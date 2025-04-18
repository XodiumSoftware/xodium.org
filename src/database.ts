/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Surreal} from "@deno/surrealdb";
import {RawQueryResult} from "@deno/surrealdb/types";

/**
 * Manages the connection and queries to a SurrealDB database instance.
 */
export class Database {
  private db: Surreal;
  private connected: boolean = false;

  /**
   * Initialises a new Database instance with configuration from environment variables.
   * @param url - SurrealDB connection URL (defaults to the SURREALDB_URL environment variable)
   * @param username - Database username (defaults to SURREALDB_USER environment variable)
   * @param password - Database password (defaults to SURREALDB_PASS environment variable)
   * @param namespace - Database namespace (defaults to SURREALDB_NS environment variable)
   * @param database - Database name (defaults to SURREALDB_DB environment variable)
   */
  constructor(
    private url: string = Deno.env.get("SURREALDB_URL")!,
    private username: string = Deno.env.get("SURREALDB_USER")!,
    private password: string = Deno.env.get("SURREALDB_PASS")!,
    private namespace: string = Deno.env.get("SURREALDB_NS")!,
    private database: string = Deno.env.get("SURREALDB_DB")!,
  ) {
    this.db = new Surreal();
  }

  /**
   * Establishes a connection to the SurrealDB instance if not already connected.
   * @throws Will throw an error if the connection, authentication, or database selection fails.
   */
  public async connect() {
    if (this.connected) return;
    await this.db.connect(this.url);
    await this.db.signin({ username: this.username, password: this.password });
    await this.db.use({ namespace: this.namespace, database: this.database });
    this.connected = true;
  }

  /**
   * Executes a SurrealQL query against the database.
   * @param query - SurrealQL query string to execute.
   * @param params - (Optional) Parameters for the query.
   * @returns An array of {@link RawQueryResult} representing the query results.
   * @throws Will throw an error if the connection or the query fails.
   * @example
   * ```TypeScript
   * const db = new Database();
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
}
