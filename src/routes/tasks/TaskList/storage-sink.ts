// Turn the data object that contains
// the todos into a string for localStorage.
import { Stream } from 'xstream';
import { State as TaskState } from '../Task/interfaces';

export default function serialize(
    todos$: Stream<Array<TaskState>>
): Stream<string> {
    return todos$.map(todosData =>
        JSON.stringify({
            list: todosData.map(todoData => ({
                title: todoData.title,
                completed: todoData.completed
            }))
        })
    );
}
