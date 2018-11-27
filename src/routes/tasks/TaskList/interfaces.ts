import { State as TaskState } from '../Task/interfaces';

export interface State {
    list: [TaskState];
    filter: string;
    filterFn: (t: TaskState) => boolean;
}

export interface Action {
    type: string;
    payload?: any;
}
