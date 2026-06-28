import type { RealtimeEvent } from "../types";
import { panel } from "./ui";

export function RealtimeStream({ events }: { events: RealtimeEvent[] }) {
  return (
    <section className={`${panel} max-h-96 overflow-auto`}>
      <h2 className="text-xl font-bold tracking-tight">Stream realtime</h2>
      {events.length === 0 ? (
        <div className="py-8 text-center text-slate-500">Os eventos aparecerão aqui durante uma execução.</div>
      ) : events.map((event, index) => (
        <article className="grid gap-1 border-t border-slate-100 py-3 text-xs md:grid-cols-[80px_210px_1fr] md:gap-3" key={`${String(event.event_type)}-${index}`}>
          <time className="text-slate-400">{new Date().toLocaleTimeString("pt-BR")}</time>
          <strong>{String(event.event_type ?? "event")}</strong>
          <code className="truncate text-slate-500">{JSON.stringify(event)}</code>
        </article>
      ))}
    </section>
  );
}
