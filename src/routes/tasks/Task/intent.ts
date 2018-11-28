import xs, { Stream } from 'xstream';
import {
    checkBoxExtractor,
    ENTER_KEY,
    ESC_KEY,
    textBoxExtractor
} from '../utils';

import { Action } from './interfaces';
import { DOMSource } from '@cycle/dom';

// THE TASK ITEM INTENT
// This intent function returns a stream of all the different,
// actions that can be taken on a task.

function intent(DOM: DOMSource): Stream<Action> {
    // THE INTENT MERGE
    // Merge all actions into one stream.
    return xs.merge(
        // THE DESTROY ACTION STREAM
        DOM.select('.destroy')
            .events('click')
            .mapTo({ type: 'destroy' }),

        // THE TOGGLE ACTION STREAM
        DOM.select('.toggle')
            .events('change')
            .map(checkBoxExtractor)
            .map(payload => ({ type: 'toggle', payload })),

        // THE START EDIT ACTION STREAM
        DOM.select('label')
            .events('dblclick')
            .mapTo({ type: 'startEdit' }),

        // THE ESC KEY ACTION STREAM
        DOM.select('.edit')
            .events('keyup')
            .filter(ev => ev.keyCode === ESC_KEY)
            .mapTo({ type: 'cancelEdit' }),

        // THE ENTER KEY ACTION STREAM
        DOM.select('.edit')
            .events('keyup')
            .filter(ev => ev.keyCode === ENTER_KEY)
            .compose(s => xs.merge(s, DOM.select('.edit').events('blur')))
            .map(ev => ({ title: textBoxExtractor(ev), type: 'doneEdit' }))
    );
}

export default intent;
