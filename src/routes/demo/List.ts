import { ul } from '@cycle/dom';
import { makeCollection } from '@cycle/state';
import { Row, State } from './Row';

export const List = makeCollection<State>({
    item: Row,
    itemKey: state => state.key,
    itemScope: key => key,
    collectSinks: instances => ({
        DOM: instances.pickCombine('DOM').map(vnodes => ul('.rows', vnodes))
    })
});
