import { createWebHistory, createRouter } from "vue-router";

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", component: () => import("@/views/Index.vue") },
        { path: "/register", component: () => import("@/views/Register.vue") },
        { path: "/login", component: () => import("@/views/Login.vue") },
        { path: "/submit", component: () => import("@/views/Submit.vue") },
        { path: "/specy", component: () => import("@/views/Specy.vue") },
        { path: "/illustration", component: () => import("@/views/Illustration.vue") },
        { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFound.vue") },
    ],
});
