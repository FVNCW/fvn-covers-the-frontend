import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import naive, { createDiscreteApi } from "naive-ui";

window.message = createDiscreteApi(["message"]).message;

createApp(App).use(router).use(naive).mount("#app");
