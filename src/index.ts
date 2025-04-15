import dotenv from 'dotenv';

import { getYargs } from './args';
import type { ConfigureArgs, ParsedArgs, ReviewArgs } from './common/types';
import { logger } from './common/utils/logger';

dotenv.config();

const main = async () => {
  const argv = (await getYargs()) as ParsedArgs;
  logger.settings.minLevel = argv.debug ? 2 : argv.ci ? 4 : 3;

  logger.debug(`Args: ${JSON.stringify(argv)}`);
  try {
    switch (argv._?.[0]) {
      case 'configure': {
        const { configure } = await import('./configure');
        await configure(argv as ConfigureArgs);
        break;
      }
      case 'review': {
        const { review } = await import('./review');
        await review(argv as ReviewArgs);
        break;
      }
      default:
        logger.error('Unknown command');
        process.exit(1);
    }
  } catch (error) {
    logger.error(`Error: ${error}`);
    process.exit(1);
  }
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  const stack = error instanceof Error ? error.stack : 'No stack trace available';

  logger.error(`Error: ${message}`);
  if (stack) {
    logger.debug(`Stack trace: ${stack}`);
  }
  process.exit(1);
});
