export type ResourceId = 'food' | 'water' | 'timber' | 'medicine' | 'tools'

export interface Stock {
  id: ResourceId
  amount: number
  demand: number
}

export const priceOf = (stock: Stock) => {
  const scarcity = Math.max(0, 1 - stock.amount / Math.max(1, stock.demand))
  return Number((1 + scarcity * 2).toFixed(3))
}

export const trade = (buyer: Record<ResourceId, number>, seller: Record<ResourceId, number>, resource: ResourceId, units: number, stocks: Stock[]) => {
  const stock = stocks.find(item => item.id === resource)
  if (!stock) return { buyer, seller, stocks, transferred: 0 }
  const available = Math.min(units, seller[resource], stock.amount)
  if (available <= 0) return { buyer, seller, stocks, transferred: 0 }
  const nextBuyer = { ...buyer, [resource]: buyer[resource] + available }
  const nextSeller = { ...seller, [resource]: seller[resource] - available }
  const nextStocks = stocks.map(item => item.id === resource ? { ...item, amount: item.amount - available } : item)
  return { buyer: nextBuyer, seller: nextSeller, stocks: nextStocks, transferred: available, price: priceOf(stock) }
}

export const tickStocks = (stocks: Stock[]): Stock[] => stocks.map(item => ({
  ...item,
  amount: Math.max(0, item.amount - item.demand * 0.08 + (item.id === 'food' || item.id === 'water' ? item.demand * 0.07 : item.demand * 0.04)),
}))

export const seedStocks = (): Stock[] => [
  { id: 'food', amount: 40, demand: 24 },
  { id: 'water', amount: 50, demand: 24 },
  { id: 'timber', amount: 30, demand: 12 },
  { id: 'medicine', amount: 8, demand: 6 },
  { id: 'tools', amount: 12, demand: 8 },
]
