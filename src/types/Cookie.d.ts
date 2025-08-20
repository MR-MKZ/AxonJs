/**
 * Options for configuring HTTP cookies.
 */
export interface CookieOptions {
  /**
   * Number of seconds until the cookie expires.
   *
   * Takes precedence over `duration` if both are set.
   *
   * Example: 3600 (1 hour)
   */
  maxAge?: number;

  /**
   * Exact expiration date of the cookie.
   *
   * If provided, the cookie will be removed after this date.
   *
   * @example
   * new Date(Date.now() + 86400000) // 1 day from now
   */
  expires?: Date;

  /**
   * Human-readable duration string to set both `expires` and `maxAge`.
   *
   * Supported units:
   * - s (seconds)
   * - m (minutes)
   * - h (hours)
   * - d (days)
   * - M (months)
   * - y (years)
   *
   * You can combine multiple units, e.g. "1d2h30m".
   *
   * Ignored if `maxAge` or `expires` are already defined.
   */
  duration?: string;

  /**
   * The path where the cookie is valid.
   *
   * Defaults to "/" if not specified.
   *
   * Example: "/api"
   */
  path?: string;

  /**
   * The domain for which the cookie is valid.
   *
   * Example: "example.com"
   */
  domain?: string;

  /**
   * Indicates if the cookie should only be sent over HTTPS.
   *
   * Recommended for all authentication cookies.
   */
  secure?: boolean;

  /**
   * Marks the cookie as inaccessible to JavaScript (`document.cookie`).
   *
   * Helps prevent XSS attacks.
   */
  httpOnly?: boolean;

  /**
   * Controls cross-site cookie behavior.
   * - "Strict": cookie sent only to same-site requests.
   * - "Lax": cookie sent on top-level navigations.
   * - "None": cookie sent on all requests (must also be `secure`).
   */
  sameSite?: 'Strict' | 'Lax' | 'None';
}
