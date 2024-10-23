import { AxonCore, AxonPlugin, Router } from "../../../src";
export class LogPluginTest implements AxonPlugin {
    private logs: number;

    constructor() {
        this.logs = 0;
    }

    name: string = "Pretty Logger";
    version: string = "1.2.0-beta";
    
    init(core: AxonCore): void {
        const router = Router();

        router.get('/log', async (req, res) => {
            this.logs++;
            
            return res.status(200).body({
                message: "This is the fist plugin of AxonJs",
                logs: this.logs
            });
        });

        core.loadRoute(router);
    }
}