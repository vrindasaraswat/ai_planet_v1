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
      console.log('Syncing stack:', stack); // Debug log
      if (JSON.stringify(nodes) !== JSON.stringify(stack.nodes || initialNodes) || JSON.stringify(edges) !== JSON.stringify(stack.edges || initialEdges)) {
        setNodes(stack.nodes || initialNodes);
        setEdges(stack.edges || initialEdges);
      }
    } else {
      console.log('No stack provided, using initial state');
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [stack, nodes, edges]);

  // Update parent stack state only if nodes or edges differ
  useEffect(() => {
    if (setStack && stack) {
      const newStack = { ...stack, nodes, edges };
      if (JSON.stringify(newStack.nodes) !== JSON.stringify(stack.nodes) || JSON.stringify(newStack.edges) !== JSON.stringify(stack.edges)) {
        console.log('Updated stack state:', newStack); // Debug log
        setStack(newStack);
      }
    }
  }, [nodes, edges, stack, setStack]);

  // Ensure ReactFlow instance initializes
  useEffect(() => {
    if (!reactFlowInstance && nodes.length > 0) {
      console.error('ReactFlow instance not initialized, forcing fallback');
      setReactFlowInstance({ screenToFlowPosition: () => ({ x: 0, y: 0 }) }); // Fallback
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
    console.log('Drag started:', type, 'Data set:', event.dataTransfer.getData('application/reactflow')); // Enhanced log
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    console.log('Drag over workspace, clientX/Y:', event.clientX, event.clientY); // Log position
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      console.log('Drop event triggered, raw data:', event.dataTransfer.getData('application/reactflow'), 'Instance:', reactFlowInstance); // Enhanced log
      if (!reactFlowInstance) {
        console.error('ReactFlow instance not available');
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow');
      console.log('Processed type:', type); // Log processed type
      if (typeof type === 'string' && type) {
        const rect = reactFlowWrapper.current?.getBoundingClientRect();
        if (!rect) {
          console.error('reactFlowWrapper ref not available');
          return;
        }
        console.log('Drop rect:', rect); // Log rect for debugging
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        console.log('Calculated position:', position); // Log calculated position
        const newNode = {
          id: `node_${Date.now()}`,
          type,
          position,
          data: { label: type.replace(/([A-Z])/g, ' $1').trim() },
        };
        setNodes((nds) => [...nds, newNode]);
        console.log('New node added:', newNode); // Log new node
      } else {
        console.error('Invalid drop type:', type);
      }
    },
    [reactFlowInstance]
  );

  const components = [
    {
      title: 'User Query',
      items: [{ type: 'userQuery', label: 'User Query', config: { placeholder: 'Enter your query here' } }],
    },
    {
      title: 'LLM (OpenAI)',
      items: [{ type: 'llmEngine', label: 'LLM (OpenAI)', config: { model: 'GPT-4-Mini', apiKey: '********', prompt: 'You are a helpful PDF assistant...', temperature: 0.75 } }],
    },
    {
      title: 'Knowledge Base',
      items: [{ type: 'knowledgeBase', label: 'Knowledge Base', config: { fileUpload: 'Upload File', embeddingModel: 'text-embedding-3-large', apiKey: '********' } }],
    },
    {
      title: 'Output',
      items: [{ type: 'output', label: 'Output', config: { outputText: 'Output will be generated based on query' } }],
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
                    draggable="true" // Explicitly set draggable
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
      <div className="workspace" style={{ height: '100%', width: 'calc(100% - 250px)', position: 'relative' }}>
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
          <Background />
          {!nodes.length && <p>Drag & drop to get started</p>}
        </ReactFlow>
      </div>
    </div>
  );
};

export default function WrappedGenAIStackPage({ stack, setStack }) {
  return (
    <ReactFlowProvider>
      <GenAIStackPage stack={stack} setStack={setStack} />
    </ReactFlowProvider>
  );
}