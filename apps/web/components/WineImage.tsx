'use client';

import { useState } from 'react';

export function WineImage({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`No image available for ${name}`}
        className="flex h-40 w-full items-center justify-center rounded-lg bg-sage-50 text-4xl"
      >
        <span aria-hidden="true">🍷</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-40 w-full rounded-lg bg-sage-50 object-contain"
    />
  );
}
