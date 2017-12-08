import * as React from 'react';
import { Children } from 'react';
import * as PropTypes from 'prop-types';
import { assign } from 'rxjs/util/assign';
import { StoreMap, storeContextKey } from './utils';

export namespace Provider {
    export type Props = {
        /**
         * The Dew store to be provided to the react context.
         */
        storeMap: StoreMap;
    };
}

/**
 * Provides a Dew store into the react context for any child components.
 * 
 * An optional `storeKey` property can be provided to allow providing the store
 * under a specific scope rather than as the default store. This may be useful
 * in separating stores, for example separating out a routing store from
 * the application store.
 */
export class Provider extends React.Component<Provider.Props, {}> {
    static childContextTypes = {
        [storeContextKey]: PropTypes.object
    };
    static contextTypes = {
        [storeContextKey]: PropTypes.object
    };

    getChildContext() {
        const parentContext = this.context[storeContextKey];

        const thisContext: StoreMap = this.props.storeMap;

        const childContext = parentContext
            ? assign({}, parentContext, thisContext)
            : thisContext;
        return {
            [storeContextKey]: childContext
        };
    }

    componentWillReceiveProps(nextProps: Readonly<Provider.Props>) {
        if (this.props.storeMap !== nextProps.storeMap) {
            throw '<Provider> does not support changing storeMap property on the fly. ';
        }
    }

    render() {
        return Children.only(this.props.children);
    }
}

export default Provider;