import { staticPlugin } from "@elysia/static";
import Elysia from "elysia";
const app = new Elysia();
app.use(staticPlugin({
    assets: "./dist",
    prefix: '/'
}));
app.listen(Number(Bun.env.FCTF_PORT), () => console.log(Bun.env.FCTF_PORT));
