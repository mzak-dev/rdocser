/** Optional local persistence that remains usable when storage is blocked or full. */
export class BrowserStorage {
  get<T>(key: string): T | undefined { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : undefined; } catch { return undefined; } }
  set<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Persistence is optional. */ } }
}
