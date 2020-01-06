export type EventPayload = OnDiagnosticsEventPayload | OnResultEventPayload;

export interface OnDiagnosticsEventPayload {
  __type: "DIAGNOSTICS";
  uri: string;
  diagnostics: string[];
}

export interface OnResultEventPayload {
  __type: "RESULT";
  uri: string;
  result: string | null;
}

export type CommandPayload = SetCommandPayload | EvaluateCommandPayload;

export interface SetCommandPayload {
  __type: "SET";
  uri: string;
  code: string;
}

export interface EvaluateCommandPayload {
  __type: "EVALUATE";
  uri: string;
}
