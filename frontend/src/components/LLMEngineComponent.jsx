import React from 'react';

const LLMEngineComponent = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4 }}>
      <h4>{data.label}</h4>
      <select>
        <option>OpenAI GPT</option>
        <option>Gemini</option>
      </select>
    </div>
  );
};

export default LLMEngineComponent;