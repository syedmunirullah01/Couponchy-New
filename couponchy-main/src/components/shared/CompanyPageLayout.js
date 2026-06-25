import { Card, CardContent } from "@/components/ui/Card";

export default function CompanyPageLayout({ title, path, children, content }) {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 animate-modalScaleIn">
      {/* Hero Header Banner */}
      <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_55%),var(--surface)] p-6 sm:p-8 lg:p-10 shadow-xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Company Directory</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">{title}</h1>
          <p className="mt-2 text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">{path}</p>
        </div>
      </section>

      {/* Main Content Area */}
      <section>
        <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 lg:p-10 shadow-lg">
          <CardContent className="p-0">
            {content ? (
              <article
                className="prose prose-invert prose-custom max-w-none text-white/80 leading-[1.8] text-[0.98rem] space-y-5
                  prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-3
                  prose-h2:text-[22px] prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-2
                  prose-strong:text-white prose-strong:font-black
                  prose-a:text-[var(--color-primary)] prose-a:underline
                  prose-li:text-white/75"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              children
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
