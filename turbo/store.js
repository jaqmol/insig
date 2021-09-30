export default class Store {
    #state;
    #reds;
    #rootSubs;
    #nameSubs;
    #stateGetter;

    constructor(reducers, initialState) {
        this.#state    = new Map();
        this.#reds     = new Map();
        this.#rootSubs = new Set();
        this.#nameSubs = new Map();
        const getter = {};
        for (const [name, reduce] of Object.entries(reducers)) {
            this.#reds.set(name, reduce);
            this.on[name] = callback => {
                this.on(name, callback);
            };
            this.off[name] = callback => {
                this.off(name, callback);
            };
            this.send[name] = event => {
                this.send(name, event);
            };
            Object.defineProperty(getter, name, {
                get: () => this.#state.get(name)
            });
        }
        this.#stateGetter = Object.freeze(getter);
        if (initialState) {
            for (const [name, value] of Object.entries(initialState)) {
                this.#state.set(name, value);
            }
        }
    }

    on(...args) {
        if (args.length === 1) {
            this.#rootSubs.add(args[0]);
        } else if (args.length === 2) {
            const acc = this.#nameSubs.get(args[0]) || new Set();
            acc.add(args[1]);
            this.#nameSubs.set(args[0], acc);
        } else {
            throw new Error('Store.on(name, callback) || Store.on(callback)');
        }
    }

    off(...args) {
        if (args.length === 1) {
            this.#rootSubs.delete(args[0]);
        } else if (args.length === 2) {
            const acc = this.#nameSubs.get(args[0]);
            if (acc) {
                acc.delete(args[1]);
                if (acc.length === 0) {
                    this.#nameSubs.delete(args[0]);
                } else {
                    this.#nameSubs.set(args[0], acc);
                }
            }
        } else {
            throw new Error('Store.off(name, callback) || Store.off(callback)');
        }
    }

    send(...args) {
        if (args.length === 1) {
            for (const [name, reduce] of this.#reds) {
                const oldVal = this.#state.get(name);
                const newVal = reduce(oldVal, args[0]);
                this.#processReduction(name, oldVal, newVal);
            }
        } else if (args.length === 2) {
            const reduce = this.#reds.get(args[0]);
            if (reduce) {
                const oldVal = this.#state.get(args[0]);
                const newVal = reduce(oldVal, args[1]);
                this.#processReduction(args[0], oldVal, newVal);
            } else {
                throw new Error(`Store.send(name, event) with unknown name: ${args[0]}`);
            }
        } else {
            throw new Error('Store.send(name, event) || Store.send(event)');
        }
    }

    #processReduction(name, oldVal, newVal) {
        if (oldVal !== newVal) {
            this.#state.set(name, newVal);
            const acc = this.#nameSubs.get(name);
            if (acc) {
                for (let callback of acc) {
                    callback(oldVal, newVal);
                }
            }
            for (let callback of this.#rootSubs) {
                callback(name, oldVal, newVal);
            }
        }
    }

    get state() {
        return this.#stateGetter;
    }

    merge(incomingState) {
        for (const [name, value] of Object.entries(incomingState)) {
            this.#state.set(name, value);
        }
    }

    has(name) {
        return this.#reds.has(name);
    }
}