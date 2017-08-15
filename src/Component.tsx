import { Consumer } from './Consumer';
import { defaultStoreKey } from './utils';
import { Subscription } from 'rxjs';
import { Store, ActionCreatorMap, bindActionCreatorMap } from 'rxjs-dew';

export type ComponentProps = {
    storeKey?: string
};

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
    Consumer<Props & ComponentProps, State>
{
    protected readonly store: Store<StoreState, Action>;
    private stateSubscription: Subscription | undefined;
    private actionSubscription: Subscription | undefined;

    constructor(props: Props & ComponentProps, context: {}) {
        super(props, context);
        const key = props.storeKey || defaultStoreKey;
        this.store = this.storeMap[key];

        if (this.store.action$ === undefined
            || this.store.dispatch$ === undefined
            || this.store.state$ === undefined) {
            throw 'Invalid store. Store provided via rxjs-dew-react Provider is not a valid '
            + 'store.';
        }
    }

    /**
     * Override this function to map the StoreState to this component's state.
     * The result will be applied to the `setState` function.
     * 
     * @param storeState the current state of the Dew store.
     */
    applyStoreState?(storeState: StoreState): void;

    /**
     *  Override this function to apply actions to this component's state.
     * @param state the current state prior to applying the action
     * @param action the action to apply.
     */
    applyStoreAction?(action: Action): void;

    /**
     * Dispatches actions to the Dew store
     * @param action the action to dispatch
     */
    dispatch = (action: Action) => this.store.dispatch$.next(action);

    componentWillReceiveProps(nextProps: Readonly<Props & { storeKey?: string }>) {
        if (this.props.storeKey !== nextProps.storeKey) {
            throw 'Dew Component does not support changing storeKey property on the fly. ';
        }
    }
    private createSubscriptions() {
        this.stateSubscription = this.stateSubscription || this.store.state$.subscribe(storeState => {
            if (this.applyStoreState) this.applyStoreState(storeState);
        });
        this.actionSubscription = this.actionSubscription || this.store.action$.subscribe(action => {
            if (this.applyStoreAction) this.applyStoreAction(action);
        });

    }
    
    componentWillMount() {
        this.createSubscriptions();
    }
    componentDidMount() {
        this.createSubscriptions();
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