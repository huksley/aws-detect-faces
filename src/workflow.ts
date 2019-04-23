import { logger as log } from './logger'

// (arg: <T>): <T>
export const notify = (
  status: 'SUCCESS' | 'FAILED',
  payload: { taskId?: string; processId?: string },
): Promise<void> => {
  log.info('Notify workflow on task status ' + status, payload)
  return Promise.resolve()
}
