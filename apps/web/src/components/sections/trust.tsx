const POINTS = [
  { title: 'Authentic Products', copy: 'Shop with confidence knowing your beauty essentials are sourced with authenticity in mind.' },
  { title: 'Curated Selection', copy: 'Every product has a purpose. We focus on bringing you skincare worth discovering.' },
  { title: 'Secure Shopping', copy: 'Your shopping experience is designed with your privacy and security in mind.' },
  { title: 'Here for Your Skin', copy: 'Questions about a product or your routine? Prolific is here to help.' },
];

export function Trust() {
  return (
    <section className="border-t border-line bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-light text-ink">Shop With Confidence</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {POINTS.map((p) => (
            <div key={p.title}>
              <h3 className="text-base font-medium text-ink">{p.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{p.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}