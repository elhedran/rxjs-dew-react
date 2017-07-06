import * as React from 'react';
import { storeContextKey, defaultStoreKey } from './Provider';
import * as PropTypes from 'prop-types';
import { Subscription } from 'rxjs';
import { Store } from 'rxjs-dew';

/**
 * Extends React.Component to connect to an Dew store provided to
 * the React context via an Dew Provider.
 * - `Props` - component specific properties
 * - `State` - component specific state
 * - `StoreState` - State type as provided by the dew store
 * - `Action` - Action type as consumed by the dew store
 * 
 * In addition to the component properties and additional optional property
 * is added, `storeKey`, which allows specifying a store provided under
 * a key other than the default Dew store. This is useful for example for
 * separating out a routing Dew store from application specific an application
 * specific store.
 */
export abstract class Component<Props, State, StoreState, Action> extends
    React.Component<Props & { storeKey?: string }, State>
{
    static contextTypes = {
        [storeContextKey]: PropTypes.object
    };

    private readonly store =
    this.context[storeContextKey]
    [this.props.storeKey || defaultStoreKey] as Store<StoreState, Action>;
    private readonly state$ = this.store.state$;
    private readonly action$ = this.store.action$;
    private readonly dispatch$ = this.store.dispatch$;
    private stateSubscription: Subscription | undefined;
    private actionSubscription: Subscription | undefined;

    constructor(props: Props, context: {}) {
        super(props, context);
        this.context = context;
        if (
            !context[storeContextKey]
            || !context[storeContextKey][this.props.storeKey || defaultStoreKey]
        ) {
            throw 'Missing store. It is recommended to wrap any rxjs-dew-react '
            + 'Components with a rxjs-dew-react Provider to set the store object. '
            + ' If a key is storeKey is set it must match a key set by a Provider '
            + ' component.';
        }
    }

/**
 * Override this function to map the StoreState to this component's state.
 * The result will be applied to the `setState` function.
 * 
 * @param storeState the current state of the Dew store.
 */
    mapToState?(storeState: StoreState): Pick<State, keyof State>;

/**
 *  Override this function to apply actions to this component's state.
 * @param state the current state prior to applying the action
 * @param action the action to apply.
 */
    soak?(state: State, action: Action): Pick<State, keyof State>;

/**
 * Dispatches actions to the Dew store
 * @param action the action to dispatch
 */
    dispatch = (action: Action) => this.dispatch$.next(action);

    componentWillReceiveProps(nextProps: Readonly<Props & { storeKey?: string }>) {
        if (this.props.storeKey !== nextProps.storeKey) {
            throw 'Dew Component does not support changing storeKey property on the fly. ';
        }
    }

    componentDidMount() {
        this.stateSubscription = this.state$.subscribe(
            rs => this.mapToState && this.setState(this.mapToState(rs))
        );
        this.actionSubscription = this.action$.subscribe(
            a => this.soak && this.setState(this.soak(this.state, a))
        )
    }

    componentWillUnmount() {
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
            this.stateSubscription = undefined;
        }
        if (this.actionSubscription) {
            this.actionSubscription.unsubscribe();
            this.actionSubscription = undefined;
        }
    }

    abstract render(): JSX.Element | null | false;
}

export default Component;