import { createAuthClient } from "better-auth/vue";
import { apiBase } from "./util/api";

export const auth = createAuthClient({
    baseURL: apiBase(),
});
