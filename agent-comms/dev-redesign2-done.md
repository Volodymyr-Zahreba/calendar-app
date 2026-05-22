# dev-redesign2-done

Статус: DONE. Сборка прошла без ошибок (37 модулей, 253ms).

## Изменённые файлы

### src/App.vue
- Фон изменён на `linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)`
- `.app__card` — padding уменьшен до `8px`, border-radius `24px`, box-shadow без изменений

### src/components/DateRangePicker/DateRangePicker.vue
- Return-инпут: иконка телефона заменена на иконку календаря (SVG rect+lines)
- `useFloating` middleware: `shift({ padding: 16 })` (было 8)
- `.dr-popup`: добавлен `max-width: calc(100vw - 32px)`
- `.dr-field__inputs`: фон `#f8f9fa`, рамка `#e2e8f0`, border-radius `12px`, палитра индиго
- `.dr-field__input--active`: inset shadow `#6366f1`, фон `#f5f3ff`
- `.dr-field__icon`: цвет `#6366f1`
- `.dr-field__label`: цвет `#64748b`
- `.dr-field__value`: цвет `#1e293b`, font-size 18px, weight 600
- `.dr-field__separator`: цвет `#a5b4fc`

### src/components/DateRangePicker/Calendar.vue
- `.dr-calendar`: box-shadow `0 4px 32px rgba(0,0,0,0.10)`, border `1px solid #e2e8f0`
- `.dr-prev`/`.dr-next`: размер 32px, border-radius 8px, фон `#f1f5f9`, цвет `#475569`, hover `#e2e8f0`
- `.dr-weekdays__day`: цвет `#94a3b8`
- `.dr-done`: цвет `#6366f1`, hover `#4f46e5`

### src/components/DateRangePicker/CalendarMonth.vue
- `.dr-month__weekday`: цвет `#94a3b8`

### src/components/DateRangePicker/CalendarDay.vue
- Hover: `background: #f1f5f9; border-radius: 8px` — чёткий контраст (было бледно-серый)
- `.is-start`/`.is-end`: фон ячейки `#ede9fe`, inner `background: #6366f1; color: #fff`
- `.is-in-range`: `background: #ede9fe; border-radius: 0; color: #4338ca`
- `.is-hover-range`: `background: #f5f3ff; border-radius: 0; color: #4338ca`
- `dr-day--disabled`: `color: #cbd5e1; cursor: not-allowed`
- `.dr-day--other-month`: цвет `#cbd5e1`
- `.dr-day__inner`: базовый цвет `#1e293b`
- Focus ring: `#6366f1`

## Критичные атрибуты — не тронуты
data-testid, CSS-классы is-start/is-end/is-in-range/is-hover-range/dr-field__input--active, логика компонентов.
