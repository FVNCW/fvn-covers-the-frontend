import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import naive, { createDiscreteApi } from "naive-ui";

const { message } = createDiscreteApi(["message"]);
(window as Window & { message?: typeof message }).message = message as never;

createApp(App).use(router).use(naive).mount("#app");