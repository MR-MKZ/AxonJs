import { Response } from '../../types/Router';

class AxonResponse {
  private res: Response;

  constructor(res: Response) {
    this.res = res;
  }

  /**
   * to add custom response message
   */
  public message(message: string) {
    this.res.statusMessage = message;

    return new Proxy(this, {
      get(target, prop) {
        if (prop === 'message') {
          throw new Error("Cannot access 'message' method after it has been called.");
        }
        return target[prop as keyof typeof target];
      },
    });
  }

  /**
   * to add body for send to client as a response body.
   *
   * **calling this method will send response to user, so ensure you called all methods which you want before this**
   * @param body the body of response to client
   */
  public body(body: string | object) {
    switch (typeof body) {
      case 'string':
        this.res.setHeader('Content-Type', 'text/plain');
        break;
      case 'object':
        this.res.setHeader('Content-Type', 'application/json');
        body = JSON.stringify(body);
        break;
      default:
        this.res.setHeader('Content-Type', 'application/json');
        body = JSON.stringify({});
        break;
    }

    this.res.end(body);
  }

  public setHeader(key: string, value: string) {
    this.res.setHeader(key as string, value);

    return this;
  }
}

export default AxonResponse;
