'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ items }: { items: { title: string; content: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-line border-t border-line">
      {items.map((item, i) => (
        <div key={item.title}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-ink"
          >
            {item.title}
            <ChevronDown
              size={16}
              className={`text-ink/40 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
            />
          </button>
          {openIndex === i && (
            <p className="pb-4 text-sm leading-6 text-ink/60">{item.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
