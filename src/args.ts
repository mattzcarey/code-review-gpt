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
          default: 'openai:gpt-4.1-mini',
        })
        .option('reviewLanguage', {
          description: 'Specifies the target natural language for translation',
          type: 'string',
          default: 'English',
        })
        .option('platform', {
          description: 'Platform type',
          choices: ['github', 'gitlab', 'azdev', 'local'],
          type: 'string',
          default: 'local',
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
