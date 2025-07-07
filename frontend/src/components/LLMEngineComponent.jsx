import React from 'react';
import { Handle } from 'reactflow';

const LLMEngineComponent = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, position: 'relative' }}>
      <h4>{data.label}</h4>
      <select>
        <option>OpenAI GPT</option>
        <option>Gemini</option>
      </select>
      <Handle type="target" position="left" id="query" style={{ top: 20, background: '#389e5f' }} />
      <Handle type="target" position="left" id="context" style={{ top: 40, background: '#389e5f' }} />
      <Handle type="source" position="right" id="output" style={{ background: '#389e5f' }} />
    </div>
  );
};

export default LLMEngineComponent;