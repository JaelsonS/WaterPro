import { loadBackendEnv } from "./loadEnv";
import { app } from "./app";

loadBackendEnv();

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on :${port}`);
});

