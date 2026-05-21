/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { isSameDay } from '../../utils/dates';
const props = defineProps();
const emit = defineEmits();
const today = new Date();
const isToday = computed(() => isSameDay(props.cell.date, today));
const isSelected = computed(() => props.isStart || props.isEnd);
const tabIndex = computed(() => (props.isFocused ? 0 : -1));
const day = computed(() => props.cell.date.getDate());
const ariaLabel = computed(() => {
    return props.cell.date.toLocaleDateString(props.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});
function handleClick(e) {
    e.preventDefault();
    if (!props.cell.isDisabled) {
        emit('pick', props.cell.date);
    }
}
function handleKeydown(e) {
    emit('keydown', e);
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
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day--disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day--disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['is-start']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['is-end']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
    ...{ onClick: (__VLS_ctx.handleClick) },
    ...{ onKeydown: (__VLS_ctx.handleKeydown) },
    ...{ onMouseenter: (...[$event]) => {
            __VLS_ctx.$emit('hover', __VLS_ctx.cell.date);
            // @ts-ignore
            [handleClick, handleKeydown, $emit, cell,];
        } },
    ...{ onMouseleave: (...[$event]) => {
            __VLS_ctx.$emit('hover', null);
            // @ts-ignore
            [$emit,];
        } },
    ...{ onFocus: (...[$event]) => {
            __VLS_ctx.$emit('hover', __VLS_ctx.cell.date);
            // @ts-ignore
            [$emit, cell,];
        } },
    ...{ onBlur: (...[$event]) => {
            __VLS_ctx.$emit('hover', null);
            // @ts-ignore
            [$emit,];
        } },
    role: "gridcell",
    tabindex: (__VLS_ctx.tabIndex),
    'aria-label': (__VLS_ctx.ariaLabel),
    'aria-selected': (__VLS_ctx.isSelected || undefined),
    'aria-disabled': (__VLS_ctx.cell.isDisabled || undefined),
    'data-testid': ('dr-day'),
    'data-iso': (__VLS_ctx.cell.iso),
    ...{ class: ([
            'dr-day',
            {
                'dr-day--other-month': !__VLS_ctx.cell.inCurrentMonth,
                'dr-day--disabled': __VLS_ctx.cell.isDisabled,
                'is-start': __VLS_ctx.isStart,
                'is-end': __VLS_ctx.isEnd,
                'is-in-range': __VLS_ctx.isInRange && !__VLS_ctx.isStart && !__VLS_ctx.isEnd,
                'is-hover-range': __VLS_ctx.isHoverRange && !__VLS_ctx.isStart && !__VLS_ctx.isEnd,
                'is-today': __VLS_ctx.isToday,
            },
        ]) },
});
/** @type {__VLS_StyleScopedClasses['dr-day']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day--other-month']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-day--disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['is-start']} */ ;
/** @type {__VLS_StyleScopedClasses['is-end']} */ ;
/** @type {__VLS_StyleScopedClasses['is-in-range']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hover-range']} */ ;
/** @type {__VLS_StyleScopedClasses['is-today']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-day__inner" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['dr-day__inner']} */ ;
(__VLS_ctx.day);
// @ts-ignore
[cell, cell, cell, cell, tabIndex, ariaLabel, isSelected, isStart, isStart, isStart, isEnd, isEnd, isEnd, isInRange, isHoverRange, isToday, day,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
