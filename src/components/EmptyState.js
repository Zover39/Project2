export default function EmptyState({ icon: Icon, title, className = '' }) {
  return (
    <div className={`py-16 text-center space-y-3 bg-white rounded-3xl border ${className}`}>
      <Icon className="w-12 h-12 text-slate-300 mx-auto" />
      <h4 className="text-lg font-bold text-slate-800">{title}</h4>
    </div>
  );
}
