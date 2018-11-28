import { State as TaskState } from '../Task/interfaces';
import { Sinks, Sources } from '../../../interfaces';
import { Stream } from 'xstream';

export interface State {
    list: TaskState[];
    filter: string;
    filterFn: (t: TaskState) => boolean;
}

export interface Action {
    type: string;
    payload?: any;
}

export interface TasksSource<S> extends Sources<S> {
    action: Stream<Action>;
}

export interface TasksSinks<S> extends Sinks<S> {
    action: Stream<any>;
}
