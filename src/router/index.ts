import { createWebHistory, createRouter } from "vue-router";

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: () => import("../views/Index.vue") },
        { path: "/:pathMatch(.*)*", component: () => import("../views/NotFound.vue") },
    ],
});
