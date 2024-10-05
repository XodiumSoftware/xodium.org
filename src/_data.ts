// _data.ts
import { GithubService } from "xodium/utils/github";

export function getMembers(): Promise<unknown[]> {
    return GithubService.getData("members");
}
