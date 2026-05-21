import { onMounted, onUnmounted } from 'vue';
const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="gridcell"][tabindex]',
].join(', ');
export function useFocusTrap(containerRef) {
    function getFocusable() {
        if (!containerRef.value)
            return [];
        return Array.from(containerRef.value.querySelectorAll(FOCUSABLE_SELECTORS));
    }
    function handleKeydown(e) {
        if (e.key !== 'Tab')
            return;
        const focusable = getFocusable();
        if (focusable.length === 0)
            return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
            if (active === first || !containerRef.value?.contains(active)) {
                e.preventDefault();
                last.focus();
            }
        }
        else {
            if (active === last || !containerRef.value?.contains(active)) {
                e.preventDefault();
                first.focus();
            }
        }
    }
    onMounted(() => {
        document.addEventListener('keydown', handleKeydown);
    });
    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown);
    });
    function focusFirst() {
        const focusable = getFocusable();
        if (focusable.length > 0) {
            focusable[0].focus();
        }
    }
    return { focusFirst };
}
