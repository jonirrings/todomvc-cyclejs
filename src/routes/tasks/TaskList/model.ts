import xs, { Stream } from 'xstream';
import { Action, State as TaskState } from '../Task/interfaces';
import { State } from './interfaces';
import { Reducer } from '@cycle/state';

// A helper function that provides filter functions
// depending on the route value.
function getFilterFn(route: string): (task: TaskState) => boolean {
    switch (route) {
        case '/active':
            return (task: TaskState) => task.completed === false;
        case '/completed':
            return (task: TaskState) => task.completed === true;
        default:
            return () => true; // allow anything
    }
}

// MAKE REDUCER STREAM
// A function that takes the actions on the task list
// and returns a stream of "reducers": functions that expect the current
// todosData (the state) and return a new version of todosData.
// THIS IS THE MODEL FUNCTION
// It expects the actions coming in from the sources
function model(
    action$: Stream<Action>,
    sourceTodosData$: Stream<State>
): Stream<Reducer<State>> {
    // THE BUSINESS LOGIC
    // Actions are passed to the `makeReducer$` function
    // which creates a stream of reducer functions that needs
    // to be applied on the todoData when an action happens.
    const init$ = sourceTodosData$.map(
        sourceTodosData =>
            function(prevState: State): State {
                return prevState === undefined ? sourceTodosData : prevState;
            }
    );
    const clearInputReducer$ = action$
        .filter(a => a.type === 'clearInput')
        .mapTo(function clearInputReducer(todosData: State): State {
            return todosData;
        });

    const changeRouteReducer$ = action$
        .filter(a => a.type === 'changeRoute')
        .map(a => a.payload)
        .startWith('/')
        .map(path => {
            const filterFn = getFilterFn(path);
            return function changeRouteReducer(todosData: State): State {
                todosData.filter = path.replace('/', '').trim();
                todosData.filterFn = filterFn;
                return todosData;
            };
        });

    return xs.merge(init$, clearInputReducer$, changeRouteReducer$);
}

export default model;
