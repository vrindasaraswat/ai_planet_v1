import React from 'react';
import { Handle } from 'reactflow';

const UserQueryComponent = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, position: 'relative' }}>
      <h4>{data.label}</h4>
      <input placeholder={data.config?.placeholder || 'Enter query...'} />
      <Handle type="source" position="right" id="query" style={{ background: '#389e5f' }} />
    </div>
  );
};

export default UserQueryComponent;