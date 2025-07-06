import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import LandingPage from './components/LandingPage';
import GenAIStackPage from './components/GenAIStackPage';
import './styles.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // Default to landing page

  const handleGetStarted = () => {
    setCurrentPage('my-stacks'); // Navigate to My Stacks page
  };

  const handleNewStack = () => {
    setCurrentPage('genai-stack'); // Navigate to GenAI Stack page
  };

  const pages = {
    landing: <LandingPage onGetStarted={handleGetStarted} />,
    'my-stacks': (
      <div className="my-stacks-page" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <header style={{ padding: '10px', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>My Stacks</h2>
          <button onClick={handleNewStack} style={{ padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
            + New Stack
          </button>
        </header>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button
            onClick={handleNewStack}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Create New Stack
          </button>
          <p style={{ marginTop: '10px', color: '#666' }}>Start building your generative AI apps with our essential tools and frameworks</p>
        </div>
      </div>
    ),
    'genai-stack': <GenAIStackPage />,
  };

  return (
    <div className="app" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="main-content" style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <div className="workspace" style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          {pages[currentPage] || pages['landing']}
        </div>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}