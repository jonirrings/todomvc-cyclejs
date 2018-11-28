import xs, { Stream } from 'xstream';
import intent from './intent';
import model from './model';
import view from './view';
import Task from '../Task';

import { TaskSinks, State as TaskState } from '../Task/interfaces';
import { State, TasksSinks, TasksSource } from './interfaces';
import { makeCollection, Reducer } from '@cycle/state';

export { State } from './interfaces';
// THE TASKLIST COMPONENT
// This is the TaskList component which is being exported below.
export function TaskList(sources: TasksSource<State>): TasksSinks<State> {
    const Tasks = makeCollection({
        item: Task,
        itemKey: (childState: TaskState, index) => childState.key,
        itemScope: key => key,
        collectSinks: instances => {
            return {
                state: instances.pickMerge('state'),
                action: instances.pickMerge('action')
            };
        }
    });
    const tasksSinks = Tasks(sources);
    const action$ = intent(sources.DOM);
    const tasksReducer$ = model(sources.action);
    const reducer$ = xs.merge(
        tasksSinks.state as Stream<Reducer<State>>,
        tasksReducer$
    );
    const vtree$ = view(sources.state.stream);
    return {
        DOM: vtree$,
        action: action$,
        state: reducer$
    };
}

export default TaskList;
