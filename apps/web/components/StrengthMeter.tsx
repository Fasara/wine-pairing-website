export function StrengthMeter({ strength }: { strength: number }) {
  const value = Math.max(0, Math.min(5, Math.round(strength)));
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`Match strength ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-2.5 w-5 rounded-sm ${i <= value ? 'bg-sage-700' : 'bg-sage-100'}`}
        />
      ))}
    </span>
  );
}
