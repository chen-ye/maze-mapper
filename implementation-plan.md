# Dungeon Mapper Implementation Plan

## 1\. Objective

Create a browser-based tool for mapping text adventure game mazes. The app
allows users to document their current location, track exits/hazards,
automatically generate new rooms by moving in cardinal directions, and visualize
the entire map layout.

## 2\. Technical Architecture

- **Framework:** [Lit](https://lit.dev/ "null") (v3) for reactive state
  management and component rendering.

- **UI Library:** [Shoelace](https://shoelace.style/ "null") for polished,
  accessible web components (buttons, inputs, cards, drawers).

- **Persistence:** `localStorage` to save the map state between sessions.

- **Browser Target:** Modern Chromium/Blink-based browsers (per user
  preference).

## 3\. Data Model

- **Coordinate System:** Cartesian grid where `x` increases East and `y`
  increases North.

- **Room Object:**

  ```
  {
    "id": "0,0",
    "x": 0,
    "y": 0,
    "name": "Start",
    "description": "",
    "hazards": "",
    "exits": { "n": false, "s": false, "e": false, "w": false },
    "color": "var(--sl-color-neutral-500)"
  }
  ```

- **Global State:**

  - `rooms`: A dictionary mapping coordinate strings (`"x,y"`) to Room objects.

  - `currentX`, `currentY`: The player's current coordinates.

## 4\. Features & UI Layout

### A. Visual Map (View)

- An infinite canvas container using CSS absolute positioning.

- Rooms rendered as tiles.

- The "Current Room" is highlighted.

- Lines or indicators showing connections/exits.

### B. Room Editor (Controller)

- **Room Details:** Inputs for Room Name, Description, and Hazards.

- **Exits:** Checkboxes or toggle switches to manually mark open paths.

- **Navigation:** A directional pad (N, S, E, W). Clicking a direction:

  1. Updates the current coordinate.

  2. Checks if a room exists there.

  3. If not, creates a new room and links it to the previous one (updating exits
     for both).

### C. Persistence

- `saveState()`: Called on any data mutation, serializes `rooms` and `position`
  to `localStorage`.

- `loadState()`: Called on `connectedCallback` to hydrate the store.
