/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from "vue";
import ControlPanel from "./components/ControlPanel.vue";
import RamachandranPlot from "./components/RamachandranPlot.vue";
import ProteinViewer3D from "./components/ProteinViewer3D.vue";
import ConformationTable from "./components/ConformationTable.vue";
import BatchComparePanel from "./components/BatchComparePanel.vue";
import { useProteinStore } from "./store/protein";
const store = useProteinStore();
const activeView = ref('single');
function handleSample(params) { store.runSampling(params); }
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "app-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "subtitle" },
});
const __VLS_0 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeView),
    ...{ class: "view-switch" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeView),
    ...{ class: "view-switch" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "single",
}));
const __VLS_6 = __VLS_5({
    label: "single",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
const __VLS_8 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    label: "compare",
}));
const __VLS_10 = __VLS_9({
    label: "compare",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
if (__VLS_ctx.store.history.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "badge" },
    });
    (__VLS_ctx.store.history.length);
}
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "app-main" },
});
if (__VLS_ctx.activeView === 'single') {
    /** @type {[typeof ControlPanel, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(ControlPanel, new ControlPanel({
        ...{ 'onSample': {} },
    }));
    const __VLS_13 = __VLS_12({
        ...{ 'onSample': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_15;
    let __VLS_16;
    let __VLS_17;
    const __VLS_18 = {
        onSample: (__VLS_ctx.handleSample)
    };
    var __VLS_14;
    if (__VLS_ctx.store.result) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "main-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "plot-area" },
        });
        /** @type {[typeof RamachandranPlot, ]} */ ;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(RamachandranPlot, new RamachandranPlot({}));
        const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "viewer-area" },
        });
        /** @type {[typeof ProteinViewer3D, ]} */ ;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(ProteinViewer3D, new ProteinViewer3D({}));
        const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
    }
    if (__VLS_ctx.store.result) {
        /** @type {[typeof ConformationTable, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(ConformationTable, new ConformationTable({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    }
}
else {
    /** @type {[typeof BatchComparePanel, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(BatchComparePanel, new BatchComparePanel({}));
    const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
}
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plot-area']} */ ;
/** @type {__VLS_StyleScopedClasses['viewer-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ControlPanel: ControlPanel,
            RamachandranPlot: RamachandranPlot,
            ProteinViewer3D: ProteinViewer3D,
            ConformationTable: ConformationTable,
            BatchComparePanel: BatchComparePanel,
            store: store,
            activeView: activeView,
            handleSample: handleSample,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
