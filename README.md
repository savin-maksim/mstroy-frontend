# MStroy Frontend — TreeStore

Тестовое задание: класс `TreeStore` для работы с древовидными данными и Vue-компонент для их визуализации через AgGrid.

## Описание задачи

Дан массив объектов с полями `id` и `parent`, формирующих дерево. `id` может быть числом или строкой. Порядок и нумерация не гарантированы.

```ts
const items = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]
```

Реализован класс `TreeStore`, принимающий этот массив в конструктор и предоставляющий методы для навигации, добавления, удаления и обновления элементов. Для визуализации создан Vue-компонент с AgGrid (Enterprise) в режиме Tree Data.

## Методы TreeStore

| Метод | Описание | Сложность |
|---|---|---|
| `getAll()` | Возвращает исходный массив элементов | O(1) |
| `getItem(id)` | Возвращает элемент по id | O(1) |
| `getChildren(id)` | Возвращает прямых потомков элемента | O(1) |
| `getAllChildren(id)` | Возвращает всех потомков рекурсивно (BFS) | O(k) |
| `getAllParents(id)` | Возвращает цепочку родителей от элемента до корня | O(d) |
| `addItem(item)` | Добавляет элемент в хранилище | O(1) |
| `removeItem(id)` | Удаляет элемент и всех его потомков | O(n+k) |
| `updateItem(item)` | Обновляет элемент, поддерживает смену parent | O(1) |

> **k** — количество потомков, **d** — глубина дерева, **n** — общее число элементов.

Быстродействие достигается за счёт двух индексов на основе `Map`:
- `itemMap` — поиск элемента по id за O(1)
- `childrenMap` — получение списка детей по parent за O(1)

## Стек технологий

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript** (strict mode)
- **Vite 8** (сборка и dev-сервер)
- **AgGrid Enterprise** (Tree Data, Vue 3)
- **SCSS** (БЭМ-методология, без scoped)
- **Vitest** + **Vue Test Utils** (юнит-тесты)
- **ESLint** (flat config, typescript-eslint, eslint-plugin-vue)
- **Prettier** (форматирование кода)

## Структура проекта (Feature-Sliced Design)

```
src/
├── app/                          # Точка входа приложения
│   ├── App.vue
│   ├── main.ts
│   └── styles/
│       └── global.scss
├── pages/                        # Страницы
│   └── home/ui/
│       └── HomePage.vue
├── widgets/                      # Составные виджеты
│   └── tree-table/ui/
│       └── TreeTable.vue         # AgGrid таблица с Tree Data
├── features/                     # Пользовательские сценарии
│   └── manage-items/ui/
│       ├── ItemForm.vue          # Форма добавления/редактирования/удаления
│       └── __tests__/
│           └── ItemForm.test.ts
├── entities/                     # Бизнес-сущности
│   └── tree-item/model/
│       ├── TreeStore.ts          # Класс-хранилище
│       ├── useTreeStore.ts       # Vue composable обёртка
│       └── __tests__/
│           └── TreeStore.test.ts
└── shared/                       # Общие ресурсы
    ├── types/index.ts            # ItemId, ITreeItem
    └── styles/_variables.scss    # SCSS-переменные цветов
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Dev-сервер
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## Линтинг и форматирование

```bash
# Проверка ESLint
npm run lint

# Автоисправление ESLint
npm run lint:fix

# Форматирование Prettier
npm run format
```

## Тестирование

```bash
# Запуск тестов в watch-режиме
npm test

# Однократный запуск тестов
npm run test:run
```

### Покрытие тестами

**TreeStore** (28 тестов):
- `getAll` — возврат всех элементов, иммутабельность исходных данных
- `getItem` — поиск по числовому и строковому id, несуществующий id
- `getChildren` — прямые потомки, листовые узлы, несуществующий id
- `getAllChildren` — все потомки рекурсивно, листовые узлы
- `getAllParents` — цепочка до корня, порядок элементов, корневой элемент
- `addItem` — добавление с числовым/строковым id, корневой элемент
- `removeItem` — удаление листа, каскадное удаление потомков, очистка индексов
- `updateItem` — обновление label, смена parent, перемещение в корень
- Перфоманс-тест на 10 000 элементах

**ItemForm** (15 тестов):
- Режимы добавления и редактирования
- Эмиты add/update/remove/cancel
- Валидация обязательных полей (id, parent, label)
- Парсинг числовых и строковых id
- Навигация фокуса по Enter
- Наполнение select родительскими элементами

## Интерфейс элемента

```ts
type ItemId = number | string

interface ITreeItem {
  id: ItemId
  parent: ItemId | null
  label?: string
  [key: string]: unknown
}
```

## Функциональность AgGrid таблицы

- Отображение дерева с разворачиваемыми строками (Tree Data, Self-Referential)
- Колонка **№ п/п** — порядковый номер строки
- Колонка **ID** — идентификатор элемента
- Колонка **Категория** — «Группа» (есть дети) или «Элемент» (лист)
- Колонка **Label** — автогруппировка с иерархией
- Все строки развёрнуты по умолчанию
- Выбор строки для редактирования в форме

## Форма управления элементами

- Добавление нового элемента (id, parent, label)
- Редактирование существующего (id заблокирован)
- Удаление элемента с каскадным удалением потомков
- Валидация: все поля обязательны
- Навигация: Enter в поле ID переводит фокус на Parent
