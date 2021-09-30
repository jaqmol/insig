import ListComp from '../turbo/list-comp.js';
import Store from '../turbo/store.js';

export class MyTable extends ListComp {
    store;

    static get observedAttributes() {
        return ['items'];
    }
    
    constructor() {
        super();
        this._store = new Store({
            items: (items = [], event) => {
                switch (event.type) {
                    case 'set':
                        return event.items;
                    case 'add':
                        return [...items, event.item];
                    case 'delete':
                        return items.filter((_, i) => i !== event.index);
                    default:
                        return items;
                }
            },
            firstNameInput: (value = '', event) => {
                switch (event.type) {
                    case 'change':
                        this.#updateFooterButtonDisabled(event.value, this._store.state.lastNameInput);
                        return event.value;
                    case 'clear-input':
                        return '';
                    default:
                        return value;
                }
            },
            lastNameInput: (value = '', event) => {
                switch (event.type) {
                    case 'change':
                        this.#updateFooterButtonDisabled(this._store.state.firstNameInput, event.value);
                        return event.value;
                    case 'clear-input':
                        return '';
                    default:
                        return value;
                }
            },
            addButtonDisabled: (value = true, event) => {
                switch (event.type) {
                    case 'change':
                        return event.value;
                    case 'clear-input':
                        return true;
                    default:
                        return value;
                }
            },
            clearButtonDisabled: (value = true, event) => {
                switch (event.type) {
                    case 'change':
                        return event.value;
                    case 'clear-input':
                        return true;
                    default:
                        return value;
                }
            },
        });
        this._store.merge({
            items: [],
            firstNameInput: '',
            lastNameInput: '',
            addButtonDisabled: true
        });
    }

    #updateFooterButtonDisabled(firstNameInput, lastNameInput) {
        firstNameInput = firstNameInput.trim();
        lastNameInput = lastNameInput.trim();
        this._store.send.addButtonDisabled({
            type: 'change',
            value: firstNameInput === '' || lastNameInput === ''
        });
        this._store.send.clearButtonDisabled({
            type: 'change',
            value: firstNameInput === '' && lastNameInput === ''
        });
    }

    attributeChangedCallback(name, _, strVal) {
        switch (name) {
            case 'items':
                strVal = strVal.replace(/'/g, '"');
                const items = JSON.parse(strVal);
                this._store.send.items({type: 'set', items});
                break;
            default:
                break;
        }
    }

    renderBase() {
        return /*html*/`
            <table>
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.renderedItems()}
                </tbody>
                <tfoot>
                    <tr>
                        <td>
                            <input type="text" name="firstName" class="firstName">
                        </td>
                        <td>
                            <input type="text" name="lastName" class="lastName">
                        </td>
                        <td>
                            <button class="add" disabled>+</button>
                            <button class="clear" disabled>x</button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
    }

    itemsParent(baseElement) {
        return baseElement.querySelector('tbody');
    }

    bindBase(baseElement) {
        const firstNameInput = baseElement.querySelector('tfoot input.firstName');
        const lastNameInput = baseElement.querySelector('tfoot input.lastName');
        const addButton = baseElement.querySelector('tfoot button.add');
        const clearButton = baseElement.querySelector('tfoot button.clear');
        
        // First Name Input
        firstNameInput.addEventListener('input', e => {
            this._store.send.firstNameInput({
                type: 'change',
                value: e.target.value
            });
        });
        this._store.on.firstNameInput((_, value) => {
            if (firstNameInput.value !== value) {
                firstNameInput.value = value;
            }
        });

        // Last Name Input
        lastNameInput.addEventListener('input', e => {
            this._store.send.lastNameInput({
                type: 'change',
                value: e.target.value
            });
        });
        this._store.on.lastNameInput((_, value) => {
            if (lastNameInput.value !== value) {
                lastNameInput.value = value;
            }
        });

        // Add Button
        addButton.addEventListener('click', e => {
            this._store.send.items({
                type: 'add', 
                item: {
                    firstName: firstNameInput.value,
                    lastName: lastNameInput.value
                }
            });
            this._store.send({type: 'clear-input'});
        });
        this._store.on.addButtonDisabled((_, value) => {
            if (addButton.disabled !== value) {
                addButton.disabled = value;
            }
        });

        // Clear Button
        clearButton.addEventListener('click', e => {
            this._store.send({type: 'clear-input'});
        });
        this._store.on.clearButtonDisabled((_, value) => {
            if (clearButton.disabled !== value) {
                clearButton.disabled = value;
            }
        });
    }

    renderItem(item, index) {
        return /*html*/`
            <tr>
                <td>${item.firstName}</td>
                <td>${item.lastName}</td>
                <td><button class="delete">x</button></td>
            </tr>
        `;
    }

    bindItem(trElem, item, index) {
        const delBtn = trElem.querySelector('button.delete');
        delBtn.addEventListener(
            'click', 
            () => this._store.send.items({type: 'delete', index}),
        );
    }

    updateItem(trElem, item, index) {
        const tds = trElem.querySelectorAll('td');
        tds[0].innerText = item.firstName;
        tds[1].innerText = item.lastName;
    }
}

customElements.define('my-table', MyTable);