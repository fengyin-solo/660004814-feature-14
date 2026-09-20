import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import type {
  BatchComparisonRow,
  BatchRecord,
  ComparisonSummary,
  Conformation,
  ProteinParams,
  SamplingResult,
} from '@/types'

const BATCHES_STORAGE_KEY = 'protein.compare.batches'
const SELECTION_STORAGE_KEY = 'protein.compare.selection'

function loadJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadBatches(): BatchRecord[] {
  const v = loadJSON(BATCHES_STORAGE_KEY)
  return Array.isArray(v) ? (v as BatchRecord[]) : []
}

function loadSelection(): string[] {
  const v = loadJSON(SELECTION_STORAGE_KEY)
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

/** 去重：同一批无论被提交多少次都只保留一个 */
function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)]
}

function mergeRanges(ranges: ([number, number] | null)[]): [number, number] | null {
  const valid = ranges.filter((r): r is [number, number] => r !== null)
  if (!valid.length) return null
  return [Math.min(...valid.map(r => r[0])), Math.max(...valid.map(r => r[1]))]
}

let batchSeq = 0

export const useProteinStore = defineStore('protein', () => {
  const loading = ref(false)
  const result = ref<SamplingResult | null>(null)
  const selectedConformation = ref<Conformation | null>(null)
  const selectedCluster = ref('all')

  // ---------- 多批对照 ----------
  /** 历史批次（持久化到 localStorage，返回页面后仍在） */
  const batches = ref<BatchRecord[]>(loadBatches())
  /** 已选中的批次 id（加载时去重并剔除已不存在的批次） */
  const selectedBatchIds = ref<string[]>(
    uniqueIds(loadSelection()).filter(id => batches.value.some(b => b.id === id))
  )

  watch(batches, v => localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(v)), { deep: true })
  watch(selectedBatchIds, v => localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(v)), { deep: true })

  async function runSampling(params: ProteinParams) {
    loading.value = true
    try {
      const { data } = await axios.post('/api/sample', params)
      result.value = data
      selectedConformation.value = null
      selectedCluster.value = 'all'
      recordBatch(data)
    } finally { loading.value = false }
  }

  function recordBatch(data: SamplingResult) {
    const confs = data.conformations || []
    const rangeOf = (vals: number[]): [number, number] | null =>
      vals.length ? [Math.min(...vals), Math.max(...vals)] : null
    batches.value.push({
      id: `batch-${Date.now()}-${++batchSeq}`,
      label: `批次 ${batches.value.length + 1}`,
      createdAt: Date.now(),
      params: { residues: data.params.residues, conformations: data.params.conformations },
      count: confs.length,
      stats: { ...data.stats },
      energyRange: confs.length ? [data.energyRange[0], data.energyRange[1]] : null,
      phiRange: rangeOf(confs.map(c => c.phi)),
      psiRange: rangeOf(confs.map(c => c.psi)),
    })
  }

  function selectConformation(conf: Conformation) { selectedConformation.value = conf }
  function filterByCluster(cluster: string) { selectedCluster.value = cluster }

  /** 勾选/取消勾选某一批；已选中的批次不会重复计入 */
  function toggleBatchSelection(id: string) {
    selectedBatchIds.value = selectedBatchIds.value.includes(id)
      ? selectedBatchIds.value.filter(x => x !== id)
      : [...selectedBatchIds.value, id]
  }

  /** 整组一次提交：先去重再过滤掉不存在的批次，同一批不会被算两遍 */
  function setBatchSelection(ids: string[]) {
    selectedBatchIds.value = uniqueIds(ids).filter(id => batches.value.some(b => b.id === id))
  }

  function clearBatchSelection() { selectedBatchIds.value = [] }

  function clearBatches() {
    batches.value = []
    selectedBatchIds.value = []
  }

  const paramKey = (p: ProteinParams) => `${p.residues}|${p.conformations}`

  /** 对照面板逐条展示用：参数、各分区占比、数值区间，并标出空批次与参数完全相同的批次 */
  const comparisonRows = computed<BatchComparisonRow[]>(() => {
    const paramCounts = new Map<string, number>()
    for (const b of batches.value) {
      const k = paramKey(b.params)
      paramCounts.set(k, (paramCounts.get(k) ?? 0) + 1)
    }
    return batches.value.map(b => ({
      ...b,
      empty: b.count === 0,
      duplicateParams: (paramCounts.get(paramKey(b.params)) ?? 0) > 1,
      proportions: {
        alpha: b.count ? (b.stats.alpha / b.count) * 100 : 0,
        beta: b.count ? (b.stats.beta / b.count) * 100 : 0,
        left: b.count ? (b.stats.left / b.count) * 100 : 0,
        disallowed: b.count ? (b.stats.disallowed / b.count) * 100 : 0,
      },
    }))
  })

  /** 当前选中的批次（按选择顺序，防御性去重，同一批只计入一次） */
  const selectedBatches = computed<BatchComparisonRow[]>(() => {
    const seen = new Set<string>()
    const rows: BatchComparisonRow[] = []
    for (const id of selectedBatchIds.value) {
      if (seen.has(id)) continue
      seen.add(id)
      const row = comparisonRows.value.find(r => r.id === id)
      if (row) rows.push(row)
    }
    return rows
  })

  /** 选中少于两条时不允许生成汇总 */
  const canGenerateSummary = computed(() => selectedBatches.value.length >= 2)

  const summaryBlockReason = computed(() => {
    const n = selectedBatches.value.length
    if (n >= 2) return ''
    return `生成汇总对照表至少需要选中 2 批数据，当前仅选中 ${n} 批，请在对照面板中多选几批后再生成`
  })

  /** 汇总口径：随选中批次实时更新；空批次不参与区间合并 */
  const comparisonSummary = computed<ComparisonSummary | null>(() => {
    const rows = selectedBatches.value
    if (rows.length < 2) return null
    const totalCount = rows.reduce((s, r) => s + r.count, 0)
    const regionTotals = rows.reduce(
      (acc, r) => ({
        alpha: acc.alpha + r.stats.alpha,
        beta: acc.beta + r.stats.beta,
        left: acc.left + r.stats.left,
        disallowed: acc.disallowed + r.stats.disallowed,
      }),
      { alpha: 0, beta: 0, left: 0, disallowed: 0 }
    )
    const pct = (n: number) => (totalCount ? (n / totalCount) * 100 : 0)
    return {
      rows,
      batchCount: rows.length,
      totalCount,
      regionTotals,
      proportions: {
        alpha: pct(regionTotals.alpha),
        beta: pct(regionTotals.beta),
        left: pct(regionTotals.left),
        disallowed: pct(regionTotals.disallowed),
      },
      energyRange: mergeRanges(rows.map(r => r.energyRange)),
      phiRange: mergeRanges(rows.map(r => r.phiRange)),
      psiRange: mergeRanges(rows.map(r => r.psiRange)),
    }
  })

  return {
    loading, result, selectedConformation, selectedCluster,
    runSampling, selectConformation, filterByCluster,
    batches, selectedBatchIds, comparisonRows, selectedBatches,
    canGenerateSummary, summaryBlockReason, comparisonSummary,
    toggleBatchSelection, setBatchSelection, clearBatchSelection, clearBatches,
  }
})
