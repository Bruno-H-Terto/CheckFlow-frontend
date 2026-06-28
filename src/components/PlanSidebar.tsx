import type { FormEvent } from "react";
import type { Plan } from "../types";
import { input, panel, primaryButton } from "./ui";

type PlanSidebarProps = {
  plans: Plan[];
  selectedId: number | null;
  planName: string;
  onPlanNameChange: (value: string) => void;
  onSelect: (planId: number) => void;
  onCreate: (event: FormEvent) => void;
};

export function PlanSidebar({ plans, selectedId, planName, onPlanNameChange, onSelect, onCreate }: PlanSidebarProps) {
  return (
    <aside className={`${panel} self-start lg:sticky lg:top-5`}>
      <h2 className="text-xl font-bold tracking-tight">Planos</h2>
      <form onSubmit={onCreate} className="mt-4 flex gap-2">
        <input data-cy="plan-name" className={input} value={planName} onChange={(event) => onPlanNameChange(event.target.value)} placeholder="Novo plano" required />
        <button className={primaryButton} type="submit">Criar</button>
      </form>
      <nav className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {plans.map((plan) => (
          <button data-cy={`plan-${plan.id}`} key={plan.id} className={`grid gap-1 rounded-xl p-3 text-left transition ${plan.id === selectedId ? "bg-brand-soft text-emerald-800" : "hover:bg-stone-100"}`} onClick={() => onSelect(plan.id)}>
            <strong>{plan.name}</strong>
            <small className="text-slate-500">Plano #{plan.id}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}
