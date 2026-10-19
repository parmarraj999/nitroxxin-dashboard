import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles,
  Users,
  CalendarDays,
  Plus,
  BarChart3,
  UserCircle,
  LayoutDashboard,
  Search,
  LogOut,
  X,
  Send,
  Bot,
  Check,
  CheckCircle2,
  ReceiptText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import './Sidebar.css';

const Sidebar = () => {
  const { user, profile, logout } = useAuth();
  const { notifications } = useNotifications(user?.uid);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi there! I am your Nitroxx AI Assistant. I can help generate event descriptions, craft marketing copy, or analyze participant attendance.'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const searchInputRef = useRef(null);
  const workspaceRef = useRef(null);
  const inboxRef = useRef(null);

  const unreadCount = (notifications || []).filter((item) => !item.isRead).length;

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
        setWorkspaceMenuOpen(false);
      }
      if (inboxRef.current && !inboxRef.current.contains(e.target)) {
        setInboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleAiSend = (e) => {
    e?.preventDefault();
    if (!aiPrompt.trim() || isGenerating) return;

    const userMsg = aiPrompt.trim();
    setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiPrompt('');
    setIsGenerating(true);

    setTimeout(() => {
      let reply = `Here's a tailored idea for "${userMsg}":\n\n1. Early Bird Special: Offer a 20% discount for the first 50 registrations.\n2. Schedule: Kickoff at 8:00 AM, key sessions by 10:30 AM, and open networking at 4:00 PM.\n3. Engagement: Setup live Q&A via Nitroxx Live Activity feed to boost attendee interaction!`;
      if (userMsg.toLowerCase().includes('email') || userMsg.toLowerCase().includes('reminder')) {
        reply = `Subject: Important Update regarding your upcoming Nitroxx Event 🚀\n\nDear Participant,\n\nWe are thrilled to welcome you! Check your dashboard for track guidelines, timing, and checkpoint maps.\n\nSee you at the starting line!`;
      }
      setAiMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsGenerating(false);
    }, 900);
  };

  // Current content navigation items mapped to the clean workspaces section
  const workspaceItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CalendarDays, label: 'My Events', path: '/events' },
    { icon: Users, label: 'Participants', path: '/participants' },
    { icon: ReceiptText, label: 'Transactions', path: '/transactions' },
    // { icon: Globe2, label: 'Public Events', path: '/explore' },
    { icon: Plus, label: 'Add Event', path: '/events/new' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  const filteredItems = searchQuery
    ? workspaceItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : workspaceItems;

  return (
    <>
      <aside className="minimal-sidebar">
        {/* Header with black badge, workspace switcher, and search button */}
        <div className="sidebar-top-bar" ref={workspaceRef}>
          <button 
            className={`workspace-trigger ${workspaceMenuOpen ? 'active' : ''}`}
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            title="Switch Workspace"
          >
            <div className="workspace-badge">
              <svg 
                className="cmd-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </div>
            <span className="workspace-name">{profile?.organization || 'Nitroxx Inc'}</span>
            {/* <ChevronDown size={14} className="workspace-chevron" /> */}
          </button>
        </div>

        {/* Workspaces Section */}
        <div className="sidebar-section-container">
          <div style={{width:'100%',height:'2px',backgroundColor:'#ebebea',margin:'0 0px'}}></div>
          {/* <div className="sidebar-section-header">Workspaces</div> */}
          <nav className="sidebar-nav-list">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
              return (
                <NavLink 
                  key={index} 
                  to={item.path} 
                  className={({ isActive: linkActive }) => 
                    `sidebar-nav-item ${linkActive || isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="item-icon" size={16} strokeWidth={1.75} />
                  <span className="item-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile at Bottom (Minimal, Notion / Linear styled) */}
        <div className="sidebar-bottom-bar">
          <div className="sidebar-user-pill">
            <img 
              src={profile?.photoURL || 'https://i.pravatar.cc/150?u=nitroxx'} 
              alt={profile?.fullName || 'User'} 
              className="user-avatar-mini" 
            />
            <div className="user-details">
              <span className="user-name">{profile?.fullName || 'Nitroxx User'}</span>
              <span className="user-role">{profile?.role || 'Host'}</span>
            </div>
            <button 
              className="user-logout-btn" 
              title="Sign Out" 
              onClick={logout}
            >
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      {/* Nitroxx AI Assistant Modal */}
      {aiModalOpen && (
        <div className="ai-modal-overlay" onClick={() => setAiModalOpen(false)}>
          <div className="ai-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ai-modal-header">
              <div className="ai-modal-title-group">
                <div className="ai-modal-icon-badge">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="ai-modal-title">Nitroxx AI Assistant</h3>
                  <p className="ai-modal-sub">Smart event creation & participant intelligence</p>
                </div>
              </div>
              <button className="ai-modal-close" onClick={() => setAiModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="ai-modal-chat">
              {aiMessages.map((m, i) => (
                <div key={i} className={`ai-chat-bubble ${m.sender}`}>
                  {m.sender === 'ai' && (
                    <div className="ai-bubble-avatar">
                      <Bot size={15} />
                    </div>
                  )}
                  <div className="ai-bubble-content">
                    <p style={{ whiteSpace: 'pre-line' }}>{m.text}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="ai-chat-bubble ai">
                  <div className="ai-bubble-avatar">
                    <Bot size={15} />
                  </div>
                  <div className="ai-bubble-content thinking">
                    <span>Generating thoughts...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ai-prompt-suggestions">
              <button 
                type="button" 
                onClick={() => setAiPrompt('Suggest registration boost strategy for our next race')}
              >
                ⚡ Boost registrations
              </button>
              <button 
                type="button" 
                onClick={() => setAiPrompt('Draft email reminder for upcoming event participants')}
              >
                ✉️ Draft participant reminder
              </button>
              <button 
                type="button" 
                onClick={() => setAiPrompt('Generate catchy title & description for Monsoon Trail')}
              >
                ✨ Event description ideas
              </button>
            </div>

            <form className="ai-modal-input-bar" onSubmit={handleAiSend}>
              <input 
                type="text" 
                placeholder="Ask AI anything about your events or participants..." 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <button type="submit" disabled={!aiPrompt.trim() || isGenerating} className="ai-send-btn">
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
