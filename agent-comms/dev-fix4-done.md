# dev-fix4-done

Три точечных фикса применены и сборка прошла успешно.

## Фикс 1: Попап сдвигается вправо
- Файл: `src/components/DateRangePicker/DateRangePicker.vue`
- Изменено: `placement: 'bottom-start'` → `placement: 'bottom'`

## Фикс 2: Дублируются is-start/is-end на днях соседних месяцев
- Файл: `src/components/DateRangePicker/CalendarMonth.vue`
- Изменено: добавлено `cell.inCurrentMonth &&` перед `isStart(cell.date)` и `isEnd(cell.date)`

## Фикс 3: Форма слишком низко
- Файл: `src/App.vue`
- Изменено: убран `justify-content: center`, заменён `padding: 60px 20px` на `padding-top: 80px; padding-bottom: 40px`

## Сборка
```
✓ built in 210ms
```
