'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={24}
            className={n <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-ink/20'}
          />
        </button>
      ))}
    </div>
  );
}