# BDD E2E тесты — отчёт агента dev

## Список созданных/изменённых файлов

### Конфигурация
- `/root/calendar-app/playwright.config.ts` — обновлён: добавлен `defineBddConfig` с раздельными outputDir для desktop (фильтр `not @mobile`) и mobile (`@mobile`)

### Feature-файлы (Gherkin)
- `tests/e2e/features/calendar-open-close.feature` — 5 сценариев: открытие, закрытие, переключение, 12 месяцев, активация поля Return
- `tests/e2e/features/date-selection.feature` — 7 сценариев: is-start, is-end, is-in-range, клик по дню, Scenario Outline с 3 примерами, out-of-month
- `tests/e2e/features/navigation.feature` — 4 сценария: кнопки Next/Prev, активное поле Departure/Return
- `tests/e2e/features/mobile.feature` — 4 сценария с тегом @mobile: fullscreen, weekday row, Done, Close

### Step definitions (TypeScript)
- `tests/e2e/steps/common.steps.ts` — Given: открытие приложения с seed (автоматически добавляет `min` на месяц раньше start date)
- `tests/e2e/steps/calendar.steps.ts` — When/Then: все действия и проверки календаря

### Замена старого теста
- `tests/e2e/date-range-picker.spec.ts` — заменён комментарием (старый spec оставлен в .js для справки)

## Результат bddgen

```
Генерация прошла без ошибок.

Сгенерированные файлы:
- .features-gen/desktop/tests/e2e/features/calendar-open-close.feature.spec.js
- .features-gen/desktop/tests/e2e/features/date-selection.feature.spec.js
- .features-gen/desktop/tests/e2e/features/navigation.feature.spec.js
- .features-gen/mobile/tests/e2e/features/mobile.feature.spec.js
```

## Результат playwright test

### Desktop (chromium) — 17/17 прошли
```
17 passed (3.8s)
```

### Mobile (mobile-chromium) — 4/4 прошли
```
4 passed (1.9s)
```

**Итого: 21/21 тестов прошли, 0 упали**

## Технические решения

1. **playwright-bdd v8 API**: вместо прямого импорта `Given/When/Then` используется `createBdd()` — API изменился в мажорной версии.

2. **Раздельные конфиги bdd**: для изоляции мобильных тестов созданы два `defineBddConfig` с `tags: 'not @mobile'` и `tags: '@mobile'` с разными `outputDir`.

3. **Автоматический `min` в seed**: шаг `Given I open the app with seed` автоматически вычисляет `min` на месяц раньше начальной даты, чтобы исторические даты (2025) рендерились в календаре.

4. **Строгий режим локаторов**: дни-дубликаты (out-of-month в соседнем месяце с тем же `data-iso`) исключаются через `:not(.dr-day--other-month)` в локаторах `[data-iso="..."]`.

5. **Состояние между шагами Prev**: шаг `I click the Prev button` сохраняет `scrollLeft` в свойство DOM-элемента `__scrollBefore`, которое читает шаг `the scroll position should have decreased`.
