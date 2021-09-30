const makeRouter = () => {
    const routeComps = str => 
        str.split('/').filter(c => c !== '#' && c.length > 0);

    let current = [];
    const registry = new Map();

    const on = (name, cb) => {
        const callbacks = registry.get(name) || [];
        callbacks.push(cb);
        registry.set(name, callbacks);
    };
    const dispatch = () => {
        const name = current.length ? current[0] : '';
        const callbacks = registry.get(name);
        if (!callbacks) return;
        const args = current.slice(1);
        callbacks.forEach(cb => cb(...args));
    };
    const go = (...args) => {
        const lastIdx = args.length - 1;
        let query = '';
        if (typeof args[lastIdx] === 'object') {
            query = '?' + Object.entries(args[lastIdx])
                        .map(([k, v]) => `${k}=${v}`)
                        .join('&');
            args = args.slice(0, lastIdx);
        }
        window.location.hash = `#/${args.join('/')}${query}`;
    };
    // Setting path component at index:
    const set = (index, comp) => {
        const args = [...current];
        args[index] = comp;
        go(...args);
    };

    window.addEventListener('hashchange', e => {
        const newUrl = new URL(e.newURL); // e.oldURL exists as well
        current = routeComps(newUrl.hash);
        dispatch();
    });

    if (window.location.hash.length > 1) {
        current = routeComps(window.location.hash);
    }

    return {
        on,
        go,
        set,
        dispatch,
        get path() {
            return [...current];
        }
    };
};

let Router = () => {
    const r = makeRouter();
    Router = () => r;
    return r;
};

export default () => Router();