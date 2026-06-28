import type { Execution } from "../types";
import { SectionTitle } from "./SectionTitle";
import { button, panel } from "./ui";

type ExecutionsPanelProps = {
  executions: Execution[];
  onCancel: (executionId: string) => void;
  onRetry: (executionId: string) => void;
};

export function ExecutionsPanel({ executions, onCancel, onRetry }: ExecutionsPanelProps) {
  return (
    <section className={panel}>
      <SectionTitle title="Execuções" count={executions.length} />
      <div className="mt-4 grid gap-2">
        {executions.map((execution) => (
          <article data-cy={`execution-${execution.id}`} className="grid gap-2 rounded-xl border border-emerald-950/10 p-3" key={execution.id}>
            <div className="flex items-center justify-between"><Status value={execution.status} /><code className="text-xs">{execution.id.slice(0, 8)}</code></div>
            <small className="text-slate-500">{new Date(execution.created_at).toLocaleString("pt-BR")}</small>
            <div className="flex gap-2">
              {(["pending", "running"].includes(execution.status)) && <button className={button} onClick={() => onCancel(execution.id)}>Cancelar</button>}
              {(["failed", "cancelled"].includes(execution.status)) && <button className={button} onClick={() => onRetry(execution.id)}>Retry</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Status({ value }: { value: Execution["status"] }) {
  const colors: Record<Execution["status"], string> = {
    completed: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-red-100 text-red-800",
    running: "bg-amber-100 text-amber-800",
    pending: "bg-slate-200 text-slate-700",
  };
  return <span className={`rounded-full px-2 py-1 text-[.68rem] font-extrabold uppercase ${colors[value]}`}>{value}</span>;
}
