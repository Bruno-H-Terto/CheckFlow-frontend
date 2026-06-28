import type { FormEvent } from "react";
import type { Step } from "../types";
import { SectionTitle } from "./SectionTitle";
import { input, panel, primaryButton } from "./ui";

type StepsPanelProps = {
  steps: Step[];
  stepJson: string;
  onStepJsonChange: (value: string) => void;
  onCreate: (event: FormEvent) => void;
};

export function StepsPanel({ steps, stepJson, onStepJsonChange, onCreate }: StepsPanelProps) {
  return (
    <section className={panel}>
      <SectionTitle title="Steps" count={steps.length} />
      <div className="my-4 grid gap-2">
        {steps.map((step) => (
          <article className="flex items-center gap-3 border-b border-slate-100 py-2" key={step.id}>
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 font-bold text-emerald-800">{step.sequence}</span>
            <div className="grid"><strong>{step.name}</strong><small className="text-slate-500">Step #{step.id}</small></div>
          </article>
        ))}
      </div>
      <form onSubmit={onCreate}>
        <label className="mb-2 block text-xs font-bold text-slate-600">Novo step em JSON</label>
        <textarea data-cy="step-json" className={`${input} resize-y font-mono text-xs leading-relaxed`} value={stepJson} onChange={(event) => onStepJsonChange(event.target.value)} rows={12} />
        <button className={`${primaryButton} mt-2`} type="submit">Adicionar step</button>
      </form>
    </section>
  );
}
