/**
 * D1 잔재용 최소 타입 선언.
 *
 * 이 저장소는 Vercel + Postgres로 운영되며 `lib/repository.ts`의 D1 경로는
 * `cloudflare:workers` import가 실패해 런타임에 실행되지 않는다. 다만 코드가
 * 남아 있어 타입 검사에는 D1Database가 필요하므로, `@cloudflare/workers-types`
 * 전체(그리고 그에 딸린 wrangler/miniflare 의존성)를 두는 대신 사용하는 만큼만 선언한다.
 */
declare interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

declare interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
}

declare interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
  dump(): Promise<ArrayBuffer>;
}
