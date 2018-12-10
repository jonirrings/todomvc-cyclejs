import xs, { Stream } from 'xstream';
import { extractSinks } from 'cyclejs-utils';
import isolate from '@cycle/isolate';

import { driverNames } from './drivers';
import { Sources, Sinks, Component } from './interfaces';

import { Counter, State as CounterState } from './routes/counter';
import { Speaker, State as SpeakerState } from './routes/speaker';
import { TaskList, State as TasksState } from './routes/tasks';
import { Demo, State as DemoState } from './routes/demo';

export interface State {
    counter?: CounterState;
    speaker?: SpeakerState;
    tasks?: TasksState;
    demo?: DemoState;
}

export function App(sources: Sources<State>): Sinks<State> {
    const match$ = sources.router.define({
        '/counter': isolate(Counter, 'counter'),
        '/speaker': isolate(Speaker, 'speaker'),
        '/tasks': isolate(TaskList, 'tasks'),
        '/demo': isolate(Demo, 'demo')
    });

    const componentSinks$: Stream<Sinks<State>> = match$
        .filter(({ path, value }: any) => path && typeof value === 'function')
        .map(({ path, value }: { path: string; value: Component<any> }) => {
            return value({
                ...sources,
                router: sources.router.path(path)
            });
        });

    const init$: Stream<string> = sources.router.history$
        .filter((l: Location) => l.pathname === '/')
        .mapTo('/counter');

    const sinks = extractSinks(componentSinks$, driverNames);
    return {
        ...sinks,
        router: xs.merge(init$, sinks.router)
    };
}
