import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StoreMap, storeContextKey } from './utils';

export abstract class Consumer<Props, State> extends
    React.Component<Props, State>
{
    static contextTypes = {
        [storeContextKey]: PropTypes.object
    };

    protected readonly storeMap: StoreMap;

    constructor(props: Props, context: {}) {
        super(props, context);
        this.context = context;
        if (
            !context[storeContextKey]
        ) {
            throw 'Missing context. It is recommended to wrap any rxjs-dew-react '
            + 'Components with a rxjs-dew-react Provider to set the store context object.';
        }
        this.storeMap =
            this.context[storeContextKey];

        if (!this.storeMap) {
            throw 'Missing store map. No store map provided via a rxjs-dew-react Provider';
        }
    }

    abstract render(): JSX.Element | null | false;
}

export default Consumer;