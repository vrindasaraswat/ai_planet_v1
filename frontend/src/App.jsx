import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import LandingPage from './components/LandingPage';
import GenAIStackPage from './components/GenAIStackPage';
import './styles.css';

function CreateStackModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isFormValid = name.trim() !== '' && description.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onCreate({ name, description, nodes: [], edges: [] });
      setName('');
      setDescription('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Stack</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <label>Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ marginBottom: '10px', height: '80px' }}
          />
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="create-btn" disabled={!isFormValid} style={!isFormValid ? { background: '#e5ede5', color: '#b2bdb2', cursor: 'not-allowed' } : {}}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppContent({ currentPage, onGetStarted, onNewStackClick, stacks, setStacks, selectedStack, setSelectedStack, setCurrentPage, isModalOpen, handleCloseModal, handleCreateStack, handleEditStack }) {
  const pages = {
    landing: <LandingPage onGetStarted={onGetStarted} />, 
    'my-stacks': (
      <div className="my-stacks">
        <header className="main-header">
          <div className="main-header-left">
            <span className="main-logo">GenAI Stack</span>
          </div>
          <div className="main-header-right">
            <span className="main-avatar">S</span>
          </div>
        </header>
        <div className="my-stacks-header-row">
          <span className="my-stacks-title">My Stacks</span>
          <button className="new-stack-btn" onClick={onNewStackClick}>+ New Stack</button>
        </div>
        <hr className="divider" />
        {stacks.length === 0 ? (
          <div className="my-stacks-empty-center">
            <div className="empty-state-card">
              <h3>Create New Stack</h3>
              <p>Start building your generative AI apps with our essential tools and frameworks</p>
              <button className="new-stack-btn" onClick={onNewStackClick}>+ New Stack</button>
            </div>
          </div>
        ) : (
          <div className="stacks-grid">
            {stacks.map((stack) => (
              <div key={stack.id} className="stack-card">
                <h3>{stack.name}</h3>
                <p>{stack.description}</p>
                <button className="edit-btn" onClick={() => handleEditStack(stack)}>Edit Stack</button>
              </div>
            ))}
          </div>
        )}
        {isModalOpen && <CreateStackModal onClose={handleCloseModal} onCreate={handleCreateStack} />}
      </div>
    ),
    'genai-stack': <GenAIStackPage stack={selectedStack} setStack={setSelectedStack} />,
  };
  return pages[currentPage] || pages['landing'];
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [stacks, setStacks] = useState([]);
  const [selectedStack, setSelectedStack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGetStarted = () => {
    setCurrentPage('my-stacks');
  };

  const handleNewStackClick = () => {
    setIsModalOpen(true);
  };

  const handleCreateStack = (stack) => {
    const newStack = { ...stack, id: Date.now(), nodes: [], edges: [] };
    setStacks(prevStacks => [...prevStacks, newStack]);
    setSelectedStack(newStack);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditStack = (stack) => {
    setSelectedStack(stack);
    setCurrentPage('genai-stack');
  };

  return (
    <div className="app" style={{ touchAction: 'auto', pointerEvents: 'auto', backgroundColor: '#666' }}>
      <div className="main-content">
        <AppContent
          currentPage={currentPage}
          onGetStarted={handleGetStarted}
          onNewStackClick={handleNewStackClick}
          stacks={stacks}
          setStacks={setStacks}
          selectedStack={selectedStack}
          setSelectedStack={setSelectedStack}
          setCurrentPage={setCurrentPage}
          isModalOpen={isModalOpen}
          handleCloseModal={handleCloseModal}
          handleCreateStack={handleCreateStack}
          handleEditStack={handleEditStack}
        />
      </div>
    </div>
  );
}

export default App;