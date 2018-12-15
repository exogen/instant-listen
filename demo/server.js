const express = require("express");
const next = require("next");
const instantListen = require("..");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const server = express();

const handler = instantListen(async () => {
  const app = next({ dev, dir: __dirname });
  const handle = app.getRequestHandler();
  await app.prepare();
  return handle;
});

server.get("*", handler);

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${PORT}`);
  handler.init();
});

handler.ready.catch(err => {
  console.error(err);
  process.exit(1);
});
