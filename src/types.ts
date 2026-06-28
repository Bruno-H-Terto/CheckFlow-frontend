export type Plan = {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
};

export type Step = {
  id: number;
  plan_id: number;
  sequence: number;
  name: string;
  active: boolean;
};

export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type Execution = {
  id: string;
  plan_id: number;
  status: ExecutionStatus;
  variables: Record<string, unknown>;
  retry_of: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type RealtimeEvent = Record<string, unknown> & {
  event_type?: string;
  execution_id?: string;
};
