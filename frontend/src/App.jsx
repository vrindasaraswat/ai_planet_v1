import React, { useState } from 'react';
import ReactFlowProvider from 'reactflow';
import 'reactflow/dist/style.css';
import LandingPage from './components/LandingPage';
import GenAIStackPage from './components/GenAIStackPage';
import './styles.css';

function AppContent({ currentPage, onGetStarted, onNewStack }) {
  const pages = {
    landing: <LandingPage onGetStarted={onGetStarted} />,
    'my-stacks': (
      <div className="my-stacks">
        <div className="my-stacks-card">
          <h1>Create New Stack</h1>
          <p>Start building your generative AI apps with our essential tools and frameworks</p>
          <button className="new-stack-btn" onClick={onNewStack}>New Stack</button>
        </div>
      </div>
    ),
    'genai-stack': <GenAIStackPage />,
  };

  return pages[currentPage] || pages['landing'];
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const handleGetStarted = () => {
    setCurrentPage('my-stacks');
  };

  const handleNewStack = () => {
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
                <AppContent currentPage={currentPage} onGetStarted={handleGetStarted} onNewStack={handleNewStack} />
              </ReactFlowProvider>
            ) : (
              <AppContent currentPage={currentPage} onGetStarted={handleGetStarted} onNewStack={handleNewStack} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;