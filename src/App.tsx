import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Execution, Plan, RealtimeEvent, Step } from "./types";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/realtime`;

const sampleStep = JSON.stringify(
  {
    name: "Health check",
    action: { method: "GET", url: "http://127.0.0.1:8000/health" },
    assertions: [{ target: "status_code", expected: 200 }],
  },
  null,
  2,
);

const panel = "rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-[0_8px_30px_rgba(31,53,32,0.04)]";
const button = "rounded-lg border border-emerald-950/20 bg-white px-3 py-2 text-sm transition hover:border-emerald-600";
const primaryButton = `${button} border-brand bg-brand font-semibold text-white hover:border-emerald-800 hover:bg-emerald-800`;
const input = "w-full rounded-lg border border-emerald-950/15 bg-stone-50 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export function App() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [planName, setPlanName] = useState("");
  const [stepJson, setStepJson] = useState(sampleStep);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const socket = useRef<WebSocket | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedId);

  const loadPlans = useCallback(async () => {
    try {
      const result = await api.listPlans();
      setPlans(result);
      setSelectedId((current) => current ?? result[0]?.id ?? null);
    } catch (cause) {
      setError(message(cause));
    }
  }, []);

  const loadPlanData = useCallback(async (planId: number) => {
    try {
      const [nextSteps, nextExecutions] = await Promise.all([
        api.listSteps(planId),
        api.listExecutions(planId),
      ]);
      setSteps(nextSteps);
      setExecutions(nextExecutions);
    } catch (cause) {
      setError(message(cause));
    }
  }, []);

  useEffect(() => void loadPlans(), [loadPlans]);

  useEffect(() => {
    if (selectedId === null) return;
    void loadPlanData(selectedId);
    setEvents([]);
    socket.current?.close();
    const connection = new WebSocket(`${WS_URL}/ws/plans/${selectedId}/executions`);
    socket.current = connection;
    connection.onopen = () => setConnected(true);
    connection.onclose = () => setConnected(false);
    connection.onerror = () => setError("Não foi possível conectar ao realtime");
    connection.onmessage = (event) => {
      const payload = JSON.parse(event.data) as RealtimeEvent;
      setEvents((current) => [payload, ...current].slice(0, 30));
      void loadPlanData(selectedId);
    };
    return () => connection.close();
  }, [loadPlanData, selectedId]);

  async function createPlan(event: FormEvent) {
    event.preventDefault();
    try {
      const plan = await api.createPlan(planName, "Criado pelo frontend");
      setPlanName("");
      await loadPlans();
      setSelectedId(plan.id);
    } catch (cause) {
      setError(message(cause));
    }
  }

  async function createStep(event: FormEvent) {
    event.preventDefault();
    if (selectedId === null) return;
    try {
      await api.createStep(selectedId, JSON.parse(stepJson));
      await loadPlanData(selectedId);
    } catch (cause) {
      setError(message(cause));
    }
  }

  async function run(action: () => Promise<unknown>) {
    if (selectedId === null) return;
    try {
      setError("");
      await action();
      await loadPlanData(selectedId);
    } catch (cause) {
      setError(message(cause));
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] p-4 md:p-7">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <span className="text-[.68rem] font-extrabold tracking-[.14em] text-slate-500">WORKFLOW ENGINE</span>
          <h1 className="text-4xl font-bold tracking-[-.04em]">Checkflow</h1>
        </div>
        <span className={`rounded-full px-3 py-2 text-xs font-medium ${connected ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
          <i className={`mr-2 inline-block size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`} />
          {connected ? "Realtime conectado" : "Realtime desconectado"}
        </span>
      </header>

      {error && <button className="mb-5 w-full rounded-lg border border-red-300 bg-red-50 p-3 text-left text-red-800" onClick={() => setError("")}>{error} ×</button>}

      <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className={`${panel} self-start lg:sticky lg:top-5`}>
          <h2 className="text-xl font-bold tracking-tight">Planos</h2>
          <form onSubmit={createPlan} className="mt-4 flex gap-2">
            <input className={input} value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="Novo plano" required />
            <button className={primaryButton} type="submit">Criar</button>
          </form>
          <nav className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {plans.map((plan) => (
              <button key={plan.id} className={`grid gap-1 rounded-xl p-3 text-left transition ${plan.id === selectedId ? "bg-brand-soft text-emerald-800" : "hover:bg-stone-100"}`} onClick={() => setSelectedId(plan.id)}>
                <strong>{plan.name}</strong><small className="text-slate-500">Plano #{plan.id}</small>
              </button>
            ))}
          </nav>
        </aside>

        <div className="grid min-w-0 gap-5">
          {!selectedPlan ? <div className={`${panel} py-16 text-center text-slate-500`}>Crie um plano para começar.</div> : <>
            <section className={`${panel} flex flex-col items-start justify-between gap-4 bg-gradient-to-br from-white to-emerald-50 sm:flex-row sm:items-center`}>
              <div><span className="text-[.68rem] font-extrabold tracking-[.14em] text-slate-500">PLANO #{selectedPlan.id}</span><h2 className="text-3xl font-bold tracking-tight">{selectedPlan.name}</h2></div>
              <button className={primaryButton} onClick={() => run(() => api.executePlan(selectedPlan.id))}>Executar plano</button>
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-2">
              <section className={panel}>
                <SectionTitle title="Steps" count={steps.length} />
                <div className="my-4 grid gap-2">
                  {steps.map((step) => <article className="flex items-center gap-3 border-b border-slate-100 py-2" key={step.id}><span className="grid size-8 place-items-center rounded-lg bg-emerald-50 font-bold text-emerald-800">{step.sequence}</span><div className="grid"><strong>{step.name}</strong><small className="text-slate-500">Step #{step.id}</small></div></article>)}
                </div>
                <form onSubmit={createStep}>
                  <label className="mb-2 block text-xs font-bold text-slate-600">Novo step em JSON</label>
                  <textarea className={`${input} resize-y font-mono text-xs leading-relaxed`} value={stepJson} onChange={(event) => setStepJson(event.target.value)} rows={12} />
                  <button className={`${primaryButton} mt-2`} type="submit">Adicionar step</button>
                </form>
              </section>

              <section className={panel}>
                <SectionTitle title="Execuções" count={executions.length} />
                <div className="mt-4 grid gap-2">
                  {executions.map((execution) => (
                    <article className="grid gap-2 rounded-xl border border-emerald-950/10 p-3" key={execution.id}>
                      <div className="flex items-center justify-between"><Status value={execution.status} /><code className="text-xs">{execution.id.slice(0, 8)}</code></div>
                      <small className="text-slate-500">{new Date(execution.created_at).toLocaleString("pt-BR")}</small>
                      <div className="flex gap-2">
                        {(["pending", "running"].includes(execution.status)) && <button className={button} onClick={() => run(() => api.cancelExecution(selectedPlan.id, execution.id))}>Cancelar</button>}
                        {(["failed", "cancelled"].includes(execution.status)) && <button className={button} onClick={() => run(() => api.retryExecution(selectedPlan.id, execution.id))}>Retry</button>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <section className={`${panel} max-h-96 overflow-auto`}>
              <h2 className="text-xl font-bold tracking-tight">Stream realtime</h2>
              {events.length === 0 ? <div className="py-8 text-center text-slate-500">Os eventos aparecerão aqui durante uma execução.</div> : events.map((event, index) => (
                <article className="grid gap-1 border-t border-slate-100 py-3 text-xs md:grid-cols-[80px_210px_1fr] md:gap-3" key={`${String(event.event_type)}-${index}`}><time className="text-slate-400">{new Date().toLocaleTimeString("pt-BR")}</time><strong>{String(event.event_type ?? "event")}</strong><code className="truncate text-slate-500">{JSON.stringify(event)}</code></article>
              ))}
            </section>
          </>}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return <h2 className="text-xl font-bold tracking-tight">{title} <span className="inline-grid size-6 place-items-center rounded-full bg-emerald-50 align-middle text-xs text-emerald-800">{count}</span></h2>;
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

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : "Erro inesperado";
}
