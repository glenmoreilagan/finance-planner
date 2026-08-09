# Pera Goals

Pera Goals is a small mobile-first personal finance planner for tracking savings goals in Philippine pesos. It runs entirely in the browser with plain HTML, CSS, and JavaScript.

## What It Does

- Creates savings goals with a name, target amount, saved amount, category, and goal set.
- Groups goals by set, such as `Government`, `Investing`, `Personal`, or `Family`.
- Tracks total saved, goal count, category count, and average progress.
- Provides quick-add buttons for common contribution amounts.
- Lets users create color-coded categories.
- Persists data locally in the browser with `localStorage`.

## Project Structure

```text
finance-app/
|-- index.html   # App markup and templates
|-- styles.css   # Mobile-first UI styling
|-- app.js       # State, rendering, event handlers, persistence
`-- README.md    # Project context
```

## Running Locally

No install or build step is required.

Open `index.html` directly in a browser, or serve the folder with any static file server:

```powershell
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Data Storage

The app stores all user data in browser `localStorage` under this key:

```text
pera-goals-state
```

Data stays on the same browser and device. There is no backend, account system, export, import, or sync.

To reset the app manually, clear that `localStorage` key in browser dev tools.

## Default Data

On first load, the app seeds:

- Categories: `PhilHealth`, `SSS`, `Banks`, `Stocks`
- Goals: `Monthly contributions`, `First stock portfolio`

After the user makes changes, the saved `localStorage` state replaces the seeded defaults.

## Implementation Notes

- The app uses `Intl.NumberFormat` with `en-PH` and `PHP` for currency display.
- Goal progress is calculated as `saved / target`, capped at `100%`.
- Deleting a category reassigns any affected goals to the first remaining category, or leaves them uncategorized if none remain.
- The UI is optimized for a narrow mobile layout with a maximum width of `440px`.

## Known Gaps

- Numeric fields are rendered as text inputs, so invalid values such as letters can enter the calculation path.
- Saved amounts can become negative if a negative value is entered manually.
- Existing goals and categories cannot be edited after creation.
- There is no validation or recovery if the saved `localStorage` JSON becomes invalid.
- There are no automated tests.
