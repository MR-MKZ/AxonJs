import http from "http";

interface IArgs {
    path: string,
    method?: string | "GET",
    userOptions?: http.RequestOptions
}

export const makeRequest = ({ path, method, userOptions }: IArgs): Promise<{
    statusCode: number;
    body: any;
    headers: http.IncomingHttpHeaders;
}> => {
    return new Promise((resolve, reject) => {
        const options = {
            ...userOptions,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const body = data ? JSON.parse(data) : {};
                    resolve({
                        statusCode: res.statusCode || 0,
                        body,
                        headers: res.headers,
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode || 0,
                        body: data,
                        headers: res.headers,
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
};