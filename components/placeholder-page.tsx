export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
        BookLeaf
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-zinc-900">{title}</h1>
      <p className="mt-4 text-zinc-600">{description}</p>
    </div>
  );
}
