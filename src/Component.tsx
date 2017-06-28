import * as React from 'react';
import { storeKey } from './Provider';
import * as PropTypes from 'prop-types';
import { Subscription } from 'rxjs';
import { Store } from 'rxjs-dew';

export abstract class Component<Props, State, RootState, Action> extends React.Component<Props, State> {
    static contextTypes = {
        [storeKey]: PropTypes.object
    };

    private readonly state$ = (this.context[storeKey] as Store<RootState, Account>).state$;
    private readonly dispatch$ = (this.context[storeKey] as Store<RootState, Account>).dispatch$;
    private subscription: Subscription | undefined;

    constructor(props: Props, context: {}) {
        super(props, context);
        this.context = context;
        if (!context[storeKey]) {
            throw 'Missing store. It is recommended to wrap any rxjs-dew-react '
            + 'Components with a rxjs-dew-react Provider to set the store object.';
        }
    }

    mapToState?(state: RootState): Pick<State, keyof State>;

    dispatch = (action: Action) => this.dispatch$.next(action);

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
}

export default Component;