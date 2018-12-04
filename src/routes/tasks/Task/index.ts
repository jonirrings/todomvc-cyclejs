import intent from './intent';
import model from './model';
import view from './view';

import { TaskState } from './interfaces';
import { Sources, Sinks } from '../../../interfaces';

export function Task({ DOM, state }: Sources<TaskState>): Sinks<TaskState> {
    const action$ = intent(DOM);
    const reducer$ = model(action$);
    const vdom$ = view(state.stream);

    return {
        DOM: vdom$,
        state: reducer$
    };
}

export default Task;
