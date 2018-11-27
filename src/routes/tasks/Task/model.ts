import xs, { Stream } from 'xstream';
import { Action, State } from './interfaces';
import { Reducer } from '@cycle/state';
import { id } from '../utils';

function blankTask(): State {
    return { key: id(), title: '', completed: false };
}

function model(action$: Stream<Action>): Stream<Reducer<State>> {
    const init$ = xs.of<Reducer<State>>(prevState =>
        prevState === undefined ? blankTask() : prevState
    );

    const startEditReducer$ = action$
        .filter(action => action.type === 'startEdit')
        .mapTo(function startEditReducer(data: State): State {
            return {
                ...data,
                editing: true
            };
        });

    const doneEditReducer$ = action$
        .filter(action => action.type === 'doneEdit')
        .map(
            action =>
                function doneEditReducer(data: State): State {
                    return {
                        ...data,
                        title: action.payload,
                        editing: false
                    };
                }
        );

    const cancelEditReducer$ = action$
        .filter(action => action.type === 'cancelEdit')
        .mapTo(function cancelEditReducer(data: State): State {
            return {
                ...data,
                editing: false
            };
        });

    const toggleReducer$ = action$
        .filter(action => action.type === 'toggle')
        .map(
            action =>
                function toggleReducer(data: State): State {
                    return {
                        ...data,
                        completed: action.payload
                    };
                }
        );

    return xs.merge(
        init$,
        startEditReducer$,
        doneEditReducer$,
        cancelEditReducer$,
        toggleReducer$
    );
}

export default model;
