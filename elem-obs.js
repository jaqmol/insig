const ElemObs = elem => {
    const callbacks = new Map(); 
    const inst = {
        on: (...args) => {
            const lastIdx = args.length - 1;
            const keys = args.slice(0, lastIdx);
            const cb = args[lastIdx];
            keys.forEach(key => {
                const acc = callbacks.get(key) || [];
                acc.push(cb);
                callbacks.set(key, acc)
                elem.addEventListener(
                    key, 
                    () => cb(elem, key),
                    false,
                );
            });
            return inst;
        },
        fire: () => {
            callbacks.forEach((acc, key) => {
                acc.forEach(cb => cb(elem, key));
            });
            return inst;
        }
    };
    return inst;
};

export default ElemObs;