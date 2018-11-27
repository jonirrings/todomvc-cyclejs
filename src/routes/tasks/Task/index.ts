import intent from './intent';
import model from './model';
import view from './view';

import { State, TaskSinks, TaskSource } from './interfaces';

// THE TASK ITEM FUNCTION
// This is a simple task item component,
// structured with the MVI-pattern.
function Task({ DOM, state, action }: TaskSource<State>): TaskSinks<State> {
    const action$ = intent(DOM, action);
    const state$ = model(action$);
    const vtree$ = view(state.stream);

    return {
        DOM: vtree$,
        action: action$,
        state: state$
    };
}

export default Task;
