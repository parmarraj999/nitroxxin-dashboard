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
  LogOut,
  X,
  Send,
  Bot,
  ReceiptText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isContracted, setIsContracted] = useState(() => {
    try {
      return localStorage.getItem('nitroxx_sidebar_contracted') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleContracted = () => {
    setIsContracted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nitroxx_sidebar_contracted', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Keyboard shortcut (⌘B or Ctrl+B) to toggle sidebar collapse/expand
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleContracted();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi there! I am your Nitroxx AI Assistant. I can help generate event descriptions, craft marketing copy, or analyze participant attendance.'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const workspaceRef = useRef(null);

  const isPreview =
    location.pathname.includes('-preview') ||
    !isAuthenticated ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nitroxx_preview_mode') === 'true');

  useEffect(() => {
    if (location.pathname.includes('-preview')) {
      try { sessionStorage.setItem('nitroxx_preview_mode', 'true'); } catch (e) {}
    } else if (isAuthenticated && !location.pathname.includes('-preview')) {
      try { sessionStorage.removeItem('nitroxx_preview_mode'); } catch (e) {}
    }
  }, [location.pathname, isAuthenticated]);

  // Preview path mapping ensures that navigation in preview mode keeps users on preview pages
  const getNavPath = (basePath) => {
    if (!isPreview) return basePath;
    const previewMap = {
      '/dashboard': '/dashboard-preview',
      '/events': '/events-preview',
      '/events/new': '/events-new-preview',
      '/participants': '/participants-preview',
      '/transactions': '/transactions-preview',
      '/analytics': '/analytics-preview',
      '/profile': '/profile-preview',
    };
    return previewMap[basePath] || basePath;
  };

  // Precise active check preventing overlapping matches (e.g. /events vs /events/new)
  const checkIsActive = (targetPath) => {
    const cur = location.pathname;
    if (targetPath === '/dashboard') {
      return cur === '/dashboard' || cur === '/' || cur === '/dashboard-preview';
    }
    if (targetPath === '/events') {
      return cur === '/events' || cur === '/events-preview';
    }
    if (targetPath === '/events/new') {
      return cur === '/events/new' || cur === '/events-new-preview';
    }
    if (targetPath === '/participants') {
      return cur === '/participants' || cur === '/participants-preview';
    }
    if (targetPath === '/transactions') {
      return cur === '/transactions' || cur === '/transactions-preview';
    }
    if (targetPath === '/analytics') {
      return cur === '/analytics' || cur === '/analytics-preview';
    }
    if (targetPath === '/profile') {
      return cur === '/profile' || cur === '/profile-preview';
    }
    return cur === targetPath || (targetPath !== '/' && cur.startsWith(targetPath + '/'));
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
    { icon: Plus, label: 'Add Event', path: '/events/new' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      <aside className={`minimal-sidebar ${isContracted ? 'contracted' : ''}`}>
        {/* Header with black badge, workspace switcher, and toggle collapse button */}
        <div className={`sidebar-top-bar ${isContracted ? 'contracted' : ''}`} ref={workspaceRef}>
          {!isContracted ? (
            <>
              <button
                className={`workspace-trigger ${workspaceMenuOpen ? 'active' : ''}`}
                onClick={() => {
                  setWorkspaceMenuOpen(!workspaceMenuOpen);
                  navigate(isPreview ? '/dashboard-preview' : '/dashboard');
                }}
                title="Go to Dashboard"
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
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  </svg>
                </div>
                <span className="workspace-name">{profile?.organization || 'Nitroxx Inc'}</span>
              </button>
              <button
                type="button"
                className="sidebar-toggle-btn"
                onClick={toggleContracted}
                title="Contract sidebar (Ctrl+B)"
                aria-label="Contract sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <div className="sidebar-contracted-top">
              <button
                className="workspace-trigger contracted"
                onClick={() => navigate(isPreview ? '/dashboard-preview' : '/dashboard')}
                title="Go to Dashboard"
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
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  </svg>
                </div>
              </button>
              <button
                type="button"
                className="sidebar-toggle-btn contracted"
                onClick={toggleContracted}
                title="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Workspaces Section */}
        <div className="sidebar-section-container">
          <div style={{ width: '100%', height: '1px', backgroundColor: '#ebebea', margin: '4px 0' }}></div>
          <nav className="sidebar-nav-list">
            {workspaceItems.map((item, index) => {
              const Icon = item.icon;
              const active = checkIsActive(item.path);
              const destination = getNavPath(item.path);
              return (
                <NavLink
                  key={index}
                  to={destination}
                  data-tooltip={item.label}
                  title={isContracted ? item.label : ''}
                  className={({ isActive: linkActive }) =>
                    `sidebar-nav-item ${active || linkActive ? 'active' : ''} ${isContracted ? 'contracted' : ''}`
                  }
                >
                  <Icon className="item-icon" size={18} strokeWidth={1.75} />
                  {!isContracted && <span className="item-label">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile at Bottom (Minimal, Notion / Linear styled) */}
        <div className={`sidebar-bottom-bar ${isContracted ? 'contracted' : ''}`}>
          {!isContracted ? (
            <div 
              className="sidebar-user-pill"
              onClick={() => navigate(isPreview ? '/profile-preview' : '/profile')}
              title="View Profile"
              style={{ cursor: 'pointer' }}
            >
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
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
              >
                <LogOut size={15} strokeWidth={1.8} />
              </button>
            </div>
          ) : (
            <div className="sidebar-user-contracted">
              <div 
                className="sidebar-user-pill contracted"
                onClick={() => navigate(isPreview ? '/profile-preview' : '/profile')}
                title={`Profile: ${profile?.fullName || 'Nitroxx User'}`}
                data-tooltip="Profile"
              >
                <img
                  src={profile?.photoURL || 'https://i.pravatar.cc/150?u=nitroxx'}
                  alt={profile?.fullName || 'User'}
                  className="user-avatar-mini"
                />
              </div>
              <button
                className="user-logout-btn contracted"
                title="Sign Out"
                data-tooltip="Sign Out"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
              >
                <LogOut size={16} strokeWidth={1.8} />
              </button>
            </div>
          )}
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

export default React.memo(Sidebar);
