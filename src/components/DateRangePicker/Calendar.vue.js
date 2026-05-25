/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import CalendarMonth from './CalendarMonth.vue';
import { useMonthList } from '../../composables/useMonthList';
import { useFocusTrap } from '../../composables/useFocusTrap';
import { toISO, addDays, addMonths, getFirstDayOfWeek, } from '../../utils/dates';
const props = defineProps();
const emit = defineEmits();
const dialogRef = ref(null);
const scrollRef = ref(null);
const minDateRef = computed(() => props.minDate);
const { months } = useMonthList(minDateRef);
const { focusFirst } = useFocusTrap(dialogRef);
// Focused date for keyboard navigation (roving tabindex)
const focusedDate = ref(new Date(props.start.getFullYear(), props.start.getMonth(), props.start.getDate()));
// Scroll state for disabling prev/next
const atStart = ref(true);
const atEnd = ref(false);
const MONTH_WIDTH = 340;
// Live region message
const liveMessage = ref('');
// Weekday labels (for mobile sticky row)
const firstDayOfWeek = computed(() => getFirstDayOfWeek(props.locale));
const weekdayLabels = computed(() => {
    const labels = [];
    for (let i = 0; i < 7; i++) {
        const dayIndex = (firstDayOfWeek.value + i) % 7;
        const refDate = new Date(2025, 0, 5 + dayIndex);
        labels.push({
            key: dayIndex,
            short: refDate.toLocaleDateString(props.locale, { weekday: 'narrow' }),
            long: refDate.toLocaleDateString(props.locale, { weekday: 'long' }),
        });
    }
    return labels;
});
function updateScrollState() {
    const el = scrollRef.value;
    if (!el)
        return;
    atStart.value = el.scrollLeft <= 4;
    atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
}
function scrollPrev() {
    scrollRef.value?.scrollBy({ left: -MONTH_WIDTH, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
function scrollNext() {
    scrollRef.value?.scrollBy({ left: MONTH_WIDTH, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function getMonthEl(month) {
    const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    return scrollRef.value?.querySelector(`[data-month="${iso}"]`) ?? null;
}
function getStartMonthEl() {
    const iso = `${props.start.getFullYear()}-${String(props.start.getMonth() + 1).padStart(2, '0')}`;
    return scrollRef.value?.querySelector(`[data-month="${iso}"]`) ?? null;
}
function getEndMonthEl() {
    const iso = `${props.end.getFullYear()}-${String(props.end.getMonth() + 1).padStart(2, '0')}`;
    return scrollRef.value?.querySelector(`[data-month="${iso}"]`) ?? null;
}
async function autoScroll(animated = false) {
    await nextTick();
    const behavior = (!animated || prefersReducedMotion()) ? 'instant' : 'smooth';
    if (props.isMobile) {
        const target = props.activeField === 'from' ? getStartMonthEl() : getEndMonthEl();
        target?.scrollIntoView({ block: 'start', behavior });
    }
    else {
        if (props.activeField === 'from') {
            const el = getStartMonthEl();
            el?.scrollIntoView({ inline: 'start', behavior });
        }
        else {
            const prevEnd = addMonths(props.end, -1);
            const el = getMonthEl(prevEnd) ?? getEndMonthEl();
            el?.scrollIntoView({ inline: 'start', behavior });
        }
    }
    setTimeout(updateScrollState, 50);
}
onMounted(async () => {
    await autoScroll();
    updateScrollState();
    // Focus the start date cell initially
    await nextTick();
    focusCell(props.start);
});
// Watch for focusedDate change and focus the element
watch(focusedDate, async (newDate) => {
    await nextTick();
    focusCell(newDate);
    // Announce the date
    liveMessage.value = newDate.toLocaleDateString(props.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});
function focusCell(date) {
    const iso = toISO(date);
    const cell = scrollRef.value?.querySelector(`[data-iso="${iso}"]`);
    if (cell) {
        cell.focus({ preventScroll: false });
    }
}
function handlePick(date) {
    emit('pick', date);
    // Update focused date after pick
    focusedDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function handleHover(date) {
    emit('hover', date);
}
function handleClose() {
    emit('close');
}
function handleDone() {
    emit('done');
}
function clampToRange(date) {
    const min = new Date(props.minDate.getFullYear(), props.minDate.getMonth(), props.minDate.getDate());
    const max = new Date(props.maxDate.getFullYear(), props.maxDate.getMonth(), props.maxDate.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d < min)
        return min;
    if (d > max)
        return max;
    return d;
}
function handleDayKeydown(e, date) {
    let newDate = null;
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            newDate = addDays(date, -1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            newDate = addDays(date, 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            newDate = addDays(date, -7);
            break;
        case 'ArrowDown':
            e.preventDefault();
            newDate = addDays(date, 7);
            break;
        case 'PageUp':
            e.preventDefault();
            if (e.shiftKey) {
                newDate = addMonths(date, -12);
            }
            else {
                newDate = addMonths(date, -1);
            }
            break;
        case 'PageDown':
            e.preventDefault();
            if (e.shiftKey) {
                newDate = addMonths(date, 12);
            }
            else {
                newDate = addMonths(date, 1);
            }
            break;
        case 'Home': {
            e.preventDefault();
            // Go to Monday of the current week
            const dow = date.getDay();
            const daysToMonday = (dow + 6) % 7;
            newDate = addDays(date, -daysToMonday);
            break;
        }
        case 'End': {
            e.preventDefault();
            // Go to Sunday of current week
            const dow2 = date.getDay();
            const daysToSunday = (7 - dow2) % 7;
            newDate = addDays(date, daysToSunday);
            break;
        }
        case 'Enter':
        case ' ':
            e.preventDefault();
            handlePick(date);
            return;
        case 'Escape':
            e.preventDefault();
            emit('close');
            return;
        default:
            return;
    }
    if (newDate) {
        const clamped = clampToRange(newDate);
        focusedDate.value = clamped;
        // Ensure the month containing the new date is visible
        ensureMonthVisible(clamped);
    }
}
function ensureMonthVisible(date) {
    nextTick(() => {
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthEl = scrollRef.value?.querySelector(`[data-month="${iso}"]`);
        if (monthEl && props.isMobile) {
            monthEl.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
        else if (monthEl && !props.isMobile) {
            const scrollEl = scrollRef.value;
            const elLeft = monthEl.offsetLeft;
            const elRight = elLeft + MONTH_WIDTH;
            const scrollLeft = scrollEl.scrollLeft;
            const clientW = scrollEl.clientWidth;
            if (elLeft < scrollLeft) {
                scrollEl.scrollTo({ left: elLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            }
            else if (elRight > scrollLeft + clientW) {
                scrollEl.scrollTo({
                    left: elRight - clientW,
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                });
            }
        }
    });
}
function handleDialogKeydown(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        emit('close');
    }
}
// Expose autoScroll so parent can call it
const __VLS_exposed = { autoScroll, focusFirst };
defineExpose(__VLS_exposed);
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
/** @type {__VLS_StyleScopedClasses['dr-prev']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-next']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-prev']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-next']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-prev']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-next']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-calendar--desktop']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-calendar--desktop']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-close']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-calendar--mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-done']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-scroll']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onKeydown: (__VLS_ctx.handleDialogKeydown) },
    ref: "dialogRef",
    ...{ class: "dr-calendar" },
    ...{ class: ({ 'dr-calendar--mobile': __VLS_ctx.isMobile, 'dr-calendar--desktop': !__VLS_ctx.isMobile }) },
    'data-testid': "dr-calendar",
    role: "dialog",
    'aria-modal': "true",
    'aria-label': "Choose dates",
});
/** @type {__VLS_StyleScopedClasses['dr-calendar']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-calendar--mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-calendar--desktop']} */ ;
if (__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dr-header dr-header--mobile" },
    });
    /** @type {__VLS_StyleScopedClasses['dr-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['dr-header--mobile']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dr-header__title" },
    });
    /** @type {__VLS_StyleScopedClasses['dr-header__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleClose) },
        ...{ class: "dr-close" },
        'data-testid': "dr-close",
        type: "button",
        'aria-label': "Close",
    });
    /** @type {__VLS_StyleScopedClasses['dr-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M15 5L5 15M5 5l10 10",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
    });
}
if (__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dr-weekdays" },
        'data-testid': "dr-weekdays",
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['dr-weekdays']} */ ;
    for (const [day] of __VLS_vFor((__VLS_ctx.weekdayLabels))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (day.key),
            ...{ class: "dr-weekdays__day" },
        });
        /** @type {__VLS_StyleScopedClasses['dr-weekdays__day']} */ ;
        (day.short);
        // @ts-ignore
        [handleDialogKeydown, isMobile, isMobile, isMobile, isMobile, handleClose, weekdayLabels,];
    }
}
if (!__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.scrollPrev) },
        ...{ class: "dr-prev" },
        'data-testid': "dr-prev",
        type: "button",
        'aria-label': "Previous months",
        disabled: (__VLS_ctx.atStart),
    });
    /** @type {__VLS_StyleScopedClasses['dr-prev']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M12 5l-7 7 7 7",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.scrollNext) },
        ...{ class: "dr-next" },
        'data-testid': "dr-next",
        type: "button",
        'aria-label': "Next months",
        disabled: (__VLS_ctx.atEnd),
    });
    /** @type {__VLS_StyleScopedClasses['dr-next']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M8 5l7 7-7 7",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onScroll: (__VLS_ctx.updateScrollState) },
    ref: "scrollRef",
    ...{ class: "dr-scroll" },
    'data-testid': "dr-scroll",
});
/** @type {__VLS_StyleScopedClasses['dr-scroll']} */ ;
for (const [month] of __VLS_vFor((__VLS_ctx.months))) {
    const __VLS_0 = CalendarMonth;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onPick': {} },
        ...{ 'onHover': {} },
        ...{ 'onKeydown': {} },
        key: (__VLS_ctx.toISO(month)),
        month: (month),
        start: (__VLS_ctx.start),
        end: (__VLS_ctx.end),
        hoverStart: (__VLS_ctx.hoverStart),
        hoverEnd: (__VLS_ctx.hoverEnd),
        focusedDate: (__VLS_ctx.focusedDate),
        minDate: (__VLS_ctx.minDate),
        maxDate: (__VLS_ctx.maxDate),
        locale: (__VLS_ctx.locale),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onPick': {} },
        ...{ 'onHover': {} },
        ...{ 'onKeydown': {} },
        key: (__VLS_ctx.toISO(month)),
        month: (month),
        start: (__VLS_ctx.start),
        end: (__VLS_ctx.end),
        hoverStart: (__VLS_ctx.hoverStart),
        hoverEnd: (__VLS_ctx.hoverEnd),
        focusedDate: (__VLS_ctx.focusedDate),
        minDate: (__VLS_ctx.minDate),
        maxDate: (__VLS_ctx.maxDate),
        locale: (__VLS_ctx.locale),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ pick: {} },
        { onPick: (__VLS_ctx.handlePick) });
    const __VLS_7 = ({ hover: {} },
        { onHover: (__VLS_ctx.handleHover) });
    const __VLS_8 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.handleDayKeydown) });
    var __VLS_3;
    var __VLS_4;
    // @ts-ignore
    [isMobile, scrollPrev, atStart, scrollNext, atEnd, updateScrollState, months, toISO, start, end, hoverStart, hoverEnd, focusedDate, minDate, maxDate, locale, handlePick, handleHover, handleDayKeydown,];
}
if (__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dr-footer dr-footer--mobile" },
    });
    /** @type {__VLS_StyleScopedClasses['dr-footer']} */ ;
    /** @type {__VLS_StyleScopedClasses['dr-footer--mobile']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleDone) },
        ...{ class: "dr-done" },
        'data-testid': "dr-done",
        type: "button",
    });
    /** @type {__VLS_StyleScopedClasses['dr-done']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dr-live" },
    'data-testid': "dr-live",
    'aria-live': "polite",
    'aria-atomic': "true",
});
/** @type {__VLS_StyleScopedClasses['dr-live']} */ ;
(__VLS_ctx.liveMessage);
// @ts-ignore
[isMobile, handleDone, liveMessage,];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    __typeEmits: {},
    __typeProps: {},
});
export default {};
