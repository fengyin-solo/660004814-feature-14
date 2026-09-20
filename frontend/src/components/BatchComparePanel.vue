<template>
  <div class="compare-panel">
    <div class="panel">
      <div class="panel-header">
        <h3>🗂️ 多批结果对照</h3>
        <span class="hint">勾选需要对照的批次（同一批重复选择只计一次）</span>
      </div>

      <el-empty v-if="store.history.length === 0" description="暂无采样批次，请先在“单批结果”中生成构象采样" :image-size="80" />

      <template v-else>
        <div class="select-toolbar">
          <el-checkbox
            :model-value="allChecked"
            :indeterminate="indeterminate"
            @change="onCheckAll"
          >全选</el-checkbox>
          <el-button link type="primary" size="small" @click="store.clearSelectedBatches()">清空选择</el-button>
          <span class="selected-count">
            已选 <b>{{ store.selectedBatchIds.length }}</b> / {{ store.history.length }} 批
          </span>
        </div>

        <el-checkbox-group
          class="batch-checklist"
          :model-value="store.selectedBatchIds"
          @change="onSelectionChange"
        >
          <el-checkbox
            v-for="b in store.history"
            :key="b.id"
            :label="b.id"
            class="batch-checkbox"
          >
            <span class="batch-item">
              <span class="batch-name">{{ b.label }}</span>
              <span class="batch-meta">
                {{ formatTime(b.createdAt) }} · 残基 {{ b.params.residues }} · 构象 {{ b.params.conformations }}
              </span>
              <el-tag v-if="isEmptyBatch(b)" type="info" size="small">数据为空</el-tag>
              <el-tag v-if="duplicateParamIds.has(b.id)" type="warning" size="small">参数相同</el-tag>
            </span>
          </el-checkbox>
        </el-checkbox-group>

        <div class="generate-bar">
          <el-button type="primary" :disabled="store.selectedBatchIds.length < 2" @click="generated = true">
            📊 生成汇总对照表
          </el-button>
          <span v-if="store.selectedBatchIds.length < 2" class="reason">
            至少需要选择 <b>两批</b> 才能生成对照表（当前已选 {{ store.selectedBatchIds.length }} 批）
          </span>
          <span v-else class="reason ok">已满足生成条件，点击按钮生成；之后调整勾选，汇总口径会自动更新</span>
        </div>
      </template>
    </div>

    <!-- 逐条明细：每一批的参数、各分区占比与数值区间 -->
    <div class="panel" v-if="summaries.length > 0">
      <h3 class="section-title">📝 各批明细（{{ summaries.length }} 批）</h3>
      <div v-for="s in summaries" :key="s.batch.id" class="batch-card" :class="{ 'is-empty': s.empty }">
        <div class="batch-card-head">
          <div>
            <span class="batch-name">{{ s.batch.label }}</span>
            <span class="batch-meta">{{ formatTime(s.batch.createdAt) }}</span>
          </div>
          <div>
            <el-tag v-if="s.empty" type="info" size="small">数据为空</el-tag>
            <el-tag v-if="duplicateParamIds.has(s.batch.id)" type="warning" size="small">参数相同</el-tag>
          </div>
        </div>

        <el-alert
          v-if="s.empty"
          type="warning"
          :closable="false"
          show-icon
          title="该批数据为空：无采样结果，分区占比与数值区间均不可用，对照表中以 — 占位。"
          class="empty-alert"
        />

        <template v-else>
          <div class="param-row">
            <span>参数：残基数 <b>{{ s.batch.params.residues }}</b></span>
            <span>构象数量 <b>{{ s.batch.params.conformations }}</b></span>
            <span>实际样本 <b>{{ s.total }}</b></span>
          </div>

          <div class="region-block">
            <div class="region-title">各分区占比</div>
            <div v-for="r in s.regions" :key="r.key" class="region-row">
              <span class="region-label" :style="{ color: regionColors[r.key] }">{{ r.label }}</span>
              <el-progress
                :percentage="ratioPercent(r.ratio)"
                :stroke-width="14"
                :color="regionColors[r.key]"
                class="region-bar"
              />
              <span class="region-count">{{ r.count }} 条 · {{ formatPercent(r.ratio) }}</span>
            </div>
          </div>

          <div class="range-block">
            <div class="range-item"><span>φ 区间</span><b>{{ formatRange(s.phiMin, s.phiMax, 2) }}°</b></div>
            <div class="range-item"><span>ψ 区间</span><b>{{ formatRange(s.psiMin, s.psiMax, 2) }}°</b></div>
            <div class="range-item"><span>LJ 能量区间</span><b>{{ formatRange(s.energyMin, s.energyMax, 3) }}</b></div>
          </div>
        </template>
      </div>
    </div>

    <!-- 汇总对照表 -->
    <div class="panel" v-if="generated">
      <h3 class="section-title">
        📋 汇总对照表
        <span class="table-note">（按当前勾选的 {{ summaries.length }} 批统计，调整勾选自动更新）</span>
      </h3>

      <el-alert
        v-if="summaries.length < 2"
        type="warning"
        :closable="false"
        show-icon
        :title="`对照至少需要两批，当前仅剩 ${summaries.length} 批，请重新勾选；重复选择同一批不会重复计入。`"
      />

      <el-table
        v-else
        :data="summaryRows"
        border
        stripe
        size="small"
        class="summary-table"
      >
        <el-table-column label="对照指标" prop="metric" width="150" fixed />
        <el-table-column v-for="s in summaries" :key="s.batch.id" :width="190" align="center">
          <template #header>
            <div class="col-head">
              <span>{{ s.batch.label }}</span>
              <el-tag v-if="s.empty" type="info" size="small">空</el-tag>
              <el-tag v-if="duplicateParamIds.has(s.batch.id)" type="warning" size="small">参数相同</el-tag>
            </div>
          </template>
          <template #default="{ row }">
            <span :class="{ 'cell-empty': s.empty && row.key !== 'status' }">{{ row.values[s.batch.id] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProteinStore } from '../store/protein'
import {
  isEmptyBatch, findDuplicateParamIds, summarizeBatch,
  formatPercent, formatRange, formatTime,
} from '../utils/batchStats'

const store = useProteinStore()
const generated = ref(false)

const regionColors: Record<string, string> = {
  'alpha-helix': '#4ecdc4',
  'beta-sheet': '#ff6b6b',
  'left-helix': '#45b7d1',
  'disallowed': '#c8cdd4',
}

// 去重后的勾选批次（store 内已用 Set 去重，整组提交也不会重复）
const summaries = computed(() => store.selectedBatches.map(summarizeBatch))
const duplicateParamIds = computed(() => findDuplicateParamIds(store.selectedBatches))

const allChecked = computed(() =>
  store.history.length > 0 && store.selectedBatchIds.length === store.history.length
)
const indeterminate = computed(() =>
  store.selectedBatchIds.length > 0 && store.selectedBatchIds.length < store.history.length
)

function onSelectionChange(ids: string[]) {
  // el-checkbox-group 回传的值统一交给 store 去重
  store.setSelectedBatches(ids)
}
function onCheckAll(checked: boolean | string | number) {
  if (checked) store.selectAllBatches()
  else store.clearSelectedBatches()
}
function ratioPercent(ratio: number) {
  return Number((ratio * 100).toFixed(2))
}

// 汇总表行：口径直接派生自当前勾选，勾选变化即更新
const summaryRows = computed(() => {
  const list = summaries.value
  const cell = (batchId: string, fn: (s: ReturnType<typeof summarizeBatch>) => string) => {
    const s = list.find(x => x.batch.id === batchId)!
    return s.empty ? '—' : fn(s)
  }

  const rows: { key: string; metric: string; values: Record<string, string> }[] = [
    {
      key: 'time', metric: '生成时间',
      values: Object.fromEntries(list.map(s => [s.batch.id, formatTime(s.batch.createdAt)])),
    },
    {
      key: 'status', metric: '数据状态',
      values: Object.fromEntries(list.map(s => [
        s.batch.id,
        s.empty ? '数据为空' : (duplicateParamIds.value.has(s.batch.id) ? '正常 · 参数相同' : '正常'),
      ])),
    },
    {
      key: 'residues', metric: '残基数',
      values: Object.fromEntries(list.map(s => [s.batch.id, String(s.batch.params.residues)])),
    },
    {
      key: 'conformations', metric: '构象数量（参数）',
      values: Object.fromEntries(list.map(s => [s.batch.id, String(s.batch.params.conformations)])),
    },
    {
      key: 'total', metric: '实际样本数',
      values: Object.fromEntries(list.map(s => [s.batch.id, cell(s.batch.id, x => String(x.total))])),
    },
  ]

  for (const region of list[0]?.regions ?? []) {
    rows.push({
      key: `region-${region.key}`,
      metric: `${region.label} 占比`,
      values: Object.fromEntries(list.map(s => {
        const r = s.regions.find(x => x.key === region.key)!
        return [s.batch.id, s.empty ? '—' : `${r.count} 条 / ${formatPercent(r.ratio)}`]
      })),
    })
  }

  rows.push(
    {
      key: 'phi', metric: 'φ 数值区间',
      values: Object.fromEntries(list.map(s => [s.batch.id, cell(s.batch.id, x => `${formatRange(x.phiMin, x.phiMax, 2)}°`)])),
    },
    {
      key: 'psi', metric: 'ψ 数值区间',
      values: Object.fromEntries(list.map(s => [s.batch.id, cell(s.batch.id, x => `${formatRange(x.psiMin, x.psiMax, 2)}°`)])),
    },
    {
      key: 'energy', metric: 'LJ 能量区间',
      values: Object.fromEntries(list.map(s => [s.batch.id, cell(s.batch.id, x => formatRange(x.energyMin, x.energyMax, 3))])),
    },
  )

  return rows
})
</script>

<style scoped>
.compare-panel { display: flex; flex-direction: column; gap: 16px; }
.panel { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.panel-header { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.panel-header h3 { color: #333; font-size: 15px; }
.hint { font-size: 12px; color: #999; }
.section-title { color: #333; font-size: 15px; margin-bottom: 12px; }
.table-note { font-size: 12px; font-weight: normal; color: #999; }

.select-toolbar { display: flex; align-items: center; gap: 12px; margin: 12px 0 8px; }
.selected-count { margin-left: auto; font-size: 13px; color: #666; }

.batch-checklist { display: flex; flex-direction: column; gap: 6px; }
.batch-checkbox { width: 100%; height: auto; padding: 6px 8px; border-radius: 6px; }
.batch-checkbox:hover { background: #f5f7fa; }
.batch-item { display: inline-flex; align-items: center; gap: 10px; }
.batch-name { font-weight: 600; color: #333; }
.batch-meta { color: #888; font-size: 12px; }

.generate-bar { display: flex; align-items: center; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
.reason { font-size: 13px; color: #e6a23c; }
.reason.ok { color: #67c23a; }

.batch-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; }
.batch-card.is-empty { background: #fafafa; }
.batch-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.empty-alert { margin: 6px 0; }

.param-row { display: flex; gap: 24px; font-size: 13px; color: #555; margin-bottom: 12px; flex-wrap: wrap; }

.region-block { margin-bottom: 12px; }
.region-title { font-size: 13px; color: #666; margin-bottom: 6px; }
.region-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.region-label { width: 70px; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.region-bar { flex: 1; }
.region-count { width: 130px; text-align: right; font-size: 12px; color: #666; flex-shrink: 0; }

.range-block { display: flex; gap: 28px; flex-wrap: wrap; font-size: 13px; }
.range-item { display: flex; flex-direction: column; gap: 2px; }
.range-item span { color: #999; font-size: 12px; }

.col-head { display: inline-flex; flex-direction: column; align-items: center; gap: 2px; }
.summary-table { width: auto; min-width: 100%; }
.cell-empty { color: #bbb; }
</style>
