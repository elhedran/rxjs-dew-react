import { Consumer } from './Consumer';
import { Store } from 'rxjs-dew';

export namespace BoundConsumer {
    export type PartialStore<K extends keyof S, S> = Store<Pick<S, K>, any>;
}

/**
 * A convenience class for when the consumer binds to a single store
 * who's state is a substate of the consumers own state.
 */
export abstract class BoundConsumer<P, S, K extends keyof S> extends Consumer<P, S> {
    protected abstract readonly store: BoundConsumer.PartialStore<K, S>;

    componentWillMount() {
        this.subscribe(this.store.state$);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }
}
