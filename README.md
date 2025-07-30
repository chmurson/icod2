## Box

Box is a simple and lightweight app to share content with your firends and family in a decentralized, encrypted way.

## Production

[icod2.netlify.app](https://icod2.netlify.app)

## Development

```
yarn install --immutable
```

Run frontend and backend
```
yarn dev
```

## Manually deploy in Netlify Preview context

```bash
cd fe
yarn workspace @icod2/fe build && netlify deploy --no-build --site c77e7e89-f17e-4593-9579-47bc6b863b8d
```

## Developer Features

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
