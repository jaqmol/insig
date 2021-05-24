import initFrag from './comp-frag.js'

const PROP_CONF = Symbol();

const FRAGMENT_TYPE = Symbol();
const CONST_TYPE = Symbol();
const LET_TYPE = Symbol();

export const INIT_FRAGMENT = Symbol();
export const INIT_CONST = Symbol();
export const INIT_LET = Symbol();
export const INIT_ON = Symbol();

const compDeclErrMsg = `Comp() must be called with either <tag-name, config> for web-components or <config> for pure JS components`;

export const Comp = (...args) => {
    switch (args.length) {
        case 1:
            return JSComp(args[0]);
        case 2:
            return WebComp(args[0], args[1]);
        default:
            throw new Error(compDeclErrMsg);
    }
};

export const Fragment = (renderFn, initFn) => ({
    [PROP_CONF]: [FRAGMENT_TYPE, renderFn, initFn],
});

export const Const = (initFn) => ({
    [PROP_CONF]: [CONST_TYPE, initFn],
});

export const Let = (initFn=() => null) => ({
    [PROP_CONF]: [LET_TYPE, initFn],
});

const JSComp = config => params => {
    const obs = new Map();
    const state = new Map();
    const self = {
        [INIT_FRAGMENT]: (n, r, i) => initFragment(n, r, i),
        [INIT_CONST]: (n, i) => initConst(n, i),
        [INIT_LET]: (n, i) => initLet(n, i),
        [INIT_ON]: (r) => initOn(r),
    };

    const dispatch = (next, prev, name) => {
        const cbs = obs.get(name);
        if (!cbs) return;
        cbs.forEach(c => c(self, next, prev, name));
    };
    const dispatchState = () => {
        state.forEach((value, name) => {
            dispatch(value, null, name);
        });
    };
    
    const initOn = registry => {
        for (const [name, callback] of Object.entries(registry)) {
            const cbT = typeof callback;
            if (cbT !== 'function') {
                throw new Error(`Found "${cbT}" instead of callback function registered for event "${name}"`);
            }
            const cbs = obs.get(name) || [];
            cbs.push(callback);
            obs.set(name, cbs);
        }
    };

    const Getter = name => () => state.get(name);

    const initFragment = (name, renderFn, initFn) => initFrag({
        initConst,
        initOn,
        self,
        stateGet: n => state.get(n), 
        name, 
        renderFn, 
        initFn,
        dispatchState 
    });

    const initConst = (name, initFn) => {
        let get = () => {
            const value = state.has(name)
                ? state.get(name)
                : initFn(self);
            state.set(name, value);
            get = Getter(name);
            return value;
        };
        Object.defineProperty(self, name, {
            get: () => get(),
        });
    };

    const initLet = (name, initFn) => {
        const set = nextVal => {
            const prevVal = state.get(name);
            state.set(name, nextVal);
            dispatch(nextVal, prevVal, name);
        };
        let get = () => {
            const value = state.has(name)
                ? state.get(name)
                : initFn(self);
            state.set(name, value);
            get = Getter(name);
            return value;
        };
        Object.defineProperty(self, name, {
            get: () => get(),
            set
        });
    };

    const initFunc = (name, fn) => {
        self[name] = (...args) => fn(self, ...args);
    };
    
    for (const [name, value] of Object.entries(config)) {
        if (value[PROP_CONF]) {
            const [type, arg1, arg2] = value[PROP_CONF];
            switch (type) {
                case FRAGMENT_TYPE:
                    initFragment(name, arg1, arg2);
                    break;
                case CONST_TYPE:
                    initConst(name, arg1);
                    break;
                case LET_TYPE:
                    initLet(name, arg1);
                    break;
            }
        } else {
            switch (typeof value) {
                case 'function':
                    initFunc(name, value);
                    break;
                case 'object':
                    if (name.toUpperCase() === 'ON') {
                        initOn(value);
                    }
                    break;
            }
        }
    }

    if (params) {
        for (const [name, value] of Object.entries(params)) {
            if (name.toUpperCase() === 'ON') {
                initOn(value);
            } else {
                self[name] = value;
            }
        }
    }

    return self;
};

const dispatchLifecycleEvent = Symbol();
const dispatchAttribChangeEvent = Symbol();

const WebComp = (tagName, config) => {
    let obsAttribs = () => {
        const allOnKeys = Object.keys(config).filter(n => n.toUpperCase() === 'ON');
        const names = allOnKeys.reduce((acc, onKey) => {
            acc.push(...Object.keys(config[onKey]));
            return acc;
        }, []);
        obsAttribs = () => names;
        return names;
    };

    const ThisJSComp = JSComp(config);

    class ThisWebComp extends HTMLElement {
        static get observedAttributes() {
            return obsAttribs();
        }

        constructor(params) {
            super();
            const comp = typeof params === 'object' 
                ? ThisJSComp(params)
                : ThisJSComp();
            
            this[dispatchLifecycleEvent] = (eventName) => {
                if (!comp[eventName]) return;
                comp[eventName]();
            };
            this[dispatchAttribChangeEvent] = (name, value) => {
                comp[name] = value;
            };
            
            const fragment = comp.fragment;
            if (!fragment) throw new Error(`No fragment found at comp "${tagName}"`);

            this.comp = comp;
            if (comp.useShadow) {
                const shadow = this.attachShadow({mode: 'open'});
                shadow.append(...fragment);
            } else {
                this.append(...fragment);
            }
        }

        connectedCallback() {
            this[dispatchLifecycleEvent]('connected');
        }
    
        disconnectedCallback() {
            this[dispatchLifecycleEvent]('disconnected');
        }
    
        adoptedCallback() {
            this[dispatchLifecycleEvent]('adopted');
        }
    
        attributeChangedCallback(name, oldValue, newValue) {
            this[dispatchAttribChangeEvent](newValue, oldValue, name);
        }
    }

    customElements.define(tagName, ThisWebComp);

    return ThisJSComp;
};
