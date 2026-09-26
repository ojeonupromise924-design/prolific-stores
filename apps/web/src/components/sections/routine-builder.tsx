import Link from 'next/link';

const STEPS = [
  { n: '1', title: 'Cleanse', copy: 'Remove buildup and start with a fresh canvas.' },
  { n: '2', title: 'Treat', copy: 'Give your skin targeted care for your specific concerns.' },
  { n: '3', title: 'Hydrate', copy: 'Replenish moisture and support a healthy-looking skin barrier.' },
  { n: '4', title: 'Protect', copy: 'Finish with daily SPF and keep your skin protected.' },
];

export function RoutineBuilder() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-light text-ink">Build Your Perfect Routine</h2>
        <p className="mt-3 text-ink/60">Everything your skin needs, all in one place.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-2xl border border-line p-6">
              <span className="text-2xl font-light text-forest-dark">{step.n}</span>
              <h3 className="mt-2 text-base font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{step.copy}</p>
            </div>
          ))}
        </div>
        <Link href="/routine" className="mt-8 inline-block text-sm font-medium text-ink underline underline-offset-4">
          Build Your Routine →
        </Link>
      </div>
    </section>
  );
}