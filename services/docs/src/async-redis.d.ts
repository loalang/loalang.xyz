declare module "async-redis" {
  export interface Client {
    keys(pattern: string): Promise<string[]>;
    set(key: string, value: string): Promise<void>;
  }

  export function createClient(opts: {
    password?: string;
    host: string;
    port: number;
  }): Client;
}
