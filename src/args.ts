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
        .option('modelString', {
          description:
            'The model to use for generating the review. Defaults to "openai:gpt-4o-mini".',
          type: 'string',
          default: 'openai:gpt-4o-mini',
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
        .option('reviewMode', {
          description: 'Mode to use for the review',
          choices: ['default', 'agent'],
          type: 'string',
          default: 'default',
        })
        .option('remote', {
          description: 'The identifier of a remote Pull Request to review',
          type: 'string',
          default: undefined,
        })
        .option('diffContext', {
          description: 'Number of context lines for git diff.',
          type: 'number',
          default: 20,
        })
        .option('ci', {
          description: 'CI environment type',
          choices: ['github', 'gitlab', 'azdev'],
          type: 'string',
          coerce: (arg) => arg || 'github',
        });
    })
    .demandCommand(1, 'Please specify a command: configure or review')
    .option('debug', {
      description: 'Enables debug logging.',
      type: 'boolean',
      default: false,
    })
    .help()
    .parse();
};
