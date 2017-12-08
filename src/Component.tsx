import { Subscription } from 'rxjs';
import { Store } from 'rxjs-dew';
import * as React from 'react';



/**
 * TODO: Document
 * 
 * A component holds its own store.
 */
export interface Component<P = {}, S = {}> extends React.Component<P, S> { }
export abstract class Component<P, S> extends React.Component<P, S>
{
    protected abstract readonly store: Store<S, any>;

    private subscription?: Subscription;
    
    componentWillMount() {
        if (!this.subscription) {
            this.subscription = this.store.state$.subscribe(s => this.setState(s));
        }
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }
}
