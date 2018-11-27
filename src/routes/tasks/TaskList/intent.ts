import xs, { Stream } from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {
    anchorExtractor,
    textBoxExtractor,
    checkBoxExtractor,
    ENTER_KEY,
    ESC_KEY
} from '../utils';
import { DOMSource } from '@cycle/dom';
import { Action } from './interfaces';
import { GenericInput } from '@cycle/history';

// THE INTENT FOR THE LIST
export default function intent(
    DOM: DOMSource,
    router: Stream<GenericInput>
): Stream<Action> {
    // THE ROUTE STREAM
    // A stream that provides the path whenever the route changes.

    const routerAction$ = router
        .startWith({ type: 'push', pathname: '/tasks' })
        .map(location => location.pathname)
        .compose(dropRepeats())
        .map(payload => ({ type: 'changeRoute', payload }));
    // THE URL STREAM
    // A stream of URL clicks in the app
    const anchorAction$ = DOM.select('a')
        .events('click')
        .map(event => anchorExtractor(event).replace('#', ''))
        .map(payload => ({ type: 'url', payload }));

    // CLEAR INPUT STREAM
    // A stream of ESC key strokes in the `.new-task` field.
    const clearAction$ = DOM.select('.new-todo')
        .events('keydown')
        .filter(ev => ev.keyCode === ESC_KEY)
        .map(payload => ({ type: 'clearInput', payload }));
    // ENTER KEY STREAM
    // A stream of ENTER key strokes in the `.new-task` field.
    const insertAction$ = DOM.select('.new-todo')
        .events('keydown')
        // Trim value and only let the data through when there
        // is anything but whitespace in the field and the ENTER key was hit.
        .filter(ev => {
            const trimmedVal = String(textBoxExtractor(ev)).trim();
            return ev.keyCode === ENTER_KEY && Boolean(trimmedVal);
        })
        // Return the trimmed value.
        .map(ev => String(textBoxExtractor(ev).trim()))
        .map((payload: string) => ({ type: 'insertTodo', payload }));

    // TOGGLE ALL STREAM
    // Create a stream out of the clicks on the `.toggle-all` button.
    const toggleAction$ = DOM.select('.toggle-all')
        .events('click')
        .map(ev => checkBoxExtractor(ev))
        .map(payload => ({ type: 'toggleAll', payload }));

    // DELETE COMPLETED TODOS STREAM
    // A stream of click events on the `.clear-completed` element.
    const deleteAction$ = DOM.select('.clear-completed')
        .events('click')
        .mapTo({ type: 'deleteCompleteds' });
    return xs.merge(
        routerAction$,
        anchorAction$,
        clearAction$,
        insertAction$,
        toggleAction$,
        deleteAction$
    );
}
