import { watch } from 'vue'
import type { Ref } from 'vue'

export function useBodyScrollLock(isOpen: Ref<boolean>) {
  watch(isOpen, (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  })
}
