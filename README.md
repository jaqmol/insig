# insig

![insig logo](insig-logo.svg "insig logo")

No-junk JS component library with insignificant weight. If you're 17.5% too weak or 11.4% too unwilling to use heavy-weight component frameworks, but still want all the stuff in one mush:

- Web-Components
- Localization
- Templates
- Routing
- Reactive binding
- Lazy init
- Observables
- Debounce
- Unique IDs
- PSW hashing

> Plus 133.7% of all the quickility.

## KEEPING IT SIMPLE SINCE 1903

Handmade master craftsmanship gives you the full-bodied low-fat experience you expect from a component framework:

- No inheritance
- No bundler
- No build-step
- No TypeScript
- No junk

> All the folding chair comfort you ever hoped for.

## REQUIREMENTS

Because `insig` is so bare bones, your customer's browser almost needs to be from the JavaScript-future:

- modules & imports
- template literals
- Web Components
- All the words: `let`, `const`, `...`

Yes: That's all the browsers, since a couple of years.

## GET OVER YOUR SPEED-ANGST

Running in an up-to-date browsers your SPA doesn't need all the vanity junk. Just use a server that doesn't crack on HTML/2 push and gzipped response compression.

Real quickility comes with not doing stuff. And thats what `insig` does: not doing stuff. If you want wing chair comfort and a nurse giving you a hand, don't use `insig`. If you know your JavaScript, get cracking.

## FRIENDLY TO CARBONS OUT OF THE BOX

`insig` is hertz-saving for computers. So somewhere someone doesn't need to burn fatty non-renewables. But keep in mind: what you do is up to you: Run your stuff on a Windows-11-VM through 5 VPNs and 6 SSH-tunnels if you like to roll like a coaler.

# Docs

`insig` happened while writing an SPA in vanilla JavaScript in a reactive, event-driven design by factoring out the accidental complexity.

## Component Example

