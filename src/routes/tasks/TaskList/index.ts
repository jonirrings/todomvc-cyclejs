import xs, { Stream } from 'xstream';
import intent from './intent';
import model from './model';
import view from './view';
import { State } from './interfaces';
import { TaskState } from '../Task/interfaces';
import { Reducer, Sinks, Sources } from '../../../interfaces';
import isolate from '@cycle/isolate';
import { List } from './List';

export const listLens = {
    get: (state: State) => {
        return state.list.filter(state.filterFn);
    },

    set: (state: State, nextFilteredList: TaskState[]) => {
        const prevFilteredList = state.list.filter(state.filterFn);
        const newList = state.list
            .map(task => nextFilteredList.find(t => t.key === task.key) || task)
            .filter(
                task =>
                    prevFilteredList.some(
                        t => t.key === task.key && !task.destroyed
                    ) &&
                    nextFilteredList.some(
                        t => t.key === task.key && !task.destroyed
                    )
            );
        return {
            ...state,
            list: newList
        };
    }
};

export function TaskList(sources: Sources<State>): Sinks<State> {
    const state$ = sources.state.stream;
    const storage$ = sources.storage;
    const action$ = intent(sources.DOM);
    const parentReducer$ = model(action$, storage$);

    const listSinks = isolate(List, { state: listLens })(sources);
    const listVDom$ = listSinks.DOM;
    const listReducer$ = listSinks.state as Stream<Reducer<State>>;

    const vdom$ = view(state$, listVDom$);
    const reducer$ = xs.merge(parentReducer$, listReducer$);

    return {
        DOM: vdom$,
        state: reducer$,
        storage: state$.map(preState => ({
            key: 'todos',
            value: JSON.stringify(preState)
        }))
    };
}
