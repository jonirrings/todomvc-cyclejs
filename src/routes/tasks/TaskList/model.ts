import xs, { Stream } from 'xstream';
import { Action, TaskState } from '../Task/interfaces';
import { State } from './interfaces';
import { Reducer } from '@cycle/state';

const defaultState: State = {
    inputValue: '',
    list: [],
    filter: '',
    filterFn: () => true
};

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

function model(action$: Stream<Action>): Stream<Reducer<State>> {
    const init$ = xs.of<Reducer<State>>(prevState =>
        prevState ? defaultState : prevState
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
