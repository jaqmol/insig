const LazyInit = (initFn, ...args) => {
    let getInst = () => {
        const inst = initFn(...args);
        getInst = () => inst;
        return inst;
    };
    return () => getInst();
};

export default LazyInit;