```js
import { Comp, Fragment, Let, Const } from './insig/comp.js';
import Router from './insig/router.js';
import Feeding from '<path-to-project-comps>/feeding.js';
import AddFeeding from '<path-to-project-comps>/add-feeding.js';
import {formatDate} from '<path-to-project-comps>/formatting.js';
import EventHub from './insig/event-hub.js';
import BusyModal from '<path-to-project-comps>/busy-modal.js';
import ErrorModal from '<path-to-project-comps>/error-modal.js';

const SECTION = {
    FEEDING: 1,
    ADD_FEEDING: 2,
    PET: 3,
    FOOD: 4
};

export default Comp('ft-app', {
    fragment: Fragment(() => /* html */`
        <main comp-ref="mainElem">
            <article class="container feeding" comp-ref="feedingSlot"></article>
            <article class="container add-feeding" comp-ref="addFeedingSlot"></article>
            <article class="container pet" comp-ref="petSlot">
                <section class="animal-header pt-5 pb-4">
                    <h1 class="title" lcz-prop="PET">PET</h1>
                </section>
            </article>
            <article class="container food" comp-ref="foodSlot">
                <section class="fodder-header pt-5 pb-4">
                    <h1 class="title" lcz-prop="FOOD">FOOD</h1>
                </section>
            </article>
            <article comp-ref="busyModalSlot"></article>
            <article comp-ref="errorModalSlot"></article>
        </main>
    `, (self) => {
        self.router.dispatch();
        window.hub = EventHub({
            showIsBusy: isBusy => {
                self.busyModalComp.show(isBusy);
            },
            showErrorModal: config => {
                self.busyModalComp.forceHide();
                self.errorModalComp.show(config);
            },
        });
    }),

    router: Const((self) => {
        const router = Router();
        router.on('', () => {
            router.go('feeding', 'today');
        });
        router.on('feeding', (day, length) => {
            if (!day) {
                router.go('feeding', 'today');
                return;
            }
            day = day === 'today' ? new Date() : new Date(day);
            length = length || 1;
            self.section = {
                kind: SECTION.FEEDING,
                day, 
                length,
            };
        });
        router.on('add-feeding', (day, stepStr) => {
            if (!day) {
                router.go('add-feeding', 'today');
                return;
            }
            if (!stepStr) {
                router.go('add-feeding', day, 'step-1');
                return;
            }
            day = day === 'today' ? new Date() : new Date(day);
            const step = Number.parseInt(stepStr.match(/\d/)[0]);
            self.section = {
                kind: SECTION.ADD_FEEDING,
                day,
                step,
            };
        });
        router.on('pet', (id) => {
            self.section = {
                kind: SECTION.PET,
                id,
            };
        });
        router.on('food', (id) => {
            self.section = {
                kind: SECTION.FOOD,
                id,
            };
        });
        return router;
    }),

    section: Let(() => ({kind: ''})),

    activateSectionSlot: (self, kind) => {
        self.feedingSlot.style.display    = kind === SECTION.FEEDING     ? 'block' : 'none';
        self.addFeedingSlot.style.display = kind === SECTION.ADD_FEEDING ? 'block' : 'none';
        self.petSlot.style.display        = kind === SECTION.PET         ? 'block' : 'none';
        self.foodSlot.style.display       = kind === SECTION.FOOD        ? 'block' : 'none';
    },

    feedingsComp: Const(() => {
        const f = Feeding();
        f.onDateChange = newDate => {
            Router().go('feeding', formatDate.forURL(newDate));
        };
        return f;
    }),

    addFeedingComp: Const((self) => {
        const af = AddFeeding();
        af.onPrevious = prevStepIdx => {
            const index = self.router.path.length - 1;
            self.router.set(index, `step-${prevStepIdx + 1}`);
        };
        af.onNext = nextStepIdx => {
            const index = self.router.path.length - 1;
            self.router.set(index, `step-${nextStepIdx + 1}`);
        };
        return af;
    }),

    busyModalComp: Const((self) => {
        const bm = BusyModal();
        self.busyModalSlot.append(...bm.fragment);
        return bm;
    }),
    errorModalComp: Const((self) => {
        const em = ErrorModal();
        self.errorModalSlot.append(...em.fragment);
        return em;
    }),

    ON: {
        section: (self, section) => {
            self.activateSectionSlot(section.kind);
            switch (section.kind) {
                case SECTION.FEEDING:
                    self.feedingsComp.date = section.day;
                    if (!self.feedingSlot.children.length) {
                        self.feedingSlot.append(...self.feedingsComp.fragment);
                    }
                    break;
                case SECTION.ADD_FEEDING:
                    if (!self.addFeedingSlot.children.length) {
                        self.addFeedingSlot.append(...self.addFeedingComp.fragment);
                    }
                    self.addFeedingComp.stepIndex = section.step - 1;
                    break;
            }
        }
    }
});
```

- An `insig` component is defined by using the 4 init functions: `Comp`, `Fragment`, `Const`, `Let`. All except `Comp` take an init-function which is lazily evaluated. 
- Every comp has one fragment property. It's init function returns a string containing HTML; one or an array of `Element` (`document.createElement(...)`) respectively. 
- Use JavaScrip's string template literals as a template engine. The returned HTMl doesn't need to have one root element. 
- Use `Comp` with 2 args to create and register a web-component. Use it with one to create function-components. 
- The `new` keyword is redundant in JavaScript and not used within `insig`.
- Use `Const(...)` to define constants and `Let(...)` to define variables. - Variables are always reactive and change-events are dispatched to the `ON: {...}` section of a comp. Every change-handler has the same name as the variable it reacts upon.

## Comps as state machines

### How to program with `insig`

An `insig` comp is a state machine. Programming is done via variable changes over time. I.e. setting one variable through user-input, reacting to the change via a handler in `ON: {...}`, setting another variable and reacting to the change, and so on. If you need to have your comp in a busy-state while async operations / server round-trips are performed, express it via a variable and it's change over time.

## `self` instead of `this`

The first argument in every function and init-functions in a comp is always `self`, the reference to the component instance. `this` cannot be used due to `insig` preferring arrow functions.

## Attrib- and prop-binding

The HTML returned by `Fragment` is augmented with the attribute and property bindings `comp-ref`, `comp-attr`, `comp-prop`, `comp-on`, `lcz-attr`, `lcz-prop`.

### comp-ref

A const reference to the actual DOM element. Mainly used as slots for modifying child-elements by appending other `insig` comp fragments, i.e.:

```js
// ...
self.feedingSlot.append(...self.feedingsComp.fragment);
// ...
```
The attribute value is the name of the reference on self.

### comp-attr

Bind comp-variables (`Let`) to the attribute of the actual DOM element. String templates are supported. See example below.

### comp-prop

Bind comp-variables (`Let`) to the property of the actual DOM element. String templates are supported. See example below.

### comp-on

Bind comp-functions to an event of the actual DOM element. String templates are NOT supported. Function name must be provided without braces. See example below.

### Event- and variable-chang-handlers

Handler-functions are defined in the `ON` object. They take 3 arguments in this order: `self`, `newValue`, `oldValue`. Setting other variables in an event handler is encouraged, as this is how you control the state machine that is an `insig` comp.

### Binding-syntax

Binding-syntax for `comp-prop` and `comp-attr` is the same, so all the following examples work for both:

`<attrib-or-prop-name>=<variable-name-or-string-template>`

Multiple binding must be separated by one space character as in `min=minValue max=maxValue value=_rangeValue`.

**<attrib-or-prop-name>**

The name of the HTML element attribute or property to bind to.

**<variable-name-or-string-template>**

The name of the variable defined on `self` to bind to. Or a template string in which variable names defined on `self` are surrounded by double curly braces as in `id=foodAmountValue_{{id}}`. Space characters must be escaped as in `class=nav-link\\ {{petActive}}`.

#### Example

```html
<label comp-attr="for=foodAmountValue_{{id}}" 
    class="form-label lead"
    comp-prop="label">No food label</label>
<div class="btn-group mb-3" role="group">
    <div class="input-group mb-2">
        <input type="text" 
            comp-attr="id=foodAmountValue_{{id}}"
            class="form-control" 
            aria-label="AMOUNT FOOD" 
            comp-prop="value=_inputValue"
            comp-on="input=onInputInput">
        <span class="input-group-text"
            comp-prop="unit">No value unit</span>
    </div>
</div>

<input type="range" 
    class="form-range" 
    comp-attr="id=foodAmountRange_{{id}}"
    comp-prop="min=minValue max=maxValue value=_rangeValue"
    comp-on="input=onRangeChange">
```

## Localization/i18n bindings

`lcz-prop` and `lcz-attr` are used to bind to localization keys from the translations file. Syntax is:

`[<attrib-or-prop-name>=]<LOCALIZATION_KEY>`

**<attrib-or-prop-name>**

The name of the prop or attrib to set the localization on. Can be omitted, defaults to `textContent`.

**<LOCALIZATION_KEY>**

The localization key to use to retrieve the value from the translations file. Fallback is value of `<attrib-or-prop-name>` if not found, default value `textContent` included.

## Localization/i18n setup

`insig` must rely on script loading order to make translations available ASAP during page-loading. Translations file and LCZ-module must be setup as follows:

```html
<!doctype html>
<html lang="en">

<head>
    <script src="/translations.js"></script> <!-- TRANSLATIONS FILE IS FIRST JS-FILE LOADED -->
    <!-- OTHER SCRIPT AFTERWARDS ... -->
</head>

<body>
    <!-- CONTENT COMES HERE -->
    <script src="/insig/lcz.js" type="module"></script> <!-- LCZ MODULE LOADED DIRECTLY AFTER CONTENT -->
</body>

</html>
```

The translations file must set a JS object onto the property `localizations` of the window object.

```js
window.localizations = {
    de: {
        DOGS: 'Hunde',
        CATS: 'Katzen',
        DOG: 'Hund',
        CAT: 'Katze',
        DONE: 'Fertig'
    }
};
```

Each language is provided via a locale key, i.e. `de` for german or `"de-CH"` for swiss german.