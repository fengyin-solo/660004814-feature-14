export interface Conformation {
  id: number
  phi: number
  psi: number
  energy: number
  region: string
  cluster: string
}

export interface ProteinParams {
  residues: number
  conformations: number
}

export interface SamplingResult {
  params: ProteinParams
  conformations: Conformation[]
  energyRange: [number, number]
  stats: { alpha: number; beta: number; left: number; disallowed: number }
}

export interface BatchRecord {
  id: string
  label: string
  createdAt: number
  params: ProteinParams
  /** null 或 conformations 为空均视为“空批次” */
  result: SamplingResult | null
}
