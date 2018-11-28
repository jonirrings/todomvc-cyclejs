import { button, div, input, label, li, VNode } from '@cycle/dom';
import { TaskState } from './interfaces';
import { Stream } from 'xstream';

function view(state$: Stream<TaskState>): Stream<VNode> {
    return state$.map(({ title, completed, editing }: TaskState) => {
        const todoRootClasses = {
            completed,
            editing
        };

        return li('.todoRoot', { class: todoRootClasses }, [
            div('.view', [
                input('.toggle', {
                    props: { type: 'checkbox', checked: completed }
                }),
                label(title),
                button('.destroy')
            ]),
            input('.edit', {
                props: { type: 'text' },
                hook: {
                    update: (
                        oldVNode: VNode,
                        { elm }: { elm: HTMLInputElement }
                    ) => {
                        elm.value = title;
                        if (editing) {
                            elm.focus();
                            elm.selectionStart = elm.value.length;
                        }
                    }
                }
            })
        ]);
    });
}

export default view;
