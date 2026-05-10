import { BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center gap-3 p-4 border-b border-border bg-sidebar/50 backdrop-blur-md">
      <div className="bg-accent/10 p-2 rounded-lg">
        <BookOpen className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h1 className="font-semibold text-foreground leading-tight">NotebookLM</h1>
        <p className="text-xs text-foreground/50">AI Assistant</p>
      </div>
    </header>
  );
}
