import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config();

export const getYargs = async () => {
  return yargs(hideBin(process.argv))
    .command('configure', 'Configure the tool', (yargs) => {
      return yargs.option('setupTarget', {
        description:
          "Specifies for which platform ('github', 'gitlab' or 'azdev') the project should be configured for. Defaults to 'github'.",
        choices: ['github', 'gitlab', 'azdev'],
        type: 'string',
        default: 'github',
      });
    })
    .command('review', 'Review code changes', (yargs) => {
      return yargs
        .option('ci', {
          description: 'CI environment type',
          choices: ['github', 'gitlab', 'azdev'],
          type: 'string',
          coerce: (arg) => arg || 'github',
        })
        .option('commentPerFile', {
          description:
            'Enables feedback to be made on a file-by-file basis. Only work when the script is running on GitHub.',
          type: 'boolean',
          default: false,
        })
        .option('model', {
          description: 'The model to use for generating the review.',
          type: 'string',
          default: 'gpt-4o-mini',
        })
        .option('reviewType', {
          description:
            "Type of review to perform. 'full' will review the entire file, 'changed' will review the changed lines only but provide the full file as context if possible. 'costOptimized' will review only the changed lines using the least tokens possible to keep api costs low. Defaults to 'changed'.",
          choices: ['full', 'changed', 'costOptimized'],
          type: 'string',
          default: 'changed',
        })
        .option('reviewLanguage', {
          description: 'Specifies the target natural language for translation',
          type: 'string',
          default: 'English',
        })
        .option('remote', {
          description: 'The identifier of a remote Pull Request to review',
          type: 'string',
          default: undefined,
        })
        .option('org', {
          description: 'Organization id to use for openAI',
          type: 'string',
          default: undefined,
        })
        .option('provider', {
          description: 'Provider to use for AI',
          choices: ['openai', 'azureai', 'bedrock'],
          type: 'string',
          default: 'openai',
        })
        .option('mode', {
          description: 'Mode to use for the review',
          choices: ['default', 'agent'],
          type: 'string',
          default: 'default',
        });
    })
    .command('test', 'Run tests', (yargs) => {
      return yargs.option('ci', {
        description: 'CI environment type',
        choices: ['github', 'gitlab', 'azdev'],
        type: 'string',
        coerce: (arg) => arg || 'github',
      });
    })
    .demandCommand(1, 'Please specify a command: configure, review, or test')
    .option('debug', {
      description: 'Enables debug logging.',
      type: 'boolean',
      default: false,
    })
    .help()
    .parse();
};
