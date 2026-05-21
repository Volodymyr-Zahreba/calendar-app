import { ref, computed } from 'vue';
import { addDays } from '../utils/dates';
export function useDateRange(initialStart, initialEnd) {
    const today = new Date();
    const start = ref(initialStart ?? new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const end = ref(initialEnd ?? addDays(start.value, 7));
    const activeField = ref('from');
    const hoverDate = ref(null);
    // Hover preview computed values
    const hoverStart = computed(() => {
        const h = hoverDate.value;
        if (!h)
            return null;
        const s = start.value;
        const e = end.value;
        const hTime = new Date(h.getFullYear(), h.getMonth(), h.getDate()).getTime();
        const sTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
        const eTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
        if (hTime > eTime)
            return s;
        if (hTime < sTime)
            return h;
        return null; // within range
    });
    const hoverEnd = computed(() => {
        const h = hoverDate.value;
        if (!h)
            return null;
        const s = start.value;
        const e = end.value;
        const hTime = new Date(h.getFullYear(), h.getMonth(), h.getDate()).getTime();
        const sTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
        const eTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
        if (hTime > eTime)
            return h;
        if (hTime < sTime)
            return e;
        return null; // within range
    });
    function pick(d) {
        if (activeField.value === 'from') {
            const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const eTime = new Date(end.value.getFullYear(), end.value.getMonth(), end.value.getDate()).getTime();
            if (dTime < eTime) {
                start.value = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                activeField.value = 'to';
            }
            else {
                end.value = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                // activeField stays 'from'
            }
        }
        else {
            const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const sTime = new Date(start.value.getFullYear(), start.value.getMonth(), start.value.getDate()).getTime();
            if (dTime > sTime) {
                end.value = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                activeField.value = 'from';
            }
            else {
                start.value = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                // activeField stays 'to'
            }
        }
    }
    function setActiveField(field) {
        activeField.value = field;
    }
    return {
        start,
        end,
        activeField,
        hoverDate,
        hoverStart,
        hoverEnd,
        pick,
        setActiveField,
    };
}
