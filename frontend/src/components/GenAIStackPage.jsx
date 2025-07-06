import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import UserQueryComponent from './UserQueryComponent';
import KnowledgeBaseComponent from './KnowledgeBaseComponent';
import LLMEngineComponent from './LLMEngineComponent';
import OutputComponent from './OutputComponent';
import './GenAIStackPage.css';

const initialNodes = [{ id: '1', type: 'userQuery', position: { x: 0, y: 0 }, data: { label: 'User Query' } }];
const initialEdges = [];

const nodeTypes = {
  userQuery: UserQueryComponent,
  knowledgeBase: KnowledgeBaseComponent,
  llmEngine: LLMEngineComponent,
  output: OutputComponent,
};

const GenAIStackPage = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onDragOver = useCallback((event) => event.preventDefault(), []);
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance) return;
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'string' && type) {
        const newNode = { id: `${nodes.length + 1}`, type, position, data: { label: type.replace(/([A-Z])/g, ' $1').trim() } };
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [reactFlowInstance, nodes.length]
  );

  const handleCreateStack = () => {
    if (nodes.length > 1 && edges.length > 0) {
      setChatOpen(true);
    }
  };

  const handleChatSubmit = async (message) => {
    const response = await fetch('http://localhost:8000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message, workflow: { nodes, edges } }),
    });
    const data = await response.json();
    setChatMessages((msgs) => [...msgs, { text: message, from: 'user' }, { text: data.response, from: 'bot' }]);
  };

  return (
    <div className="genai-stack-page" ref={reactFlowWrapper} style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
      <nav className="sidebar" style={{ overflow: 'hidden' }}>
        <h3>Component Library</h3>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'userQuery')}>User Query</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'knowledgeBase')}>Knowledge Base</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'llmEngine')}>LLM Engine</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'output')}>Output</div>
      </nav>
      <div className="workspace" style={{ flexGrow: 1, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          fitView
          style={{ height: '100%', width: '100%' }}
        >
          <Controls />
          <Background />
        </ReactFlow>
        <button onClick={handleCreateStack} className="create-stack-btn" style={{ overflow: 'hidden' }}>Create New Stack</button>
        {chatOpen && <OutputComponent messages={chatMessages} onSubmit={handleChatSubmit} />}
      </div>
    </div>
  );
};

export default function WrappedGenAIStackPage() {
  return (
    <ReactFlowProvider>
      <GenAIStackPage />
    </ReactFlowProvider>
  );
}