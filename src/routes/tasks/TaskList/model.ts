import xs, { Stream } from 'xstream';
import { Action, TaskState } from '../Task/interfaces';
import { State } from './interfaces';
import { Reducer } from '@cycle/state';
import { id } from '../utils';
import { DOMIntent } from './intent';
import { ResponseCollection } from '@cycle/storage';

const defaultState: State = {
    inputValue: '',
    list: [],
    filter: '',
    filterFn: () => true
};

function getFilterFn(route: string): (task: TaskState) => boolean {
    switch (route) {
        case 'active':
            return (task: TaskState) => task.completed === false;
        case 'completed':
            return (task: TaskState) => task.completed === true;
        default:
            return () => true; // allow anything
    }
}

function model(
    {
        changeRoute$,
        updateAction$,
        cancelAction$,
        insertAction$,
        toggleAction$,
        deleteAction$
    }: DOMIntent,
    storage$: ResponseCollection
): Stream<Reducer<State>> {
    const init$ = storage$.local
        .getItem('todos')
        .map((todos: string) => (prevState: State) => {
            if (prevState) {
                return prevState;
            }
            if (todos) {
                return Object.assign(defaultState, JSON.parse(todos)) as State;
            }
            return defaultState;
        });

    const updateInputValueReducer$ = updateAction$.map(
        a =>
            function updateInputValue(prevState: State): State {
                return { ...prevState, inputValue: a.payload };
            }
    );

    const clearInputReducer$ = xs
        .merge(cancelAction$, insertAction$)
        .mapTo(function clearInputReducer(prevState: State): State {
            return { ...prevState, inputValue: '' };
        });

    const changeRouteReducer$ = changeRoute$
        .map(a => a.payload)
        .debug()
        .map((path: string) => {
            const filterFn = getFilterFn(path);
            return function changeRouteReducer(todosData: State): State {
                const p = path.replace(/\/tasks\/?/g, '').trim();
                console.log(p);
                todosData.filter = p;
                todosData.filterFn = filterFn;
                return todosData;
            };
        });
    const insertTodoReducer$ = insertAction$.map(
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
    const toggleAllReducer$ = toggleAction$.map(
        a =>
            function toggleAllReducer(prevState: State): State {
                return {
                    ...prevState,
                    list: prevState.list.map(s => ({
                        ...s,
                        completed: a.payload
                    }))
                };
            }
    );
    const deleteCompletedReducer$ = deleteAction$.map(
        a =>
            function deleteCompeletedReducer(prevState: State): State {
                return {
                    ...prevState,
                    list: prevState.list.filter(s => !s.completed)
                };
            }
    );
    return xs.merge(
        init$,
        clearInputReducer$,
        updateInputValueReducer$,
        changeRouteReducer$,
        insertTodoReducer$,
        toggleAllReducer$,
        deleteCompletedReducer$
    );
}

export default model;
