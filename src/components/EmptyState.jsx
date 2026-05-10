import { Sparkles, FileText, Search } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-lg mx-auto mt-20 animate-slide-up">
      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border border-accent/20">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-3">Welcome to NotebookLM RAG</h2>
      <p className="text-sm text-foreground/60 leading-relaxed mb-8">
        Upload a PDF or CSV document in the sidebar, and I will read it, process it, and generate a vector embedding index. You can then ask me any questions based on its contents.
      </p>
      
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-sidebar border border-border rounded-xl p-4 flex flex-col items-center text-center">
          <FileText className="w-5 h-5 text-accent mb-2" />
          <h3 className="text-xs font-medium text-foreground/80 mb-1">1. Parse & Chunk</h3>
          <p className="text-[10px] text-foreground/50">Extracts text and applies recursive chunking.</p>
        </div>
        <div className="bg-sidebar border border-border rounded-xl p-4 flex flex-col items-center text-center">
          <Search className="w-5 h-5 text-accent mb-2" />
          <h3 className="text-xs font-medium text-foreground/80 mb-1">2. Embed & Search</h3>
          <p className="text-[10px] text-foreground/50">Uses MiniLM-L6-v2 + Cosine Similarity.</p>
        </div>
      </div>
    </div>
  );
}
