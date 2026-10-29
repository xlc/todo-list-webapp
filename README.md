# A little every day — Todo List

A calm, responsive place to organize your tasks. Built with React, TypeScript, Vite, and ordinary CSS. No accounts, backend, external fonts, or UI framework.

## Get started

Install a current stable [Bun](https://bun.sh/) release. Use Node.js 22.12+ (or a newer supported LTS release) for the Vite and test tooling.

```sh
bun install
bun run dev
```

Open the local URL printed by Vite. For an externally accessible development sandbox, use `bun run dev -- --host 0.0.0.0`.

## Using your list

- Type a task and press **Enter** or choose **Add task**. Task text is trimmed; blank tasks are rejected. Duplicate names are allowed.
- Check a task to complete it; uncheck it to make it active again.
- Choose **Edit** to change a task. **Enter** or **Save** commits; **Escape** or **Cancel** discards the draft. Moving focus away does not save. Empty edits show an error without deleting the task.
- Use **All**, **Active**, and **Completed** to filter the list. Switching filters cancels an open edit.
- **Delete** removes one task. **Clear completed** removes all completed tasks, including those hidden by the current filter.
- The remaining count always includes all incomplete tasks, regardless of the selected filter.

Controls work with the keyboard: Tab/Shift+Tab moves between them, Space toggles checkboxes, and Enter activates buttons. Inline editors receive focus automatically. Removing a visible row moves focus to a surviving task, or to the add input when none remains. All row actions are available without hovering. The layout adapts to mobile and desktop, wraps long text, and respects reduced-motion preferences.

## Local data and privacy

Tasks are saved in localStorage under `todo-list-webapp:v1` as a versioned JSON envelope. Only task IDs, text, and completion state are stored; filters and editing drafts are temporary.

Your list belongs to the **current browser and origin** (protocol, hostname, and port). It is not synchronized across devices, tabs, or browsers, and there is no backup. Clearing browser data can remove it. Development and preview ports have separate lists. Avoid storing sensitive information on shared devices.

If storage is blocked or full, the app remains usable in memory and displays a warning that changes may not survive a reload. A later successful mutation retries saving the current list. Malformed or unsupported saved data is not overwritten merely by opening the app: a notice explains that the next task mutation will replace it. With multiple tabs open, the last successful save wins.

## Tests and production build

```sh
bun run test        # Vitest, non-watch mode
bun run test:watch  # Interactive development tests
bun run lint       # Oxlint
bun run build      # TypeScript checks and production bundle in dist/
bun run preview    # Serve the built bundle locally
```

The automated suite covers immutable task operations, filtering/counts, versioned storage validation and failures, keyboard entry, editing, cancellation, focus recovery, empty states, persistence across remounts, and in-memory fallback. Tests use jsdom and React Testing Library, with isolated storage for every test.

For browser verification, exercise all task actions in both development and production preview, reload to confirm persistence, and check keyboard navigation and focus after removing rows. Inspect 320px, 768px, and 1440px layouts, 200% zoom, long text, and reduced-motion mode. Automated DOM tests do not replace visual or screen-reader checks.

## GitHub Pages deployment

The deployment workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and can also be started manually from the Actions tab. It installs dependencies with `bun install --frozen-lockfile`, runs tests and lint, builds the Vite app, and uploads `dist/` for deployment to the `github-pages` environment. Only the deployment job receives Pages write and OIDC permissions.

Before the first deployment, a repository administrator must open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The workflow does not enable Pages or change repository settings itself. If a run fails because Pages is not enabled, select that source and rerun the workflow. Any protection rules on the `github-pages` environment must also allow deployment from `main`.

The expected project URL is https://xlc.github.io/todo-list-webapp/ once deployment succeeds. `vite.config.ts` sets `base: '/todo-list-webapp/'` so built scripts, styles, and the favicon use that project path. Development and production preview also use `/todo-list-webapp/`; follow the URL printed by Vite. If the repository is renamed or a custom domain is configured, update the base path to match the hosting location.

## Project layout

```text
src/
  App.tsx              Page composition, filters, announcements, focus recovery
  App.css              Responsive app layout
  index.css            Shared styles and focus tokens
  components/
    TodoForm.tsx       Add form and validation
    TodoItem.tsx       Task row and inline editor
  todos.ts             Pure immutable task operations and derived state
  storage.ts           Versioned storage validation and error handling
  useTodos.ts          State and mutation-only persistence
  *.test.ts(x)         Task, storage, and UI coverage
  test/setup.ts        Test cleanup and browser-storage isolation
public/favicon.svg     Local app icon
vitest.config.ts       DOM test configuration
```

No account system or cross-tab synchronization is included. `bun run preview` is for local build inspection, not a production hosting server.
