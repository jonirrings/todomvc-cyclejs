import xs, { Stream } from 'xstream';
import { Action, TaskState } from './interfaces';
import { Reducer } from '@cycle/state';
import { id } from '../utils';
import { DOMIntent } from './intent';

function blankTask(): TaskState {
    return { key: id(), title: '', completed: false };
}

function model({
    destroyAction$,
    toggleAction$,
    startEditAction$,
    cancelEditAction$,
    doneEditAction$
}: DOMIntent): Stream<Reducer<TaskState>> {
    const init$ = xs.of<Reducer<TaskState>>(prevState =>
        prevState === undefined ? blankTask() : prevState
    );

    const startEditReducer$ = startEditAction$.mapTo(function startEditReducer(
        data: TaskState
    ): TaskState {
        return {
            ...data,
            editing: true
        };
    });

    const doneEditReducer$ = doneEditAction$.map(
        action =>
            function doneEditReducer(data: TaskState): TaskState {
                return {
                    ...data,
                    title: action.payload,
                    editing: false
                };
            }
    );

    const cancelEditReducer$ = cancelEditAction$.mapTo(
        function cancelEditReducer(data: TaskState): TaskState {
            return {
                ...data,
                editing: false
            };
        }
    );

    const toggleReducer$ = toggleAction$.map(
        action =>
            function toggleReducer(data: TaskState): TaskState {
                return {
                    ...data,
                    completed: action.payload
                };
            }
    );
    const destroyReducer$ = destroyAction$.mapTo(function destroyReducer(
        data: TaskState
    ): TaskState {
        return {
            ...data,
            destroyed: true
        };
    });
    return xs.merge(
        init$,
        startEditReducer$,
        doneEditReducer$,
        cancelEditReducer$,
        toggleReducer$
    );
}

export default model;
