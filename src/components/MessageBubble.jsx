import { useState, useEffect } from 'react';
import { User, Sparkles, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAssistant = message.role === 'assistant';

  const [displayedContent, setDisplayedContent] = useState(isAssistant ? '' : message.content);

  useEffect(() => {
    if (!isAssistant) return;
    
    let i = 0;
    const text = message.content;
    
    const interval = setInterval(() => {
      setDisplayedContent(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 10); 

    return () => clearInterval(interval);
  }, [message.content, isAssistant]);

  return (
    <div className={clsx("flex gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
        isUser ? "bg-accent/20 text-accent" : isSystem ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
      )}>
        {isUser ? <User className="w-4 h-4" /> : isSystem ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>
      <div className={clsx(
        "px-5 py-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed",
        isUser 
          ? "bg-accent/10 border border-accent/20 text-foreground" 
          : isSystem
            ? "bg-red-500/10 border border-red-500/20 text-red-200"
            : "bg-sidebar border border-border text-foreground/90 whitespace-pre-wrap"
      )}>
        {displayedContent}
        {isAssistant && displayedContent.length < message.content.length && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-accent/70 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}
