import { Stream } from 'xstream';
import { DOMSource, VNode } from '@cycle/dom';
import { StateSource, Reducer } from '@cycle/state';
import { RouterSource, HistoryAction } from 'cyclic-router';
import { ResponseCollection } from '@cycle/storage';

export { Reducer } from '@cycle/state';

export type Component<State> = (s: Sources<State>) => Sinks<State>;

export interface Sources<State> {
    DOM: DOMSource;
    router: RouterSource;
    state: StateSource<State>;
    storage: ResponseCollection;
}

export interface Sinks<State> {
    DOM?: Stream<VNode>;
    router?: Stream<HistoryAction>;
    speech?: Stream<string>;
    storage?: Stream<any>;
    state?: Stream<Reducer<State>>;
}
