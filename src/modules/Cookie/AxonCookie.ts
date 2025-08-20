import type { Request, Response } from '../../types/Router';
import type { CookieOptions } from '../../types/Cookie';

type TimeUnit = 's' | 'm' | 'h' | 'd' | 'M' | 'y';

class AxonCookie {
  /**
   * Parse cookies from request headers
   */
  static parse(req: Request<any>): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieHeader = req.headers.cookie;

    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = decodeURIComponent(value);
      });
    }

    return cookies;
  }

  /**
   * Internal: convert duration string (e.g. "1d2h") to expires and maxAge
   */
  private static parseDurationToExpireOptions(duration: string): { expires: Date; maxAge: number } {
    const now = new Date();
    const originalTime = now.getTime();
    const matches = [...duration.matchAll(/(\d+)([smhdyM])/g)];

    if (matches.length === 0) {
      throw new Error('Invalid cookie duration format');
    }

    for (const match of matches) {
      const num = parseInt(match[1], 10);
      const unit = match[2] as TimeUnit;

      switch (unit) {
        case 's':
          now.setSeconds(now.getSeconds() + num);
          break;
        case 'm':
          now.setMinutes(now.getMinutes() + num);
          break;
        case 'h':
          now.setHours(now.getHours() + num);
          break;
        case 'd':
          now.setDate(now.getDate() + num);
          break;
        case 'M':
          now.setMonth(now.getMonth() + num);
          break;
        case 'y':
          now.setFullYear(now.getFullYear() + num);
          break;
        default:
          throw new Error(`Unsupported time unit: ${unit}`);
      }
    }

    const maxAge = Math.floor((now.getTime() - originalTime) / 1000);
    return { expires: now, maxAge };
  }

  /**
   * Set a cookie in the response
   */
  static set(res: Response, name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    // if duration string is provided, convert it
    if (options.duration) {
      const { expires, maxAge } = this.parseDurationToExpireOptions(options.duration);
      options.expires = expires;
      options.maxAge = maxAge;
    }

    if (options.maxAge != null) cookieString += `; Max-Age=${options.maxAge}`;
    if (options.expires) cookieString += `; Expires=${options.expires.toUTCString()}`;
    if (options.path) cookieString += `; Path=${options.path}`;
    if (options.domain) cookieString += `; Domain=${options.domain}`;
    if (options.secure) cookieString += `; Secure`;
    if (options.httpOnly) cookieString += `; HttpOnly`;
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;

    const existingCookies = res.getHeader('Set-Cookie');
    const cookiesArray = Array.isArray(existingCookies)
      ? existingCookies
      : typeof existingCookies === 'string'
        ? [existingCookies]
        : [];

    res.setHeader('Set-Cookie', [...cookiesArray, cookieString]);
  }

  /**
   * Clear a cookie
   *
   * You have to pass all options which you set while creating cookie to delete that cookie.
   */
  static clear(res: Response, name: string, options: CookieOptions = {}): void {
    const clearOptions = {
      ...options,
      expires: new Date(0),
      maxAge: 0,
      duration: '0s',
    };

    this.set(res, name, '', clearOptions);
  }
}

export default AxonCookie;
