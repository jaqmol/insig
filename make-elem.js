export const makeElem = htmlStr => {
    const helper = document.createElement('div');
    helper.innerHTML = htmlStr;
    return helper.firstElementChild;
};

export const makeElems = htmlStr => {
    const helper = document.createElement('div');
    helper.innerHTML = htmlStr;
    return [...helper.children];
};
