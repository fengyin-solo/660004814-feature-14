import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { dedupeBatchIds } from '@/utils/batchStats';
const SELECTED_STORAGE_KEY = 'protein-compare-selected-batch-ids';
function loadSelectedIds() {
    try {
        const raw = localStorage.getItem(SELECTED_STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : [];
    }
    catch {
        return [];
    }
}
export const useProteinStore = defineStore('protein', () => {
    const loading = ref(false);
    const result = ref(null);
    const selectedConformation = ref(null);
    const selectedCluster = ref('all');
    const history = ref([]);
    let batchSeq = 0;
    // 选中批次统一走 Set 去重：重复勾选/整组提交都不会把同一批算两遍
    const selectedBatchIds = ref(dedupeBatchIds(loadSelectedIds()));
    const selectedBatches = computed(() => {
        const map = new Map(history.value.map(b => [b.id, b]));
        return selectedBatchIds.value.map(id => map.get(id)).filter((b) => !!b);
    });
    async function runSampling(params) {
        loading.value = true;
        try {
            const { data } = await axios.post('/api/sample', params);
            result.value = data;
            selectedConformation.value = null;
            selectedCluster.value = 'all';
            batchSeq += 1;
            const batch = {
                id: `batch-${Date.now()}-${batchSeq}`,
                label: `批次 ${history.value.length + 1}`,
                createdAt: Date.now(),
                params: { ...params },
                result: data,
            };
            history.value = [...history.value, batch];
            // 新生成的批次默认纳入对照候选
            selectedBatchIds.value = dedupeBatchIds([...selectedBatchIds.value, batch.id]);
        }
        finally {
            loading.value = false;
        }
    }
    function selectConformation(conf) { selectedConformation.value = conf; }
    function filterByCluster(cluster) { selectedCluster.value = cluster; }
    function setSelectedBatches(ids) {
        selectedBatchIds.value = dedupeBatchIds(ids);
    }
    function toggleBatch(id, checked) {
        const set = new Set(selectedBatchIds.value);
        if (checked)
            set.add(id);
        else
            set.delete(id);
        selectedBatchIds.value = Array.from(set);
    }
    function selectAllBatches() {
        selectedBatchIds.value = dedupeBatchIds(history.value.map(b => b.id));
    }
    function clearSelectedBatches() {
        selectedBatchIds.value = [];
    }
    // 历史变化后剔除已不存在的批次（如刷新后旧选择失效），并持久化；返回后仍保留上次选择
    watch(history, () => {
        const valid = new Set(history.value.map(b => b.id));
        selectedBatchIds.value = selectedBatchIds.value.filter(id => valid.has(id));
    });
    watch(selectedBatchIds, (ids) => {
        try {
            localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(ids));
        }
        catch {
            /* localStorage 不可用时静默降级为内存保留 */
        }
    }, { deep: true });
    return {
        loading, result, selectedConformation, selectedCluster,
        history, selectedBatchIds, selectedBatches,
        runSampling, selectConformation, filterByCluster,
        setSelectedBatches, toggleBatch, selectAllBatches, clearSelectedBatches,
    };
});
