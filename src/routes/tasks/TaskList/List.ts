import { ul } from '@cycle/dom';
import { makeCollection } from '@cycle/state';
import Task from '../Task';
import { TaskState } from '../Task/interfaces';

export const List = makeCollection({
    item: Task,
    itemKey: (state: TaskState) => state.key,
    itemScope: key => key,
    collectSinks: instances => ({
        DOM: instances
            .pickCombine('DOM')
            .map(vnodes => ul('.todo-list', vnodes)),
        state: instances.pickMerge('state')
    })
});
