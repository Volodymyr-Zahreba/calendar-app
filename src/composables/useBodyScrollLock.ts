import { watch } from 'vue'
import type { Ref } from 'vue'

export function useBodyScrollLock(isOpen: Ref<boolean>) {
  let scrollY = 0

  watch(isOpen, (open) => {
    if (open) {
      scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  })
}
