import Store from '../turbo/store.js';

export default class ListComp extends HTMLElement {
    constructor() {
        super();
        
        if (typeof this.renderBase !== 'function') {
            throw new Error('ListComp subclass must implement renderBase() method');
        }
        if (typeof this.renderItem !== 'function') {
            throw new Error('ListComp subclass must implement renderItem(item, index) method');
        }
        if (typeof this.updateItem !== 'function') {
            throw new Error('ListComp subclass must implement updateItem(elem, item, index) method');
        }

        const bindItems = (parentElement, items, startIndex) => {
            if (typeof this.bindItem === 'function') {
                const itemElements = parentElement.children;
                for (let i = startIndex; i < items.length; i++) {
                    this.bindItem(itemElements[i], items[i], i);
                }
            }
        };

        const onItemsFn = parentElement => (oldItems, newItems) => {
            if (oldItems.length < newItems.length) {
                addItems(parentElement, oldItems, newItems);
            } else if (oldItems.length > newItems.length) {
                deleteItems(parentElement, oldItems, newItems);
            } else {
                updateItems(parentElement, oldItems, newItems);
            }
        };

        const addItems = (parentElement, oldItems, newItems) => {
            const helper = parentElement.cloneNode(false);
            const amount = newItems.length - oldItems.length;
            
            const acc = [];
            for (let i = 0; i < amount; i++) {
                const j = oldItems.length + i;
                acc.push(this.renderItem(newItems[j], j));
            }

            helper.innerHTML = acc.join('\n');
            parentElement.append(...helper.children);
            
            bindItems(parentElement, newItems, oldItems.length);
            updateItems(parentElement, oldItems, newItems);
        };

        const deleteItems = (parentElement, oldItems, newItems) => {
            const itemElements = parentElement.children;
            for (let i = newItems.length; i < itemElements.length; i++) {
                itemElements[i].remove();
            }
            updateItems(parentElement, oldItems, newItems);
        };

        const updateItems = (parentElement, oldItems, newItems) => {
            const itemElements = parentElement.children;
            for (let i = 0; i < newItems.length; i++) {
                const oi = oldItems[i];
                const ni = newItems[i];
                if (oi !== ni) {
                    this.updateItem(itemElements[i], ni, i);
                }
            }
        };
        
        setTimeout(() => {
            if (!this._store || !(this._store instanceof Store) || !this._store.has('items')) {
                throw new Error('ListComp subclass must initialize _store with items array');
            }
            this.attachShadow({mode: 'open'});
            const helper = document.createElement('div');
            
            helper.innerHTML = this.renderBase();
            const baseElements = [...helper.children];
            
            if (typeof this.bindBase === 'function') {
                this.bindBase(...baseElements);
            }

            this.shadowRoot.append(...baseElements);

            const parentElement = typeof this.itemsParent === 'function'
                ? this.itemsParent(...baseElements)
                : baseElements[0];

            bindItems(parentElement, this._store.state.items, 0);
            updateItems(parentElement, [], this._store.state.items);

            this._store.on.items(onItemsFn(parentElement));
        }, 0);
    }

    renderedItems() {
        return this._store.state.items.map(this.renderItem).join('\n');
    }
}