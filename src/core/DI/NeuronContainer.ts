import type {
    DependencyRecord,
    Lifecycle
} from "../../types/Dependency";

/**
 * NeuronContainer is a flexible and performant dependency injection system.
 * Supports aliasing, hybrid string/class tokens, async registration, and lifecycles.
 *
 * ### Lifecycle Types:
 *
 * - **Singleton**: Shared instance for entire app lifetime.
 * - **Transient**: New instance on every request.
 * - **Scoped**: New instance per logical scope/request.
 * 
 * @experimental This is an experimental feature.
 * @version 0.5.1
 * @since 0.13.0
 */
class NeuronContainer {
    private DependencyStorage = new Map<string | Function, DependencyRecord>();
    private DependencyAliases = new Map<string | Function, string | Function>();
    private ScopedInstances = new Map<string, Map<string | Function, any>>();

    /**
     * Register a static value or instance (object, function, class instance).
     * @example
     * container.registerValue('logger', new Logger())
     * container.registerValue('config', { port: 3000 })
     */
    public registerValue<T>(
        keys: string | string[] | Function,
        value: T,
        options: { lifecycle?: Lifecycle } = {}
    ) {
        this.register(keys, value, { ...options, isFactory: false });
    }

    /**
     * Register a factory function that creates the dependency (sync or async).
     * @example
     * container.registerFactory('db', () => new DB())
     * container.registerFactory('auth', async () => await AuthService.build())
     */
    public registerFactory<T>(
        keys: string | string[] | Function,
        factory: () => T | Promise<T>,
        options: { lifecycle?: Lifecycle } = {}
    ) {
        return this.register(keys, factory, { ...options, isFactory: true });
    }

    /**
     * Main registration method used internally by value/factory variants.
     */
    public register<T>(
        keys: string | string[] | Function,
        value: T | (() => T | Promise<T>),
        options: { lifecycle?: Lifecycle, isFactory: boolean }
    ) {
        const lifecycle: Lifecycle = options.lifecycle || 'singleton';
        const names = Array.isArray(keys) ? keys : [keys];
        const [mainKey, ...aliases] = names;

        this.DependencyStorage.set(mainKey, { value, lifecycle, isFactory: options.isFactory });

        for (const alias of aliases) {
            this.DependencyAliases.set(alias, mainKey);
        }
    }

    /**
     * 
     * @param key Get the original (main) key from an alias or actual key.
     * @returns 
     */
    private getMainKey(key: string | Function): string | Function {
        return this.DependencyAliases.get(key) || key;
    }

    /**
     * Resolve a dependency, respecting its lifecycle (singleton, scoped, transient).
     * @example
     * const logger = await container.resolve('logger')
     * const auth = await container.resolve('auth', req.id)
     */
    public async resolve<T>(key: string | Function, scopeId?: string): Promise<T> {
        const mainKey = this.getMainKey(key);
        const record = this.DependencyStorage.get(mainKey);
        if (!record) throw new Error(`Dependency '${String(key)}' not found`);

        if (record.lifecycle === 'singleton' && record.instance !== undefined) {
            return record.instance;
        }

        if (record.lifecycle === 'scoped') {
            if (!scopeId) throw new Error(`Scope ID is required for scoped dependency '${String(key)}'`);
            const scopedMap = this.ScopedInstances.get(scopeId) || new Map();
            if (scopedMap.has(mainKey)) return scopedMap.get(mainKey);

            const instance = await this.instantiate(record);
            scopedMap.set(mainKey, instance);
            this.ScopedInstances.set(scopeId, scopedMap);
            return instance;
        }

        const instance = await this.instantiate(record);

        if (record.lifecycle === 'singleton') {
            record.instance = instance;
        }

        return instance;
    }

    /**
     * Instantiate a dependency, calling factory fuctions or returning raw values.
     */
    private async instantiate<T>(record: DependencyRecord<T>): Promise<T> {
        return record.isFactory
            ? await (record.value as () => T | Promise<T>)()
            : record.value as T
    }

    /**
     * Shortcut for resolve(), mostly for user-facing code.
     * @example
     * const db = await container.use(DBService);
     */
    public async use<T>(key: string | Function, scopeId?: string): Promise<T> {
        return this.resolve<T>(key, scopeId);
    }

    /**
     * Override a registered dependency with a new singleton value.
     * @example
     * container.override('logger', customLogger);
     */
    public override<T>(key: string | Function, value: T) {
        const mainKey = this.getMainKey(key);
        if (!this.DependencyStorage.has(mainKey)) {
            throw new Error(`Cannot override unregistered dependency '${String(key)}'`);
        }

        this.DependencyStorage.set(mainKey, {
            value,
            lifecycle: 'singleton',
            instance: value,
            isFactory: false
        });
    }

    /**
     * List all registered dependency keys.
     * @example
     * console.log(container.listDependencies());
     */
    public listDependencies(): (string | Function)[] {
        return Array.from(this.DependencyStorage.keys());
    }

    /**
     * Inspect metadata of a registered dependency.
     * @example
     * container.inspect('db');
     */
    public inspect(key: string | Function) {
        const mainKey = this.getMainKey(key);
        const record = this.DependencyStorage.get(mainKey);
        if (!record) return null;

        return {
            key: mainKey,
            lifecycle: record.lifecycle,
            resolved: !!record.instance,
            isFactory: record.isFactory
        }
    }

    /**
     * Clone the entire container with same dependencies.
     * @example
     * const testContainer = container.clone();
     */
    public clone(): NeuronContainer {
        const newContainer = new NeuronContainer();
        for (const [key, record] of this.DependencyStorage.entries()) {
            newContainer.DependencyStorage.set(key, { ...record });
        }

        for (const [alias, mainKey] of this.DependencyAliases.entries()) {
            newContainer.DependencyAliases.set(alias, mainKey);
        }

        return newContainer;
    }

    /**
     * Clear all scoped instances for a specific scope ID.
     * @example
     * container.clearScope(req.id);
     */
    public clearScope(scopeId: string): void {
        this.ScopedInstances.delete(scopeId);
    }
}

export default NeuronContainer;