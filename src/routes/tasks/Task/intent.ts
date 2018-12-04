import xs, { Stream } from 'xstream';
import {
    checkBoxExtractor,
    ENTER_KEY,
    ESC_KEY,
    textBoxExtractor
} from '../utils';

import { Action } from './interfaces';
import { DOMSource } from '@cycle/dom';

export interface DOMIntent {
    destroyAction$: Stream<Action>;
    toggleAction$: Stream<Action>;
    startEditAction$: Stream<Action>;
    cancelEditAction$: Stream<Action>;
    doneEditAction$: Stream<Action>;
}

function intent(DOM: DOMSource): DOMIntent {
    const destroyAction$ = DOM.select('.destroy')
        .events('click')
        .mapTo({ type: 'destroy' });

    const toggleAction$ = DOM.select('.toggle')
        .events('change')
        .map(checkBoxExtractor)
        .map(payload => ({ type: 'toggle', payload }));

    const startEditAction$ = DOM.select('label')
        .events('dblclick')
        .mapTo({ type: 'startEdit' });

    const cancelEditAction$ = DOM.select('.edit')
        .events('keyup')
        .filter(ev => ev.keyCode === ESC_KEY)
        .mapTo({ type: 'cancelEdit' });

    const doneEditAction$ = DOM.select('.edit')
        .events('keyup')
        .filter(ev => ev.keyCode === ENTER_KEY)
        .compose(s => xs.merge(s, DOM.select('.edit').events('blur')))
        .map(ev => ({ title: textBoxExtractor(ev), type: 'doneEdit' }));
    return {
        destroyAction$,
        toggleAction$,
        startEditAction$,
        cancelEditAction$,
        doneEditAction$
    };
}

export default intent;
