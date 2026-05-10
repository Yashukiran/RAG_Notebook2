import { ScrollText } from 'lucide-react';

export default function SourceViewer({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-sidebar flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-medium text-foreground/80">Retrieved Sources</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sources.map((src, idx) => (
          <div key={idx} className="bg-background rounded-lg border border-border p-3 text-xs leading-relaxed animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/50">
              <span className="text-accent font-medium">Chunk {idx + 1}</span>
              <span className="text-foreground/40 text-[10px]">{(src.similarity * 100).toFixed(1)}% match</span>
            </div>
            <p className="text-foreground/70 italic line-clamp-6 hover:line-clamp-none transition-all">"{src.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
