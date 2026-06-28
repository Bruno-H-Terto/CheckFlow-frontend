export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Plan = {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
};

export type ActionType = "http";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AssertionTarget = "status_code" | "body" | "header";

export type AssertionOperator = "equals";

export type HttpAction = {
  type: ActionType;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: JsonValue;
  timeout_seconds: number;
};

export type StepAssertion = {
  target: AssertionTarget;
  operator: AssertionOperator;
  expected: JsonValue;
  path: string | null;
};

export type Step = {
  id: number;
  plan_id: number;
  sequence: number;
  name: string;
  description: string | null;
  action: HttpAction;
  assertions: StepAssertion[];
  extracts: Record<string, string>;
  created_at: string;
  updated_at: string;
  active: boolean;
};

export type StepCreate = {
  sequence?: number | null;
  name: string;
  description?: string | null;
  action: HttpAction;
  assertions: StepAssertion[];
  extracts?: Record<string, string>;
  active?: boolean;
};

export type StepUpdate = {
  sequence: number;
  name: string;
  description?: string | null;
  action: HttpAction;
  assertions: StepAssertion[];
  extracts?: Record<string, string>;
  active?: boolean;
};

export type StepFormState = {
  name: string;
  description: string;
  method: HttpMethod;
  url: string;
  timeout_seconds: number;
  expected_status: number;
};

export const emptyStepForm: StepFormState = {
  name: "",
  description: "",
  method: "GET",
  url: "",
  timeout_seconds: 30,
  expected_status: 200,
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
