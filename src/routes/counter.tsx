import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';

import { Sources, Sinks, Reducer } from '../interfaces';
import { ResponseCollection } from '@cycle/storage';

export interface State {
    count: number;
}
export const defaultState: State = {
    count: 0
};

interface DOMIntent {
    increment$: Stream<null>;
    decrement$: Stream<null>;
    link$: Stream<null>;
}

export function Counter({ DOM, state, storage }: Sources<State>): Sinks<State> {
    const { increment$, decrement$, link$ }: DOMIntent = intent(DOM);

    return {
        DOM: view(state.stream),
        state: model(increment$, decrement$, storage),
        router: redirect(link$),
        storage: state.stream.map(prevState => ({
            key: 'count',
            value: prevState.count
        }))
    };
}

function model(
    increment$: Stream<any>,
    decrement$: Stream<any>,
    storage$: ResponseCollection
): Stream<Reducer<State>> {
    const init$ = storage$.local
        .getItem('count')
        .map((count: string) => (prevState: State) => {
            if (prevState) {
                return prevState;
            }
            if (count) {
                return { count: Number(count) };
            }
            return defaultState;
        });

    const addToState: (n: number) => Reducer<State> = n => state => ({
        ...state,
        count: (state as State).count + n
    });
    const add$ = increment$.mapTo(addToState(1));
    const subtract$ = decrement$.mapTo(addToState(-1));

    return xs.merge(init$, add$, subtract$);
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(({ count }) => (
        <div>
            <h2>My Awesome Cycle.js app - Page 1</h2>
            <span>{'Counter: ' + count}</span>
            <button type="button" className="add">
                Increase
            </button>
            <button type="button" className="subtract">
                Decrease
            </button>
            <button type="button" data-action="navigate">
                Page 2
            </button>
        </div>
    ));
}

function intent(DOM: DOMSource): DOMIntent {
    const increment$ = DOM.select('.add')
        .events('click')
        .mapTo(null);

    const decrement$ = DOM.select('.subtract')
        .events('click')
        .mapTo(null);

    const link$ = DOM.select('[data-action="navigate"]')
        .events('click')
        .mapTo(null);

    return { increment$, decrement$, link$ };
}

function redirect(link$: Stream<any>): Stream<string> {
    return link$.mapTo('/speaker');
}
