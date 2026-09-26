const STEPS = [
  { label: 'Cleanse', copy: 'Start fresh with gentle, effective cleansers.' },
  { label: 'Treat', copy: 'Target your skin concerns with powerful treatments.' },
  { label: 'Moisturize', copy: 'Lock in hydration and restore your skin barrier.' },
  { label: 'Protect', copy: 'Give your skin daily defense with SPF.' },
  { label: 'Glow', copy: 'Discover essentials for a healthy, radiant finish.' },
];

export function QuickShop() {
  return (
    <section className="border-t border-line bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-light text-ink">Shop What Your Skin Needs</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          {STEPS.map((step) => (
            <button
              key={step.label}
              className="group flex flex-col items-start gap-2 rounded-2xl border border-line p-5 text-left transition hover:border-sage"
            >
              <span className="text-base font-medium text-ink">{step.label}</span>
              <span className="text-sm text-ink/50">{step.copy}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}