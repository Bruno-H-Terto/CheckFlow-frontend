import type { Execution, Plan, Step, StepUpdate } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail ?? `Erro HTTP ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  listPlans: () => request<Plan[]>("/plans"),
  createPlan: (name: string, description: string) =>
    request<Plan>("/plans", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
  listSteps: (planId: number) => request<Step[]>(`/plans/${planId}/steps`),
  createStep: (planId: number, payload: unknown) =>
    request<Step>(`/plans/${planId}/steps`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteStepe: (planId: number, stepId: number) => request(`/plans/${planId}/steps/${stepId}`, {
    method: "DELETE",
  }),
  updateStep: (planId: number, stepId: number, payload: StepUpdate) =>
    request<Step>(`/plans/${planId}/steps/${stepId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  listExecutions: (planId: number) =>
    request<Execution[]>(`/plans/${planId}/executions`),
  executePlan: (planId: number) =>
    request<{ execution_id: string }>(`/plans/${planId}/executions`, {
      method: "POST",
      body: "{}",
    }),
  cancelExecution: (planId: number, executionId: string) =>
    request(`/plans/${planId}/executions/${executionId}/cancel`, {
      method: "POST",
    }),
  retryExecution: (planId: number, executionId: string) =>
    request(`/plans/${planId}/executions/${executionId}/retry`, {
      method: "POST",
    }),
};
