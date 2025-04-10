/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {createOrgDataHandler} from "../../../../utils/utils.ts";

export interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
}

/**
 * API route handler for fetching organization members.
 */
export default createOrgDataHandler<Member[]>("members", "/orgs/{org}/members");
