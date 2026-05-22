/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.3.1/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, watch, onMounted, onUnmounted, nextTick, } from 'vue';
import { useFloating, autoUpdate, offset, flip, shift, } from '@floating-ui/vue';
import Calendar from './Calendar.vue';
import { useDateRange } from '../../composables/useDateRange';
import { useBodyScrollLock } from '../../composables/useBodyScrollLock';
import { addMonths, endOfMonth } from '../../utils/dates';
const props = withDefaults(defineProps(), {
    locale: 'en-US',
});
const emit = defineEmits();
// Determine if mobile at component level
const isMobile = ref(false);
function checkMobile() {
    isMobile.value = window.matchMedia('(max-width: 767.98px)').matches;
}
onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});
onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});
// Effective min/max dates
const today = new Date();
const effectiveMinDate = computed(() => {
    return props.minDate ?? new Date(today.getFullYear(), today.getMonth(), today.getDate());
});
const effectiveMaxDate = computed(() => {
    return props.maxDate ?? endOfMonth(addMonths(today, 12));
});
// Internal state (uncommitted on mobile until Done/Close)
const { start: internalStart, end: internalEnd, activeField, hoverDate, hoverStart, hoverEnd, pick, setActiveField, } = useDateRange(new Date(props.modelValue.start), new Date(props.modelValue.end));
// Sync with modelValue changes
watch(() => props.modelValue, (val) => {
    internalStart.value = new Date(val.start);
    internalEnd.value = new Date(val.end);
}, { deep: true });
const isOpen = ref(false);
useBodyScrollLock(isOpen);
const liveMessage = ref('');
// Floating UI
const departureRef = ref(null);
const floatingRef = ref(null);
const fieldRef = ref(null);
const calendarRef = ref(null);
const { floatingStyles, update } = useFloating(departureRef, floatingRef, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
});
const returnRef = ref(null);
// Formatted date display
const formattedStart = computed(() => internalStart.value.toLocaleDateString(props.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
}));
const formattedEnd = computed(() => internalEnd.value.toLocaleDateString(props.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
}));
function openPopup(field) {
    setActiveField(field);
    isOpen.value = true;
    nextTick(async () => {
        if (calendarRef.value) {
            await calendarRef.value.autoScroll();
        }
    });
}
function closePopup() {
    isOpen.value = false;
    hoverDate.value = null;
    // Commit on desktop close
    if (!isMobile.value) {
        commitValue();
    }
    // Return focus to trigger
    nextTick(() => {
        departureRef.value?.focus();
    });
}
function commitValue() {
    emit('update:modelValue', {
        start: new Date(internalStart.value),
        end: new Date(internalEnd.value),
    });
}
function commitAndClose() {
    commitValue();
    closePopup();
}
function handleDepartureTriggerClick() {
    if (isOpen.value) {
        if (activeField.value === 'from') {
            // Toggle: close
            closePopup();
        }
        else {
            // Just change active field
            setActiveField('from');
            if (!isMobile.value && calendarRef.value) {
                // On desktop, don't auto-scroll when already open
            }
        }
    }
    else {
        openPopup('from');
    }
}
function handleReturnTriggerClick() {
    if (isOpen.value) {
        if (activeField.value === 'to') {
            // Toggle: close
            closePopup();
        }
        else {
            // Just change active field
            setActiveField('to');
            if (!isMobile.value && calendarRef.value) {
                // On desktop, don't auto-scroll when already open
            }
        }
    }
    else {
        openPopup('to');
    }
}
function handlePick(date) {
    pick(date);
    liveMessage.value = `Selected ${date.toLocaleDateString(props.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })}`;
    // On desktop, commit immediately after each pick
    if (!isMobile.value) {
        commitValue();
    }
}
function handleHover(date) {
    // Only apply hover on non-touch devices
    if (!isMobile.value) {
        hoverDate.value = date;
    }
}
function handleMobileClose() {
    // Close without committing (but we commit anyway in spec — "both commit")
    commitValue();
    isOpen.value = false;
    hoverDate.value = null;
}
function handleDone() {
    commitValue();
    isOpen.value = false;
    hoverDate.value = null;
}
// Outside click handler (desktop only)
function handleOutsideClick(e) {
    if (!isOpen.value || isMobile.value)
        return;
    const target = e.target;
    // Check if click is inside field or popup
    if (fieldRef.value?.contains(target))
        return;
    if (floatingRef.value?.contains(target))
        return;
    closePopup();
}
onMounted(() => {
    document.addEventListener('mousedown', handleOutsideClick);
});
onUnmounted(() => {
    document.removeEventListener('mousedown', handleOutsideClick);
});
const __VLS_defaults = {
    locale: 'en-US',
};
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
/** @type {__VLS_StyleScopedClasses['dr-field__inputs']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-field__input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dr-field" },
    ref: "fieldRef",
});
/** @type {__VLS_StyleScopedClasses['dr-field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dr-field__inputs" },
});
/** @type {__VLS_StyleScopedClasses['dr-field__inputs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleDepartureTriggerClick) },
    ref: "departureRef",
    type: "button",
    ...{ class: "dr-field__input" },
    ...{ class: ({ 'dr-field__input--active': __VLS_ctx.isOpen && __VLS_ctx.activeField === 'from' }) },
    'data-testid': "dr-trigger-departure",
    'aria-label': (`Departure date: ${__VLS_ctx.formattedStart}`),
    'aria-expanded': (__VLS_ctx.isOpen),
    'aria-haspopup': "dialog",
});
/** @type {__VLS_StyleScopedClasses['dr-field__input']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-field__input--active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['dr-field__icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2",
    ry: "2",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.line)({
    x1: "16",
    y1: "2",
    x2: "16",
    y2: "6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.line)({
    x1: "8",
    y1: "2",
    x2: "8",
    y2: "6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.line)({
    x1: "3",
    y1: "10",
    x2: "21",
    y2: "10",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__text" },
});
/** @type {__VLS_StyleScopedClasses['dr-field__text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__label" },
});
/** @type {__VLS_StyleScopedClasses['dr-field__label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__value" },
});
/** @type {__VLS_StyleScopedClasses['dr-field__value']} */ ;
(__VLS_ctx.formattedStart);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dr-field__separator" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['dr-field__separator']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.line)({
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
    points: "12 5 19 12 12 19",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleReturnTriggerClick) },
    ref: "returnRef",
    type: "button",
    ...{ class: "dr-field__input" },
    ...{ class: ({ 'dr-field__input--active': __VLS_ctx.isOpen && __VLS_ctx.activeField === 'to' }) },
    'data-testid': "dr-trigger-return",
    'aria-label': (`Return date: ${__VLS_ctx.formattedEnd}`),
    'aria-expanded': (__VLS_ctx.isOpen),
    'aria-haspopup': "dialog",
});
/** @type {__VLS_StyleScopedClasses['dr-field__input']} */ ;
/** @type {__VLS_StyleScopedClasses['dr-field__input--active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['dr-field__icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2",
    ry: "2",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.line)({
    x1: "16",
    y1: "2",
    x2: "16",
    y2: "6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.line)({
    x1: "8",
    y1: "2",
    x2: "8",
    y2: "6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.line)({
    x1: "3",
    y1: "10",
    x2: "21",
    y2: "10",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__text" },
});
/** @type {__VLS_StyleScopedClasses['dr-field__text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__label" },
});
/** @type {__VLS_StyleScopedClasses['dr-field__label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dr-field__value" },
});
/** @type {__VLS_StyleScopedClasses['dr-field__value']} */ ;
(__VLS_ctx.formattedEnd);
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.isOpen && !__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMousedown: (() => { }) },
        ref: "floatingRef",
        ...{ class: "dr-popup" },
        ...{ style: (__VLS_ctx.floatingStyles) },
    });
    /** @type {__VLS_StyleScopedClasses['dr-popup']} */ ;
    const __VLS_6 = Calendar;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        ...{ 'onPick': {} },
        ...{ 'onHover': {} },
        ...{ 'onClose': {} },
        ...{ 'onDone': {} },
        ref: "calendarRef",
        start: (__VLS_ctx.internalStart),
        end: (__VLS_ctx.internalEnd),
        hoverStart: (__VLS_ctx.hoverStart),
        hoverEnd: (__VLS_ctx.hoverEnd),
        activeField: (__VLS_ctx.activeField),
        minDate: (__VLS_ctx.effectiveMinDate),
        maxDate: (__VLS_ctx.effectiveMaxDate),
        locale: (__VLS_ctx.locale),
        isMobile: (false),
    }));
    const __VLS_8 = __VLS_7({
        ...{ 'onPick': {} },
        ...{ 'onHover': {} },
        ...{ 'onClose': {} },
        ...{ 'onDone': {} },
        ref: "calendarRef",
        start: (__VLS_ctx.internalStart),
        end: (__VLS_ctx.internalEnd),
        hoverStart: (__VLS_ctx.hoverStart),
        hoverEnd: (__VLS_ctx.hoverEnd),
        activeField: (__VLS_ctx.activeField),
        minDate: (__VLS_ctx.effectiveMinDate),
        maxDate: (__VLS_ctx.effectiveMaxDate),
        locale: (__VLS_ctx.locale),
        isMobile: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_11;
    const __VLS_12 = ({ pick: {} },
        { onPick: (__VLS_ctx.handlePick) });
    const __VLS_13 = ({ hover: {} },
        { onHover: (__VLS_ctx.handleHover) });
    const __VLS_14 = ({ close: {} },
        { onClose: (__VLS_ctx.closePopup) });
    const __VLS_15 = ({ done: {} },
        { onDone: (__VLS_ctx.commitAndClose) });
    var __VLS_16;
    var __VLS_9;
    var __VLS_10;
}
// @ts-ignore
[handleDepartureTriggerClick, isOpen, isOpen, isOpen, isOpen, isOpen, activeField, activeField, activeField, formattedStart, formattedStart, handleReturnTriggerClick, formattedEnd, formattedEnd, isMobile, floatingStyles, internalStart, internalEnd, hoverStart, hoverEnd, effectiveMinDate, effectiveMaxDate, locale, handlePick, handleHover, closePopup, commitAndClose,];
var __VLS_3;
let __VLS_18;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    to: "body",
}));
const __VLS_20 = __VLS_19({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
if (__VLS_ctx.isOpen && __VLS_ctx.isMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dr-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['dr-overlay']} */ ;
    const __VLS_24 = Calendar;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        ...{ 'onPick': {} },
        ...{ 'onHover': {} },
        ...{ 'onClose': {} },
        ...{ 'onDone': {} },
        ref: "calendarRef",
        start: (__VLS_ctx.internalStart),
        end: (__VLS_ctx.internalEnd),
        hoverStart: (__VLS_ctx.hoverStart),
        hoverEnd: (__VLS_ctx.hoverEnd),
        activeField: (__VLS_ctx.activeField),
        minDate: (__VLS_ctx.effectiveMinDate),
        maxDate: (__VLS_ctx.effectiveMaxDate),
        locale: (__VLS_ctx.locale),
        isMobile: (true),
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onPick': {} },
        ...{ 'onHover': {} },
        ...{ 'onClose': {} },
        ...{ 'onDone': {} },
        ref: "calendarRef",
        start: (__VLS_ctx.internalStart),
        end: (__VLS_ctx.internalEnd),
        hoverStart: (__VLS_ctx.hoverStart),
        hoverEnd: (__VLS_ctx.hoverEnd),
        activeField: (__VLS_ctx.activeField),
        minDate: (__VLS_ctx.effectiveMinDate),
        maxDate: (__VLS_ctx.effectiveMaxDate),
        locale: (__VLS_ctx.locale),
        isMobile: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_29;
    const __VLS_30 = ({ pick: {} },
        { onPick: (__VLS_ctx.handlePick) });
    const __VLS_31 = ({ hover: {} },
        { onHover: (__VLS_ctx.handleHover) });
    const __VLS_32 = ({ close: {} },
        { onClose: (__VLS_ctx.handleMobileClose) });
    const __VLS_33 = ({ done: {} },
        { onDone: (__VLS_ctx.handleDone) });
    var __VLS_34;
    var __VLS_27;
    var __VLS_28;
}
// @ts-ignore
[isOpen, activeField, isMobile, internalStart, internalEnd, hoverStart, hoverEnd, effectiveMinDate, effectiveMaxDate, locale, handlePick, handleHover, handleMobileClose, handleDone,];
var __VLS_21;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dr-live" },
    'data-testid': "dr-live",
    'aria-live': "polite",
    'aria-atomic': "true",
});
/** @type {__VLS_StyleScopedClasses['dr-live']} */ ;
(__VLS_ctx.liveMessage);
// @ts-ignore
var __VLS_17 = __VLS_16, __VLS_35 = __VLS_34;
// @ts-ignore
[liveMessage,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
