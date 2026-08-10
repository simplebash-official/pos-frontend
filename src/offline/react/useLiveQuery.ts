import { useEffect, useState } from 'react';
import { liveQuery, type Subscription } from 'dexie';

/**
 * Subscribes a component to a Dexie query.
 *
 * The query re-runs whenever any table it touched changes — from a sync pull,
 * a local write, or a write in another tab — so screens stay live with no
 * cache invalidation anywhere.
 *
 * `initial` is a required argument rather than an internal default: the caller
 * must state what "no data yet" renders as, instead of every call site
 * papering over an `undefined` with `?? []`.
 */
export interface LiveQueryResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
}

function depsChanged(previous: readonly unknown[], next: readonly unknown[]): boolean {
  if (previous.length !== next.length) {
    return true;
  }
  return previous.some((value, index) => !Object.is(value, next[index]));
}

export function useLiveQuery<T>(
  querier: () => Promise<T>,
  initial: T,
  deps: readonly unknown[]
): LiveQueryResult<T> {
  const [state, setState] = useState<LiveQueryResult<T>>({
    data: initial,
    isLoading: true,
    error: null,
  });
  const [trackedDeps, setTrackedDeps] = useState(deps);

  // Reset to "loading" during render rather than inside the effect. Setting
  // state in an effect body would commit the stale result first and then
  // immediately re-render over it.
  if (depsChanged(trackedDeps, deps)) {
    setTrackedDeps(deps);
    setState({ data: initial, isLoading: true, error: null });
  }

  useEffect(() => {
    // `querier` is captured from the render that changed `deps`, which is the
    // only time it can meaningfully differ. Dexie re-invokes it on every
    // change to the tables it touched.
    const subscription: Subscription = liveQuery(querier).subscribe({
      next: (data) => setState({ data, isLoading: false, error: null }),
      error: (error: Error) => setState((previous) => ({ ...previous, isLoading: false, error })),
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
