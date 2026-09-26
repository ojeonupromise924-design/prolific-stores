const VALUES = [
  { title: 'Curated With Purpose', copy: 'We bring together products selected with your skin goals in mind.' },
  { title: 'Made for Real Routines', copy: 'Whether you keep it simple or love a 10-step ritual, there\u2019s a place for Prolific in your routine.' },
  { title: 'Beauty Without the Guesswork', copy: 'Discover clear, helpful guidance so you can shop with confidence.' },
  { title: 'Your Skin, Your Journey', copy: 'Because healthy-looking skin doesn\u2019t happen overnight. We\u2019re here for every step.' },
];

export function WhyProlific() {
  return (
    <section className="border-t border-line bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-forest-dark">Why Prolific</p>
        <h2 className="mt-2 text-3xl font-light text-ink">More Than a Beauty Store</h2>
        <p className="mt-3 max-w-xl text-ink/60">We believe finding great skincare shouldn&apos;t feel complicated.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title}>
              <h3 className="text-base font-medium text-ink">{v.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{v.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}