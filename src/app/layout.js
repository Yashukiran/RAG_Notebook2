import "./globals.css";

export const metadata = {
  title: "NotebookLM RAG",
  description: "A complete Google NotebookLM style RAG application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
