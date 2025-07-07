import React from 'react';

const OutputComponent = ({ messages, onSubmit }) => {
  const [input, setInput] = React.useState('');
  const safeMessages = Array.isArray(messages) ? messages : [];
  return (
    <div className="chat-interface">
      {safeMessages.map((msg, index) => (
        <p key={index} className={msg.from}>{msg.text}</p>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(input); setInput(''); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default OutputComponent;