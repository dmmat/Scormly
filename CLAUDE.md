# Scormly

Локальний (local-first) конструктор навчальних курсів у блочному стилі (аналог
Articulate Rise) з експортом у формат **SCORM 1.2 / 2004**. Працює повністю на
стороні клієнта, без серверного бекенду. Дані, медіа та проєкти зберігаються у
файловій системі користувача через **File System Access API**, а SCORM-пакети
генеруються в браузері (JSZip).

Повне технічне завдання — див. ТЗ (Версія 2).

## Стек

- **React 18 + TypeScript** — компонентна блочна структура.
- **Vite** — збірка та dev-сервер (HMR).
- **Tailwind CSS v4** — стилізація (CSS-first конфіг через `@tailwindcss/vite`,
  без `tailwind.config.js`; тема — у `src/index.css` через `@theme`).
- **Zustand** — глобальний стан курсу (структура, активний урок; згодом
  undo/redo).
- Заплановано: **JSZip** (експорт SCORM), **dnd-kit / @hello-pangea/dnd**
  (drag-and-drop), **File System Access API** (робота з диском).

## Команди

```bash
npm install      # встановити залежності
npm run dev      # dev-сервер (http://localhost:5173)
npm run build    # перевірка типів (tsc --noEmit) + production-збірка
npm run preview  # локальний перегляд production-збірки
```

## Структура

```
src/
├── main.tsx                  # точка входу React
├── App.tsx                   # макет: Header + Sidebar + Workspace
├── index.css                 # Tailwind + бренд-тема (--color-brand)
├── types/course.ts           # модель даних: Course / Lesson / Block (ТЗ §4)
├── store/courseStore.ts      # Zustand store курсу
└── components/layout/        # Header, Sidebar, Workspace, Logo
```

## Бренд

Назва — **Scormly**. Акцентний колір — рожевий `#EC4899` (Tailwind-утиліти
`text-brand` / `bg-brand`, відтінки `brand-light`, `brand-dark`). Інтерфейс
світлий, у дусі Articulate Rise (багато білого простору, рожеві акценти на
активних елементах).

## Модель даних

Курс — ієрархічний JSON: `Course → Lesson[] → Block[]`. Кожен блок має `id`,
`type` (union `BlockType`), `settings` та `data`. Додавання нового типу блока =
розширення `BlockType` + відповідний компонент-рендерер. Зберігайте модель
декларативною та серіалізованою у JSON (це основа для `project.json` і експорту).

## Конвенції

- Суворий TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`).
- Перед комітом переконайтеся, що `npm run build` проходить без помилок.
- Коментарі — лише там, де потрібне пояснення «чому», а не «що».

## Деплой

Production-збірка деплоїться на **GitHub Pages** через workflow
`.github/workflows/deploy.yml` (push у головну гілку). Base-шлях для Pages
вмикається змінною `GITHUB_PAGES=true` (див. `vite.config.ts`).
