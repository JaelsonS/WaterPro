export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-white px-6 py-32" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-4 w-48 rounded bg-slate-line" />
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-ice" />
          <div className="space-y-4 pt-4">
            <div className="h-8 w-3/4 rounded bg-slate-line" />
            <div className="h-4 w-full rounded bg-ice" />
            <div className="h-4 w-5/6 rounded bg-ice" />
            <div className="mt-8 h-12 w-48 rounded-full bg-azure/20" />
          </div>
        </div>
      </div>
      <span className="sr-only">A carregar…</span>
    </div>
  );
}
