export function didRefresh() {
  try {
    for (const entry of performance.getEntriesByName(window.location.href)) {
      return (entry as any).type === "reload";
    }
  } catch {}
  return true;
}
