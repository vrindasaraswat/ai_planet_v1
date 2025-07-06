import React, { useState } from 'react';
import ReactFlowProvider from 'reactflow';
import 'reactflow/dist/style.css';
import LandingPage from './components/LandingPage';
import GenAIStackPage from './components/GenAIStackPage';
import './styles.css';

function CreateStackModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && description) {
      onCreate({ name, description, nodes: [], edges: [] }); // Initialize with empty nodes and edges
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create New Stack</h3>
        <form onSubmit={(e) => { handleSubmit(e); onClose(); }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="create-btn">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppContent({ currentPage, onGetStarted, onNewStack, stacks, setStacks, selectedStack, setSelectedStack }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateStack = (stack) => {
    setStacks([...stacks, { ...stack, id: Date.now() }]);
    setSelectedStack({ ...stack, id: Date.now(), nodes: [], edges: [] }); // Set selected stack for new workflow
    setCurrentPage('genai-stack'); // Navigate to genai-stack after creation
  };

  const handleEditStack = (stackId) => {
    const stack = stacks.find(s => s.id === stackId);
    setSelectedStack(stack);
    setCurrentPage('genai-stack');
  };

  const handleNewStackClick = () => {
    setIsModalOpen(true);
  };

  const pages = {
    landing: <LandingPage onGetStarted={onGetStarted} />,
    'my-stacks': (
      <div className="my-stacks">
        <h2>My Stacks</h2>
        <div className="stacks-grid">
          {stacks.map((stack) => (
            <div key={stack.id} className="stack-card">
              <h3>{stack.name}</h3>
              <p>{stack.description}</p>
              <button className="edit-btn" onClick={() => handleEditStack(stack.id)}>Edit Stack</button>
            </div>
          ))}
        </div>
        <button className="new-stack-btn" onClick={handleNewStackClick}>+ New Stack</button>
        {isModalOpen && <CreateStackModal onClose={() => setIsModalOpen(false)} onCreate={handleCreateStack} />}
      </div>
    ),
    'genai-stack': <GenAIStackPage stack={selectedStack} />,
  };

  return pages[currentPage] || pages['landing'];
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [stacks, setStacks] = useState([]);
  const [selectedStack, setSelectedStack] = useState(null);

  const handleGetStarted = () => {
    setCurrentPage('my-stacks');
  };

  const handleNewStack = () => {
    setSelectedStack(null);
    setCurrentPage('genai-stack');
  };

  return (
    <div className="app" style={{ touchAction: 'auto', pointerEvents: 'auto' }}>
      <div className="main-content">
        {currentPage === 'landing' ? (
          <LandingPage onGetStarted={handleGetStarted} />
        ) : (
          <>
            <header>
              <h2>GenAI Stack</h2>
              <button onClick={handleNewStack}>+ New Stack</button>
            </header>
            {currentPage === 'genai-stack' ? (
              <ReactFlowProvider>
                <AppContent currentPage={currentPage} onGetStarted={handleGetStarted} onNewStack={handleNewStack} stacks={stacks} setStacks={setStacks} selectedStack={selectedStack} setSelectedStack={setSelectedStack} />
              </ReactFlowProvider>
            ) : (
              <AppContent currentPage={currentPage} onGetStarted={handleGetStarted} onNewStack={handleNewStack} stacks={stacks} setStacks={setStacks} selectedStack={selectedStack} setSelectedStack={setSelectedStack} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;