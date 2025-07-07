import React from 'react';
import { Handle } from 'reactflow';

const OutputComponent = ({ messages, onSubmit, data }) => {
  const [input, setInput] = React.useState('');
  const safeMessages = Array.isArray(messages) ? messages : [];
  return (
    <div className="chat-interface" style={{ position: 'relative', border: '1px solid #ccc', borderRadius: 4, padding: 10 }}>
      {safeMessages.map((msg, index) => (
        <p key={index} className={msg.from}>{msg.text}</p>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(input); setInput(''); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
      <Handle type="target" position="left" id="output" style={{ background: '#389e5f' }} />
    </div>
  );
};

export default OutputComponent;