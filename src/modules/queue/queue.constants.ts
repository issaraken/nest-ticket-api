export const QUEUE_NAMES = {
  TICKET_NOTIFY: 'ticket-notify',
  TICKET_SLA: 'ticket-sla',
}

export const JOB_NAMES = {
  NOTIFY_TICKET_CREATED: 'notify-ticket-created',
  NOTIFY_TICKET_UPDATED: 'notify-ticket-updated',
  CHECK_TICKET_SLA: 'check-ticket-sla',
}

export const JOB_OPTIONS = {
  NOTIFY: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
  SLA: {
    attempts: 1,
    removeOnComplete: 100,
    removeOnFail: 50,
  },
}
