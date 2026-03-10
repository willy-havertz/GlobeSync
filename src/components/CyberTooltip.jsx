export default function CyberTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-dark px-3 py-2 text-[0.58rem] border border-cyan-800/40">
      <p className="text-cyan-500 mb-1 tracking-widest">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}
