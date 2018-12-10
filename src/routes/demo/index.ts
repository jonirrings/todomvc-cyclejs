import { Reducer, Sinks, Sources } from '../../interfaces';
import xs, { Stream } from 'xstream';
import { VNode, DOMSource, textarea, div, button, span } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { List } from './List';
import { State as RowState } from './Row';
import { id, redirect } from '../tasks/utils';

export interface State {
    text: string;
    list: RowState[];
}

interface DOMIntent {
    updateText$: Stream<string>;
    createOne$: Stream<null>;
    link$: Stream<null>;
}

const defaultState: State = {
    text: 'hello cycle',
    list: []
};
const listLens = {
    get: (state: State) => state.list
};

export function Demo({ DOM, state }: Sources<State>): Sinks<State> {
    const { updateText$, createOne$, link$ }: DOMIntent = intent(DOM);
    const listSinks = isolate(List, { state: listLens })({ DOM, state });
    const listVDom$ = listSinks.DOM;
    return {
        DOM: view(state.stream, listVDom$),
        state: model(updateText$, createOne$),
        router: redirect(link$, '/tasks')
    };
}

function intent(DOM: DOMSource): DOMIntent {
    const updateText$ = DOM.select('#text')
        .events('input')
        .map((ev: any) => ev.target.value);
    const createOne$ = DOM.select('#create')
        .events('click')
        .mapTo(null);
    const link$ = DOM.select('#nav')
        .events('click')
        .mapTo(null);
    return {
        updateText$,
        createOne$,
        link$
    };
}

function view(state$: Stream<State>, listVDom$: Stream<VNode>): Stream<VNode> {
    return xs.combine(state$, listVDom$).map(([{ text }, list]) =>
        div([
            textarea({
                attrs: { id: 'text', rows: 3 },
                props: { value: text }
            }),
            button({ attrs: { id: 'create', type: 'button' } }, [
                'Create One!'
            ]),
            button({ attrs: { id: 'nav', type: 'button' } }, ['Goto Tasks']),
            list
        ])
    );
}

function model(
    updateText$: Stream<string>,
    createOne$: Stream<null>
): Stream<Reducer<State>> {
    const init$ = xs.of<Reducer<State>>(() => defaultState);
    const update$ = updateText$.map(text => (state: State) => ({
        ...state,
        text
    }));
    const create$ = createOne$.map(_ => ({ text, list }: State) => ({
        text,
        list: list.concat({ text, key: id() })
    }));
    return xs.merge(init$, update$, create$);
}
