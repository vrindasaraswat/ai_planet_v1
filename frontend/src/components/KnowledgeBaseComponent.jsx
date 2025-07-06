import React from 'react';

const KnowledgeBaseComponent = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4 }}>
      <h4>{data.label}</h4>
      <input type="file" />
    </div>
  );
};

export default KnowledgeBaseComponent;