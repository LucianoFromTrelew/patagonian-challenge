import { main } from "./main";

main(process.argv.slice(2)).catch((err: Error) => {
  console.log(err.message);
  process.exitCode = 1;
});
