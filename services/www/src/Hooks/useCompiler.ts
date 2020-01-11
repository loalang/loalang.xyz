import { useMemo, useState, useEffect } from "react";
import { Compiler } from "../Compiler";

export function useCompiler(
  onCreate?: (compiler: Compiler) => void
): {
  compiler: Compiler;
  diagnostics: Record<string, string[]>;
  results: Record<string, string | null>;
} {
  const [diagnostics, setDiagnostics] = useState<Record<string, string[]>>({});
  const [results, setResults] = useState<Record<string, string | null>>({});

  const compiler = useMemo(() => {
    const compiler = Compiler.create({
      onResult(uri, result) {
        setResults(d => ({
          ...d,
          [uri]: result == null ? null : result
        }));
        setDiagnostics(d => ({
          ...d,
          [uri]: []
        }));
      },
      onDiagnostics(uri, diagnostics) {
        setDiagnostics(d => ({
          ...d,
          [uri]: diagnostics
        }));
      }
    });

    if (onCreate != null) {
      onCreate(compiler);
    }

    return compiler;
  }, [onCreate]);

  useEffect(() => () => compiler.dispose(), [compiler]);

  return { compiler, diagnostics, results };
}
