// Small typed wrapper around localStorage with JSON handling & namespacing

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write failures
  }
}

export function loadDate(key: string): Date | null {
  const iso = localStorage.getItem(key);
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function saveDate(key: string, date: Date) {
  try { localStorage.setItem(key, date.toISOString()); } catch {}
}
