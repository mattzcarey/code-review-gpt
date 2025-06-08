import dotenv from 'dotenv'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

dotenv.config()

export const getYargs = async () => {
  return yargs(hideBin(process.argv))
    .command('configure', 'Configure the tool', (yargs) => {
      return yargs.option('platform', {
        description:
          "Specifies for which platform ('github', 'gitlab' or 'azdev') the project should be configured for. Defaults to 'github'.",
        choices: ['github', 'gitlab', 'azdev'],
        type: 'string',
        default: 'github',
      })
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
        })
        .option('maxSteps', {
          description: 'Maximum number of agentic steps to take',
          type: 'number',
          default: 50,
        })
        .option('baseUrl', {
          description: 'Base URL for the platform',
          type: 'string',
        })
        .option('ignore', {
          description:
            "Array of globs which shippie ignores. If you don't provide any, sensible default will be used",
          type: 'array',
        })
        .option('customInstructions', {
          description: 'Custom instructions to be added to the review prompt',
          type: 'string',
        })
    })
    .demandCommand(1, 'Please specify a command: configure or review')
    .option('debug', {
      description: 'Enables debug logging.',
      type: 'boolean',
      default: false,
    })
    .option('telemetry', {
      description: 'Enables anonymous telemetry.',
      type: 'boolean',
      default: true,
    })
    .help()
    .parse()
}
