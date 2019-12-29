declare module "async-redis" {
  export interface Client {
    keys(pattern: string): Promise<string[]>;
    set(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
  }

  export function createClient(opts: {
    password?: string;
    host: string;
    port: number;
  }): Client;
}
