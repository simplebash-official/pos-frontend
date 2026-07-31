/**
 * Generic type-safe LocalStorage backing store for mock data persistence across page reloads.
 */
export class LocalStorageStore<T extends { id: string }> {
  private key: string;
  private memoryStore: T[];
  private normalizer?: (item: unknown) => T;

  constructor(key: string, initialData: T[], normalizer?: (item: unknown) => T) {
    this.key = key;
    this.normalizer = normalizer;
    this.memoryStore = this.load(initialData);
  }

  private load(initialData: T[]): T[] {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = this.normalizer
            ? parsed.map((item) => this.normalizer!(item))
            : (parsed as T[]);
          // Automatically upgrade & persist healed store schema
          localStorage.setItem(this.key, JSON.stringify(normalized));
          return normalized;
        }
      }
      localStorage.setItem(this.key, JSON.stringify(initialData));
      return initialData;
    } catch {
      return initialData;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.memoryStore));
    } catch (e) {
      console.error(`Failed to persist ${this.key} to localStorage`, e);
    }
  }

  public getAll(): T[] {
    return [...this.memoryStore];
  }

  public getById(id: string): T | undefined {
    return this.memoryStore.find((item) => item.id === id);
  }

  public add(item: T): T {
    this.memoryStore.unshift(item);
    this.persist();
    return item;
  }

  public update(id: string, updates: Partial<T>): T | undefined {
    const index = this.memoryStore.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    const updated = { ...this.memoryStore[index], ...updates };
    this.memoryStore[index] = updated;
    this.persist();
    return updated;
  }

  public remove(id: string): boolean {
    const initialLength = this.memoryStore.length;
    this.memoryStore = this.memoryStore.filter((item) => item.id !== id);
    const removed = this.memoryStore.length < initialLength;
    if (removed) this.persist();
    return removed;
  }

  public filter(predicate: (item: T) => boolean): T[] {
    return this.memoryStore.filter(predicate);
  }

  public setAll(items: T[]): void {
    this.memoryStore = [...items];
    this.persist();
  }
}
