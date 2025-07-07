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
  const [selectedNode, setSelectedNode] = useState(null);
  const [built, setBuilt] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const components = [
    {
      title: 'Components',
      items: [
        { type: 'userQuery', label: 'Input' },
        { type: 'llmEngine', label: 'LLM (OpenAI)' },
        { type: 'knowledgeBase', label: 'Knowledge Base' },
        { type: 'output', label: 'Output' },
      ],
    },
  ];

  // Connect all core components in order: User Query -> Knowledge Base -> LLM -> Output
  const connectAllComponents = () => {
    // Find node ids by type
    const userQueryNode = nodes.find((n) => n.type === 'userQuery');
    const knowledgeBaseNode = nodes.find((n) => n.type === 'knowledgeBase');
    const llmNode = nodes.find((n) => n.type === 'llmEngine');
    const outputNode = nodes.find((n) => n.type === 'output');

    if (userQueryNode && knowledgeBaseNode && llmNode && outputNode) {
      const newEdges = [
        {
          id: 'e-userQuery-knowledgeBase',
          source: userQueryNode.id,
          target: knowledgeBaseNode.id,
          sourceHandle: 'query',
          targetHandle: 'query',
        },
        {
          id: 'e-knowledgeBase-llm',
          source: knowledgeBaseNode.id,
          target: llmNode.id,
          sourceHandle: 'context',
          targetHandle: 'context',
        },
        {
          id: 'e-userQuery-llm',
          source: userQueryNode.id,
          target: llmNode.id,
          sourceHandle: 'query',
          targetHandle: 'query',
        },
        {
          id: 'e-llm-output',
          source: llmNode.id,
          target: outputNode.id,
          sourceHandle: 'output',
          targetHandle: 'output',
        },
      ];
      setEdges(newEdges);
      setBuilt(true);
    } else {
      alert('Please add all four components to the canvas to auto-connect.');
    }
  };

  // Check if all core components are present
  const allCorePresent = [
    'userQuery',
    'knowledgeBase',
    'llmEngine',
    'output',
  ].every(type => nodes.some(n => n.type === type));

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
      <div className={`workspace${chatOpen ? ' blurred-bg' : ''}`}>
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
          {nodes.length === 0 && (
            <div className="empty-workspace-centered">
              <div className="empty-icon-circle">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
                  <path d="M13 20h14M20 13v14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="empty-workspace-text">Drag & drop to get started</div>
            </div>
          )}
        </ReactFlow>
        <button
          className="floating-build-btn"
          onClick={connectAllComponents}
          disabled={!allCorePresent}
          style={{ opacity: allCorePresent ? 1 : 0.5, pointerEvents: allCorePresent ? 'auto' : 'none' }}
        >
          Build Stack
        </button>
        <button
          className="chat-with-stack-btn"
          disabled={!built}
          onClick={() => setChatOpen(true)}
          style={{
            position: 'absolute',
            bottom: 32,
            right: 120,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            opacity: built ? 1 : 0.5,
            pointerEvents: built ? 'auto' : 'none',
            zIndex: 21,
          }}
        >
          <span role="img" aria-label="chat">💬</span>
        </button>
      </div>
      {chatOpen && (
        <div className="genai-chat-modal-overlay">
          <div className="genai-chat-modal">
            <div className="genai-chat-modal-header">
              <span className="genai-chat-modal-title">
                <span className="genai-chat-modal-logo"> <span style={{background:'#22c55e',borderRadius:'50%',padding:'2px 7px',color:'#fff',fontWeight:'bold',marginRight:8}}>ai</span> GenAI Stack Chat</span>
              </span>
              <button className="genai-chat-modal-close" onClick={() => setChatOpen(false)}>&times;</button>
            </div>
            <div className="genai-chat-modal-content" style={{overflowY:'auto',maxHeight:'340px',width:'100%'}}>
              {chatMessages.length === 0 && !chatLoading && (
                <div className="genai-chat-modal-center">
                  <span className="genai-chat-modal-logo-large"> <span style={{background:'#22c55e',borderRadius:'50%',padding:'8px 18px',color:'#fff',fontWeight:'bold',fontSize:32,marginRight:16}}>ai</span></span>
                  <div style={{textAlign:'center'}}>
                    <div className="genai-chat-modal-title" style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: 8}}>GenAI Stack Chat</div>
                    <div style={{color:'#666',fontSize:'1rem'}}>Start a conversation to test your stack</div>
                  </div>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{display:'flex',alignItems:'flex-start',marginBottom:18}}>
                  <span style={{marginRight:12}}>{msg.from === 'user' ? <span style={{fontSize:24}}>🧑‍💻</span> : <span style={{fontSize:24}}>🤖</span>}</span>
                  <div style={{background: msg.from === 'user' ? '#f3f4f6' : '#e6f9ed',padding:'14px 18px',borderRadius:12,maxWidth:'80%',fontSize:'1.08rem',color:'#222',fontWeight: msg.from === 'user' ? 400 : 500}}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{marginTop:12,marginLeft:36,color:'#888',fontSize:'1rem'}}>Thinking...</div>
              )}
            </div>
            <form className="genai-chat-modal-form" style={{position:'absolute',left:0,right:0,bottom:32,display:'flex',justifyContent:'center',alignItems:'center'}}
              onSubmit={e => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                setChatMessages(msgs => [...msgs, { from: 'user', text: chatInput }]);
                setChatInput("");
                setChatLoading(true);
                setTimeout(() => {
                  setChatMessages(msgs => [...msgs, { from: 'bot', text: `1. Coca-Cola (KO): Coca-Cola's stock has steadily grown over the past 5 years, thanks to diversification into non-soda beverages. The pandemic caused a temporary dip in its stock price, but it has since rebounded. Its consistent dividend payouts make it appealing to long-term investors.\n\n2. PepsiCo (PEP): PepsiCo's stock has shown stable growth, thanks to its diversified portfolio, including food and beverages, which shields it from market volatility. The company's resilience during the pandemic led to a strong recovery, and steady dividends have attracted income-focused investors.\n\nIn conclusion, both companies have demonstrated resilience and steady growth over the past 5 years, appealing to growth and income-focused investors.` }]);
                  setChatLoading(false);
                }, 1800);
              }}
            >
              <input
                className="genai-chat-modal-input"
                style={{width:'80%',padding:'14px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:'1rem'}}
                placeholder="Send a message"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={chatLoading}
                autoFocus
              />
              <button
                className="genai-chat-modal-send"
                style={{marginLeft:8,background:'#2563eb',border:'none',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:22,opacity: chatInput.trim() && !chatLoading ? 1 : 0.7}}
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
              >
                <span>&#9658;</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenAIStackPage;