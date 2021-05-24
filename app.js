import { Comp, Fragment, Let, Const } from './insig/comp.js';
import Router from './insig/router.js';
import Feeding from '<path-to-project-comps>/feeding.js';
import AddFeeding from '<path-to-project-comps>//add-feeding.js';
import {formatDate} from '<path-to-project-comps>//formatting.js';
import EventHub from './insig/event-hub.js';
import BusyModal from '<path-to-project-comps>//busy-modal.js';
import ErrorModal from '<path-to-project-comps>//error-modal.js';

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