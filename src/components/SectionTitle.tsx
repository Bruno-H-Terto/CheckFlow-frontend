export function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="text-xl font-bold tracking-tight">
      {title}{" "}
      <span className="inline-grid size-6 place-items-center rounded-full bg-emerald-50 align-middle text-xs text-emerald-800">
        {count}
      </span>
    </h2>
  );
}
