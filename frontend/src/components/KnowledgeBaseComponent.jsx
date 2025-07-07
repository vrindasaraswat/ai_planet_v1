import React from 'react';
import { Handle } from 'reactflow';

const KnowledgeBaseComponent = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, position: 'relative' }}>
      <h4>{data.label}</h4>
      <input type="file" />
      <Handle type="target" position="left" id="query" style={{ background: '#389e5f' }} />
      <Handle type="source" position="right" id="context" style={{ background: '#389e5f' }} />
    </div>
  );
};

export default KnowledgeBaseComponent;