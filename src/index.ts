import { getApp } from "./app";
import "dotenv/config";
import { getConnection } from "./utils";

async function run() {
  const app = await getApp(await getConnection());
  const port = process.env.EXPRESS_PORT || 3000;
  app.listen(port, () => {
    console.log(`[Express] Listening on port ${port}`);
  });
}

run();
