/// <reference types="../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
import DateRangePicker from './components/DateRangePicker/DateRangePicker.vue';
import { parseISO } from './utils/dates';
// Parse URL search params
const params = new URLSearchParams(window.location.search);
// ?seed=YYYY-MM-DD,YYYY-MM-DD
const seed = params.get('seed');
const today = new Date();
const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
let initialStart = todayStart;
let initialEnd = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 7);
if (seed) {
    const parts = seed.split(',');
    if (parts.length === 2) {
        try {
            initialStart = parseISO(parts[0].trim());
            initialEnd = parseISO(parts[1].trim());
        }
        catch {
            // fallback to defaults
        }
    }
}
// ?min=YYYY-MM-DD
const minParam = params.get('min');
const minDate = computed(() => {
    if (minParam) {
        try {
            return parseISO(minParam);
        }
        catch {
            return undefined;
        }
    }
    return undefined;
});
// ?max=YYYY-MM-DD
const maxParam = params.get('max');
const maxDate = computed(() => {
    if (maxParam) {
        try {
            return parseISO(maxParam);
        }
        catch {
            return undefined;
        }
    }
    return undefined;
});
const dateRange = ref({
    start: initialStart,
    end: initialEnd,
});
function formatDate(d) {
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app" },
});
/** @type {__VLS_StyleScopedClasses['app']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "app__title" },
});
/** @type {__VLS_StyleScopedClasses['app__title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app__demo" },
});
/** @type {__VLS_StyleScopedClasses['app__demo']} */ ;
const __VLS_0 = DateRangePicker;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.dateRange),
    minDate: (__VLS_ctx.minDate),
    maxDate: (__VLS_ctx.maxDate),
    locale: "en-US",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dateRange),
    minDate: (__VLS_ctx.minDate),
    maxDate: (__VLS_ctx.maxDate),
    locale: "en-US",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (__VLS_ctx.dateRange) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "app__result" },
    });
    /** @type {__VLS_StyleScopedClasses['app__result']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.formatDate(__VLS_ctx.dateRange.start));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.formatDate(__VLS_ctx.dateRange.end));
}
// @ts-ignore
[dateRange, dateRange, dateRange, dateRange, minDate, maxDate, formatDate, formatDate,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
