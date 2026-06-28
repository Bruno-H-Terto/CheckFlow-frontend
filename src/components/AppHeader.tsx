type AppHeaderProps = {
  connected: boolean;
};

export function AppHeader({ connected }: AppHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div>
        <span className="text-[.68rem] font-extrabold tracking-[.14em] text-slate-500">
          WORKFLOW ENGINE
        </span>
        <h1 className="text-4xl font-bold tracking-[-.04em]">Checkflow</h1>
      </div>
      <span
        data-cy="realtime-status"
        className={`rounded-full px-3 py-2 text-xs font-medium ${connected ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}
      >
        <i
          className={`mr-2 inline-block size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`}
        />
        {connected ? "Realtime conectado" : "Realtime desconectado"}
      </span>
    </header>
  );
}
