const ObsList = () => {
    let acc = [];
    const obs = {
        add: [],
        set: [],
        'delete': [],
        clear: []
    };

    const add = (...items) => {
        acc.push(...items);
        obs.add.forEach(cb => cb(...items));
    };
    const set = (index, item) => {
        acc[index] = item;
        obs.set.forEach(cb => cb(index, item));
    };
    const get = (index) => acc[index];
    const deleteFn = (index) => {
        acc.splice(index, 1);
        obs.delete.forEach(cb => cb(index));
    };
    const clear = () => {
        acc = [];
        obs.clear.forEach(cb => cb());
    };

    const forEach = callback => acc.forEach(callback);

    const on = (event, callback) => {
        const cbs = obs[event];
        if (!cbs) throw new Error(`Event ${event} not supported`);
        cbs.push(callback);
    };

    // const ito = () => {
    //     let idx = 0;
    //     return { next: () => {
    //         if (idx < acc.length) {
    //             const res = {
    //                 value: acc[idx], 
    //                 done: false,
    //             };
    //             idx += 1;
    //             return res;
    //         }
    //         return { done: true };
    //     } };
    // };

    return Object.freeze({
        add,
        set,
        get,
        'delete': deleteFn,
        clear,
        forEach,
        on,
        // [Symbol.iterator]: ito,
        get length() {
            return acc.length;
        }
    });
};

export default ObsList;