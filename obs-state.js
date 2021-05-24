const ObsState = config => {
    const state = new Map();
    const callbacks = new Map();
    const inst = {
        on: (...args) => {
            const lastIdx = args.length - 1;
            const keys = args.slice(0, lastIdx);
            const cb = args[lastIdx];
            keys.forEach(key => {
                if (!state.has(key)) throw new Error(`No value "${key}" in ObsState`);
                const acc = callbacks.get(key) || [];
                acc.push(cb);
                callbacks.set(key, acc)
            });
            return inst;
        },
        fire: () => {
            callbacks.forEach((acc, key) => {
                const value = state.get(key);
                acc.forEach(cb => cb(value, undefined, key));
            });
            return inst;
        }
    };
    const dispatch = (nextVal, prevVal, key) => {
        const acc = callbacks.get(key);
        if (acc) acc.forEach(cb => cb(nextVal, prevVal, key));
    };
    Object.entries(config).forEach(([key, initVal]) => {
        if (key === 'on') throw new Error('ObsState values must not be named "on" or "fire"');
        state.set(key, initVal);
        Object.defineProperty(inst, key, {
            get : () => state.get(key),
            set : nextVal => {
                const prevVal = state.get(key);
                state.set(key, nextVal);
                dispatch(nextVal, prevVal, key);
            }
        });
    });
    return inst;
};

export default ObsState;