import {
  EventPayload,
  SetCommandPayload,
  EvaluateCommandPayload
} from "./protocol";

export interface CompilerEvents {
  onDiagnostics(uri: string, diagnostics: string[]): void;
  onResult(uri: string, result: string | null): void;
}

export class Compiler {
  private constructor(
    private readonly _worker: Worker,
    listeners: CompilerEvents
  ) {
    _worker.addEventListener("message", event => {
      const payload: EventPayload = JSON.parse(event.data);

      switch (payload.__type) {
        case "DIAGNOSTICS":
          listeners.onDiagnostics(payload.uri, payload.diagnostics);
          break;

        case "RESULT":
          listeners.onResult(payload.uri, payload.result);
          break;
      }
    });
  }

  static create(events: CompilerEvents) {
    const worker = new Worker("./compilerWorker", { type: "module" });

    return new Compiler(worker, events);
  }

  dispose() {
    this._worker.terminate();
  }

  set(uri: string, code: string) {
    const payload: SetCommandPayload = {
      __type: "SET",
      uri,
      code
    };

    this._worker.postMessage(JSON.stringify(payload));
  }

  evaluate(uri: string) {
    const payload: EvaluateCommandPayload = {
      __type: "EVALUATE",
      uri
    };

    this._worker.postMessage(JSON.stringify(payload));
  }
}
