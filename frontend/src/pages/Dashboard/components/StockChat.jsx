import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, ChevronDown, Zap } from 'lucide-react';

const chatStyles = `
  .stock-chat-container {
    margin-top: 4rem;
    border-radius: 24px;
    background: rgba(10, 15, 25, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    height: 600px;
    position: relative;
  }

  .chat-header {
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
    font-size: 1.1rem;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }

  .message-wrapper {
    display: flex;
    gap: 1rem;
    max-width: 85%;
  }

  .message-wrapper.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar.bot { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; }
  .avatar.user { background: rgba(255, 255, 255, 0.1); color: #ccc; }

  .message-bubble {
    padding: 1rem 1.25rem;
    border-radius: 18px;
    font-size: 0.95rem;
    line-height: 1.5;
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
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  }

  .scenario-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .chat-input-area {
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .input-container {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
  }

  .input-container:focus-within {
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }

  .chat-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    outline: none;
  }

  .send-btn {
    width: 40px;
    height: 40px;
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
  .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .quick-actions {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    scrollbar-width: none;
  }

  .action-chip {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #9ca3af;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .action-chip:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    color: #fff;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #6366f1;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const StockChat = ({ jobId, symbol }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello! I'm your InvestIQ Strategic Analyst. I've analyzed the report for ${symbol}. Ask me anything about the financials, or try a 'What-If' scenario!`,
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      text: `Chat cleared. Ready for new analysis on ${symbol}.`,
      isUser: false
    }]);
  };

  // Simple Markdown-lite parser for financial reports
  const MarkdownText = ({ text }) => {
    // 1. Bold numbers and percentages
    let processed = text.replace(/(\d+\.?\d*%?|\₹\d+[\d,]*\.?\d*)/g, '<strong>$1</strong>');
    // 2. Bold headers like ###
    processed = processed.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    // 3. Bullet points
    processed = processed.replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>');
    
    return <div dangerouslySetInnerHTML={{ __html: processed }} />;
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text || !text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare history for the backend (excluding current message)
      const chatHistory = messages.map(m => ({
        text: m.text,
        isUser: m.isUser
      }));

      const response = await fetch('/api/v2/reports/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          message: text.trim(),
          history: chatHistory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        isScenario: text.toLowerCase().includes('what if') || text.toLowerCase().includes('scenario'),
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        id: Date.now() + 2,
        text: "I'm having trouble connecting to the Strategic AI. Please check your connection and try again.",
        isUser: false,
        isError: true,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stock-chat-root">
      <style>{chatStyles}</style>
      <div className="stock-chat-container">
        <div className="chat-header">
          <div className="chat-title">
            <Sparkles size={20} className="text-indigo-400" />
            <span>Ask InvestIQ Strategic AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={clearChat}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Clear History
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Agent Online: {symbol} Context Active
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.isUser ? 'user' : 'bot'} ${msg.isError ? 'opacity-70' : ''}`}>
              <div className={`avatar ${msg.isUser ? 'user' : 'bot'}`}>
                {msg.isUser ? <User size={18} /> : (msg.isError ? <AlertCircle size={18} className="text-red-400" /> : <Zap size={18} />)}
              </div>
              <div className="flex flex-col">
                {msg.isScenario && (
                  <div className="scenario-tag">
                    <Zap size={12} />
                    <span>Scenario Projection</span>
                  </div>
                )}
                <div className="message-bubble">
                  {msg.isUser ? msg.text : <MarkdownText text={msg.text} />}
                </div>
                <div className={`text-[10px] mt-1 ${msg.isUser ? 'text-right' : ''} text-gray-500`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper bot">
              <div className="avatar bot">
                <Bot size={18} />
              </div>
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
            <button className="action-chip" onClick={() => handleSendMessage("Explain the top 3 risks in simpler terms")}>
              Explained Risks
            </button>
            <button className="action-chip" onClick={() => handleSendMessage(`What if ${symbol} revenue grows by 15%?`)}>
              Scenario: +15% Revenue
            </button>
            <button className="action-chip" onClick={() => handleSendMessage("Is the dividend sustainable?")}>
              Dividend Safety
            </button>
          </div>
          <div className="input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask a question or run a scenario..."
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
