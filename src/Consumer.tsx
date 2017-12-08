import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Subscription, Observable } from 'rxjs';
import { StoreMap, storeContextKey } from './utils';

/**
 * Extends React.Component to connect to a Dew store map provided
 * to the React context via a Dew provider.
 * 
 * The store map is made accessible via the `storeMap` protected
 * readonly property.  No bindings or subscriptions
 * are enabled.
 */
export interface Consumer<P = {}, S = {}> extends React.Component<P, S> { }
export abstract class Consumer<P, S> extends React.Component<P, S>
{
    static contextTypes = {
        [storeContextKey]: PropTypes.object
    };

    protected readonly storeMap: StoreMap;

    constructor(props: P, context: {}) {
        super(props, context);
        this.context = context;
        if (
            !context[storeContextKey]
        ) {
            throw 'Missing context. It is recommended to wrap any rxjs-dew-react '
            + 'Components with a rxjs-dew-react Provider to set the store context object.';
        }
        this.storeMap =
            this.context[storeContextKey];

        if (!this.storeMap) {
            throw 'Missing store map. No store map provided via a rxjs-dew-react Provider';
        }
    }

    private subscriptions: Subscription[] = []
    protected subscribe<K extends keyof S>(state$: Observable<Pick<S, K>>): void;
    protected subscribe<T>(map$: Observable<T>, fn: (prev: S, value: T) => S, callback?: () => any): void;
    protected subscribe<K extends keyof S, T>(
        state$: Observable<Pick<S, K>> | Observable<T>,
        fn?: (value: T, prev: S, props: P) => S,
        callback?: () => any
    ): void {
        if (fn !== undefined) {
            this.subscriptions.push(
                (state$ as Observable<T>).subscribe(
                    value => this.setState((prev, props) => fn(value, prev, props), callback)
                )
            );
        } else {
            this.subscriptions.push(
                (state$ as Observable<Pick<S, K>>).subscribe(
                    p => this.setState(p)
                )
            );
        }
    }


    protected unsubscribe(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}