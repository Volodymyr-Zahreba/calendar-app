# QA Отчёт — Итерация 1

## РЕЗУЛЬТАТ: PASS

Все тесты зелёные — реализация соответствует спецификации полностью.

---

### Unit-тесты
- Всего: 59
- Прошло: 59
- Упало: 0

### E2E-тесты (chromium desktop + mobile эмуляция)
- Всего: 30
- Прошло: 30
- Упало: 0

---

### Покрытие unit-тестами

#### `dates.spec.ts` (39 тестов)

**addMonths** — добавление/вычитание месяцев, переход года, зажим дней при переполнении (Jan 31 → Feb 28)

**addDays** — добавление/вычитание дней, переход месяца и года

**isSameDay** — совпадение/несовпадение дат, игнорирование времени

**isInRange** — граничные значения (включительно), значения вне диапазона, однодневный диапазон

**toISO** — форматирование YYYY-MM-DD, padding однозначных месяца и дня

**endOfMonth** — 31/30-дневные месяцы, февраль обычного и високосного года

**monthGrid** — 42 ячейки, исключение года < 1900, корректный первый день недели (Mon/Sun), inCurrentMonth, отключение по minDate/maxDate, последовательность дат

#### `useDateRange.spec.ts` (20 тестов)

**6 кейсов симметричного правила pick:**
1. from, d > end → end=d, activeField='from' (остаётся)
2. from, d === end → end=d, activeField='from' (граница)
3. from, d < start → start=d, activeField='to'
4. from, start ≤ d < end → start=d, activeField='to'
5. to, d > end → end=d, activeField='from'
6. to, d === start → start=d, activeField='to' (граница)
7. to, d < start → start=d, activeField='to' (остаётся)
8. to, start < d ≤ end → end=d, activeField='from'
9. Инвариант: end ≥ start после цепочки из 6 пиков
10. setActiveField переключает поле

**Hover preview (6 тестов):**
- d > end: hoverStart=start, hoverEnd=d
- d < start: hoverStart=d, hoverEnd=end
- d внутри диапазона → null/null
- d === start → null/null (граница = внутри)
- d === end → null/null (граница = внутри)
- hoverDate=null → null/null

---

### Покрытие E2E-тестами

#### Desktop (24 теста)
1. Открытие попапа кликом на dr-trigger-departure
2. Закрытие повторным кликом (toggle)
3. 12 месяцев в dr-scroll
4. data-month атрибуты в формате YYYY-MM
5. Классы is-start и is-end по seed-параметру
6. Класс is-in-range для дней внутри диапазона
7. Клик по дню → is-start
8. Два клика → диапазон с is-start, is-in-range, is-end
9. Симметричный pick: from + d > end → end обновляется, from остаётся активным
10. Симметричный pick: from + d < end → start обновляется, to активен
11. Симметричный pick: to + d > start → end обновляется, from активен
12. Симметричный pick: to + d < start → start обновляется, to остаётся
13. Outside-click закрывает десктоп попап
14. Hover preview: is-hover-range появляется за пределами диапазона
15. Нет is-hover-range при наведении внутри диапазона
16. dr-prev и dr-next видны на desktop
17. dr-next прокручивает вперёд (scrollLeft увеличивается)
18. dr-prev прокручивает назад (scrollLeft уменьшается)
19. Departure-триггер получает dr-field__input--active при открытии через departure
20. Return-триггер получает dr-field__input--active при открытии через return
21. Клик на return-триггер когда попап открыт переключает activeField на to
22. dr-live присутствует в DOM
23. dr-done и dr-close не видны на desktop
24. dr-weekdays не виден на desktop

#### Mobile (6 тестов, эмуляция viewport 390×844 + hasTouch)
25. Fullscreen calendar открывается, ширина равна viewport
26. dr-weekdays виден на мобайле
27. dr-weekdays sticky — Y-позиция не меняется при скролле
28. dr-done закрывает календарь
29. dr-close закрывает календарь
30. dr-prev и dr-next не видны на мобайле

---

### Упавшие тесты

Нет. Все тесты прошли с первого запуска после корректной настройки окружения.

---

### Технические детали прогона

- **Unit-тесты**: Vitest v4.1.7, happy-dom окружение, 364ms
- **E2E-тесты**: Playwright v1.60.0, Chromium (headless-shell), 12.6s
- **Dev-сервер**: Vite v8.0.13 на порту 5173 (reuseExistingServer)
- **Проблемы при настройке** (решены автоматически):
  - Missing `libnspr4.so` → устранено через `playwright install-deps`
  - `page.goto('/?...')` не применял baseURL → исправлено на абсолютные URL `http://localhost:5173/...`
  - `test.use({ ...devices['iPhone 13'] })` в describe-группе вызывает ошибку `defaultBrowserType` → заменено на `{ viewport, hasTouch, userAgent }`

### Что нужно исправить dev-агенту

Ничего. Реализация полностью соответствует спецификации.
