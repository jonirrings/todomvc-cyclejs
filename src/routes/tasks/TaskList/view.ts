import {
    a,
    button,
    div,
    footer,
    h1,
    header,
    input,
    label,
    li,
    section,
    span,
    strong,
    ul,
    VNode
} from '@cycle/dom';

import { State } from './interfaces';
import xs, { Stream } from 'xstream';

function renderHeader(state: State): VNode {
    return header('.header', [
        h1('todos'),
        input('.new-todo', {
            props: {
                type: 'text',
                placeholder: 'What needs to be done?',
                autofocus: true,
                name: 'newTodo',
                value: state.inputValue
            }
        })
    ]);
}

function renderMainSection(todosData: State, listVDom: VNode): VNode {
    const allCompleted = todosData.list.reduce(
        (x: boolean, y) => x && y.completed,
        true
    );
    const sectionStyle = { display: todosData.list.length ? '' : 'none' };

    return section('.main', { style: sectionStyle }, [
        input({
            attrs: { class: 'toggle-all', id: 'toggle-all' },
            props: { type: 'checkbox', checked: allCompleted }
        }),
        label({ attrs: { for: 'toggle-all' } }, ['Mark all as complete']),
        listVDom
    ]);
}

function renderFilterButton(
    todosData: State,
    filterTag: string,
    path: string,
    text: string
): VNode {
    return li([
        a(
            {
                props: { href: path },
                class: { selected: todosData.filter === filterTag }
            },
            text
        )
    ]);
}

function renderFooter(todosData: State): VNode {
    const amountCompleted = todosData.list.filter(
        todoData => todoData.completed
    ).length;
    const amountActive = todosData.list.length - amountCompleted;
    const footerStyle = { display: todosData.list.length ? '' : 'none' };

    return footer('.footer', { style: footerStyle }, [
        span('.todo-count', [
            strong(String(amountActive)),
            ' item' + (amountActive !== 1 ? 's' : '') + ' left'
        ]),
        ul('.filters', [
            renderFilterButton(todosData, '/tasks', '/tasks', 'All'),
            renderFilterButton(
                todosData,
                '/tasks/active',
                '/tasks/active',
                'Active'
            ),
            renderFilterButton(
                todosData,
                '/tasks/completed',
                '/tasks/completed',
                'Completed'
            )
        ]),
        amountCompleted > 0
            ? button(
                  '.clear-completed',
                  'Clear completed (' + amountCompleted + ')'
              )
            : null
    ]);
}

// THE VIEW
// This function expects the stream of todosData
// from the model function and turns it into a
// virtual DOM stream that is then ultimately returned into
// the DOM sink in the index.js.
export default function view(
    state$: Stream<State>,
    listVDom$: Stream<VNode>
): Stream<VNode> {
    return xs
        .combine(state$, listVDom$)
        .map(([state, listVDom]) =>
            div([
                renderHeader(state),
                renderMainSection(state, listVDom),
                renderFooter(state)
            ])
        );
}
