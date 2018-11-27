import { State } from './interfaces';
import { Stream } from 'xstream';

interface Anonymous {
    [index: string]: any;
}

function merge(...args: Anonymous[]): Anonymous {
    const result: Anonymous = {};
    for (let i = 0; i < args.length; i++) {
        const object = args[i];
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                result[key] = object[key];
            }
        }
    }
    return result;
}

const safeJSONParse = (str: string) => JSON.parse(str) || {};

const mergeWithDefaultTodosData = (todosData: State) => {
    return merge(
        {
            list: [],
            filter: '',
            filterFn: () => true // allow anything
        },
        todosData
    ) as State;
};

// Take localStorage todoData stream and transform into
// a JavaScript object. Set default data.
export default function deserialize(
    localStorageValue$: Stream<any>
): Stream<State> {
    return localStorageValue$.map(safeJSONParse).map(mergeWithDefaultTodosData);
}
