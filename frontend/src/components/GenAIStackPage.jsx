import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import UserQueryComponent from './UserQueryComponent';
import KnowledgeBaseComponent from './KnowledgeBaseComponent';
import LLMEngineComponent from './LLMEngineComponent';
import OutputComponent from './OutputComponent';
import './GenAIStackPage.css';

const initialNodes = [];
const initialEdges = [];

const nodeTypes = {
  userQuery: UserQueryComponent,
  knowledgeBase: KnowledgeBaseComponent,
  llmEngine: LLMEngineComponent,
  output: OutputComponent,
};

const GenAIStackPage = ({ stack, setStack }) => {
  const [nodes, setNodes] = useState(stack ? (stack.nodes || initialNodes) : initialNodes);
  const [edges, setEdges] = useState(stack ? (stack.edges || initialEdges) : initialEdges);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  // Sync with stack prop only when stack changes
  useEffect(() => {
    if (stack) {
      console.log('Syncing stack:', stack);
      if (JSON.stringify(nodes) !== JSON.stringify(stack.nodes || initialNodes) || JSON.stringify(edges) !== JSON.stringify(stack.edges || initialEdges)) {
        setNodes(stack.nodes || initialNodes);
        setEdges(stack.edges || initialEdges);
      }
    } else {
      console.log('No stack provided, using initial state');
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [stack]);

  // Update parent stack state only if nodes or edges differ
  useEffect(() => {
    if (setStack && stack) {
      const newStack = { ...stack, nodes, edges };
      if (JSON.stringify(newStack.nodes) !== JSON.stringify(stack.nodes) || JSON.stringify(newStack.edges) !== JSON.stringify(stack.edges)) {
        console.log('Updated stack state:', newStack);
        setStack(newStack);
      }
    }
  }, [nodes, edges, stack, setStack]);

  // Ensure ReactFlow instance initializes
  useEffect(() => {
    if (!reactFlowInstance && nodes.length > 0) {
      console.error('ReactFlow instance not initialized, forcing fallback');
      setReactFlowInstance({ screenToFlowPosition: () => ({ x: 0, y: 0 }) });
    }
  }, [reactFlowInstance, nodes.length]);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
    console.log('Drag started:', type, 'Data set:', event.dataTransfer.getData('application/reactflow'));
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'string' && type) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        const newNode = {
          id: `node_${Date.now()}`,
          type,
          position,
          data: { label: type.replace(/([A-Z])/g, ' $1').trim() },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [reactFlowInstance]
  );

  const components = [
    {
      title: 'Components',
      items: [
        { type: 'userQuery', label: 'Chat With AI' },
        { type: 'userQuery', label: 'Input' },
        { type: 'llmEngine', label: 'LLM (OpenAI)' },
        { type: 'knowledgeBase', label: 'Knowledge Base' },
        { type: 'output', label: 'Output' },
        { type: 'userQuery', label: 'ContentWriter' },
        { type: 'userQuery', label: 'ContentSummarizer' },
        { type: 'userQuery', label: 'InformationFinder' },
        { type: 'userQuery', label: 'EditStack' },
        { type: 'userQuery', label: 'NewStack' },
        { type: 'userQuery', label: 'smartAI' },
        { type: 'userQuery', label: 'write content' },
        { type: 'userQuery', label: 'summarize information' },
        { type: 'userQuery', label: 'find relevant data' },
        { type: 'userQuery', label: 'assistant tool' },
        { type: 'userQuery', label: 'platform interface' },
        { type: 'userQuery', label: 'dashboard' },
        { type: 'userQuery', label: 'manage' },
        { type: 'userQuery', label: 'organize' },
        { type: 'userQuery', label: 'create' },
        { type: 'userQuery', label: 'generate' },
        { type: 'userQuery', label: 'assist' },
        { type: 'userQuery', label: 'help' },
        { type: 'userQuery', label: 'support' },
        { type: 'userQuery', label: 'technology innovation' },
        { type: 'userQuery', label: 'digital solution' },
        { type: 'userQuery', label: 'user-friendly' },
        { type: 'userQuery', label: 'efficient' },
        { type: 'userQuery', label: 'productive' },
        { type: 'userQuery', label: 'smart' },
        { type: 'userQuery', label: 'intelligent' },
        { type: 'userQuery', label: 'automated system' },
        { type: 'userQuery', label: 'application' },
        { type: 'userQuery', label: 'software' },
        { type: 'userQuery', label: 'online' },
        { type: 'userQuery', label: 'web service' },
      ],
    },
  ];

  return (
    <div className="genai-stack-page" ref={reactFlowWrapper} style={{ height: '100%', width: '100%' }}>
      <nav className="sidebar">
        <h3>Components</h3>
        {components.map((section) => (
          <div key={section.title}>
            <div className="section-header" onClick={() => toggleSection(section.title)}>
              {section.title} <span>{collapsedSections[section.title] ? '▼' : '▲'}</span>
            </div>
            {!collapsedSections[section.title] && (
              <div className="section-content">
                {section.items.map((item) => (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type)}
                    className="draggable-item"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="workspace">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          fitView
          style={{ height: '100%', width: '100%' }}
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
          {!nodes.length && (
            <div className="empty-workspace">
              <span role="img" aria-label="drag">👇</span>
              <p>Drag & drop to get started</p>
            </div>
          )}
        </ReactFlow>
      </div>
      <div className="footer-controls">
        <button className="save-btn">Save</button>
        <div className="zoom-controls">
          <button>+</button>
          <span>-</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default GenAIStackPage;