module.exports = function instantListen(createHandler) {
  let resolveHandler;
  let rejectHandler;
  let readyHandler;

  const ready = new Promise((resolve, reject) => {
    resolveHandler = resolve;
    rejectHandler = reject;
  });

  function init() {
    const promise = Promise.resolve()
      .then(createHandler)
      .then(handler => {
        if (typeof handler !== "function") {
          throw new Error(
            "The `createHandler` argument must return a function that handles requests. " +
              "If you are using the standard Next.js request handler, return `app.getRequestHandler()`."
          );
        }
        readyHandler = handler;
        return handler;
      });
    promise.then(resolveHandler, rejectHandler);
    return promise;
  }

  function handler(req, res, next) {
    if (readyHandler) {
      // If `appHandler` has already been set, skip waiting on the promise
      // (which even if resolved, will be async) and call the handler right
      // away.
      readyHandler(req, res, next);
    } else {
      ready
        // When the `ready` promise is resolved, `appHandler` is guaranteed
        // to be set.
        .then(() => {
          readyHandler(req, res, next);
        })
        // If there was a problem with either `ready` or `appHandler`, it
        // happened asynchronously and the server needs to know about the
        // error, so pass it along to `next`.
        .catch(next);
    }
  }

  handler.init = init;
  handler.ready = ready;

  return handler;
};
