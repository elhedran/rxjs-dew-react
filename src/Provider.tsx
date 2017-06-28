import * as React from 'react';
import { Children } from 'react';
import * as PropTypes from 'prop-types';
import { Store } from 'rxjs-dew';

export type Props<State, Action> = {
    store: Store<State, Action>;
};

export const storeKey = '@rxjs-dew-react/context/store';

export class Provider<S, A> extends React.Component<Props<S, A>, undefined> {
    static childContextTypes = {
        [storeKey]: PropTypes.object
    };

    getChildContext() {
        return {
            [storeKey]: this.props.store,
        };
    }

    constructor(props: Props<S, A>, context: {}) {
        super(props, context);
        this[storeKey] = props.store;
    }

    componentWillReceiveProps(nextProps: Props<S, A>) {
        if (this[storeKey] !== nextProps.store) {
            throw '<Provider> does not support changing store property on the fly. ';
        }
    }

    render() {
        return Children.only(this.props.children);
    }
}

export default Provider;