const instantListen = require("./index");

describe("instantListen", () => {
  describe("handler", () => {
    it("is a function", () => {
      const createHandler = jest.fn();
      const handler = instantListen(createHandler);
      expect(typeof handler).toBe("function");
    });

    it("calls the created handler when ready", async () => {
      const appHandler = jest.fn();
      const createHandler = () => appHandler;
      const handler = instantListen(createHandler);
      handler.init();
      const args = [{}, {}, () => {}];
      handler(...args);
      await handler.ready;
      expect(appHandler).toHaveBeenCalledWith(...args);
    });

    it("calls the created handler immediately if ready", async () => {
      const appHandler = jest.fn();
      const createHandler = () => appHandler;
      const handler = instantListen(createHandler);
      handler.init();
      const args = [{}, {}, () => {}];
      await handler.ready;
      handler(...args);
      expect(appHandler).toHaveBeenCalledWith(...args);
    });
  });

  it("does not call createHandler if init() is never called", () => {
    const createHandler = jest.fn();
    instantListen(createHandler);
    expect(createHandler).not.toHaveBeenCalled();
  });

  it("throws an error if createHandler does not return a function", async () => {
    const createHandler = jest.fn();
    const handler = instantListen(createHandler);
    await expect(handler.init()).rejects.toThrow(/getRequestHandler/);
  });

  it("resolves the ready promise after createHandler is resolved", async () => {
    const appHandler = jest.fn();
    const createHandler = () => Promise.resolve(appHandler);
    const handler = instantListen(createHandler);
    handler.init();
    await expect(handler.ready).resolves.toBe(appHandler);
  });
});
