import xs, { Stream } from 'xstream';
import {
    anchorExtractor,
    textBoxExtractor,
    checkBoxExtractor,
    ENTER_KEY,
    ESC_KEY
} from '../utils';
import { DOMSource } from '@cycle/dom';
import { Action } from './interfaces';

// THE INTENT FOR THE LIST
export interface DOMIntent {
    anchorAction$: Stream<Action>;
    updateAction$: Stream<Action>;
    cancelAction$: Stream<Action>;
    insertAction$: Stream<Action>;
    toggleAction$: Stream<Action>;
    deleteAction$: Stream<Action>;
}

export default function intent(DOM: DOMSource): DOMIntent {
    const newTodoDom = DOM.select('.new-todo');

    const anchorAction$ = DOM.select('a')
        .events('click')
        .map(event => anchorExtractor(event).replace('#', ''))
        .map(payload => ({ type: 'url', payload }));
    const updateAction$ = newTodoDom
        .events('input')
        .map(ev => textBoxExtractor(ev))
        .map((payload: string) => ({ type: 'updateInput', payload }));
    const cancelAction$ = newTodoDom
        .events('keydown')
        .filter(ev => ev.keyCode === ESC_KEY)
        .map(payload => ({ type: 'cancelInput', payload }));
    const insertAction$ = newTodoDom
        .events('keydown')
        .filter(ev => {
            const trimmedVal = String(textBoxExtractor(ev)).trim();
            return ev.keyCode === ENTER_KEY && Boolean(trimmedVal);
        })
        .map(ev => String(textBoxExtractor(ev).trim()))
        .map((payload: string) => ({ type: 'insertTodo', payload }));
    const toggleAction$ = DOM.select('.toggle-all')
        .events('click')
        .map(ev => checkBoxExtractor(ev))
        .map(payload => ({ type: 'toggleAll', payload }));
    const deleteAction$ = DOM.select('.clear-completed')
        .events('click')
        .mapTo({ type: 'deleteCompleteds' });
    return {
        anchorAction$,
        updateAction$,
        cancelAction$,
        insertAction$,
        toggleAction$,
        deleteAction$
    };
}
