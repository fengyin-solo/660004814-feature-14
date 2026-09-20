/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, ref } from 'vue';
import { useProteinStore } from '../store/protein';
import { isEmptyBatch, findDuplicateParamIds, summarizeBatch, formatPercent, formatRange, formatTime, } from '../utils/batchStats';
const store = useProteinStore();
const generated = ref(false);
const regionColors = {
    'alpha-helix': '#4ecdc4',
    'beta-sheet': '#ff6b6b',
    'left-helix': '#45b7d1',
    'disallowed': '#c8cdd4',
};
// 去重后的勾选批次（store 内已用 Set 去重，整组提交也不会重复）
const summaries = computed(() => store.selectedBatches.map(summarizeBatch));
const duplicateParamIds = computed(() => findDuplicateParamIds(store.selectedBatches));
const allChecked = computed(() => store.history.length > 0 && store.selectedBatchIds.length === store.history.length);
const indeterminate = computed(() => store.selectedBatchIds.length > 0 && store.selectedBatchIds.length < store.history.length);
function onSelectionChange(ids) {
    // el-checkbox-group 回传的值统一交给 store 去重
    store.setSelectedBatches(ids);
}
function onCheckAll(checked) {
    if (checked)
        store.selectAllBatches();
    else
        store.clearSelectedBatches();
}
function ratioPercent(ratio) {
    return Number((ratio * 100).toFixed(2));
}
// 汇总表行：口径直接派生自当前勾选，勾选变化即更新
const summaryRows = computed(() => {
    const list = summaries.value;
    const cell = (batchId, fn) => {
        const s = list.find(x => x.batch.id === batchId);
        return s.empty ? '—' : fn(s);
    };
    const rows = [
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
    ];
    for (const region of list[0]?.regions ?? []) {
        rows.push({
            key: `region-${region.key}`,
            metric: `${region.label} 占比`,
            values: Object.fromEntries(list.map(s => {
                const r = s.regions.find(x => x.key === region.key);
                return [s.batch.id, s.empty ? '—' : `${r.count} 条 / ${formatPercent(r.ratio)}`];
            })),
        });
    }
    rows.push({
        key: 'phi', metric: 'φ 数值区间',
        values: Object.fromEntries(list.map(s => [s.batch.id, cell(s.batch.id, x => `${formatRange(x.phiMin, x.phiMax, 2)}°`)])),
    }, {
        key: 'psi', metric: 'ψ 数值区间',
        values: Object.fromEntries(list.map(s => [s.batch.id, cell(s.batch.id, x => `${formatRange(x.psiMin, x.psiMax, 2)}°`)])),
    }, {
        key: 'energy', metric: 'LJ 能量区间',
        values: Object.fromEntries(list.map(s => [s.batch.id, cell(s.batch.id, x => formatRange(x.energyMin, x.energyMax, 3))])),
    });
    return rows;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['reason']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['range-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "compare-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hint" },
});
if (__VLS_ctx.store.history.length === 0) {
    const __VLS_0 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无采样批次，请先在“单批结果”中生成构象采样",
        imageSize: (80),
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无采样批次，请先在“单批结果”中生成构象采样",
        imageSize: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "select-toolbar" },
    });
    const __VLS_4 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.allChecked),
        indeterminate: (__VLS_ctx.indeterminate),
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.allChecked),
        indeterminate: (__VLS_ctx.indeterminate),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onChange: (__VLS_ctx.onCheckAll)
    };
    __VLS_7.slots.default;
    var __VLS_7;
    const __VLS_12 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.store.history.length === 0))
                return;
            __VLS_ctx.store.clearSelectedBatches();
        }
    };
    __VLS_15.slots.default;
    var __VLS_15;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected-count" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (__VLS_ctx.store.selectedBatchIds.length);
    (__VLS_ctx.store.history.length);
    const __VLS_20 = {}.ElCheckboxGroup;
    /** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onChange': {} },
        ...{ class: "batch-checklist" },
        modelValue: (__VLS_ctx.store.selectedBatchIds),
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onChange': {} },
        ...{ class: "batch-checklist" },
        modelValue: (__VLS_ctx.store.selectedBatchIds),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onChange: (__VLS_ctx.onSelectionChange)
    };
    __VLS_23.slots.default;
    for (const [b] of __VLS_getVForSourceType((__VLS_ctx.store.history))) {
        const __VLS_28 = {}.ElCheckbox;
        /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            key: (b.id),
            label: (b.id),
            ...{ class: "batch-checkbox" },
        }));
        const __VLS_30 = __VLS_29({
            key: (b.id),
            label: (b.id),
            ...{ class: "batch-checkbox" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "batch-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "batch-name" },
        });
        (b.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "batch-meta" },
        });
        (__VLS_ctx.formatTime(b.createdAt));
        (b.params.residues);
        (b.params.conformations);
        if (__VLS_ctx.isEmptyBatch(b)) {
            const __VLS_32 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                type: "info",
                size: "small",
            }));
            const __VLS_34 = __VLS_33({
                type: "info",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            __VLS_35.slots.default;
            var __VLS_35;
        }
        if (__VLS_ctx.duplicateParamIds.has(b.id)) {
            const __VLS_36 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
                type: "warning",
                size: "small",
            }));
            const __VLS_38 = __VLS_37({
                type: "warning",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            __VLS_39.slots.default;
            var __VLS_39;
        }
        var __VLS_31;
    }
    var __VLS_23;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "generate-bar" },
    });
    const __VLS_40 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (__VLS_ctx.store.selectedBatchIds.length < 2),
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (__VLS_ctx.store.selectedBatchIds.length < 2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.store.history.length === 0))
                return;
            __VLS_ctx.generated = true;
        }
    };
    __VLS_43.slots.default;
    var __VLS_43;
    if (__VLS_ctx.store.selectedBatchIds.length < 2) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "reason" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
        (__VLS_ctx.store.selectedBatchIds.length);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "reason ok" },
        });
    }
}
if (__VLS_ctx.summaries.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    (__VLS_ctx.summaries.length);
    for (const [s] of __VLS_getVForSourceType((__VLS_ctx.summaries))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (s.batch.id),
            ...{ class: "batch-card" },
            ...{ class: ({ 'is-empty': s.empty }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "batch-card-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "batch-name" },
        });
        (s.batch.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "batch-meta" },
        });
        (__VLS_ctx.formatTime(s.batch.createdAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (s.empty) {
            const __VLS_48 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                type: "info",
                size: "small",
            }));
            const __VLS_50 = __VLS_49({
                type: "info",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            __VLS_51.slots.default;
            var __VLS_51;
        }
        if (__VLS_ctx.duplicateParamIds.has(s.batch.id)) {
            const __VLS_52 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                type: "warning",
                size: "small",
            }));
            const __VLS_54 = __VLS_53({
                type: "warning",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            __VLS_55.slots.default;
            var __VLS_55;
        }
        if (s.empty) {
            const __VLS_56 = {}.ElAlert;
            /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                type: "warning",
                closable: (false),
                showIcon: true,
                title: "该批数据为空：无采样结果，分区占比与数值区间均不可用，对照表中以 — 占位。",
                ...{ class: "empty-alert" },
            }));
            const __VLS_58 = __VLS_57({
                type: "warning",
                closable: (false),
                showIcon: true,
                title: "该批数据为空：无采样结果，分区占比与数值区间均不可用，对照表中以 — 占位。",
                ...{ class: "empty-alert" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "param-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
            (s.batch.params.residues);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
            (s.batch.params.conformations);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
            (s.total);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "region-block" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "region-title" },
            });
            for (const [r] of __VLS_getVForSourceType((s.regions))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (r.key),
                    ...{ class: "region-row" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "region-label" },
                    ...{ style: ({ color: __VLS_ctx.regionColors[r.key] }) },
                });
                (r.label);
                const __VLS_60 = {}.ElProgress;
                /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                    percentage: (__VLS_ctx.ratioPercent(r.ratio)),
                    strokeWidth: (14),
                    color: (__VLS_ctx.regionColors[r.key]),
                    ...{ class: "region-bar" },
                }));
                const __VLS_62 = __VLS_61({
                    percentage: (__VLS_ctx.ratioPercent(r.ratio)),
                    strokeWidth: (14),
                    color: (__VLS_ctx.regionColors[r.key]),
                    ...{ class: "region-bar" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "region-count" },
                });
                (r.count);
                (__VLS_ctx.formatPercent(r.ratio));
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "range-block" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "range-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
            (__VLS_ctx.formatRange(s.phiMin, s.phiMax, 2));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "range-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
            (__VLS_ctx.formatRange(s.psiMin, s.psiMax, 2));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "range-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
            (__VLS_ctx.formatRange(s.energyMin, s.energyMax, 3));
        }
    }
}
if (__VLS_ctx.generated) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "table-note" },
    });
    (__VLS_ctx.summaries.length);
    if (__VLS_ctx.summaries.length < 2) {
        const __VLS_64 = {}.ElAlert;
        /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            type: "warning",
            closable: (false),
            showIcon: true,
            title: (`对照至少需要两批，当前仅剩 ${__VLS_ctx.summaries.length} 批，请重新勾选；重复选择同一批不会重复计入。`),
        }));
        const __VLS_66 = __VLS_65({
            type: "warning",
            closable: (false),
            showIcon: true,
            title: (`对照至少需要两批，当前仅剩 ${__VLS_ctx.summaries.length} 批，请重新勾选；重复选择同一批不会重复计入。`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    }
    else {
        const __VLS_68 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            data: (__VLS_ctx.summaryRows),
            border: true,
            stripe: true,
            size: "small",
            ...{ class: "summary-table" },
        }));
        const __VLS_70 = __VLS_69({
            data: (__VLS_ctx.summaryRows),
            border: true,
            stripe: true,
            size: "small",
            ...{ class: "summary-table" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        const __VLS_72 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            label: "对照指标",
            prop: "metric",
            width: "150",
            fixed: true,
        }));
        const __VLS_74 = __VLS_73({
            label: "对照指标",
            prop: "metric",
            width: "150",
            fixed: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        for (const [s] of __VLS_getVForSourceType((__VLS_ctx.summaries))) {
            const __VLS_76 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                key: (s.batch.id),
                width: (190),
                align: "center",
            }));
            const __VLS_78 = __VLS_77({
                key: (s.batch.id),
                width: (190),
                align: "center",
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            __VLS_79.slots.default;
            {
                const { header: __VLS_thisSlot } = __VLS_79.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "col-head" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (s.batch.label);
                if (s.empty) {
                    const __VLS_80 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                        type: "info",
                        size: "small",
                    }));
                    const __VLS_82 = __VLS_81({
                        type: "info",
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                    __VLS_83.slots.default;
                    var __VLS_83;
                }
                if (__VLS_ctx.duplicateParamIds.has(s.batch.id)) {
                    const __VLS_84 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                        type: "warning",
                        size: "small",
                    }));
                    const __VLS_86 = __VLS_85({
                        type: "warning",
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
                    __VLS_87.slots.default;
                    var __VLS_87;
                }
            }
            {
                const { default: __VLS_thisSlot } = __VLS_79.slots;
                const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: ({ 'cell-empty': s.empty && row.key !== 'status' }) },
                });
                (row.values[s.batch.id]);
            }
            var __VLS_79;
        }
        var __VLS_71;
    }
}
/** @type {__VLS_StyleScopedClasses['compare-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['select-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-count']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-checklist']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-name']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['generate-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['reason']} */ ;
/** @type {__VLS_StyleScopedClasses['reason']} */ ;
/** @type {__VLS_StyleScopedClasses['ok']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-name']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['param-row']} */ ;
/** @type {__VLS_StyleScopedClasses['region-block']} */ ;
/** @type {__VLS_StyleScopedClasses['region-title']} */ ;
/** @type {__VLS_StyleScopedClasses['region-row']} */ ;
/** @type {__VLS_StyleScopedClasses['region-label']} */ ;
/** @type {__VLS_StyleScopedClasses['region-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['region-count']} */ ;
/** @type {__VLS_StyleScopedClasses['range-block']} */ ;
/** @type {__VLS_StyleScopedClasses['range-item']} */ ;
/** @type {__VLS_StyleScopedClasses['range-item']} */ ;
/** @type {__VLS_StyleScopedClasses['range-item']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['table-note']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-table']} */ ;
/** @type {__VLS_StyleScopedClasses['col-head']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isEmptyBatch: isEmptyBatch,
            formatPercent: formatPercent,
            formatRange: formatRange,
            formatTime: formatTime,
            store: store,
            generated: generated,
            regionColors: regionColors,
            summaries: summaries,
            duplicateParamIds: duplicateParamIds,
            allChecked: allChecked,
            indeterminate: indeterminate,
            onSelectionChange: onSelectionChange,
            onCheckAll: onCheckAll,
            ratioPercent: ratioPercent,
            summaryRows: summaryRows,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
