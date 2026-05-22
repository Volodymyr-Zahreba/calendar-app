# dev-fix3-done

Все три точечных фикса применены и сборка прошла успешно.

## Что исправлено

### Проблема 1: Попап уезжал вправо
- Файл: `src/components/DateRangePicker/DateRangePicker.vue`
- Изменение: `useFloating(departureRef, ...)` → `useFloating(fieldRef, ...)` + `shift({ padding: 8 })`
- Теперь якорь — весь блок `.dr-field` (полная ширина), а не узкая кнопка departure

### Проблема 2: Попап выходил за нижний край экрана
- Файл: `src/components/DateRangePicker/Calendar.vue`
- Добавлено в `.dr-calendar--desktop`: `max-height: calc(100vh - 120px); overflow: hidden; display: flex; flex-direction: column;`
- Добавлено в `.dr-calendar--desktop .dr-scroll`: `overflow-y: auto`

### Проблема 3: Фон менялся при открытии (position:fixed на body)
- Файл: `src/composables/useBodyScrollLock.ts`
- Убраны: `position: fixed`, `top: -scrollY`, `width: 100%`
- Оставлено только: `overflow: hidden` при открытии, сброс при закрытии

## Результат сборки
```
✓ built in 271ms
dist/assets/index-B9u8kIvR.js   101.89 kB │ gzip: 37.54 kB
```
