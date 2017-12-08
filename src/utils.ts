import { Store } from 'rxjs-dew';

export const storeContextKey = '@rxjs-dew-react/context/store';

export type StoreMap = {
    [key: string]: Store<any, any>;
}