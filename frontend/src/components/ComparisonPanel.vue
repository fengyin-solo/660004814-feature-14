<template>
  <div class="panel compare-panel">
    <div class="panel-header">
      <h3>🧪 多批结果对照面板</h3>
      <div class="header-actions" v-if="rows.length">
        <span class="selected-info">已选 {{ selectedCount }} / {{ rows.length }} 批</span>
        <el-button size="small" @click="selectAll">全选</el-button>
        <el-button size="small" @click="store.clearBatchSelection()">清空选择</el-button>
        <el-button size="small" type="danger" plain @click="onClearHistory">清空历史</el-button>
      </div>
    </div>

    <el-empty v-if="!rows.length" :image-size="90" description="暂无采样批次，请先在上方生成构象采样" />

    <template v-else>
      <!-- 逐条列出每一批的参数、各分区占比与数值区间 -->
      <el-table :data="rows" stripe size="small" max-height="300">
        <el-table-column width="44" align="center">
          <template #header>
            <el-checkbox :model-value="allSelected" :indeterminate="indeterminate" @change="toggleAll" />
          </template>
          <template #default="{ row }">
            <el-checkbox :model-value="isSelected(row.id)" @change="store.toggleBatchSelection(row.id)" />
          </template>
        </el-table-column>
        <el-table-column label="批次" width="140">
          <template #default="{ row }">
            <div class="batch-cell">
              <span class="batch-label">{{ row.label }}</span>
              <span class="batch-time">{{ formatTime(row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="参数" width="170">
          <template #default="{ row }">
            残基数 {{ row.params.residues }} · 构象 {{ row.params.conformations }}
          </template>
        </el-table-column>
        <el-table-column label="各分区占比" min-width="240">
          <template #default="{ row }">
            <span v-if="row.empty" class="na">—（无数据）</span>
            <span v-else class="props">
              <span class="prop a">α {{ pct(row.proportions.alpha) }}</span>
              <span class="prop b">β {{ pct(row.proportions.beta) }}</span>
              <span class="prop l">左手 {{ pct(row.proportions.left) }}</span>
              <span class="prop d">禁阻 {{ pct(row.proportions.disallowed) }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="数值区间" min-width="250">
          <template #default="{ row }">
            <span v-if="row.empty" class="na">—（无数据）</span>
            <div v-else class="ranges">
              <div>能量 {{ fmtRange(row.energyRange, 3) }} kcal/mol</div>
              <div>φ {{ fmtRange(row.phiRange, 1) }}° · ψ {{ fmtRange(row.psiRange, 1) }}°</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标记" width="160">
          <template #default="{ row }">
            <el-tag v-if="row.empty" type="info" size="small" class="flag">数据为空</el-tag>
            <el-tag v-if="row.duplicateParams" type="warning" size="small" class="flag">参数完全相同</el-tag>
            <span v-if="!row.empty && !row.duplicateParams" class="na">—</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="summary-actions">
        <el-button type="primary" :disabled="!store.canGenerateSummary" @click="summaryVisible = true">
          📊 生成汇总对照表
        </el-button>
        <span v-if="!store.canGenerateSummary" class="reason">⚠ {{ store.summaryBlockReason }}</span>
        <span v-else class="hint">汇总口径随选中批次实时更新</span>
      </div>

      <div v-if="summaryVisible" class="summary-area">
        <el-alert
          v-if="!store.comparisonSummary"
          type="warning"
          show-icon
          :closable="false"
          :title="store.summaryBlockReason"
        />
        <el-table
          v-else
          :data="store.comparisonSummary.rows"
          border
          size="small"
          show-summary
          :summary-method="summaryMethod"
        >
          <el-table-column label="批次" min-width="150">
            <template #default="{ row }">
              <span class="batch-label">{{ row.label }}</span>
              <el-tag v-if="row.empty" type="info" size="small" class="flag">空</el-tag>
              <el-tag v-if="row.duplicateParams" type="warning" size="small" class="flag">参数相同</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="残基数" width="80" align="right">
            <template #default="{ row }">{{ row.params.residues }}</template>
          </el-table-column>
          <el-table-column label="构象数" width="90" align="right">
            <template #default="{ row }">{{ row.count }}</template>
          </el-table-column>
          <el-table-column label="α-螺旋" width="90" align="right">
            <template #default="{ row }">{{ row.empty ? '—' : pct(row.proportions.alpha) }}</template>
          </el-table-column>
          <el-table-column label="β-折叠" width="90" align="right">
            <template #default="{ row }">{{ row.empty ? '—' : pct(row.proportions.beta) }}</template>
          </el-table-column>
          <el-table-column label="左手螺旋" width="90" align="right">
            <template #default="{ row }">{{ row.empty ? '—' : pct(row.proportions.left) }}</template>
          </el-table-column>
          <el-table-column label="禁阻区" width="90" align="right">
            <template #default="{ row }">{{ row.empty ? '—' : pct(row.proportions.disallowed) }}</template>
          </el-table-column>
          <el-table-column label="能量区间 (kcal/mol)" min-width="160">
            <template #default="{ row }">{{ fmtRange(row.energyRange, 3) }}</template>
          </el-table-column>
          <el-table-column label="φ 区间 (°)" min-width="140">
            <template #default="{ row }">{{ fmtRange(row.phiRange, 1) }}</template>
          </el-table-column>
          <el-table-column label="ψ 区间 (°)" min-width="140">
            <template #default="{ row }">{{ fmtRange(row.psiRange, 1) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useProteinStore } from '../store/protein'

const store = useProteinStore()
const summaryVisible = ref(false)

const rows = computed(() => store.comparisonRows)
const selectedCount = computed(() => store.selectedBatches.length)
const allSelected = computed(() => rows.value.length > 0 && selectedCount.value === rows.value.length)
const indeterminate = computed(() => selectedCount.value > 0 && !allSelected.value)

const isSelected = (id: string) => store.selectedBatchIds.includes(id)

function toggleAll() {
  if (allSelected.value) store.clearBatchSelection()
  else selectAll()
}

/** 整组一次提交：store 内会去重，同一批不会被算两遍 */
function selectAll() {
  store.setBatchSelection(rows.value.map(r => r.id))
}

async function onClearHistory() {
  try {
    await ElMessageBox.confirm('确定清空全部历史批次与当前选择吗？', '清空历史', { type: 'warning' })
    store.clearBatches()
    summaryVisible.value = false
  } catch { /* 用户取消 */ }
}

const pct = (v: number) => `${v.toFixed(1)}%`
const fmtRange = (r: [number, number] | null, digits: number) =>
  r ? `${r[0].toFixed(digits)} ~ ${r[1].toFixed(digits)}` : '—'
const formatTime = (ts: number) => new Date(ts).toLocaleString('zh-CN', { hour12: false })

/** 汇总行：按当前选中批次加权合并，随选择实时更新 */
function summaryMethod(): string[] {
  const s = store.comparisonSummary
  if (!s) return []
  return [
    `汇总（${s.batchCount} 批）`,
    '—',
    String(s.totalCount),
    s.totalCount ? pct(s.proportions.alpha) : '—',
    s.totalCount ? pct(s.proportions.beta) : '—',
    s.totalCount ? pct(s.proportions.left) : '—',
    s.totalCount ? pct(s.proportions.disallowed) : '—',
    fmtRange(s.energyRange, 3),
    fmtRange(s.phiRange, 1),
    fmtRange(s.psiRange, 1),
  ]
}
</script>

<style scoped>
.panel { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.compare-panel { margin-top: 16px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.panel-header h3 { color: #333; font-size: 15px; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.selected-info { font-size: 13px; color: #666; margin-right: 4px; }
.batch-cell { display: flex; flex-direction: column; }
.batch-label { font-weight: 600; color: #333; }
.batch-time { font-size: 12px; color: #999; }
.props { display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; }
.prop { padding: 1px 6px; border-radius: 4px; background: #f4f4f5; }
.prop.a { color: #0e9f8f; }
.prop.b { color: #e0495f; }
.prop.l { color: #2f7fd6; }
.prop.d { color: #999; }
.ranges { font-size: 12px; color: #555; line-height: 1.6; }
.na { color: #bbb; }
.flag { margin-left: 4px; }
.summary-actions { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.reason { font-size: 13px; color: #e6a23c; }
.hint { font-size: 12px; color: #999; }
.summary-area { margin-top: 14px; }
</style>
