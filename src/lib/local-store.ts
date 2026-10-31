import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/** Directory for local-development storage (used only when Supabase is not configured). */
export const LOCAL_DIR = path.resolve(process.env.LOCAL_STORAGE_DIR ?? path.join(process.cwd(), "storage"));

/**
 * A JSON file with serialised, atomic read-modify-write (temp file + rename).
 * Not suitable for serverless hosts, where the filesystem is not persistent.
 */
export function localJson<T>(name: string, empty: T) {
  const file = path.join(LOCAL_DIR, name);
  let queue: Promise<unknown> = Promise.resolve();

  async function read(): Promise<T> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as T;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(empty);
      throw e;
    }
  }
  async function write(data: T) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, file);
  }
  function update(fn: (data: T) => T | Promise<T>): Promise<T> {
    const run = queue.then(async () => {
      const next = await fn(await read());
      await write(next);
      return next;
    });
    queue = run.catch(() => {});
    return run;
  }
  return { read, update };
}
