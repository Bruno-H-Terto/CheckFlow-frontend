import { useState, type FormEvent } from "react";
import type { Step, StepCreate, StepFormState, StepUpdate } from "../types";
import { emptyStepForm } from "../types";
import { SectionTitle } from "./SectionTitle";
import { input, panel, primaryButton } from "./ui";

type StepsPanelProps = {
  steps: Step[];
  onCreate: (payload: StepCreate) => Promise<void>;
  onUpdate: (stepId: number, payload: StepUpdate) => Promise<void>;
  onDelete: (stepId: number) => Promise<void>;
};

export function StepsPanel({ steps, onCreate, onUpdate, onDelete }: StepsPanelProps) {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<StepFormState>(emptyStepForm);
  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? null;

  function updateField<K extends keyof StepFormState>(
    field: K,
    value: StepFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectStep(step: Step) {
    setSelectedStepId(step.id);
    setIsCreating(false);
    setIsEditing(false);
  }

  function openCreateForm() {
    setSelectedStepId(null);
    setForm(emptyStepForm);
    setIsCreating((current) => !current);
    setIsEditing(false);
  }

  function toggleEditForm() {
    if (!selectedStep) return;

    if (!isEditing) {
      setForm(stepToForm(selectedStep));
    }
    setIsEditing((current) => !current);
  }

  async function deleteStep() {
    if (!selectedStep) return;

    await onDelete(selectedStep.id);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (selectedStep) {
      await onUpdate(selectedStep.id, formToUpdate(form, selectedStep));
      setIsEditing(false);
      return;
    }

    await onCreate(formToCreate(form));
    setForm(emptyStepForm);
    setIsCreating(false);
  }

  const formVisible = isCreating || (selectedStep !== null && isEditing);

  return (
    <section className={panel}>
      <div className="flex items-center justify-between gap-3">
        <SectionTitle title="Steps" count={steps.length} />
        <button
          type="button"
          className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
          onClick={openCreateForm}
          aria-expanded={isCreating}
        >
          {isCreating ? "Cancelar" : "+ Novo step"}
        </button>
      </div>

      <div className="my-4 grid gap-2">
        {steps.map((step) => {
          const selected = step.id === selectedStepId;

          return (
            <article
              key={step.id}
              className={`rounded-xl border p-3 transition-colors ${
                selected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => selectStep(step)}
                aria-pressed={selected}
              >
                <strong>{step.sequence}. {step.name}</strong>
                <p className="text-xs text-slate-500">
                  {step.action.method} {step.action.url}
                </p>
                <p className="text-xs text-slate-400">
                  Criado em {new Date(step.created_at).toLocaleString("pt-BR")}
                </p>
              </button>
            </article>
          );
        })}
      </div>

      {selectedStep && (
        <section className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Step selecionado
              </p>
              <h3 className="font-bold">{selectedStep.name}</h3>
            </div>
            <button
              type="button"
              className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-white"
              onClick={toggleEditForm}
              aria-expanded={isEditing}
              aria-controls="step-form"
            >
              {isEditing ? "Fechar edição" : "Editar step"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-white"
              onClick={deleteStep}
              >
                Deletar passo

            </button>
          </div>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="font-bold">Método</dt><dd>{selectedStep.action.method}</dd></div>
            <div><dt className="font-bold">Timeout</dt><dd>{selectedStep.action.timeout_seconds}s</dd></div>
            <div className="sm:col-span-2"><dt className="font-bold">URL</dt><dd className="break-all">{selectedStep.action.url}</dd></div>
            {selectedStep.description && (
              <div className="sm:col-span-2"><dt className="font-bold">Descrição</dt><dd>{selectedStep.description}</dd></div>
            )}
            <div><dt className="font-bold">Assertions</dt><dd>{selectedStep.assertions.length}</dd></div>
            <div><dt className="font-bold">Status</dt><dd>{selectedStep.active ? "Ativo" : "Inativo"}</dd></div>
          </dl>
        </section>
      )}

      {formVisible && (
        <form id="step-form" onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700">
            {selectedStep ? `Editar ${selectedStep.name}` : "Novo step"}
          </h3>

          <input className={input} placeholder="Nome" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          <textarea className={input} placeholder="Descrição" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
          <select className={input} value={form.method} onChange={(event) => updateField("method", event.target.value as StepFormState["method"])}>
            <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="PATCH">PATCH</option><option value="DELETE">DELETE</option>
          </select>
          <input className={input} placeholder="URL" value={form.url} onChange={(event) => updateField("url", event.target.value)} required />
          <input className={input} type="number" min="1" placeholder="Timeout em segundos" value={form.timeout_seconds} onChange={(event) => updateField("timeout_seconds", Number(event.target.value))} />
          <input className={input} type="number" placeholder="Status esperado" value={form.expected_status} onChange={(event) => updateField("expected_status", Number(event.target.value))} />
          <button className={primaryButton} type="submit">
            {selectedStep ? "Salvar alterações" : "Adicionar step"}
          </button>
        </form>
      )}
    </section>
  );
}

function stepToForm(step: Step): StepFormState {
  const statusAssertion = step.assertions.find(
    (assertion) => assertion.target === "status_code"
  );

  return {
    name: step.name,
    description: step.description ?? "",
    method: step.action.method,
    url: step.action.url,
    timeout_seconds: step.action.timeout_seconds,
    expected_status:
      typeof statusAssertion?.expected === "number" ? statusAssertion.expected : 200,
  };
}

function formToCreate(form: StepFormState): StepCreate {
  return {
    name: form.name,
    description: form.description,
    action: {
      type: "http",
      method: form.method,
      url: form.url,
      headers: {},
      body: null,
      timeout_seconds: form.timeout_seconds,
    },
    assertions: [{
      target: "status_code",
      operator: "equals",
      expected: form.expected_status,
      path: null,
    }],
    extracts: {},
    active: true,
  };
}

function formToUpdate(form: StepFormState, step: Step): StepUpdate {
  const statusAssertion = {
    target: "status_code" as const,
    operator: "equals" as const,
    expected: form.expected_status,
    path: null,
  };
  const assertions = step.assertions.some(
    (assertion) => assertion.target === "status_code"
  )
    ? step.assertions.map((assertion) =>
        assertion.target === "status_code" ? statusAssertion : assertion
      )
    : [...step.assertions, statusAssertion];

  return {
    sequence: step.sequence,
    name: form.name,
    description: form.description,
    action: {
      ...step.action,
      method: form.method,
      url: form.url,
      timeout_seconds: form.timeout_seconds,
    },
    assertions,
    extracts: step.extracts,
    active: step.active,
  };
}

function formToDelete(form: StepFormState): StepCreate {
  return {
    name: form.name,
    description: form.description,
    action: {
      type: "http",
      method: form.method,
      url: form.url,
      headers: {},
      body: null,
      timeout_seconds: form.timeout_seconds,
    },
    assertions: [{
      target: "status_code",
      operator: "equals",
      expected: form.expected_status,
      path: null,
    }],
    extracts: {},
    active: true,
  };
}