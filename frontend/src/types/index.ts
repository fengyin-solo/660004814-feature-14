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

export interface RegionStats {
  alpha: number
  beta: number
  left: number
  disallowed: number
}

export interface SamplingResult {
  params: ProteinParams
  conformations: Conformation[]
  energyRange: [number, number]
  stats: RegionStats
}

/** 一次采样形成的历史批次（仅保存对照所需的元数据） */
export interface BatchRecord {
  id: string
  label: string
  createdAt: number
  params: ProteinParams
  count: number
  stats: RegionStats
  energyRange: [number, number] | null
  phiRange: [number, number] | null
  psiRange: [number, number] | null
}

/** 对照面板中逐条展示的一行：在批次元数据上附加占比与标记 */
export interface BatchComparisonRow extends BatchRecord {
  empty: boolean
  duplicateParams: boolean
  proportions: RegionStats
}

/** 按选中批次加权合并的汇总口径 */
export interface ComparisonSummary {
  rows: BatchComparisonRow[]
  batchCount: number
  totalCount: number
  regionTotals: RegionStats
  proportions: RegionStats
  energyRange: [number, number] | null
  phiRange: [number, number] | null
  psiRange: [number, number] | null
}
