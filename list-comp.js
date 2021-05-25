import {
    Comp,
    Fragment,
    Let,
    Const,
    INIT_ON,
    INIT_LET
} from './comp.js';

const invalidInitError = 'ListComp() must be called with a combination of <tagName:string, pubVars:object, ChildComp:function>. <tagName:string, pubVars:object> can be omitted. <tagName:string> defaults to "div".';
const singleRootCompError = 'Child components must be single-root for use in ListComp';
const incompatibleCompError = 'Child component must be declared with Comp(...)';
const reservedKeywordError = word => `"${word}" is a reserved keyword for ListComp`;
const invalidEventError = eventName => `Event "${eventName}" is not supported by ListComp`;
const reservedKeywords = new Set(['Add', 'Set', 'Delete', 'ReplaceAll', 'IndexOf', 'FindIndex', 'OnMap']);
const validEventNames = new Set(['Add', 'Set', 'Delete', 'ReplaceAll']);

const ListComp = (...args) => {
    let tagName = 'div';
    let initPubVars = () => {};
    let ChildComp;
    for (const arg of args) {
        switch (typeof arg) {
            case 'string':
                tagName = arg;
                break;
            case 'object':
                for (const [varName] of Object.entries(arg)) {
                    if (reservedKeywords.has(varName)) {
                        reservedKeywordError(varName);
                    }
                }
                initPubVars = instance => {
                    for (const [varName, initVal] of Object.entries(arg)) {
                        if (!instance[INIT_LET]) throw new Error(incompatibleCompError);
                        instance[INIT_LET](varName, () => initVal);
                    }
                };
                break;
            case 'function':
                ChildComp = arg;
                break;
            default:
                throw new Error(invalidInitError);
        }
    }
    if (!ChildComp) throw new Error(invalidInitError);

    return Comp({
        _mapObservers: Const(() => new Map()),
        _dispatchMapEvent: (self, name, ...args) => {
            if (!self._mapObservers.has(name)) return;
            const acc = self._mapObservers.get(name);
            for (const cb of acc) {
                const mapper = cb(...args);
                self._items.forEach((item, index) => {
                    const changedItem = mapper(item, index);
                    if (changedItem !== item) {
                        pub.Set(index, changedItem);
                    }
                });
            };
        },

        _changeObservers: Const(() => []),
        _dispatchChangeEvent: (self) => {
            if (self._changeObservers.length === 0) return;
            const clone = [...self._items];
            for (const cb of self._changeObservers) {
                cb(clone);
            }
        },

        _itemChangeObservers: Const(() => []),
        _processItemChange: (self, comp, name, value) => {
            const index = self._comps.indexOf(comp);
            const item = self._items[index];
            if (item[name] === value) return;
            item[name] = value;
            self._items[index] = item;
            if (self._itemChangeObservers.length === 0) return;
            for (const cb of self._itemChangeObservers) {
                cb(index, item);
            }
        },
        
        // fragment: Fragment(() => `
        //     <${tagName} comp-ref="_contentRef"></${tagName}>
        // `, self => {
        //     initPubVars(self);
        // }),
        fragment: Fragment(() => {
            const f = document.createElement(tagName);
            f.setAttribute('comp-ref', '_contentRef');
            return f;
        }, self => {
            initPubVars(self);
        }),
        
        _items: Const(() => []),
        _comps: Const(() => []),

        Add: (self, item) => {
            const comp = ChildComp(item);
            if (comp.fragment.length !== 1) {
                throw new Error(singleRootCompError);
            }
            const registry = {};
            for (const [name] of Object.entries(item)) {
                registry[name] = (_, value) => {
                    self._processItemChange(comp, name, value);
                };
            }
            if (!comp[INIT_ON]) throw new Error(incompatibleCompError);
            comp[INIT_ON](registry);
            self._items.push(item);
            self._comps.push(comp);
            self._contentRef.append(comp.fragment[0]);
            self._dispatchMapEvent('Add', item);
            self._dispatchChangeEvent();
        },
        Set: (self, index, item) => {
            if ((index < 0) || (index >= self._items.length)) {
                throw new Error(`Index ${index} out of bounds`);
            }
            self._items[index] = item;
            const comp = self._comps[index];
            Object.entries(item).forEach(([k, v]) => {
                comp[k] = v;
            });
            self._dispatchMapEvent('Set', index, item);
            self._dispatchChangeEvent();
        },
        Delete: (self, index) => {
            if ((index < 0) || (index >= self._items.length)) {
                throw new Error(`Index ${index} out of bounds`);
            }
            self._items.splice(index, 1);
            self._comps.splice(index, 1);
            const elem = self._contentRef.children[index];
            elem.remove();
            self._dispatchMapEvent('Delete', index);
            self._dispatchChangeEvent();
        },

        ReplaceAll: (self, items) => {
            const privItmLen = self._items.length;
            for (let i = 0; i < items.length; i++) {
                if (i < privItmLen) {
                    self.Set(i, items[i]);
                } else {
                    self.Add(items[i]);
                }
            }
            while (self._items.length > items.length) {
                self.Delete(self._items.length - 1);
            }
            self._dispatchMapEvent('ReplaceAll', items);
            self._dispatchChangeEvent();
        },

        IndexOf: (self, item) => self._items.indexOf(item),
        FindIndex: (self, callback) => self._items.findIndex(callback),

        /**
         * callback is expected to return mapping function
         */
        OnMap: (self, eventName, callback) => {
            if (!validEventNames.has(eventName)) {
                throw new Error(invalidEventError(eventName));
            }
            const acc = self._mapObservers.get(eventName) || [];
            acc.push(callback);
            self._mapObservers.set(eventName, acc);
        },

        OnChange: (self, callback) => {
            self._changeObservers.push(callback);
        },
        OnItemChange: (self, callback) => {
            self._itemChangeObservers.push(callback);
        }
    });
};

export default ListComp;