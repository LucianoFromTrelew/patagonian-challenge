import { getApp } from "./app";
import "dotenv/config";
import { getConnection } from "./utils";

async function run() {
  const app = await getApp(await getConnection());
  app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`[Express] Listening on port ${process.env.EXPRESS_PORT}`);
  });
}

run();
