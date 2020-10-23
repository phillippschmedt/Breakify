import { SSL_OP_EPHEMERAL_RSA } from "constants"

class EventScheduler {
  timer: NodeJS.Timeout | null
  delay: number
  callback: () => void
  startedAt: number | null

  constructor(func: () => void, delay: number) {
    this.timer = null
    this.delay = delay
    this.callback = func
    this.startedAt = null
  }

  start() {
    this.startedAt = Date.now()
    this.timer = setTimeout(this.callback, this.delay*1000)
  }

  cancel() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

export default EventScheduler


