import * as React from 'react';
import { storeContextKey, defaultStoreKey } from './Provider';
import * as PropTypes from 'prop-types';
import { Subscription } from 'rxjs';
import { Store } from 'rxjs-dew';

export abstract class Component<Props, State, RootState, Action> extends
    React.Component<Props & { storeKey?: string }, State>
{
    static contextTypes = {
        [storeContextKey]: PropTypes.object
    };

    private readonly store =
    this.context[storeContextKey]
    [this.props.storeKey || defaultStoreKey] as Store<RootState, Action>;
    private readonly state$ = this.store.state$;
    private readonly dispatch$ = this.store.dispatch$;
    private subscription: Subscription | undefined;

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

    mapToState?(state: RootState): Pick<State, keyof State>;

    dispatch = (action: Action) => this.dispatch$.next(action);

    componentWillReceiveProps(nextProps: Readonly<Props & { storeKey?: string }>) {
        if (this.props.storeKey !== nextProps.storeKey) {
            throw 'Dew Component does not support changing storeKey property on the fly. ';
        }
    }

    componentDidMount() {
        this.subscription = this.state$.subscribe(
            rs => this.mapToState && this.setState(this.mapToState(rs))
        );
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    abstract render(): JSX.Element | null | false;
}

export default Component;