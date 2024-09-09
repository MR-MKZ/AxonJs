import { IncomingMessage } from "http";

const getRequestBody = async (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
        let body = '';

        // Listen for data events
        req.on('data', (chunk) => {
            body += chunk.toString(); // Convert binary to string
        });

        // End event indicates that the entire body has been received
        req.on('end', () => {
            try {
                // Try to parse the body as JSON if applicable
                req.body = JSON.parse(body); // Assign the parsed body to req.body
                resolve(req.body); // Resolve the promise with the parsed body
            } catch (error) {
                req.body = body; // If parsing fails, set req.body to the raw string
                resolve(req.body);
            }
        });

        // Handle any errors during the data stream
        req.on('error', (error) => {
            reject(error);
        });
    });
}

export default getRequestBody