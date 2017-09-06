import * as React from 'react';
import { ActionCreatorMap, bindActionCreatorMap } from 'rxjs-dew';
import * as Rx from 'rxjs';

export type SubscriberProps<State, Action> = {
    dispatch$: Rx.Subject<Action>;
    state$: Rx.Observable<State>;
}

export abstract class Subscriber<Props, State, Action> extends
    React.Component<Props & SubscriberProps<State, Action>, State>
{
    private stateSubscription: Rx.Subscription | undefined;

    dispatch = (action: Action) => this.props.dispatch$.next(action);

    componentWillReceiveProps(nextProps: Readonly<Props & SubscriberProps<State, Action>>) {
        if (this.props.dispatch$ !== nextProps.dispatch$) {
            throw 'Dew Subscriber does not support changing dispatch$ property on the fly. ';
        }
        if (this.props.state$ !== nextProps.state$) {
            throw 'Dew Subscriber does not support changing state$ property on the fly. ';
        }
    }

    private createSubscriptions() {
        this.stateSubscription = this.stateSubscription
            || this.props.state$.subscribe(storeState => this.setState(storeState));
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
    }

    bindActions<T extends ActionCreatorMap<Action>>(map: T) {
        return bindActionCreatorMap(map, this.dispatch);
    }

    abstract render(): JSX.Element | null | false;
}

export default Subscriber;