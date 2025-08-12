// Simple promise concurrency limiter (no external deps)
export function createLimiter(max: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (active >= max) return;
    const fn = queue.shift();
    if (!fn) return;
    active++;
    fn();
  };

  const run = <T>(task: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const exec = () => {
        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            active--;
            next();
          });
      };
      queue.push(exec);
      next();
    });
  };

  return run;
}
