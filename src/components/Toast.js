import { CheckCircle } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-emerald-400" />
      <span>{message}</span>
    </div>
  );
}
