import xs from 'xstream';
import { makeCollection } from '@cycle/state';
import intent from './intent';
import model from './model';
import view from './view';
import deserialize from './storage-source';
import serialize from './storage-sink';
import Task from '../Task';

import { Sources, Sinks } from '../../../interfaces';
import { TaskSinks, State as TaskState } from '../Task/interfaces';
import { State } from './interfaces';

export { State } from './interfaces';
// THE TASKLIST COMPONENT
// This is the TaskList component which is being exported below.
export function TaskList(sources: Sources<State>): Sinks<State> {
    // THE LOCALSTORAGE STREAM
    // Here we create a localStorage stream that only streams
    // the first value read from localStorage in order to
    // supply the application with initial state.
    const localStorage$ = sources.storage.local.getItem('todos-cycle').take(1);
    // THE INITIAL TASK DATA
    // The `deserialize` function takes the serialized JSON stored in localStorage
    // and turns it into a stream sending a JSON object.
    const sourceTodosData$ = deserialize(localStorage$);
    // THE INTENT (MVI PATTERN)
    // Pass relevant sources to the intent function, which set up
    // streams that model the users actions.
    const action$ = intent(sources.DOM, sources.router);
    // THE MODEL (MVI PATTERN)
    // Actions get passed to the model function which transforms the data
    // coming through and prepares the data for the view.
    const state$ = model(action$, sourceTodosData$);
    // THE ITEM ADDITION STREAM
    // Emits objects of sources specific to each item.
    // Merges stored items with new items
    const add$ = xs.merge(
        sourceTodosData$.map(data =>
            data.list.map(props => ({ props$: xs.of(props) }))
        ),
        action$
            .filter(action => action.type === 'insertTodo')
            .map(action => ({
                props$: xs.of({
                    title: action.payload,
                    completed: false
                })
            }))
    );
    // THE ITEM REMOVAL SELECTOR FUNCTION
    // This function takes item's sinks and returns a stream representing
    // its removal. Merges internal removals and `deleteCompleteds` actions
    function removeSelector(itemSinks: TaskSinks<TaskState>) {
        const deleteCompleteds$ = action$.filter(
            action => action.type === 'deleteCompleteds'
        );
        return xs.merge(
            // Consider deleteCompleteds$ only if the task is completed.
            // analogue of rx pausable
            itemSinks.state
                .map(state => deleteCompleteds$.filter(() => state.completed))
                .flatten(),
            itemSinks.action.filter(action => action.type === 'destroy')
        );
    }
    // THE COLLECTION STREAM
    // Collection function takes a component function, a common sources object,
    // a stream of item additions, and a selector function from item sinks to
    // a stream of removals
    const list$ = Collection(
        Task,
        {
            DOM: sources.DOM,
            action$: action$.filter(action => action.type === 'toggleAll')
        },
        add$,
        removeSelector
    );
    // THE COMBINED CHILDREN VTREE AND STATE STREAMS
    const todoVtrees$ = Collection.pluck(list$, itemSinks => itemSinks.DOM);
    const todoStates$ = Collection.pluck(list$, itemSinks => itemSinks.state$);

    const amendedState$ = xs
        .combine(state$, todoVtrees$, todoStates$)
        .map(([parentState, todoVtrees, todoStates]) => ({
            ...parentState,
            list: todoStates.map((state, i) => ({
                ...state,
                todoItem: { DOM: todoVtrees[i] }
            }))
        }));
    // THE VIEW (MVI PATTERN)
    // We render state as markup for the DOM.
    const vdom$ = view(amendedState$);
    // WRITE TO LOCALSTORAGE
    // The latest state is written to localStorage.
    const storage$ = serialize(todoStates$).map(state => ({
        key: 'todos-cycle',
        value: state
    }));
    // COMPLETE THE CYCLE
    // Write the virtual dom stream to the DOM and write the
    // storage stream to localStorage.
    const sinks = {
        DOM: vdom$,
        storage: storage$
    };
    return sinks;
}

export default TaskList;
