export default class Comp extends HTMLElement {
    constructor() {
        super();
        setTimeout(() => {
            if (typeof this.render === 'function') {
                this.attachShadow({mode: 'open'});
                const helper = document.createElement('div');
                helper.innerHTML = this.render();
                const elements = [...helper.children];
                if (typeof this.bind === 'function') {
                    this.bind(...elements);
                }
                this.shadowRoot.append(...elements);
            }
        }, 0);
    }
}