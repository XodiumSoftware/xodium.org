/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {createOrgDataHandler} from "../../../../utils/utils.ts";

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
}

/**
 * API route handler for fetching organization repositories.
 */
export default createOrgDataHandler<Repo[]>("repos", "/orgs/{org}/repos");
