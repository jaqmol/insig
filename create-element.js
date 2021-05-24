const err1stAttrib = '1st attribute must be tag-name string';
const err2ndAttribObjOrArr = '2nd attribute must be object of attributes or array of children';
const arr1st2nd3rdWrong = '1st attribute must be tag-name string, 2nd attribute must be object of attributes, 3rd attribute must be array of children';

const CE = (...args) => {
    switch (args.length) {
        case 1:
            if (typeof args[0] === 'string') {
                return createElem(args[0]);
            } else {
                throw new Error(err1stAttrib);
            }
        case 2:
            if (typeof args[0] === 'string') {
                if (args[1] instanceof Array) {
                    return addChildren(createElem(args[0]), args[1]);
                } else if (typeof args[1] === 'object') {
                    return addAttribs(createElem(args[0]), args[1]);
                } else {
                    throw new Error(err2ndAttribObjOrArr);
                }
            } else {
                throw new Error(err1stAttrib);
            }
        case 3:
            if ((typeof args[0] === 'string') && (typeof args[1] === 'object') && (args[2] instanceof Array)) {
                return addChildren(addAttribs(createElem(args[0]), args[1]), args[2]);
            } else {
                throw new Error(arr1st2nd3rdWrong);
            }
        default:
            throw new Error(arr1st2nd3rdWrong);
    }
};

const createElem = (tagName) => {
    return document.createElement(tagName);
};

const addChildren = (elem, elemChildren) => {
    elem.append(...elemChildren);
    return elem;
};

const addAttribs = (elem, elemAttributes) => {
    for (const [name, value] of Object.entries(elemAttributes)) {
        elem.setAttribute(name, value);
    }
    return elem;
};

export default CE;