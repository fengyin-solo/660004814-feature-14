/** 选中批次 ID 去重：保持顺序、去掉重复项，保证同一批不会被算两遍 */
export function dedupeBatchIds(ids) {
    return Array.from(new Set(ids));
}
/** 空批次：没有结果对象，或构象列表为空 */
export function isEmptyBatch(batch) {
    return !batch.result || batch.result.conformations.length === 0;
}
/** 参数口径键：参数完全相同的批次据此标出 */
export function paramsKey(params) {
    return `residues=${params.residues}|conformations=${params.conformations}`;
}
/**
 * 在给定批次集合内，找出“参数与另一批完全相同”的批次 id。
 * 空批次不参与参数重复判定。
 */
export function findDuplicateParamIds(batches) {
    const groups = new Map();
    for (const b of batches) {
        if (isEmptyBatch(b))
            continue;
        const key = paramsKey(b.params);
        const list = groups.get(key) ?? [];
        list.push(b.id);
        groups.set(key, list);
    }
    const dup = new Set();
    for (const ids of groups.values()) {
        if (ids.length > 1)
            ids.forEach(id => dup.add(id));
    }
    return dup;
}
export const REGION_META = [
    { key: 'alpha-helix', label: 'α-螺旋' },
    { key: 'beta-sheet', label: 'β-折叠' },
    { key: 'left-helix', label: '左手螺旋' },
    { key: 'disallowed', label: '禁阻区' },
];
/** 以实际构象列表为准统计各分区占比与数值区间（口径前后端一致） */
export function summarizeBatch(batch) {
    const empty = isEmptyBatch(batch);
    const confs = empty ? [] : batch.result.conformations;
    const total = confs.length;
    const counts = {
        'alpha-helix': 0, 'beta-sheet': 0, 'left-helix': 0, 'disallowed': 0,
    };
    let energyMin = null;
    let energyMax = null;
    let phiMin = null;
    let phiMax = null;
    let psiMin = null;
    let psiMax = null;
    for (const c of confs) {
        counts[c.region] = (counts[c.region] ?? 0) + 1;
        energyMin = energyMin === null ? c.energy : Math.min(energyMin, c.energy);
        energyMax = energyMax === null ? c.energy : Math.max(energyMax, c.energy);
        phiMin = phiMin === null ? c.phi : Math.min(phiMin, c.phi);
        phiMax = phiMax === null ? c.phi : Math.max(phiMax, c.phi);
        psiMin = psiMin === null ? c.psi : Math.min(psiMin, c.psi);
        psiMax = psiMax === null ? c.psi : Math.max(psiMax, c.psi);
    }
    const regions = REGION_META.map(({ key, label }) => ({
        key,
        label,
        count: counts[key] ?? 0,
        ratio: total === 0 ? 0 : (counts[key] ?? 0) / total,
    }));
    return {
        batch, empty, total,
        energyMin, energyMax, phiMin, phiMax, psiMin, psiMax,
        regions,
    };
}
/** 百分比：0.1234 -> 12.34% */
export function formatPercent(ratio) {
    return `${(ratio * 100).toFixed(2)}%`;
}
/** 数值区间：两端都存在时返回 a ~ b，否则返回 — */
export function formatRange(min, max, digits = 3) {
    if (min === null || max === null)
        return '—';
    return `${min.toFixed(digits)} ~ ${max.toFixed(digits)}`;
}
export function formatTime(ts) {
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
