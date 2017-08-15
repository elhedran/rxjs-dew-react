import { Store } from 'rxjs-dew';

export const storeContextKey = '@rxjs-dew-react/context/store';
export const defaultStoreKey = 'default';

export type StoreMap = {
    [key: string]: Store<any, any>;
}

export const isStore = (thing: Store<any, any> | any): thing is Store<any, any> => thing.action$ && thing.state$ && thing.dispatch$;