import TemplateRender from './template-render.js';
import LCZ from './lcz.js';

const initFrag = ({
    initConst,
    initOn,
    self,
    stateGet, 
    name, 
    renderFn, 
    initFn,
    dispatchState
}) => {
    let get = () => {
        const toBeRendered = renderFn(self);
        const fragment = toBeRendered instanceof Array
            ? renderFrag(...toBeRendered)
            : renderFrag(toBeRendered);
        initRefs(initConst, fragment);
        initBinds(initOn, fragment, stateGet);
        initObs(self, fragment);
        initLcz(fragment);
        dispatchState();
        get = () => fragment;
        if (initFn) initFn(self, fragment);
        return fragment;
    };
    Object.defineProperty(self, name, {
        get: () => get(),
    });
};

export default initFrag;

const renderFrag = (...toBeRendered) => {
    const children = [];
    const helper = document.createElement('div');
    const transferChildren = () => {
        children.push(...helper.children);
    };
    for (const item of toBeRendered) {
        if ((typeof item === 'string') && (item !== '')) {
            helper.innerHTML = item;
            transferChildren();
        } else if (item instanceof Node) {
            children.push(item);
        }
    }
    return children;
};

const initRefs = (initConst, fragment) => {
    const processElem = elem => {
        const constName = elem.getAttribute('comp-ref');
        initConst(constName, () => elem);
    };
    for (const child of fragment) {
        if (child.hasAttribute('comp-ref')) {
            processElem(child);
        }
        for (const finding of child.querySelectorAll('[comp-ref]')) {
            processElem(finding);
        }
    }
};

const initBinds = (initOn, fragment, stateGet) => {
    const processElem = (attrName, elem) => {
        const binding = elem.getAttribute(attrName);
        switch (attrName) {
            case 'comp-attr':
                registerBindings(binding, initOn, (nameToSet, value) => {
                    elem.setAttribute(nameToSet, value(stateGet));
                }, false);
                break;
            case 'comp-prop':
                registerBindings(binding, initOn, (nameToSet, value) => {
                    elem[nameToSet] = value(stateGet);
                }, true);
                break;
        }
    };
    for (const attrName of ['comp-attr', 'comp-prop']) {
        const sel = `[${attrName}]`;
        for (const child of fragment) {
            if (child.hasAttribute(attrName)) {
                processElem(attrName, child);
            }
            for (const finding of child.querySelectorAll(sel)) {
                processElem(attrName, finding);
            }
        }
    }
};

/*
Template-Syntax: 
    comp-attr="id=fodderItem-{{id}}"
             ="id=fodderItem-{{id}}"
             ="innerHTML=Whatever there is <em>{{textA}}</em> {{textB}}"
*/

const registerBindings = (bindingsTemplate, initOn, setOnElem, isProp) => {
    let reducer = (acc, comp) => {
        acc.push(comp);
        reducer = (acc, comp, idx, buff) => {
            const prevIdx = idx - 1;
            let prevComp = buff[prevIdx];
            if (prevComp.endsWith('\\')) {
                acc[prevIdx] = `${prevComp.slice(0, -1)} ${comp}`;
            } else {
                acc.push(comp);
            }
            return acc;
        };
        return acc;
    };
    const allBindings = bindingsTemplate.split(' ').reduce(
        (acc, comp, idx, buff) => reducer(acc, comp, idx, buff), 
        []
    );
    for (const binding of allBindings) {
        registerOneBinding(binding, initOn, setOnElem, isProp);
    }
};

const registerOneBinding = (binding, initOn, setOnElem, isProp) => {
    const equalsIdx = binding.indexOf('=');
    const containsEqual = equalsIdx > -1;
    if (!isProp && !containsEqual) throw new Error(`No "=" found in binding "${binding}"`);
    const nameToSet = containsEqual ? binding.slice(0, equalsIdx).trim() : 'textContent';
    const subject = binding.slice(equalsIdx + 1).trim();
    const render = TemplateRender(subject);
    const registry = render
        ? render.names.map(vn => [vn, () => setOnElem(nameToSet, render)])
        : [[subject, (_, value) => setOnElem(nameToSet, () => value)]];
    initOn(Object.fromEntries(registry));
};


const initObs = (self, fragment) => {
    const register = (elem, bindings) => bindings
        .split(' ')
        .forEach(rawBinding => {
            const binding = rawBinding.trim();
            if (binding === '') return;
            const eqsIdx = binding.indexOf('=');
            if (eqsIdx === -1) throw new Error(`No "=" found in binding "${binding}"`);
            const eventName = binding.slice(0, eqsIdx).trim();
            const funcName = binding.slice(eqsIdx + 1).trim();
            elem.addEventListener(eventName, e => {
                if (!self[funcName]) throw new Error(`No function "${funcName}" found`);
                const funcT = typeof self[funcName];
                if (funcT !== 'function') throw new Error(`"${funcName}" is not a function (${funcT})`);
                self[funcName](e);
            });
        });
    for (const child of fragment) {
        if (child.hasAttribute('comp-on')) {
            const value = child.getAttribute('comp-on');
            register(child, value);
        }
        for (const elem of child.querySelectorAll('[comp-on]')) {
            const value = elem.getAttribute('comp-on');
            register(elem, value);
        }
    }
};

/*
Localization-Syntax: 
    lcz-attr="textContent=LOCALIZABLE_KEY:Fallback Translation"
            ="LOCALIZABLE_KEY:Fallback Translation"
*/
const initLcz = (fragment) => {
    if (!LCZ.initialized) return;
    const elems = [];
    for (const child of fragment) {
        for (const attrName of ['lcz-attr', 'lcz-prop']) {
            const sel = `[${attrName}]`;
            if (child.hasAttribute(attrName)) {
                elems.push(child);
            }
            for (const finding of child.querySelectorAll(sel)) {
                elems.push(finding);
            }
        }
    }
    LCZ().fragment(...elems);
};
