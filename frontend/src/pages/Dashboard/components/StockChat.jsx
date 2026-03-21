import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, ChevronDown, Zap, Bot as BotIcon, X } from 'lucide-react';

const chatStyles = `
  .stock-chat-root {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .stock-chat-widget {
    position: fixed;
    bottom: 100px;
    right: 30px;
    width: 420px;
    height: 620px;
    border-radius: 28px;
    background: rgba(13, 18, 28, 0.75);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-origin: bottom right;
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    pointer-events: none;
  }

  .stock-chat-widget.open {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: auto;
  }

  .chat-toggle-btn {
    position: fixed;
    bottom: 25px;
    right: 30px;
    width: 64px;
    height: 64px;
    border-radius: 32px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
    z-index: 1001;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .chat-toggle-btn:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.6);
  }

  .chat-toggle-btn.open {
    background: rgba(31, 41, 55, 0.8);
    transform: scale(1) rotate(180deg);
  }

  .chat-header {
    padding: 1.25rem 1.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chat-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    color: #fff;
    font-size: 1rem;
    letter-spacing: -0.01em;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }

  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

  .message-wrapper {
    display: flex;
    gap: 0.75rem;
    max-width: 88%;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .message-wrapper.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar.bot { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; }
  .avatar.user { background: rgba(255, 255, 255, 0.1); color: #ccc; }

  .message-bubble {
    padding: 0.85rem 1.15rem;
    border-radius: 20px;
    font-size: 0.92rem;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .message-wrapper.bot .message-bubble {
    background: rgba(255, 255, 255, 0.05);
    color: #e5e7eb;
    border-top-left-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .message-wrapper.user .message-bubble {
    background: #6366f1;
    color: white;
    border-top-right-radius: 4px;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
  }

  .scenario-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.65rem;
    background: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .chat-input-area {
    padding: 1.25rem 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .input-container {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 0.4rem;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
  }

  .input-container:focus-within {
    border-color: rgba(99, 102, 241, 0.45);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .chat-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    padding: 0.65rem 0.9rem;
    font-size: 0.92rem;
    outline: none;
  }

  .send-btn {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: #6366f1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .send-btn:hover { transform: scale(1.05); background: #4f46e5; }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .quick-actions {
    display: flex;
    gap: 0.65rem;
    margin-bottom: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    scrollbar-width: none;
  }

  .action-chip {
    padding: 0.45rem 0.9rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: #9ca3af;
    font-size: 0.78rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .action-chip:hover {
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.3);
    color: #fff;
  }

  .typing-indicator { display: flex; gap: 4px; padding: 4px; }
  .dot { width: 5px; height: 5px; background: #6366f1; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }

  @keyframes bounce { 0%, 80%, 100% { transform: scale(0.3); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }

  .scenario-banner {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 1.1rem;
    margin-bottom: 1.75rem;
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
  }

  .scenario-banner-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(99, 102, 241, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #818cf8;
    flex-shrink: 0;
  }

  .scenario-banner-content h4 { color: #fff; font-size: 0.88rem; font-weight: 600; margin-bottom: 0.2rem; }
  .scenario-banner-content p { color: #9ca3af; font-size: 0.78rem; line-height: 1.5; margin: 0; }

  @media (max-width: 500px) {
    .stock-chat-widget {
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      border-radius: 0;
      position: fixed;
    }
    .chat-toggle-btn { bottom: 20px; right: 20px; }
  }
`;

const StockChat = ({ jobId, symbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Strategic Intelligence for **${symbol}** is active. I've analyzed the report fundamentals—ready for deep-dive queries or 'What-If' projections.`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      text: `Analysis History cleared. Context for **${symbol}** remains active in the buffer.`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const MarkdownText = ({ text }) => {
    let processed = text.replace(/(\*\*(.*?)\*\*)/g, '<strong>$2</strong>');
    processed = processed.replace(/(\d+\.?\d*%?|\₹\d+[\d,]*\.?\d*)/g, '<strong>$1</strong>');
    processed = processed.replace(/^### (.*$)/gm, '<h3 class="text-md font-bold mt-3 mb-1 text-white">$1</h3>');
    processed = processed.replace(/^- (.*$)/gm, '<li class="ml-3 mb-1 list-none flex items-start gap-2"><span class="text-indigo-400 mt-1">•</span> $1</li>');
    return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: processed }} />;
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text || !text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ text: m.text, isUser: m.isUser }));

      // Note: Using absolute URL to match IntelligenceReportPage.jsx pattern
      const response = await fetch('http://localhost:5001/api/v2/reports/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          message: text.trim(),
          history: chatHistory
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server connection failed');

      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        isScenario: text.toLowerCase().includes('what if') || text.toLowerCase().includes('scenario'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: "I'm having trouble connecting to the Strategic AI. Please verify the backend service is running on Port 5001.",
        isUser: false,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stock-chat-root">
      <style>{chatStyles}</style>
      
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close Analyst" : "Ask Strategic AI"}
      >
        {isOpen ? <X size={28} /> : <Sparkles size={30} />}
      </button>

      <div className={`stock-chat-widget ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Zap size={18} className="text-indigo-400" />
            </div>
            <span>Strategic Analyst</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={clearChat} className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-black">
              Reset
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Live</span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          <div className="scenario-banner">
            <div className="scenario-banner-icon">
              <Zap size={18} />
            </div>
            <div className="scenario-banner-content">
              <h4>What-If Engine Active</h4>
              <p>Try: "What if revenue grows by 20%?" to see price target impacts.</p>
            </div>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.isUser ? 'user' : 'bot'} ${msg.isError ? 'opacity-90' : ''}`}>
              <div className={`avatar ${msg.isUser ? 'user' : 'bot'}`}>
                {msg.isUser ? <User size={16} /> : (msg.isError ? <AlertCircle size={16} className="text-red-400" /> : <Zap size={16} />)}
              </div>
              <div className="flex flex-col">
                {msg.isScenario && (
                  <div className="scenario-tag">
                    <Zap size={10} />
                    <span>Projection</span>
                  </div>
                )}
                <div className="message-bubble">
                  {msg.isUser ? msg.text : <MarkdownText text={msg.text} />}
                </div>
                <div className={`text-[9px] mt-1 ${msg.isUser ? 'text-right' : ''} text-gray-600 font-bold uppercase`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper bot">
              <div className="avatar bot"><Bot size={16} /></div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="dot" style={{ animationDelay: '0s' }}></div>
                  <div className="dot" style={{ animationDelay: '0.2s' }}></div>
                  <div className="dot" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="quick-actions">
            <button className="action-chip" onClick={() => handleSendMessage("Key risks?")}>Explain Risks</button>
            <button className="action-chip" onClick={() => handleSendMessage(`What if ${symbol} revenue +15%?`)}>+15% Growth</button>
            <button className="action-chip" onClick={() => handleSendMessage("Is dividend safe?")}>Dividend Safety</button>
          </div>
          <div className="input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask a question or simulation..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="send-btn" 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChat;
