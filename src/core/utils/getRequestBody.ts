import { IncomingMessage } from "http";

const getRequestBody = async (req: IncomingMessage): Promise<string | Record<string, string | undefined> | undefined> => {
    return new Promise((resolve, reject) => {
        let body = '';

        // Listen for data events
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                req.body = JSON.parse(body);
                resolve(req.body);
            } catch (error) {
                req.body = body;
                resolve(req.body);
            }
        });

        req.on('error', (error) => {
            reject(error);
        });
    });
}

export default getRequestBody