import { watch } from 'vue';
export function useBodyScrollLock(isOpen) {
    watch(isOpen, (open) => {
        if (open) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
    });
}
