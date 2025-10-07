/* eslint-disable @typescript-eslint/no-explicit-any */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) {
    return `${minutes}m`
  }
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

export function groupScheduleByDay(schedule: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>()

  schedule.forEach((entry) => {
    const date = new Date(entry.start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(entry)
  })

  return grouped
}
