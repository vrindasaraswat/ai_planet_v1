import React, { useState, useRef, useCallback } from 'react';
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

const GenAIStackPage = ({ stack }) => {
  const [nodes, setNodes] = useState(stack ? stack.nodes || initialNodes : initialNodes);
  const [edges, setEdges] = useState(stack ? stack.edges || initialEdges : initialEdges);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

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
          id: `${nodes.length + 1}`,
          type,
          position,
          data: { label: type.replace(/([A-Z])/g, ' $1').trim() },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [reactFlowInstance, nodes.length]
  );

  console.log('Nodes:', nodes); // Debug log to check if nodes are updating

  return (
    <div className="genai-stack-page" ref={reactFlowWrapper}>
      <nav className="sidebar">
        <h3>Component Library</h3>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'userQuery')}>User Query</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'knowledgeBase')}>Knowledge Base</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'llmEngine')}>LLM Engine</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'output')}>Output</div>
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
        >
          <Controls />
          <Background />
          {!nodes.length && <p>Drag & drop to get started</p>}
        </ReactFlow>
      </div>
    </div>
  );
};

export default function WrappedGenAIStackPage({ stack }) {
  return (
    <ReactFlowProvider>
      <GenAIStackPage stack={stack} />
    </ReactFlowProvider>
  );
}