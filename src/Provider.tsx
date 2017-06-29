import * as React from 'react';
import { Children } from 'react';
import * as PropTypes from 'prop-types';
import { Store } from 'rxjs-dew';

export type Props<State, Action> = {
    store: Store<State, Action>;
    storeKey?: string;
};

export const storeContextKey = '@rxjs-dew-react/context/store';
export const defaultStoreKey = 'default';

export class Provider<S, A> extends React.Component<Props<S, A>, {}> {
    static childContextTypes = {
        [storeContextKey]: PropTypes.object
    };
    static contextTypes = {
        [storeContextKey]: PropTypes.object
    };

    getChildContext() {
        const parentContext = this.context[storeContextKey];
        const thisContext = {
            [this.props.storeKey || defaultStoreKey]: this.props.store,
        };
        const childContext = parentContext
            ? Object.assign({}, parentContext, thisContext)
            : thisContext;
        return {
            [storeContextKey]: childContext
        };
    }

    componentWillReceiveProps(nextProps: Readonly<Props<S, A>>) {
        if (this.props.store !== nextProps.store) {
            throw '<Provider> does not support changing store property on the fly. ';
        }
    }

    render() {
        return Children.only(this.props.children);
    }
}

export default Provider;