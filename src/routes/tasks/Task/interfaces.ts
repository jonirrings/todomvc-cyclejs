export interface TaskState {
    key: string;
    title: string;
    completed: boolean;
    editing?: boolean;
    destroyed?: boolean;
}

export interface Action {
    type: string;
    payload?: any;
}
