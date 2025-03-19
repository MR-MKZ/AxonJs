import { AxonCore, axonLogger, AxonPlugin, Router } from "../../../src";
export class LogPluginTest implements AxonPlugin {
    private logs: number;

    constructor() {
        this.logs = 0;
    }

    name: string = "Pretty Logger";
    version: string = "1.2.0-beta";
    
    async init(core: AxonCore): Promise<void> {
        const router = Router("/pretty-logger");

        router.get('/log', async (req, res) => {
            this.logs++;

            axonLogger.plugin(`[${this.name}] logs: ${this.logs}`);
            
            return res.status(200).body({
                message: "This is the fist plugin of AxonJs",
                logs: this.logs
            });
        });

        core.loadRoute(router);
    }
}