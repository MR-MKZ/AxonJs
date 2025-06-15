import { Axon, Router } from '../../src';
import { makeRequest } from '../utils';
import http from "http";

describe('AxonCore Integration Tests (v0.0.1)', () => {
    const core = Axon();
    const router = Router();
    const TEST_PORT = 19876; // Use a high port number to avoid conflicts  
    const TEST_HOST = '127.0.0.1';
    const userOptions: http.RequestOptions = {
        hostname: TEST_HOST,
        port: TEST_PORT
    }

    beforeAll(async () => {
        // Define routes for testing  
        router.get('/test', (req, res) => {
            return res.status(200).body({ message: 'GET test successful' });
        });

        router.post('/test', (req, res) => {
            return res.status(201).body({ message: 'POST test successful' });
        });

        router.put('/test', (req, res) => {
            return res.status(200).body({ message: 'PUT test successful' });
        });

        router.patch('/test', (req, res) => {
            return res.status(200).body({ message: 'PATCH test successful' });
        });

        router.delete('/test', (req, res) => {
            return res.status(200).body({ message: 'DELETE test successful' });
        });

        router.get('/params/{id}', (req, res) => {
            return res.status(200).body({ id: req.params?.id });
        });

        router.get('/middleware-test', (req, res) => {
            return res.status(200).body({ modified: req.body });
        }).middleware((req, res, next) => {
            req.body = 'middleware ran';
            next();
        });

        // Load routes to core  
        await core.loadRoute(router);

        // Start the server  
        return new Promise((resolve) => {
            core.listen(TEST_HOST, TEST_PORT, () => {
                resolve(true);
            });
        });
    });

    afterAll(() => {
        // Close the server  
        core.close();
    });

    test('Should handle GET request correctly', async () => {
        const response = await makeRequest({ path: '/test', userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('GET test successful');
    });

    test('Should handle POST request correctly', async () => {
        const response = await makeRequest({ path: '/test', method: 'POST', userOptions });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('POST test successful');
    });

    test('Should handle PUT request correctly', async () => {
        const response = await makeRequest({ path: '/test', method: 'PUT', userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('PUT test successful');
    });

    test('Should handle PATCH request correctly', async () => {
        const response = await makeRequest({ path: '/test', method: 'PATCH', userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('PATCH test successful');
    });

    test('Should handle DELETE request correctly', async () => {
        const response = await makeRequest({ path: '/test', method: 'DELETE', userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('DELETE test successful');
    });

    test('Should handle OPTIONS request correctly', async () => {
        const response = await makeRequest({ path: '/test', method: 'OPTIONS', userOptions });
        expect(response.statusCode).toBe(204);
    });

    test('Should parse route parameters correctly', async () => {
        const response = await makeRequest({ path: '/params/123', userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe('123');
    });

    test('Should execute route middlewares correctly', async () => {
        const response = await makeRequest({ path: '/middleware-test', userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body.modified).toBe('middleware ran');
    });

    test('Should return 404 for non-existent routes', async () => {
        const response = await makeRequest({ path: '/non-existent-route', userOptions });
        expect(response.statusCode).toBe(404);
    });
});