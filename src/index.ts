import { run } from '@cycle/run';
import { getDrivers, wrapMain } from './drivers';
import { Component } from './interfaces';
import { App } from './app';

const main: Component<any> = wrapMain(App);

run(main as any, getDrivers());
