import dotenv from "dotenv";
import { getYargs } from "./args";
import { logger } from "./common/utils/logger";

dotenv.config();

const main = async () => {
  const argv = await getYargs();
  logger.settings.minLevel = argv.debug ? 2 : argv.ci ? 4 : 3;

  switch (argv._[0]) {
    case "configure":
      const { configure } = await import("./configure");
      await configure();
      break;
    case "review":
      const { review } = await import("./review");
      const { getFilesWithChanges } = await import(
        "./common/git/getFilesWithChanges"
      );
      const files = await getFilesWithChanges(argv.ci);
      await review(argv, files);
      break;
    case "test":
      const { test } = await import("./test");
      await test(argv);
      break;
    default:
      logger.error("Unknown command");
      process.exit(1);
  }
};

main().catch((error) => {
  logger.error(`Error: ${error}`);
  process.exit(1);
});
