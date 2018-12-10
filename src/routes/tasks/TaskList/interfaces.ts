import { TaskState } from '../Task/interfaces';
import { Sinks, Sources } from '../../../interfaces';
import { Stream } from 'xstream';

export interface State {
    inputValue: string;
    list: TaskState[];
    filter: string;
    filterFn: (t: TaskState) => boolean;
}

export interface Action {
    type: string;
    payload?: any;
}
