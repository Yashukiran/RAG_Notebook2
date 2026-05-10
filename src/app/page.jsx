"use client";

import Header from '@/components/Header';
import UploadPanel from '@/components/UploadPanel';
import ChatInterface from '@/components/ChatInterface';

export default function Page() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <div className="w-72 hidden md:block shrink-0">
          <UploadPanel />
        </div>
        <ChatInterface />
      </main>
    </div>
  );
}
