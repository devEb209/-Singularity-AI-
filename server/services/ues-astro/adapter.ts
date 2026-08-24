export const astroAdapters = [
  { id: 'internal-kepler', status: 'IMPLEMENTED' as const, fetchedRemote: false as const },
  { id: 'nasa-horizons', status: 'ADAPTER_AVAILABLE' as const, fetchedRemote: false as const },
  { id: 'simbad', status: 'ADAPTER_AVAILABLE' as const, fetchedRemote: false as const },
  { id: 'gaia-archive', status: 'ADAPTER_AVAILABLE' as const, fetchedRemote: false as const },
]

export const probeAstro = (id: string) => {
  const adapter = astroAdapters.find(item => item.id === id) ?? astroAdapters[1]
  return {
    ...adapter,
    liveRemote: false as const,
    nBodyUniverse: false as const,
    reason: adapter.status === 'IMPLEMENTED' ? 'local-kepler-sample' : 'ADAPTER_REQUIRED',
  }
}
