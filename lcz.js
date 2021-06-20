const parseDefinition = (defStr, getValue) => {
    const equalIdx = defStr.indexOf('=');
    const colonIdx = defStr.indexOf(':');
    const hasColon = colonIdx > -1;
    const hasEqual = (equalIdx > -1) && hasColon && (equalIdx < colonIdx);
    const subject = hasEqual ? defStr.slice(0, equalIdx) : 'textContent';
    const key = defStr.slice(hasEqual ? (equalIdx + 1) : 0, hasColon ? colonIdx : defStr.length);
    const fallback = hasColon ? defStr.slice(colonIdx + 1) : getValue(subject);
    return {subject, key, fallback};
};

const MakeLCZ = translations => {
    const key = (aKey, fallback) => {
        const val = translations[aKey];
        return val || fallback;
    };
    /*
    Localization-Syntax: 
        lcz-attr="textContent=LOCALIZABLE_KEY:Fallback Translation"
                ="LOCALIZABLE_KEY:Fallback Translation"
    */
    const fragment = (...elems) => elems.forEach(e => {
        if (e.hasAttribute('lcz-attr')) {
            const r = parseDefinition(e.getAttribute('lcz-attr'), s => e.getAttribute(s));
            e.setAttribute(r.subject, key(r.key, r.fallback));
        } else if (e.hasAttribute('lcz-prop')) {
            const r = parseDefinition(e.getAttribute('lcz-prop'), s => e[s]);
            e[r.subject] = key(r.key, r.fallback);
        }
    });
    return Object.freeze({ key, fragment });
};

let getInstance = () => {
    throw new Error('LCZ can only be used in scripts loaded after LCZ script tag');
};
const LCZ = () => getInstance();
export default LCZ;

const findCurrentLocalization = allTranslations => {
    if (allTranslations instanceof Array) {
        allTranslations = allTranslations.reduce((coll, oneTranslation) => {
            return Object.entries(oneTranslation)
                .reduce((acc, [loc, tls]) => {
                    if (!!acc[loc]) {
                        acc[loc] = Object.assign(acc[loc], tls);
                    } else {
                        acc[loc] = tls;
                    }
                    return acc;
                }, coll);
        }, {});
    }
    const availLocs = Object.keys(allTranslations);
    const locale = navigator.languages.find(l => availLocs.includes(l));
    return locale ? allTranslations[locale] : {};
};

(() => {
    if (!window.localizations) throw new Error('Please load your <localizations>.js before the LCZ script tag');
    const instance = MakeLCZ(findCurrentLocalization(window.localizations));
    window.localizations = undefined;
    getInstance = () => instance;
    LCZ.initialized = true;
    instance.fragment(...[
        ...document.querySelectorAll('[lcz-attr]'), 
        ...document.querySelectorAll('[lcz-prop]')
    ]);
})();