type Constructor = new (...args: any[]) => any;

type Func = (...args: any[]) => any;

type Instance = object & { constructor: Function }

type DependencyValue = Constructor | Instance | Func;

/**
 * ### 1. Singleton
 * A single instance of the service is created and shared thoughout the
 * application's lifetime.
 * 
 * Usage: Well-suited for services that are expensive to create or if they need to be shared across the application.
 * 
 * Example:
 * - Caching services
 * - Logging service
 * - Configuration providers
 * 
 * ### 2. Transient
 * A new instance of the service is created every time it is requested.
 * 
 * Usage: Well-suited for lightweight or stateless services (services that don't hold any state between calls).
 * 
 * Example:
 * - A notification service, such an Email sender.
 * 
 * ### 3. Scoped
 * A single instance of the service is created per scope and reused within that scope.
 * 
 * Usage: Suitable for services that maintain state within the same request but don't wantto share the state between requests.
 * 
 * Example:
 * - Authentication service that need to verify permissions based on the request context.
 */
type Lifecycle = 'singleton' | 'transient' | 'scoped';

interface DependencyRecord<T = any> {
    value: T | (() => T | Promise<T>);
    lifecycle: Lifecycle;
    instance?: T;
    isFactory: boolean;
}

export type {
    Constructor,
    Func,
    Instance,
    DependencyValue,
    Lifecycle,
    DependencyRecord
}