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
export default function intent(DOM: DOMSource): Stream<Action> {
    const anchorAction$ = DOM.select('a')
        .events('click')
        .map(event => anchorExtractor(event).replace('#', ''))
        .map(payload => ({ type: 'url', payload }));
    const clearAction$ = DOM.select('.new-todo')
        .events('keydown')
        .filter(ev => ev.keyCode === ESC_KEY)
        .map(payload => ({ type: 'clearInput', payload }));
    const insertAction$ = DOM.select('.new-todo')
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
    return xs.merge(
        anchorAction$,
        clearAction$,
        insertAction$,
        toggleAction$,
        deleteAction$
    );
}
