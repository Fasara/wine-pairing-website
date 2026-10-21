import { typeLabel } from '@/lib/format';
import type { WineType } from '@/lib/types';

export function TypeBadge({ type }: { type: WineType }) {
  return (
    <span className="inline-block rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-semibold text-sage-900">
      {typeLabel(type)}
    </span>
  );
}
