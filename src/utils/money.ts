import Decimal from 'decimal.js'

export function toMoney(value: number | string | Decimal) {
  return new Decimal(value || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
}

export function toRatio(value: number | string | Decimal) {
  return new Decimal(value || 0).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toNumber()
}

export function addMoney(values: Array<number | string | Decimal>) {
  return toMoney(values.reduce((sum, value) => new Decimal(sum).plus(value || 0), new Decimal(0)))
}

export function moneyEquals(left: number, right: number, tolerance = 0.01) {
  return new Decimal(left).minus(right).abs().lessThanOrEqualTo(tolerance)
}

export function formatMoney(value: number | string | null | undefined) {
  return new Decimal(value || 0).toFixed(2)
}

export function formatPercent(ratio: number | string | null | undefined) {
  return new Decimal(ratio || 0).mul(100).toDecimalPlaces(2).toNumber()
}
