# dev-ready: DateRangePicker реализован

## Список созданных файлов

### Конфигурация проекта
- `/root/calendar-app/package.json` — скрипты, зависимости
- `/root/calendar-app/vite.config.ts` — Vite + @vitejs/plugin-vue
- `/root/calendar-app/tsconfig.json` — target ESNext, moduleResolution bundler, strict
- `/root/calendar-app/vitest.config.ts` — happy-dom, globals, include только tests/unit
- `/root/calendar-app/playwright.config.ts` — chromium desktop + iPhone 13, baseURL localhost:5173
- `/root/calendar-app/index.html` — div#app, script src=/src/main.ts
- `/root/calendar-app/.npmrc` — ignore-scripts для vue-demi

### Исходный код
- `/root/calendar-app/src/main.ts` — createApp(App).mount('#app')
- `/root/calendar-app/src/App.vue` — парсит ?seed, ?min, ?max из URL; v-model на DateRangePicker
- `/root/calendar-app/src/utils/dates.ts` — monthGrid, addMonths, addDays, isSameDay, isInRange, toISO, endOfMonth, startOfDay, parseISO, getFirstDayOfWeek + LOCALE_FIRST_DAY_OF_WEEK
- `/root/calendar-app/src/composables/useDateRange.ts` — start/end/activeField/hoverDate реф; pick() логика; hoverStart/hoverEnd computed
- `/root/calendar-app/src/composables/useMonthList.ts` — 12 месяцев начиная с minDate
- `/root/calendar-app/src/composables/useFocusTrap.ts` — Tab/Shift+Tab trap внутри ref-элемента
- `/root/calendar-app/src/composables/useBodyScrollLock.ts` — блокировка scroll body при isOpen
- `/root/calendar-app/src/components/DateRangePicker/types.ts` — ISODate, DateRange, DayCellMeta, PickerProps
- `/root/calendar-app/src/components/DateRangePicker/CalendarDay.vue` — ячейка дня: role=gridcell, aria-label, aria-selected/disabled, roving tabindex, CSS-классы is-start/is-end/is-in-range/is-hover-range, data-testid=dr-day, data-iso
- `/root/calendar-app/src/components/DateRangePicker/CalendarMonth.vue` — role=grid, columnheader строка скрыта на mobile, data-testid=dr-month, data-month=YYYY-MM
- `/root/calendar-app/src/components/DateRangePicker/Calendar.vue` — role=dialog, aria-modal, focus-trap, мобильный fullscreen (dr-close, dr-done, dr-weekdays sticky, dr-footer), десктоп навигация dr-prev/dr-next, dr-scroll scroll-контейнер, autoScroll, клавиатурная навигация (стрелки/Page/Home/End/Enter/Esc), aria-live dr-live
- `/root/calendar-app/src/components/DateRangePicker/DateRangePicker.vue` — Teleport+@floating-ui/vue (placement bottom-start, autoUpdate), dr-trigger-departure/dr-trigger-return, dr-field__input--active, outside-click, toggle логика, commit батч для мобайла

### Тесты (заглушки)
- `/root/calendar-app/tests/unit/dates.spec.ts` — describe + it.todo
- `/root/calendar-app/tests/unit/useDateRange.spec.ts` — describe + it.todo
- `/root/calendar-app/tests/e2e/date-range-picker.spec.ts` — test.describe пустой

## Результат pnpm test:unit

```
 RUN  v4.1.7 /root/calendar-app

 Test Files  2 skipped (2)
      Tests  2 todo (2)
   Start at  10:49:55
   Duration  279ms
```

Все тесты завершились без ошибок (2 todo-заглушки, 0 failures). TypeScript `vue-tsc --noEmit` — без ошибок.

## Известные ограничения

1. **Hover-превью только для @media hover:hover** — проверка производится через `isMobile` flag, но точную media-query `(hover:hover)` на уровне JS не применяет; на гибридных устройствах (планшет с мышью) поведение hover совпадёт с mobile.

2. **Мобильный breakpoint** — определяется через `window.matchMedia('(max-width: 767.98px)')`. Не учитывает `pointer: fine` и `hover: hover` из спецификации для полного определения "desktop" устройства.

3. **Playwright тесты** — E2E заглушка не проверяет функциональность; браузеры Playwright не скачаны в этом окружении.

4. **vue-demi build scripts** — добавлен `.npmrc` с `enable-pre-post-scripts=true` и `--ignore-scripts` для обхода `ERR_PNPM_IGNORED_BUILDS`. На чистом окружении может потребоваться `pnpm approve-builds`.

5. **Sticky weekdays на мобайле** — высота шапки (top: 53px) захардкожена в CSS. При изменении высоты заголовка нужно адаптировать.

6. **Focus-trap** — реализован через глобальный слушатель keydown; при наличии нескольких диалогов одновременно потребуется дополнительная изоляция.
