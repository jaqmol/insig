import Comp from '../turbo/comp.js';
import Store from '../turbo/store.js';

export class MyCounter extends Comp {
    #store;

    static get observedAttributes() {
        return ['label'];
    }

    constructor() {
        super();

        this.#store = new Store({
            label: (value = '', event) => {
                switch (event.type) {
                    case 'set':
                        return event.value;
                    default:
                        return value;
                }
            },
            counter: (value = 0, event) => {
                switch (event) {
                    case 'incremented':
                        return value + 1;
                    case 'decremented':
                        return value - 1;
                    default:
                        return value;
                }
            },
        });

        this.#store.merge({
            label: null,
            counter: 1,
        });
    }

    attributeChangedCallback(name, _, value) {
        switch (name) {
            case 'label':
                this.#store.send.label({type: 'set', value});
                break;
            default:
                break;
        }
    }

    get label() {
        return this.#store.state.label;
    }
    set label(value) {
        this.#store.send.label({type: 'set', value});
    }

    render() {
        return /*html*/`
            <div>
                <span class="label">${this.#store.state.label}</span>
                <span class="counter">${this.#store.state.counter}</span>
            </div>
            <button class="decrement">Decrement</button>
            <button class="increment">Increment</button>
        `;
    }

    bind(valElem, decBtn, incBtn) {
        const labelElem = valElem.querySelector('.label');
        this.#store.on.label((_, value) => {
            labelElem.innerText = value;
        });
        const counterElem = valElem.querySelector('.counter');
        this.#store.on.counter((_, value) => {
            counterElem.innerText = value;
        });
        decBtn.addEventListener('click', () => {
            this.#store.send.counter('decremented');
        });
        incBtn.addEventListener('click', () => {
            this.#store.send.counter('incremented');
        });
    }
}

customElements.define('my-counter', MyCounter);