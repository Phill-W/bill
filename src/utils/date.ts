import dayjs, { type Dayjs } from 'dayjs'

export function calcDays(start: string, end: string) {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  if (!startDate.isValid() || !endDate.isValid()) return 0
  return endDate.diff(startDate, 'day') + 1
}

export function listDates(start: string, end: string) {
  const dates: string[] = []
  let current = dayjs(start)
  const endDate = dayjs(end)
  while (current.isValid() && endDate.isValid() && (current.isSame(endDate) || current.isBefore(endDate))) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  return dates
}

export function getWeekName(date: string | Dayjs) {
  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weeks[dayjs(date).day()] || ''
}

export function isAfterToday(date: string) {
  return dayjs(date).isAfter(dayjs(), 'day')
}

export function formatDate(date: string | Date | Dayjs) {
  return dayjs(date).format('YYYY-MM-DD')
}
