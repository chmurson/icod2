## Stashcrate

Stashcrate is a simple and lightweight app to share content with your friends and family in a decentralized, encrypted way.

## Production

[icod2.netlify.app](https://icod2.netlify.app)

## Local development

```
yarn install --immutable
```

Run backend
```
cd be
yarn dev
```

Take note of the multiaddrs the server is listening on in the backend's standard output. It should look like `/ip4/127.0.0.1/tcp/8080/p2p/Qm...XnBs`. It can be configured if needed in `be/config.yaml` by creating `be/config.local.yaml`.

Make sure the multiaddrs output by the backend is written into `/fe/.env.local` under the `VITE_BOOTSTRAP_MULTIADDRS` variable.

```
VITE_BOOTSTRAP_MULTIADDRS=/ip4/127.0.0.1/tcp/8080/p2p/Qm...XnBs
```

and then run frontend

```
cd fe
yarn dev
```

## Manually deploy frontend client in Netlify Preview context

```bash
cd fe
yarn workspace @icod2/fe build && netlify deploy --no-build --site c77e7e89-f17e-4593-9579-47bc6b863b8d
```

## Frontend Developer Features

The `icod2Dev` object is exposed on the `window` object in development mode. It provides the following features:

### `lockedBoxAutoLoad`

Allows you to automatically load a specific box when the app starts.

*   `set(box: string)`: Sets the box ID to automatically load.
*   `get()`: Gets the box ID that will be automatically loaded.

Example usage in the console:

```javascript
window.icod2Dev.lockedBoxAutoLoad.set({/* json object from download locked box file */});
```

### `countDownOverride`

Allows you to override the countdown timer for a specific box.

*   `set(box: string)`: Sets the box ID to override the countdown for.
*   `get()`: Gets the box ID that has its countdown overridden.

Example usage in the console:

```javascript
window.icod2Dev.countDownOverride.set(10000 /* 10 seconds */);
```

### `topNavTools`

Allows you to enable developer tools in the top navigation bar.

*   `set(box: string)`: Enables the tools.
*   `get()`: Gets the status of the tools.
