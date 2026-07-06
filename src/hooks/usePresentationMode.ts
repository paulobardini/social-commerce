import { useEffect, useState, useCallback } from "react";

const KEY = "vendedor.presentationMode";
const EVT = "presentation-mode-change";

function read(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function usePresentationMode() {
  const [on, setOn] = useState<boolean>(() => read());

  useEffect(() => {
    const handler = () => setOn(read());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const set = useCallback((v: boolean) => {
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch {}
    window.dispatchEvent(new Event(EVT));
    setOn(v);
  }, []);

  const toggle = useCallback(() => set(!read()), [set]);

  return { on, set, toggle };
}
