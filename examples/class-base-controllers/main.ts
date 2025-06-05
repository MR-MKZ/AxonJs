import { Axon } from "../../src";
import authRouter from "./routers/auth.route";

const core = Axon();

core.loadRoute(authRouter);

core.listen();