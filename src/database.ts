/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Surreal} from "@deno/surrealdb";
import {RawQueryResult} from "@deno/surrealdb/types";

/**
 * Manages the connection and queries to a SurrealDB database instance.
 */
class Database {
  private db: Surreal;

  /**
   * Initialises a new Database instance with configuration from environment variables.
   * @param url - SurrealDB connection URL (defaults to the SURREALDB_URL environment variable)
   * @param username - Database username (defaults to SURREALDB_USER environment variable)
   * @param password - Database password (defaults to SURREALDB_PASS environment variable)
   * @param namespace - Database namespace (defaults to SURREALDB_NS environment variable)
   * @param database - Database name (defaults to SURREALDB_DB environment variable)
   * @param enableScheduler - Whether to enable automatic periodic health checks for the database connection upon instantiation (defaults to true).
   */
  constructor(
    private url: string = Deno.env.get("SURREALDB_URL")!,
    private username: string = Deno.env.get("SURREALDB_USER")!,
    private password: string = Deno.env.get("SURREALDB_PASS")!,
    private namespace: string = Deno.env.get("SURREALDB_NS")!,
    private database: string = Deno.env.get("SURREALDB_DB")!,
    enableScheduler: boolean = true,
  ) {
    this.db = new Surreal();
    if (enableScheduler) this.scheduler();
  }

  /**
   * Establishes a connection to the SurrealDB instance if not already connected.
   * @throws Will throw an error if the connection, authentication, or database selection fails.
   */
  public async connect() {
    try {
      await this.db.connect(this.url);
      await this.db.signin({
        username: this.username,
        password: this.password,
      });
      await this.db.use({
        namespace: this.namespace,
        database: this.database,
      });
    } catch (err) {
      await this.db.close();
      throw new Error(`SurrealDB connection failed: ${err}`);
    }
  }

  /**
   * Executes a SurrealQL query against the database.
   * @param query - SurrealQL query string to execute.
   * @param params - (Optional) Parameters for the query.
   * @returns An array of {@link RawQueryResult} representing the query results.
   * @throws Will throw an error if the connection or the query fails.
   * @example
   * ```TypeScript
   * import { db } from "./database.ts";
   * const results = await db.query("SELECT * FROM user WHERE active = $active", { active: true });
   * ```
   */
  public async query(
    query: string,
    params?: Record<string, unknown>,
  ): Promise<RawQueryResult[]> {
    await this.connect();
    return await this.db.query(query, params);
  }

  /**
   * Checks the health status of the SurrealDB connection by executing a simple query.
   * @returns A promise that resolves to `true` if the database responds successfully or `false` if there is an error or no response.
   */
  public async health(): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.db.query("SELECT 1");
      return Array.isArray(result) && result.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Schedules periodic health checks for the SurrealDB connection and logs the health status.
   * @param cronName - The name for the cron job (default: "db_health_report").
   * @param schedule - The cron schedule string (default: "0 * * * *", which runs every hour).
   * This method is called automatically when the Database instance is created if scheduling is enabled.
   */
  private scheduler(
    cronName = "db_health_report",
    schedule = "0 * * * *",
  ) {
    void Deno.cron(cronName, schedule, async () => {
      console.log(
        `[Health Reporter] Database Health Check Report: ${
          (await this.health())
            ? "SurrealDB is healthy."
            : "SurrealDB is unreachable or unhealthy!"
        }`,
      );
    });
  }
}

export const db = new Database();
