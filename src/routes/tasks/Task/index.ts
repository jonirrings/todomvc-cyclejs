import intent from './intent';
import model from './model';
import view from './view';

import { TaskState } from './interfaces';
import { Sources, Sinks } from '../../../interfaces';

// THE TASK ITEM FUNCTION
// This is a simple task item component,
// structured with the MVI-pattern.
export function Task({ DOM, state }: Sources<TaskState>): Sinks<TaskState> {
    const action$ = intent(DOM);
    const reducer$ = model(action$);
    const vtree$ = view(state.stream);

    return {
        DOM: vtree$,
        state: reducer$
    };
}

export default Task;
