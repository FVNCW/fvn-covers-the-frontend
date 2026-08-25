import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { apiBase } from "./engine/util/api.js";

createApp(App).use(router).mount("#app");

