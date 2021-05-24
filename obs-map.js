const ObsMap = () => {
    const acc = new Map();
    const obs = {
        set: [],
        'delete': [],
        clear: []
    };

    const set = (key, value) => {
        acc.set(key, value);
        obs.set.forEach(cb => cb(key, value));
    };
    const get = (key) => acc.get(key);
    const has = (key) => acc.has(key);
    const deleteFn = (key) => {
        acc.delete(key);
        obs.delete.forEach(cb => cb(key));
    };
    const clear = () => {
        acc.clear();
        obs.clear.forEach(cb => cb());
    };

    const on = (event, callback) => {
        const cbs = obs[event];
        if (!cbs) throw new Error(`Event ${event} not supported`);
        cbs.push(callback);
    };

    const forEach = (callback) => {
        acc.forEach((value, key) => callback(key, value));
    };

    return Object.freeze({
        set,
        get,
        has,
        'delete': deleteFn,
        clear,
        on,
        // [Symbol.iterator]: ito,
        get length() {
            return acc.length;
        },
        forEach
    });
};

export default ObsMap;