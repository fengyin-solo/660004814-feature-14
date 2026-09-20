<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🧬 蛋白质折叠构象采样与分析平台</h1>
      <p class="subtitle">Ramachandran图 · LJ势能计算 · 3D骨架可视化 · 多批对照统计</p>
      <el-radio-group v-model="activeView" class="view-switch">
        <el-radio-button label="single">单批结果</el-radio-button>
        <el-radio-button label="compare">
          多批对照<span v-if="store.history.length" class="badge">{{ store.history.length }}</span>
        </el-radio-button>
      </el-radio-group>
    </header>
    <main class="app-main">
      <template v-if="activeView === 'single'">
        <ControlPanel @sample="handleSample" />
        <div class="main-grid" v-if="store.result">
          <div class="plot-area"><RamachandranPlot /></div>
          <div class="viewer-area"><ProteinViewer3D /></div>
        </div>
        <ConformationTable v-if="store.result" />
      </template>
      <BatchComparePanel v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import ControlPanel from "./components/ControlPanel.vue"
import RamachandranPlot from "./components/RamachandranPlot.vue"
import ProteinViewer3D from "./components/ProteinViewer3D.vue"
import ConformationTable from "./components/ConformationTable.vue"
import BatchComparePanel from "./components/BatchComparePanel.vue"
import { useProteinStore } from "./store/protein"
import type { ProteinParams } from "./types"

const store = useProteinStore()
const activeView = ref<'single' | 'compare'>('single')
function handleSample(params: ProteinParams) { store.runSampling(params) }
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f0f2f5}
.app-container{min-height:100vh}
.app-header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:24px 40px}
.app-header h1{font-size:1.8rem}
.subtitle{opacity:.85;margin-top:4px;font-size:.9rem}
.view-switch{margin-top:14px}
.view-switch .badge{display:inline-block;min-width:18px;margin-left:4px;padding:0 5px;border-radius:9px;background:#667eea;color:#fff;font-size:11px;line-height:18px;text-align:center}
.app-main{padding:20px 40px}
.main-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}
</style>
