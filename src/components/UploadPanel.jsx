import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function UploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [docInfo, setDocInfo] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setStatus('success');
      setDocInfo({ filename: data.filename, chunks: data.chunksCount });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-border p-4">
      <h2 className="text-sm font-semibold text-foreground/80 mb-4 uppercase tracking-wider">Document Source</h2>
      
      <div className="bg-background rounded-xl p-4 border border-border">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-accent/50 hover:bg-accent/5 rounded-lg p-6 cursor-pointer transition-colors">
          <UploadCloud className="w-8 h-8 text-foreground/50 mb-2" />
          <span className="text-sm text-foreground/70 font-medium">Click to select PDF/CSV</span>
          <span className="text-xs text-foreground/40 mt-1">Max file size: 10MB</span>
          <input type="file" accept=".pdf,.csv" className="hidden" onChange={handleFileChange} />
        </label>
        
        {file && (
          <div className="mt-4 flex items-center justify-between bg-sidebar p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm truncate text-foreground/80">{file.name}</span>
            </div>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="w-full mt-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {status === 'uploading' ? (
            <><LoadingSpinner size="sm" /> Processing...</>
          ) : (
            'Upload & Process'
          )}
        </button>

        {status === 'error' && (
          <div className="mt-4 flex items-start gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm border border-red-400/20">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === 'success' && docInfo && (
          <div className="mt-4 flex items-start gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg text-sm border border-green-400/20">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Ready for questions</p>
              <p className="text-xs opacity-80 mt-1">Extracted {docInfo.chunks} chunks</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
