/**
 * Chainable stand-in for a Drizzle query builder. Every method returns the
 * builder; awaiting it resolves to the next queued result. Calls are recorded.
 */
export function mockDb(...results: unknown[]) {
  const queue = [...results];
  const calls: { method: string; args: unknown[] }[] = [];
  const builder: any = new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === 'then') {
          const next = queue.shift();
          return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
            next instanceof Error ? reject(next) : resolve(next);
        }
        return (...args: unknown[]) => {
          calls.push({ method: prop, args });
          return builder;
        };
      },
    },
  );
  return { db: builder, calls, remaining: () => queue.length };
}
