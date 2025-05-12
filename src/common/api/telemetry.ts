import { ulid } from 'ulid'
import packageJson from '../../../package.json'
import type { PlatformProvider } from '../platform/provider'
import type { ParsedArgs } from '../types'

enum EventType {
  REVIEW_STARTED = 'review_started',
  REVIEW_STOPPED = 'review_stopped',
  CONFIGURE = 'configure',
}

export class Telemetry {
  url = 'https://telemetry.shippie.dev/events'
  run_id: string
  repo_id: string
  args: ParsedArgs
  provider: PlatformProvider

  constructor(args: ParsedArgs, provider: PlatformProvider) {
    this.args = args
    this.run_id = ulid()
    this.provider = provider
    this.repo_id = this.provider.getRepoId()
  }

  startReview() {
    const event = {
      event_type: EventType.REVIEW_STARTED,
      repo_id: this.repo_id,
      run_id: this.run_id,
      args: this.args,
      system: {
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        shippie_version: packageJson.version,
      },
    }

    fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(event),
    })
  }
}
