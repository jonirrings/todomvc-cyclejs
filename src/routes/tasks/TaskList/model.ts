import xs, { Stream } from 'xstream';
import { Action, TaskState } from '../Task/interfaces';
import { State } from './interfaces';
import { Reducer } from '@cycle/state';
import { id } from '../utils';
import { DOMIntent } from './intent';

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

function model({
    anchorAction$,
    updateAction$,
    cancelAction$,
    insertAction$,
    toggleAction$,
    deleteAction$
}: DOMIntent): Stream<Reducer<State>> {
    const init$ = xs.of<Reducer<State>>(prevState =>
        prevState ? prevState : defaultState
    );

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

    const changeRouteReducer$ = anchorAction$
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
