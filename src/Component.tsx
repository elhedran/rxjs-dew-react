import * as React from 'react';
import { storeContextKey, defaultStoreKey } from './Provider';
import * as PropTypes from 'prop-types';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, ActionCreatorMap, bindActionCreatorMap } from 'rxjs-dew';

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

    private readonly store: Store<StoreState, Action>;
    private readonly state$: Observable<StoreState>;
    private readonly action$: Observable<Action>;
    private readonly dispatch$: Subject<Action>;
    private stateSubscription: Subscription | undefined;
    private actionSubscription: Subscription | undefined;

    constructor(props: Props, context: {}) {
        super(props, context);
        this.context = context;
        if (
            !context[storeContextKey]
        ) {
            throw 'Missing context. It is recommended to wrap any rxjs-dew-react '
            + 'Components with a rxjs-dew-react Provider to set the store context object.';
        }
        this.store =
            this.context[storeContextKey]
            [this.props.storeKey || defaultStoreKey] as Store<StoreState, Action>;
        if (!this.store) {
            throw 'Missing store. No store provided via a rxjs-dew-react Provider match '
            + 'storeKey required by this component.';
        }
        if (this.store.action$ === undefined
            || this.store.dispatch$ === undefined
            || this.store.state$ === undefined) {
            throw 'Invalid store. Store provided via rxjs-dew-react Provider is not a valid '
            + 'store.';
        }
        this.state$ = this.store.state$;
        this.action$ = this.store.action$;
        this.dispatch$ = this.store.dispatch$;
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
        if (this.mapToState) {
            this.stateSubscription = this.state$.subscribe(
                rs => this.mapToState && this.setState(this.mapToState(rs))
            );
        }
        if (this.soak) {
            this.actionSubscription = this.action$.subscribe(
                a => this.soak && this.setState(this.soak(this.state, a))
            );
        }
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

    bindActions<T extends ActionCreatorMap<Action>>(map: T) {
        return bindActionCreatorMap(map, this.dispatch);
    }

    abstract render(): JSX.Element | null | false;
}

export default Component;