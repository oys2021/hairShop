export default function StatusBadge({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-green-100 text-brand-green',
    red: 'bg-red-100 text-brand-red',
    orange: 'bg-orange-100 text-brand-orange',
    blue: 'bg-blue-100 text-brand-navy',
  };

  return (
    <span className={`inline-flex min-w-20 items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
