/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Surreal} from "@deno/surrealdb";

export class Database {
  private db: Surreal;
  private connected: boolean = false;

  constructor(
    private url: string = Deno.env.get("SURREALDB_URL")!,
    private username: string = Deno.env.get("SURREALDB_USER")!,
    private password: string = Deno.env.get("SURREALDB_PASS")!,
    private namespace: string = Deno.env.get("SURREALDB_NS")!,
    private database: string = Deno.env.get("SURREALDB_DB")!,
  ) {
    this.db = new Surreal();
  }

  public async connect() {
    if (this.connected) return;
    await this.db.connect(this.url);
    await this.db.signin({ username: this.username, password: this.password });
    await this.db.use({ namespace: this.namespace, database: this.database });
    this.connected = true;
  }
}
