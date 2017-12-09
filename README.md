<img title="logo" src="logo/logo.png" style="{width: 20em; height: 20em;}">

# RxJs Dew React

React components for subscribing to Dew store.

* `Component` - An abstract react component that uses a `Dew.Store` to manage its own state that it creates itself.
* `Provider` - Provides a map of `Dew.Store` objects into the react context. Extends and merges to an
    existing `Provider` map if a parent object is already using a provider.
* `Consumer` - An abstract react component that provides a `storeMap` property to access provided `Dew.Store` objects
    by a `Provider`.  Also includes `subscribe` and `unsubscribe` functions to asist in binding `Dew.Store` objects
    either from the provided map or created by the consumer to the consumers state.
* `BoundConsumer` - A convenience abstract react component that subscribes to a single specified `Dew.Store` property
    `store`. Requires this stores `state$` obersvable to have a state that is a subset of the state of the
    `BoundConsumer` state.