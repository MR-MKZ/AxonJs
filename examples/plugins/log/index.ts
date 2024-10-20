import { AxonCore, AxonPlugin, Router } from "../../../src";

interface LogPlugin extends AxonPlugin {
    log(): void;
}

export class LogPluginTest implements LogPlugin {
    private logs: number;

    constructor() {
        this.logs = 0;
    }

    init(core: AxonCore): void {
        const router = Router();

        router.get("/log", async (req, res) => {
            this.logs++;
            
            return res.status(200).body({
                message: "This is the fist plugin of AxonJs"
            });
        });

        core.loadRoute(router);
    }    
    
    log(): void {
        console.log(`logs count until now is ${this.logs}`);
    }
}