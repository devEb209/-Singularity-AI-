import { SnbCompeteCore } from './core.js'

export { SnbCompeteCore } from './core.js'
export { generationScore } from './score.js'

export class SnbCompeteService {
  private core = new SnbCompeteCore()
  status() {
    return this.core.evaluate()
  }
}
