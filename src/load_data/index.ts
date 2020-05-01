import { main } from "./main";

main(process.argv.slice(2)).catch(() => {
  process.exitCode = 1;
});
