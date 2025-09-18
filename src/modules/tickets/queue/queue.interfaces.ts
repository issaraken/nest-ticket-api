export interface TicketNotifyJobData {
  ticketId: string
  action: 'created' | 'updated'
  previousStatus?: string
  currentStatus: string
}

export interface TicketSlaJobData {
  ticketId: string
  createdAt: Date
  priority: string
  slaMinutes: number
}
