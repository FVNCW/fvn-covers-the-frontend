import { auth } from "@/engine/app";
import { defineStore } from "pinia";

export const session = defineStore("session", {
    async state() {
        return {
            session: await auth.getSession(),
        };
    },
});
