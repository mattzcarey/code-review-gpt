import dotenv from "dotenv";

import { getYargs } from "./args";
import { logger } from "./common/utils/logger";
import { getOpenAIApiKey } from "./config";

dotenv.config();

const main = async () => {
  const argv = await getYargs();
  const openAIApiKey = getOpenAIApiKey();
  logger.settings.minLevel = argv.debug ? 2 : argv.ci ? 4 : 3;

  logger.debug(`Args: ${JSON.stringify(argv)}`);

  switch (argv._[0]) {
    case "configure": {
      const { configure } = await import("./configure");
      await configure(argv);
      break;
    }
    case "review": {
      const { review } = await import("./review");
      const { getReviewFiles } = await import("./common/utils/getReviewFiles");
      const files = await getReviewFiles(argv.ci, argv.remote);
      await review(argv, files, openAIApiKey);
      break;
    }
    case "test": {
      const { test } = await import("./test");
      await test(argv, openAIApiKey);
      break;
    }
    default:
      logger.error("Unknown command");
      process.exit(1);
  }
};

main().catch((error) => {
  const message =
    error instanceof Error ? error.message : "An unknown error occurred";
  const stack =
    error instanceof Error ? error.stack : "No stack trace available";

  logger.error(`Error: ${message}`);
  if (stack) {
    logger.debug(`Stack trace: ${stack}`);
  }
  process.exit(1);
});
