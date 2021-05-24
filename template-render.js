const TemplateRender = template => {
    const tokens = parseTokens(template);
    if (!tokens) return null;
    const render = makeRenderer(makeProducers(tokens));
    render.names = extractNames(tokens);
    return render;
}

const parseTokens = template => {
    const matches = [...template.matchAll(/{{\s*([a-zA-Z0-9]+)\s*}}/g)];
    if (!matches.length) return null;
    const tokens = [];
    const lastTokenEndIndex = () => {
        if (tokens.length === 0) return 0;
        const lr = tokens[tokens.length - 1];
        return lr[2] + lr[3];
    };
    matches.forEach(match => {
        const lrei = lastTokenEndIndex();
        const prefix = template.slice(lrei, match.index);
        tokens.push(['str', prefix, lrei, prefix.length]);
        tokens.push(['rpl', match[1], match.index, match[0].length]);
    });
    const lrei = lastTokenEndIndex();
    const suffix = template.slice(lrei);
    tokens.push(['str', suffix, lrei, suffix.length]);
    return tokens;
};

const makeProducers = tokens => tokens.reduce((acc, [type, payload]) => {
    switch (type) {
        case 'str':
            if (payload.length) {
                acc.push(stringProducer(payload));
            }
            break;
        case 'rpl':
            acc.push(replacementProducer(payload));
            break;
    }
    return acc;
}, []);

const stringProducer = str => () => str;
const replacementProducer = name => getFn => getFn(name);

const makeRenderer = producers => getFn => producers.map(p => p(getFn)).join('');

const extractNames = tokens => tokens.reduce((acc, [type, payload]) => {
    if (type === 'rpl') acc.push(payload);
    return acc;
}, []);

export default TemplateRender;