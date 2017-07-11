import * as React from 'react';
import { Children } from 'react';
import * as PropTypes from 'prop-types';
import { Store } from 'rxjs-dew';

export type StoreMap = {
    [key: string]: Store<any, any>;
}

const isStore = (thing: Store<any, any> | any): thing is Store<any, any> => thing.action$ && thing.state$ && thing.dispatch$;

export type Props = {
    /**
     * The Dew store to be provided to the react context.
     */
    store: Store<any, any> | StoreMap;
};

export const storeContextKey = '@rxjs-dew-react/context/store';
export const defaultStoreKey = 'default';

/**
 * Provides a Dew store into the react context for any child components.
 * 
 * An optional `storeKey` property can be provided to allow providing the store
 * under a specific scope rather than as the default store. This may be useful
 * in separating stores, for example separating out a routing store from
 * the application store.
 */
export class Provider extends React.Component<Props, {}> {
    static childContextTypes = {
        [storeContextKey]: PropTypes.object
    };
    static contextTypes = {
        [storeContextKey]: PropTypes.object
    };

    getChildContext() {
        const parentContext = this.context[storeContextKey];

        const store = this.props.store;
        
        const thisContext: StoreMap = isStore(store)
        ? { [defaultStoreKey]: store }
        : store;

        const childContext = parentContext
            ? Object.assign({}, parentContext, thisContext)
            : thisContext;
        return {
            [storeContextKey]: childContext
        };
    }

    componentWillReceiveProps(nextProps: Readonly<Props>) {
        if (this.props.store !== nextProps.store) {
            throw '<Provider> does not support changing store property on the fly. ';
        }
    }

    render() {
        return Children.only(this.props.children);
    }
}

export default Provider;