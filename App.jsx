import React, { useState, useRef } from 'react';
import { Brain, Heart, Bell, Send, ArrowRight, Paperclip, X } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'chat'
  const [isLogin, setIsLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }

      if (isLogin) {
        setCurrentUser(data.username);
        setActiveTab('home');
      } else {
        setIsLogin(true); // Switch to login after successful register
        setAuthError('Registration successful! Please sign in.');
      }
    } catch {
      setAuthError('Network error occurred.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    const userMsg = input.trim();
    let displayMsg = userMsg;
    if (selectedFile) {
      displayMsg += `\n(Attached: ${selectedFile.name})`;
    }

    setMessages(prev => [...prev, { text: displayMsg, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('user', currentUser || 'anon');
      formData.append('msg', userMsg || 'Analyze this file.');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/chat', {
        method: 'POST',
        body: formData,
      });
      console.log(res);
      clearFile();

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
    } catch {
      setMessages(prev => [...prev, { text: 'Sorry, I am having trouble connecting.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header>
        <div className="logo-container" onClick={() => currentUser && setActiveTab('home')} style={{ cursor: currentUser ? 'pointer' : 'default' }}>
          <Brain className="logo-icon" />
          <span>MindCare</span>
        </div>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Welcome, {currentUser}</span>
            {activeTab === 'home' && (
              <button className="btn-primary" onClick={() => setActiveTab('chat')}>
                <ArrowRight size={16} /> Open Chat
              </button>
            )}
            <button className="btn-primary" onClick={() => { setCurrentUser(null); setActiveTab('home'); }} style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#fff', border: '1px solid #333' }}>
              Sign Out
            </button>
          </div>
        ) : null}
      </header>

      <main>
        <h1 className="hero-title">
          Your mind deserves<br />
          <span className="highlight">gentle care.</span>
        </h1>
        <p className="hero-subtitle">
          A safe space to express your thoughts, understand your emotions,
          and receive guidance for your mental well-being.
        </p>

        {!currentUser ? (
          <div className="feature-card" style={{ maxWidth: '400px', margin: '1rem auto', width: '100%', padding: '2.5rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>{isLogin ? 'Welcome Back' : 'Join MindCare'}</h2>
            {authError && <p style={{ color: authError.includes('successful') ? '#10b981' : '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{authError}</p>}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <input
                type="text"
                placeholder="Username"
                value={authForm.username}
                onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                required
                className="chat-input"
                style={{ width: '100%' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                required
                className="chat-input"
                style={{ width: '100%' }}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#8c8886', fontSize: '0.9rem' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => { setIsLogin(!isLogin); setAuthError(''); }} style={{ color: '#ff6a00', cursor: 'pointer', fontWeight: '500' }}>
                {isLogin ? 'Register' : 'Sign In'}
              </span>
            </p>
          </div>
        ) : activeTab === 'home' ? (
          <div className="features-grid">
            <div className="feature-card">
              <Brain size={32} className="feature-icon" />
              <h3 className="feature-title">AI Analysis</h3>
              <p className="feature-desc">Deep understanding of your mental state.</p>
            </div>
            <div className="feature-card">
              <Heart size={32} className="feature-icon" />
              <h3 className="feature-title">Compassion</h3>
              <p className="feature-desc">Gentle suggestions for your recovery.</p>
            </div>
            <div className="feature-card">
              <Bell size={32} className="feature-icon" />
              <h3 className="feature-title">Reminders</h3>
              <p className="feature-desc">Stay on track with wellness habits.</p>
            </div>
          </div>
        ) : (
          <div className="chat-container">
            <div className="chat-history">
              {messages.length === 0 && (
                <div className="chat-bubble bot">
                  Hello. I am here to listen. How are you feeling today?
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.sender}`}>
                  {m.text}
                </div>
              ))}
              {isLoading && <div className="chat-bubble bot">Thinking...</div>}
            </div>
            {selectedFile && (
              <div style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '4px', marginBottom: '8px' }}>
                <span>Attached: {selectedFile.name}</span>
                <X size={16} onClick={clearFile} style={{ cursor: 'pointer' }} />
              </div>
            )}
            <form className="chat-input-area" onSubmit={sendMessage}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' }}
              >
                <Paperclip size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".txt,image/png,image/jpeg,image/jpg"
              />
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" className="chat-submit" disabled={isLoading}>
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
