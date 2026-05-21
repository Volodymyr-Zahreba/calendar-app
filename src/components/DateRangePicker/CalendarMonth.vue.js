/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import CalendarDay from './CalendarDay.vue';
import { monthGrid, isSameDay, isInRange as utilIsInRange, getFirstDayOfWeek, } from '../../utils/dates';
const props = defineProps();
const emit = defineEmits();
const firstDayOfWeek = computed(() => getFirstDayOfWeek(props.locale));
const monthISO = computed(() => {
    const y = props.month.getFullYear();
    const m = String(props.month.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
});
const monthLabel = computed(() => props.month.toLocaleDateString(props.locale, { month: 'long', year: 'numeric' }));
const cells = computed(() => monthGrid(props.month.getFullYear(), props.month.getMonth(), firstDayOfWeek.value, props.minDate, props.maxDate));
const weeks = computed(() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
        result.push(cells.value.slice(i * 7, i * 7 + 7));
    }
    return result;
});
const weekdayLabels = computed(() => {
    const labels = [];
    for (let i = 0; i < 7; i++) {
        const dayIndex = (firstDayOfWeek.value + i) % 7;
        // Use a reference date: week starting Jan 5, 2025 (Sunday)
        const refDate = new Date(2025, 0, 5 + dayIndex); // Jan 5 2025 is Sunday
        labels.push({
            key: dayIndex,
            short: refDate.toLocaleDateString(props.locale, { weekday: 'narrow' }),
            long: refDate.toLocaleDateString(props.locale, { weekday: 'long' }),
        });
    }
    return labels;
});
function isStart(d) {
    return isSameDay(d, props.start);
}
function isEnd(d) {
    return isSameDay(d, props.end);
}
function isInRange(d) {
    return utilIsInRange(d, props.start, props.end);
}
function isHoverRange(d) {
    if (!props.hoverStart || !props.hoverEnd)
        return false;
    return utilIsInRange(d, props.hoverStart, props.hoverEnd);
}
function isFocused(d) {
    if (!props.focusedDate)
        return false;
    return isSameDay(d, props.focusedDate);
}
function handleDayKeydown(e, date) {
    emit('keydown', e, date);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dr-month" },
    'data-testid': "dr-month",
    'data-month': (__VLS_ctx.monthISO),
    role: "group",
    'aria-label': (__VLS_ctx.monthLabel),
});
/** @type {__VLS_StyleScopedClasses['dr-month']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dr-month__header" },
});
/** @type {__VLS_StyleScopedClasses['dr-month__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-month__title" },
});
/** @type {__VLS_StyleScopedClasses['dr-month__title']} */ ;
(__VLS_ctx.monthLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
    role: "grid",
    'aria-label': (__VLS_ctx.monthLabel),
    ...{ class: "dr-month__grid" },
});
/** @type {__VLS_StyleScopedClasses['dr-month__grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
    ...{ class: "dr-month__weekdays" },
});
/** @type {__VLS_StyleScopedClasses['dr-month__weekdays']} */ ;
for (const [day] of __VLS_vFor((__VLS_ctx.weekdayLabels))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        key: (day.key),
        role: "columnheader",
        'aria-label': (day.long),
        scope: "col",
        ...{ class: "dr-month__weekday" },
    });
    /** @type {__VLS_StyleScopedClasses['dr-month__weekday']} */ ;
    (day.short);
    // @ts-ignore
    [monthISO, monthLabel, monthLabel, monthLabel, weekdayLabels,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
for (const [week, wi] of __VLS_vFor((__VLS_ctx.weeks))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
        key: (wi),
        role: "row",
    });
    for (const [cell] of __VLS_vFor((week))) {
        const __VLS_0 = CalendarDay;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            ...{ 'onPick': {} },
            ...{ 'onHover': {} },
            ...{ 'onKeydown': {} },
            key: (cell.iso),
            cell: (cell),
            isStart: (__VLS_ctx.isStart(cell.date)),
            isEnd: (__VLS_ctx.isEnd(cell.date)),
            isInRange: (__VLS_ctx.isInRange(cell.date)),
            isHoverRange: (__VLS_ctx.isHoverRange(cell.date)),
            isFocused: (__VLS_ctx.isFocused(cell.date)),
            locale: (__VLS_ctx.locale),
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onPick': {} },
            ...{ 'onHover': {} },
            ...{ 'onKeydown': {} },
            key: (cell.iso),
            cell: (cell),
            isStart: (__VLS_ctx.isStart(cell.date)),
            isEnd: (__VLS_ctx.isEnd(cell.date)),
            isInRange: (__VLS_ctx.isInRange(cell.date)),
            isHoverRange: (__VLS_ctx.isHoverRange(cell.date)),
            isFocused: (__VLS_ctx.isFocused(cell.date)),
            locale: (__VLS_ctx.locale),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_5;
        const __VLS_6 = ({ pick: {} },
            { onPick: (...[$event]) => {
                    __VLS_ctx.$emit('pick', $event);
                    // @ts-ignore
                    [weeks, isStart, isEnd, isInRange, isHoverRange, isFocused, locale, $emit,];
                } });
        const __VLS_7 = ({ hover: {} },
            { onHover: (...[$event]) => {
                    __VLS_ctx.$emit('hover', $event);
                    // @ts-ignore
                    [$emit,];
                } });
        const __VLS_8 = ({ keydown: {} },
            { onKeydown: (...[$event]) => {
                    __VLS_ctx.handleDayKeydown($event, cell.date);
                    // @ts-ignore
                    [handleDayKeydown,];
                } });
        var __VLS_3;
        var __VLS_4;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
