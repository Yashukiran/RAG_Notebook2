import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import SourceViewer from './SourceViewer';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSources([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${err.message}. Make sure you've uploaded a document and set the XAI_API_KEY.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col relative h-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              {messages.map((m, idx) => (
                <MessageBubble key={idx} message={m} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-foreground/50 ml-4 animate-pulse">
                  <LoadingSpinner size="md" />
                  <span className="text-sm">Generating response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the uploaded document..."
              className="w-full bg-sidebar border border-border rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 shadow-lg"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-accent hover:bg-accent-hover text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
      
      {/* Sources Panel */}
      {sources.length > 0 && (
        <div className="w-80 border-l border-border bg-sidebar/30 flex flex-col">
          <SourceViewer sources={sources} />
        </div>
      )}
    </div>
  );
}
