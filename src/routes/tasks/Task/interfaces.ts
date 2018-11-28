import { Stream } from 'xstream';
import { Sinks, Sources } from '../../../interfaces';

export interface State {
    key: string;
    title: string;
    completed: boolean;
    editing?: boolean;
}

export interface Action {
    type: string;
    payload?: any;
}

export interface TaskSource<S> extends Sources<S> {
    action: Stream<Action>;
}

export interface TaskSinks<S> extends Sinks<S> {
    action: Stream<any>;
}
