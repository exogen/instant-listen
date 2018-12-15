# instant-listen

Do you have an Express request handler that requires some preparation before
it’s ready? This package makes it easy to set up a “deferred” handler that will
allow the server to start listening earlier, then respond when the real handler
is ready. That means you can start making requests right away, instead of
refreshing a bunch of “connection refused” pages while your app is bootstrapped.

## Examples

### Next.js with Express

This package is currently quite useful with Next.js in development mode, which
has a rather slow bootstrapping phase. There are two slow parts to Next.js’
startup time. The initial app creation:

```js
// This is a really slow synchronous/blocking call! 
const app = next({ dev });
```

And the preparation, which performs a webpack build:

```js
// This is an even slower asynchronous call!
app.prepare().then(/* ... */);
```

Typical [custom server instructions](https://github.com/zeit/next.js/tree/canary/examples/custom-server-express)
don’t call `listen()` until after both of these steps are complete, meaning if
you try to load the app in the meantime, you’ll get an error until the server is
ready to accept connections.

Using `instant-listen` makes it easy to start the slow bootstrapping phase after
the server is already listening:

```js
const express = require("express");
const next = require("next");
const instantListen = require("instant-listen");

const server = express();

const handler = instantListen(async () => {
  const app = next({ dev: process.env.NODE_ENV !== "production" });
  const handle = app.getRequestHandler();
  await app.prepare();
  return handle;
});

server.get("*", handler);

server.listen(3000, err => {
  if (err) {
    throw err;
  }
  handler.init();
  console.log(`> Ready on http://localhost:3000`);
});
```

## Usage

```js
// CommonJS
const instantListen = require("instant-listen");

// ES2015
import instantListen from "instant-listen";
```

Call `instantListen` with a function that returns your request handler, or a
Promise that resolves to a request handler.

```js
const handler = instantListen(async () => {
  // Do some work…
  return myHandler;
});
```

The result is a new request handler that will delay responding to requests until
it is ready to use your real handler. The handler function has two extra
properties:

- `init`: A function to call when you’re ready for your handler creation
  function to begin. In order to guarantee the server starts listening as soon
  as possible, it’s best to do this after the server is already listening (like
  in the `listen()` callback).
- `ready`: A Promise that will resolve when the handler has been created and is
  ready to respond to requests.
