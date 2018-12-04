import xs, { Stream } from 'xstream';
import { Action, TaskState } from '../Task/interfaces';
import { State } from './interfaces';
import { Reducer } from '@cycle/state';
import { id } from '../utils';

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
    const cancelInputAction$ = action$.filter(a => a.type === 'clearInput');
    const insertTodoAction$ = action$.filter(a => a.type === 'insertTodo');
    const updateInputAction$ = action$.filter(a => a.type === 'updateInput');
    const init$ = xs.of<Reducer<State>>(prevState =>
        prevState ? prevState : defaultState
    );

    const updateInputValueReducer$ = updateInputAction$.map(
        a =>
            function updateInputValue(prevState: State): State {
                return { ...prevState, inputValue: a.payload };
            }
    );

    const clearInputReducer$ = xs
        .merge(cancelInputAction$, insertTodoAction$)
        .mapTo(function clearInputReducer(prevState: State): State {
            return { ...prevState, inputValue: '' };
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
    const insertTodoReducer$ = insertTodoAction$.map(
        a =>
            function insertTodoReducer(prevState: State): State {
                const newTodo = {
                    key: id(),
                    title: a.payload,
                    completed: false,
                    editing: false
                };
                return {
                    ...prevState,
                    list: prevState.list.concat(newTodo)
                };
            }
    );
    return xs.merge(
        init$,
        clearInputReducer$,
        updateInputValueReducer$,
        changeRouteReducer$,
        insertTodoReducer$
    );
}

export default model;
