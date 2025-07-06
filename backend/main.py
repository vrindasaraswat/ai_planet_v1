from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import pymupdf
import chromadb
from openai import OpenAI
# import google.generativeai as genai
# from serpapi import GoogleSearch
import asyncio
import platform

app = FastAPI()
client = chromadb.Client()
collection = client.get_or_create_collection("knowledge_base")
openai_client = OpenAI()
# gemini = genai.GenerativeModel('gemini-pro')
# search = GoogleSearch({"api_key": "your_serpapi_key"})

class QueryRequest(BaseModel):
    query: str
    workflow: dict

def extract_text(file):
    with pymupdf.open(stream=file.file.read(), filetype="pdf") as doc:
        text = "".join(page.get_text() for page in doc)
    return text

def generate_embeddings(text):
    response = openai_client.embeddings.create(input=text, model="text-embedding-ada-002")
    return response.data[0].embedding

def store_embedding(text, embedding):
    collection.add(embeddings=[embedding], documents=[text], ids=[f"doc_{len(collection.get()['ids']) + 1}"])

def retrieve_context(query):
    embedding = generate_embeddings(query)
    results = collection.query(query_embeddings=[embedding], n_results=1)
    return results['documents'][0][0] if results['documents'] else ""

async def llm_response(query, context=None, model="gpt-4", prompt="Answer the query based on context if provided."):
    if context:
        prompt += f"\nContext: {context}"
    if model.lower() == "gemini":
        response = await asyncio.to_thread(lambda: gemini.generate_content(prompt + query))
        return response.text
    else:
        response = openai_client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt + query}])
        return response.choices[0].message.content

async def web_search(query):
    results = search.get_json({"q": query, "location": "Austin, Texas, United States"})
    return results["organic_results"][0]["snippet"] if results.get("organic_results") else "No web results"

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    text = extract_text(file)
    embedding = generate_embeddings(text)
    store_embedding(text, embedding)
    return {"message": "File processed and stored"}

@app.post("/query")
async def process_query(request: QueryRequest):
    query = request.query
    workflow = request.workflow
    context = ""
    response = ""

    # Validate workflow sequence
    node_ids = [node["id"] for node in workflow["nodes"]]
    for edge in workflow["edges"]:
        if edge["source"] not in node_ids or edge["target"] not in node_ids:
            raise HTTPException(status_code=400, detail="Invalid workflow connection")

    # Process nodes in sequence
    for node in workflow["nodes"]:
        if node["type"] == "knowledgeBase":
            context = retrieve_context(query)
        elif node["type"] == "llmEngine":
            model = "gpt-4"  # Default model, can be extended with config
            llm_response_text = await llm_response(query, context if context else None, model)
            response = llm_response_text
            if any(edge["source"] == node["id"] and edge["target"] == n["id"] for n in workflow["nodes"] for edge in workflow["edges"] if n["type"] == "output"):
                web_result = await web_search(query)
                response += f"\nWeb: {web_result}"

    return {"response": response}

if platform.system() == "Emscripten":
    asyncio.ensure_future(app)
else:
    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000)