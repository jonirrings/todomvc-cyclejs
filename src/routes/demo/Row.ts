import { Sinks, Sources } from '../../interfaces';
import { Stream } from 'xstream';
import { li, VNode } from '@cycle/dom';

export interface State {
    text: string;
    key: string;
}

export function Row({ state }: Sources<State>): Sinks<State> {
    return {
        DOM: view(state.stream)
    };
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(({ text, key }) =>
        li({ className: '.row', dataset: { key } }, text)
    );
}
