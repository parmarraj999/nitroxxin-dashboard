import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles,
  Inbox,
  Users,
  CalendarDays,
  Globe2,
  Plus,
  BarChart3,
  UserCircle,
  LayoutDashboard,
  Search,
  ChevronDown,
  LogOut,
  X,
  Send,
  Bot,
  Check,
  CheckCircle2
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

          {/* <button 
            className={`sidebar-search-toggle ${searchOpen ? 'open' : ''}`}
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search sidebar and events"
          >
            <Search size={16} strokeWidth={1.8} />
          </button> */}

          {/* Workspace Switcher Popover */}
          {workspaceMenuOpen && (
            <div className="workspace-dropdown">
              <div className="workspace-dropdown-header">
                <p className="dropdown-label">Active Workspace</p>
                <p className="dropdown-title">{profile?.organization || 'Nitroxx Inc'}</p>
                <span className="plan-badge">Pro Plan</span>
              </div>
              <div className="workspace-dropdown-divider" />
              <div className="workspace-dropdown-item active">
                <div className="workspace-dot" />
                <div className="workspace-item-info">
                  <span className="workspace-item-title">{profile?.organization || 'Nitroxx Inc'}</span>
                  <span className="workspace-item-sub">Default Production</span>
                </div>
                <Check size={14} className="check-icon" />
              </div>
              <div className="workspace-dropdown-divider" />
              <button 
                className="workspace-dropdown-action" 
                onClick={() => { setWorkspaceMenuOpen(false); navigate('/profile'); }}
              >
                Workspace Settings
              </button>
            </div>
          )}
        </div>

        {/* Quick Search Bar (Toggles when search icon is clicked) */}
        {searchOpen && (
          <form className="sidebar-quick-search" onSubmit={handleSearchSubmit}>
            <Search size={14} className="search-field-icon" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search or jump to..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-field-input"
            />
            <button 
              type="button" 
              className="search-clear-btn" 
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
            >
              <X size={13} />
            </button>
          </form>
        )}

        {/* Top items: AI Assistant & Inbox */}
        <div className="sidebar-utility-group" ref={inboxRef}>
          {/* <button 
            className={`sidebar-nav-item utility-item ${aiModalOpen ? 'active' : ''}`}
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkles className="item-icon" size={16} strokeWidth={1.75} />
            <span className="item-label">AI Assistant</span>
          </button>

          <button 
            className={`sidebar-nav-item utility-item ${inboxOpen ? 'active' : ''}`}
            onClick={() => setInboxOpen(!inboxOpen)}
          >
            <Inbox className="item-icon" size={16} strokeWidth={1.75} />
            <span className="item-label">Inbox</span>
            {unreadCount > 0 && (
              <span className="inbox-badge">{unreadCount}</span>
            )}
          </button> */}

          {/* Inbox Notifications Flyout */}
          {inboxOpen && (
            <div className="sidebar-inbox-popover">
              <div className="inbox-popover-header">
                <span className="inbox-title">Notifications</span>
                {unreadCount > 0 && (
                  <span className="inbox-count-tag">{unreadCount} new</span>
                )}
              </div>
              <div className="inbox-list">
                {(!notifications || notifications.length === 0) ? (
                  <div className="inbox-empty">
                    <CheckCircle2 size={24} className="empty-check" />
                    <p>All caught up!</p>
                    <span>No unread notifications right now</span>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n, idx) => (
                    <div key={idx} className="inbox-card">
                      <div className="inbox-card-dot" />
                      <div className="inbox-card-body">
                        <p className="inbox-card-title">{n.title || 'Event Notification'}</p>
                        <p className="inbox-card-msg">{n.message || 'New update available on your events.'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workspaces Section */}
        <div className="sidebar-section-container">
          <div className="sidebar-section-header">Workspaces</div>
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
