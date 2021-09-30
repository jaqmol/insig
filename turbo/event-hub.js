const EventHub = (config) => {
    const self = {};
    if (config instanceof Array) {
        for (const name of config) {
            self[name] = Event();
        }
    } else if (typeof config === 'object') {
        for (const [name, callback] of Object.entries(config)) {
            self[name] = Event(callback);
        }
    } else {
        throw new Error('No events configured');
    }
    return Object.freeze(self);
};

const INITIAL_VALUE = Symbol();

const Event = (initCallback) => {
    let currentArgs = INITIAL_VALUE;
    const acc = new Set();
    const fire = () => {
        for (const cb of acc) {
            cb(...currentArgs);
        };
    };
    const send = (...args) => {
        currentArgs = args;
        fire();
    };
    const on = (cb, dispatchLastEvent) => {
        acc.add(cb);
        if (dispatchLastEvent && currentArgs !== INITIAL_VALUE) {
            fire();
        }
    };
    const off = cb => {
        acc.delete(cb);
    };
    if (typeof initCallback === 'function') {
        on(initCallback);
    }
    send.on = on;
    send.off = off;
    return Object.freeze(send);
};

export default EventHub;