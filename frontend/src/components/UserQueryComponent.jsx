import React from 'react';

const UserQueryComponent = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4 }}>
      <h4>{data.label}</h4>
      <input placeholder="Enter query..." />
    </div>
  );
};

export default UserQueryComponent;