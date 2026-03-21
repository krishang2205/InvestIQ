import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Zap, X } from 'lucide-react';

const chatStyles = `
  .stock-chat-root {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .stock-chat-widget {
    position: fixed;
    bottom: 100px;
    left: 30px;
    width: 420px;
    height: 600px;
    border-radius: 20px;
    background: rgba(10, 10, 10, 0.85);
    backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid rgba(209, 199, 157, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(209, 199, 157, 0.1);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    transform-origin: bottom left;
    opacity: 0;
    transform: scale(0.95) translateY(20px);
    pointer-events: none;
  }

  .stock-chat-widget.open {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: auto;
  }

  /* Theme-matched Mesh Glow Background */
  .chat-mesh-glow {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at 0% 0%, rgba(209, 199, 157, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 100% 100%, rgba(209, 199, 157, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .chat-toggle-btn {
    position: fixed;
    bottom: 25px;
    left: 30px;
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: #D1C79D;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(209, 199, 157, 0.3);
    z-index: 1001;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .chat-toggle-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(209, 199, 157, 0.5);
    background: #FFF8E1;
  }

  .chat-toggle-btn.open {
    background: #111;
    color: #D1C79D;
    border-color: #D1C79D;
    transform: rotate(90deg);
  }

  .chat-header {
    padding: 1.25rem 1.5rem;
    background: rgba(209, 199, 157, 0.03);
    border-bottom: 1px solid rgba(209, 199, 157, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
  }

  .chat-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
    color: #D1C79D;
    font-size: 0.95rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    z-index: 1;
    scrollbar-width: thin;
    scrollbar-color: rgba(209, 199, 157, 0.1) transparent;
  }

  .chat-messages::-webkit-scrollbar { width: 3px; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(209, 199, 157, 0.2); border-radius: 10px; }

  .message-wrapper {
    display: flex;
    gap: 0.75rem;
    max-width: 90%;
    animation: slideIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  @keyframes slideIn { 
    from { opacity: 0; transform: translateX(-10px); } 
    to { opacity: 1; transform: translateX(0); } 
  }

  .message-wrapper.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .message-bubble {
    padding: 0.9rem 1.2rem;
    border-radius: 14px;
    font-size: 0.9rem;
    line-height: 1.6;
    position: relative;
  }

  .message-wrapper.bot .message-bubble {
    background: rgba(255, 255, 255, 0.03);
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 3px solid #D1C79D;
  }

  .message-wrapper.user .message-bubble {
    background: #D1C79D;
    color: #000;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(209, 199, 157, 0.2);
  }

  .chat-input-area {
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(209, 199, 157, 0.1);
    z-index: 1;
  }

  .input-container {
    background: #111;
    border: 1px solid rgba(209, 199, 157, 0.2);
    border-radius: 12px;
    padding: 0.35rem;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
  }

  .input-container:focus-within {
    border-color: #D1C79D;
    box-shadow: 0 0 0 3px rgba(209, 199, 157, 0.1);
  }

  .chat-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    outline: none;
  }

  .chat-input::placeholder { color: #4b5563; }

  .send-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #D1C79D;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .send-btn:hover { transform: scale(1.05); background: #FFF8E1; }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .quick-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.85rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    scrollbar-width: none;
  }

  .action-chip {
    padding: 0.4rem 0.8rem;
    background: rgba(209, 199, 157, 0.05);
    border: 1px solid rgba(209, 199, 157, 0.15);
    border-radius: 8px;
    color: #D1C79D;
    font-size: 0.75rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .action-chip:hover {
    background: rgba(209, 199, 157, 0.2);
    color: #fff;
  }

  .typing-indicator { display: flex; gap: 4px; padding: 4px; }
  .dot { width: 4px; height: 4px; background: #D1C79D; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }

  @keyframes bounce { 0%, 80%, 100% { transform: scale(0.3); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }

  .scenario-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.6rem;
    background: rgba(209, 199, 157, 0.15);
    color: #D1C79D;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 800;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
  }
`;

const StockChat = ({ jobId, symbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Deep-analysis for **${symbol}** complete. I am ready for strategic queries or valuation simulations.`,
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

  const MarkdownText = ({ text }) => {
    let processed = text.replace(/(\*\*(.*?)\*\*)/g, '<strong style="color: #D1C79D">$2</strong>');
    processed = processed.replace(/(\d+\.?\d*%?|\₹\d+[\d,]*\.?\d*)/g, '<strong style="color: #D1C79D">$1</strong>');
    processed = processed.replace(/^### (.*$)/gm, '<h3 style="color: #D1C79D; font-size: 0.9rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em;">$1</h3>');
    processed = processed.replace(/^- (.*$)/gm, '<li style="margin-left: 0.5rem; margin-bottom: 0.25rem; list-style: none; display: flex; gap: 0.5rem; align-items: flex-start;"><span style="color: #D1C79D">•</span> $1</li>');
    return <div dangerouslySetInnerHTML={{ __html: processed }} />;
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
      const response = await fetch('http://localhost:5001/api/v2/reports/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          message: text.trim(),
          history: messages.map(m => ({ text: m.text, isUser: m.isUser }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connection failed');

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        isScenario: text.toLowerCase().includes('what if') || text.toLowerCase().includes('scenario'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: "Strategic API connection timed out. Please verify service status.",
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
        title={isOpen ? "Return to Report" : "Launch Strategic AI"}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      <div className={`stock-chat-widget ${isOpen ? 'open' : ''}`}>
        <div className="chat-mesh-glow" />
        
        <div className="chat-header">
          <div className="chat-title">
            <Zap size={16} />
            <span>AI Strategic Analyst</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
            <ChevronDown size={20} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.isUser ? 'user' : 'bot'}`}>
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
                <div className={`text-[9px] mt-1 ${msg.isUser ? 'text-right' : ''} text-gray-700 font-bold uppercase tracking-wider`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper bot">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="dot"></div>
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
            <button className="action-chip" onClick={() => handleSendMessage("Valuation risks?")}>Risks</button>
            <button className="action-chip" onClick={() => handleSendMessage(`What if ${symbol} margin drops 5%?`)}>Margin Simulation</button>
            <button className="action-chip" onClick={() => handleSendMessage("Capital allocation?")}>Capital</button>
          </div>
          <div className="input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="send-btn" 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add ChevronDown to the icons import if not present
const ChevronDown = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default StockChat;
