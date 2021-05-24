const MemoQuery = selector => {
    let fn = () => {
        const e = document.querySelector(selector);
        fn = () => e;
        return e;
    };
    return () => fn();
};

export default MemoQuery;