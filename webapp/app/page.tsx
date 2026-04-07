import Link from 'next/link';

const tools = [
  {
    slug: 'growthdiagnostic',
    title: 'Growth Engine Diagnostic',
    description:
      'Find the growth traps slowing your business — and the systems you need to build first.',
    badge: 'Free',
    stats: [
      { value: '24', label: 'Questions' },
      { value: '6–8 min', label: 'Completion' },
    ],
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      <nav className="px-6 py-5 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-brand-border">
        <span className="text-brand-accent font-bold text-lg tracking-tight">GrowthSpan</span>
      </nav>

      <main className="flex-1 px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="mb-12">
          <div className="inline-flex items-center rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-1.5 text-sm font-medium text-brand-accent mb-6">
            Operator Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            Tools for growth-stage operators
          </h1>
          <p className="text-lg text-brand-muted max-w-xl">
            Free diagnostic and planning tools to help you find constraints and build better systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="group card hover:border-brand-accent/40 hover:shadow-sm transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-brand-accent p-2 rounded-lg bg-brand-accent/10 group-hover:bg-brand-accent/15 transition-colors">
                  {tool.icon}
                </div>
                <span className="text-xs font-semibold text-brand-accent bg-brand-accent/10 rounded-full px-2.5 py-1">
                  {tool.badge}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-brand-text mb-2 group-hover:text-brand-accent transition-colors">
                {tool.title}
              </h2>
              <p className="text-sm text-brand-muted mb-6 flex-1 leading-relaxed">
                {tool.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {tool.stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-sm font-bold text-brand-text">{s.value}</div>
                      <div className="text-xs text-brand-subtle">{s.label}</div>
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-brand-accent group-hover:translate-x-0.5 transition-transform">
                  Start →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-brand-subtle max-w-5xl mx-auto w-full border-t border-brand-border">
        © {new Date().getFullYear()} GrowthSpan. All tools are free to use.
      </footer>
    </div>
  );
}
