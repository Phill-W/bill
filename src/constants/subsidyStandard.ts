export const TRAFFIC_STANDARD = 40
export const COMMUNICATION_STANDARD = 40

export function getMealStandard(cityType: string) {
  if (cityType === '1') return 100
  if (cityType === '2') return 80
  if (cityType === '3') return 50
  return 0
}
