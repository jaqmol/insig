import { Comp, ListComp, Store } from 'turbo';



export class MyListComponent extends ListComp {
    #store = new Store({
        items: (value = [], event) => {
            switch (event.type) {
                case 'add':
                    return value + 1;
                case 'remove':
                    return value - 1;
                default:
                    return value;
            }
        },
    });

    content() {
        return `
            <table>
                ${this.contentItems()}
            <table>
        `;
    }

    contentItem(item, index) {
        return `
            <tr>
                <td>${item.firstName}</td>
                <td>${item.lastName}</td>
            </tr>
        `;
    }

    // bind(tableElem) {

    // }

    contentElements(tableElem) {
        return tableElem.querySelectorAll('td');
    }

    bindItem(tableElem, item, index) {
        // this.#store.on.items(index, item => {
            const tds = trElem.querySelectorAll('td');
            tds[0].innerText = item.firstName;
            tds[1].innerText = item.lastName;
        // });
    }
    
}