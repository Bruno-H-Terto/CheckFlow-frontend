import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import { AppHeader } from "./components/AppHeader";
import { ExecutionsPanel } from "./components/ExecutionsPanel";
import { PlanSidebar } from "./components/PlanSidebar";
import { RealtimeStream } from "./components/RealtimeStream";
import { StepsPanel } from "./components/StepsPanel";
import { panel, primaryButton } from "./components/ui";
import type { Execution, Plan, RealtimeEvent, Step } from "./types";

const WS_URL = import.meta.env.VITE_WS_URL || `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/realtime`;
const sampleStep = JSON.stringify({ name: "Health check", action: { method: "GET", url: "http://127.0.0.1:8000/health" }, assertions: [{ target: "status_code", expected: 200 }] }, null, 2);

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
    } catch (cause) { setError(message(cause)); }
  }, []);

  const loadPlanData = useCallback(async (planId: number) => {
    try {
      const [nextSteps, nextExecutions] = await Promise.all([api.listSteps(planId), api.listExecutions(planId)]);
      setSteps(nextSteps);
      setExecutions(nextExecutions);
    } catch (cause) { setError(message(cause)); }
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
      setEvents((current) => [JSON.parse(event.data) as RealtimeEvent, ...current].slice(0, 30));
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
    } catch (cause) { setError(message(cause)); }
  }

  async function createStep(event: FormEvent) {
    event.preventDefault();
    if (selectedId === null) return;
    try {
      await api.createStep(selectedId, JSON.parse(stepJson));
      await loadPlanData(selectedId);
    } catch (cause) { setError(message(cause)); }
  }

  async function run(action: () => Promise<unknown>) {
    if (selectedId === null) return;
    try { setError(""); await action(); await loadPlanData(selectedId); }
    catch (cause) { setError(message(cause)); }
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] p-4 md:p-7">
      <AppHeader connected={connected} />
      {error && <button className="mb-5 w-full rounded-lg border border-red-300 bg-red-50 p-3 text-left text-red-800" onClick={() => setError("")}>{error} ×</button>}
      <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <PlanSidebar plans={plans} selectedId={selectedId} planName={planName} onPlanNameChange={setPlanName} onSelect={setSelectedId} onCreate={createPlan} />
        <div className="grid min-w-0 gap-5">
          {!selectedPlan ? <div className={`${panel} py-16 text-center text-slate-500`}>Crie um plano para começar.</div> : <>
            <section className={`${panel} flex flex-col items-start justify-between gap-4 bg-gradient-to-br from-white to-emerald-50 sm:flex-row sm:items-center`}>
              <div><span className="text-[.68rem] font-extrabold tracking-[.14em] text-slate-500">PLANO #{selectedPlan.id}</span><h2 className="text-3xl font-bold tracking-tight">{selectedPlan.name}</h2></div>
              <button data-cy="execute-plan" className={primaryButton} onClick={() => run(() => api.executePlan(selectedPlan.id))}>Executar plano</button>
            </section>
            <div className="grid items-start gap-5 xl:grid-cols-2">
              <StepsPanel steps={steps} stepJson={stepJson} onStepJsonChange={setStepJson} onCreate={createStep} />
              <ExecutionsPanel executions={executions} onCancel={(id) => run(() => api.cancelExecution(selectedPlan.id, id))} onRetry={(id) => run(() => api.retryExecution(selectedPlan.id, id))} />
            </div>
            <RealtimeStream events={events} />
          </>}
        </div>
      </section>
    </main>
  );
}

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : "Erro inesperado";
}
