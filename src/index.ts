import dotenv from "dotenv";
import { getYargs } from "./args";

dotenv.config();

const main = async () => {
  const argv = await getYargs();

  if (argv._.includes("configure")) {
    const { configure } = await import("./configure");
    await configure();
  } else if (argv._.includes("review")) {
    const { review } = await import("./review");
    await review(argv);
  } else {
    console.error("Unknown command");
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(`Error: ${error}`);
  process.exit(1);
});
