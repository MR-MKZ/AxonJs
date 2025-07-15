import { Request } from '../../types/RouterTypes';

const getRequestBody = async (
  req: Request<any>
): Promise<string | Record<string, string | undefined> | undefined> => {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
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

    req.on('error', error => {
      reject(error);
    });
  });
};

export default getRequestBody;
