import xs, { Stream } from 'xstream';
import {
    checkBoxExtractor,
    ENTER_KEY,
    ESC_KEY,
    textBoxExtractor
} from '../utils';

import { Action } from './interfaces';
import { DOMSource } from '@cycle/dom';

function intent(DOM: DOMSource): Stream<Action> {
    return xs.merge(
        DOM.select('.destroy')
            .events('click')
            .mapTo({ type: 'destroy' }),

        DOM.select('.toggle')
            .events('change')
            .map(checkBoxExtractor)
            .map(payload => ({ type: 'toggle', payload })),

        DOM.select('label')
            .events('dblclick')
            .mapTo({ type: 'startEdit' }),

        DOM.select('.edit')
            .events('keyup')
            .filter(ev => ev.keyCode === ESC_KEY)
            .mapTo({ type: 'cancelEdit' }),

        DOM.select('.edit')
            .events('keyup')
            .filter(ev => ev.keyCode === ENTER_KEY)
            .compose(s => xs.merge(s, DOM.select('.edit').events('blur')))
            .map(ev => ({ title: textBoxExtractor(ev), type: 'doneEdit' }))
    );
}

export default intent;
