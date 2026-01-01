
    import { LitElement, html, css } from 'https://esm.sh/lit@3.1.2';
    import { repeat } from 'https://esm.sh/lit@3.1.2/directives/repeat.js';

    // --- Shoelace Manual Setup ---
    import { setBasePath } from 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/utilities/base-path.js';

    // Set the base path for icons and assets
    setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/');

    // Import components used in the template
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/button/button.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/icon/icon.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/card/card.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/divider/divider.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/input/input.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/textarea/textarea.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/checkbox/checkbox.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/switch/switch.js';


    class DungeonMapper extends LitElement {
      static styles = css`
        :host {
          display: block;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          touch-action: none; /* Prevent browser handling of gestures */
        }



        /* Map Area */
        .map-viewport {
          background-color: var(--sl-color-neutral-100);
          background-image: radial-gradient(var(--sl-color-neutral-300) 1px, transparent 0);
          background-size: var(--sl-spacing-large) var(--sl-spacing-large);
          background-position: center center;
          position: relative;
          height: 100%;
          width: 100%;
        }

        .map-viewport:active {
          cursor: grabbing;
        }

        .map-world {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: 0 0;
          transition: transform 0.1s ease-out;
          will-change: transform;
        }

        .room-node {
          position: absolute;
          width: 60px;
          height: 60px;
          background: var(--sl-color-neutral-0);
          border: 2px solid var(--sl-color-neutral-300);
          border-radius: var(--sl-border-radius-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--sl-font-size-x-small);
          text-align: center;
          color: var(--sl-color-neutral-700);
          box-shadow: var(--sl-shadow-small);
          transform: translate(-50%, -50%);
          transition: all 0.2s ease;
          user-select: none;
        }

        .room-node.current {
          background: var(--sl-color-primary-600);
          border-color: var(--sl-color-primary-700);
          color: var(--sl-color-neutral-0);
          z-index: 10;
          box-shadow: 0 0 var(--sl-spacing-medium) var(--sl-color-primary-200);
        }

        .room-node.hazard {
          border-color: var(--sl-color-danger-500);
          background-color: var(--sl-color-danger-50);
        }

        .room-node.hazard::after {
          content: '!';
          position: absolute;
          top: calc(-1 * var(--sl-spacing-x-small));
          right: calc(-1 * var(--sl-spacing-x-small));
          background: var(--sl-color-danger-600);
          color: var(--sl-color-neutral-0);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-weight: var(--sl-font-weight-bold);
          font-weight: var(--sl-font-weight-bold);
          line-height: 16px;
        }

        .room-node.unexplored {
            background-color: var(--sl-color-neutral-200);
            color: var(--sl-color-neutral-500);
        }

        .room-node.phantom {
            opacity: 0.6;
            border-style: dashed;
            background: transparent;
            cursor: pointer;
            z-index: 5; /* Below current room but clickable */
        }
        .room-node.phantom:hover {
            opacity: 1;
            background: var(--sl-color-primary-50);
            border-color: var(--sl-color-primary-400);
        }

        /* Connections */
        .connector {
          position: absolute;
          background: var(--sl-color-neutral-400);
          z-index: 0;
          transform: translate(-50%, -50%);
        }
        .connector.vertical { width: 2px; height: 40px; }
        .connector.horizontal { width: 40px; height: 2px; }

        .hud {
            position: absolute;
            top: var(--sl-spacing-medium);
            right: var(--sl-spacing-medium);
            display: flex;
            gap: var(--sl-spacing-small);
        }

        .details-panel {
            position: absolute;
            bottom: var(--sl-spacing-medium);
            left: var(--sl-spacing-medium);
            width: 300px;
            background: var(--sl-color-neutral-0);
            border-radius: var(--sl-border-radius-medium);
            box-shadow: var(--sl-shadow-large);
            padding: var(--sl-spacing-medium);
            display: flex;
            flex-direction: column;
            gap: var(--sl-spacing-small);
            z-index: 100;
        }

        .details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-weight: bold;
            color: var(--sl-color-primary-600);
        }

        @media (max-width: 600px) {
            .details-panel {
                width: 100%;
                left: 0;
                bottom: 0;
                border-radius: var(--sl-border-radius-medium) var(--sl-border-radius-medium) 0 0;
                box-sizing: border-box;
                margin: 0;
            }
        }
      `;

      static properties = {
        rooms: { type: Object },
        currentX: { type: Number },
        currentY: { type: Number },
        panX: { type: Number },
        panY: { type: Number },
        isDragging: { type: Boolean },
        saveStatus: { type: String },
        importOpen: { type: Boolean },
        editingId: { type: String }
      };

      constructor() {
        super();
        this.rooms = {};
        this.currentX = 0;
        this.currentY = 0;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.TILE_SIZE = 100;
        this.saveStatus = '';
        this.importOpen = false;
        this.editingId = null;
      }

      connectedCallback() {
        super.connectedCallback();
        this.loadState();
        if (Object.keys(this.rooms).length === 0) {
          this.createRoom(0, 0, "Start");
        }
      }

      // --- Data Logic ---

      get currentRoomId() {
        return `${this.currentX},${this.currentY}`;
      }

      get currentRoom() {
        return this.rooms[this.currentRoomId];
      }

      createRoom(x, y, name = "") {
        const id = `${x},${y}`;
        if (this.rooms[id]) return;

        this.rooms = {
          ...this.rooms,
          [id]: {
            id,
            x,
            y,
            name,
            notes: "",
            hazards: "",
            explored: true,
            exits: { n: false, s: false, e: false, w: false }
          }
        };
        this.saveState();
      }

      updateCurrentRoom(updates) {
        if (!this.currentRoom) return;

        const updatedRoom = { ...this.currentRoom, ...updates };
        this.rooms = {
          ...this.rooms,
          [this.currentRoomId]: updatedRoom
        };
        this.saveState();
      }

      move(direction) {
        let dx = 0, dy = 0;
        if (direction === 'n') dy = 1;
        if (direction === 's') dy = -1;
        if (direction === 'e') dx = 1;
        if (direction === 'w') dx = -1;

        const newX = this.currentX + dx;
        const newY = this.currentY + dy;
        const newId = `${newX},${newY}`;

        // Update exits of CURRENT room
        const currentExits = { ...this.currentRoom.exits, [direction]: true };
        this.updateCurrentRoom({ exits: currentExits });

        // Create new room if needed
        if (!this.rooms[newId]) {
          this.createRoom(newX, newY, "");
        }

        // Connect BACK from new room
        const opposite = { n: 's', s: 'n', e: 'w', w: 'e' }[direction];
        const targetRoom = this.rooms[newId];
        const targetExits = { ...targetRoom.exits, [opposite]: true };

        this.rooms = {
            ...this.rooms,
            [newId]: { ...targetRoom, exits: targetExits }
        };

        // Move
        this.currentX = newX;
        this.currentY = newY;

        // Auto-pan
        this.panX = -this.currentX * this.TILE_SIZE;
        this.panY = this.currentY * this.TILE_SIZE;

        this.saveState();
      }

      // --- Persistence ---

      saveState() {
        const state = {
          rooms: this.rooms,
          currentX: this.currentX,
          currentY: this.currentY
        };
        localStorage.setItem('dungeon-mapper-v1', JSON.stringify(state));

        const now = new Date();
        this.saveStatus = `Saved ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      }

      loadState() {
        const raw = localStorage.getItem('dungeon-mapper-v1');
        if (raw) {
          try {
            const state = JSON.parse(raw);
            this.rooms = state.rooms || {};
            this.currentX = state.currentX || 0;
            this.currentY = state.currentY || 0;
            // Center on loaded position
            this.panX = -this.currentX * this.TILE_SIZE;
            this.panY = this.currentY * this.TILE_SIZE;
            this.saveStatus = 'Loaded from storage';
          } catch (e) {
            console.error("Failed to load save", e);
            this.saveStatus = 'Load failed';
          }
        }
      }

      resetMap() {
        if(confirm("Are you sure? This will delete all map data.")) {
            this.rooms = {};
            this.currentX = 0;
            this.currentY = 0;
            this.createRoom(0,0, "Start");
            this.panX = 0;
            this.panY = 0;
            this.saveState();
            this.saveStatus = 'Map reset';
        }
      }

      exportData() {
        const raw = localStorage.getItem('dungeon-mapper-v1');
        if(!raw) return alert("No data to export.");
        navigator.clipboard.writeText(raw).then(() => {
            alert("Map data copied to clipboard! You can save this to a text file.");
        }).catch(err => {
            console.error(err);
            alert("Failed to copy to clipboard.");
        });
      }

      async importData() {
        // Simple prompt for paste
        const raw = prompt("Paste your map JSON string here:");
        if (raw) {
            try {
                // Validate JSON
                JSON.parse(raw);
                localStorage.setItem('dungeon-mapper-v1', raw);
                this.loadState();
                alert("Map imported successfully!");
            } catch (e) {
                alert("Invalid JSON data.");
            }
        }
      }

      addRoomAt(dir) {
        let dx = 0, dy = 0;
        if (dir === 'n') dy = 1;
        if (dir === 's') dy = -1;
        if (dir === 'e') dx = 1;
        if (dir === 'w') dx = -1;

        const newX = this.currentX + dx;
        const newY = this.currentY + dy;

        // Ensure connection logic handles creation
        this.move(dir);
      }

      // --- Map Interaction ---

      handleWheel(e) {
        e.preventDefault();
        this.panX -= e.deltaX;
        this.panY -= e.deltaY;
      }

      startDrag(e) {
        // e.preventDefault(); // Don't prevent default here for mouse, might break focus? For touch it's handled by CSS touch-action
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }

      doDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault(); // Prevent scroll on touch if any
        this.panX = e.clientX - this.dragStart.x;
        this.panY = e.clientY - this.dragStart.y;
      }

      stopDrag(e) {
        this.isDragging = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      // --- Rendering ---

      stopRename(e) {
         if(e.key === 'Enter' || e.type === 'blur') {
             this.editingId = null;
         }
      }

      renderDetailsPanel() {
        if (!this.currentRoom) return '';
        const room = this.currentRoom;

        return html`
            <div class="details-panel" @mousedown=${(e) => e.stopPropagation()}>
                <div class="details-header">
                    <span>Room Details</span>
                    <sl-switch
                        size="small"
                        ?checked=${room.explored}
                        @sl-change=${(e) => this.updateCurrentRoom({ explored: e.target.checked })}
                    >Explored</sl-switch>
                </div>

                <sl-input
                    label="Name"
                    size="small"
                    value=${room.name || ''}
                    @sl-input=${(e) => this.updateCurrentRoom({ name: e.target.value })}
                ></sl-input>

                <sl-textarea
                    label="Notes"
                    size="small"
                    rows="2"
                    resize="none"
                    value=${room.notes || ''}
                    @sl-input=${(e) => this.updateCurrentRoom({ notes: e.target.value })}
                ></sl-textarea>

                <sl-input
                    label="Hazards"
                    size="small"
                    value=${room.hazards || ''}
                    @sl-input=${(e) => this.updateCurrentRoom({ hazards: e.target.value })}
                >
                    <sl-icon slot="prefix" name="exclamation-triangle"></sl-icon>
                </sl-input>
            </div>
        `;
      }

      renderMap() {
        const DIRECTIONS = [
          { dir: 'n', type: 'vertical', dx: 0, dy: -50 },
          { dir: 's', type: 'vertical', dx: 0, dy: 50 },
          { dir: 'e', type: 'horizontal', dx: 50, dy: 0 },
          { dir: 'w', type: 'horizontal', dx: -50, dy: 0 }
        ];

        return repeat(Object.values(this.rooms), (room) => room.id, (room) => {
          const left = room.x * this.TILE_SIZE;
          const top = -room.y * this.TILE_SIZE;

          const isCurrent = room.x === this.currentX && room.y === this.currentY;
          const hasHazard = room.hazards && room.hazards.length > 0;

          return html`
            ${repeat(DIRECTIONS, (d) => d.dir, ({dir, type, dx, dy}) =>
                room.exits[dir]
                   ? html`<div class="connector ${type}" style="left: ${left + dx}px; top: ${top + dy}px;"></div>`
                   : ''
            )}
            <div
              class="room-node ${isCurrent ? 'current' : ''} ${hasHazard ? 'hazard' : ''} ${!room.explored ? 'unexplored' : ''}"
              style="left: ${left}px; top: ${top}px;"
              @click=${() => { this.currentX = room.x; this.currentY = room.y; }}
              @dblclick=${() => this.editingId = room.id}
            >
              ${this.editingId === room.id
                ? html`<input
                        autofocus
                        value="${room.name}"
                        style="width: 50px; font-size: 10px;"
                        @click=${(e) => e.stopPropagation()}
                        @keydown=${(e) => this.stopRename(e)}
                        @blur=${(e) => this.stopRename(e)}
                        @input=${(e) => this.updateCurrentRoom({ name: e.target.value })}
                       >`
                : (room.name || 'Room')
              }
            </div>
          `;
        });
      }

      renderPhantoms() {
        if(!this.currentRoom) return null;

        const DIRECTIONS = [
          { dir: 'n', dx: 0, dy: 1 },
          { dir: 's', dx: 0, dy: -1 },
          { dir: 'e', dx: 1, dy: 0 },
          { dir: 'w', dx: -1, dy: 0 }
        ];

        return repeat(DIRECTIONS, (d) => d.dir, ({dir, dx, dy}) => {
             const targetX = this.currentX + dx;
             const targetY = this.currentY + dy;
             const targetId = `${targetX},${targetY}`;

             // If room exists, no phantom
             if(this.rooms[targetId]) return '';

             const left = targetX * this.TILE_SIZE;
             const top = -targetY * this.TILE_SIZE;

             return html`
                <div
                    class="room-node phantom"
                    style="left: ${left}px; top: ${top}px;"
                    @click=${() => this.addRoomAt(dir)}
                    title="Add Room"
                >
                    <sl-icon name="plus"></sl-icon>
                </div>
             `;
        });
      }

      render() {
        const room = this.currentRoom || {};

        return html`
          <!-- Map Viewport -->
          <div
            class="map-viewport"
            style="background-position: calc(50% + ${this.panX}px) calc(50% + ${this.panY}px);"
            @pointerdown=${this.startDrag}
            @pointermove=${this.doDrag}
            @pointerup=${this.stopDrag}
            @pointercancel=${this.stopDrag}
            @wheel=${this.handleWheel}
          >
            <div class="map-world" style="transform: translate(${this.panX}px, ${this.panY}px);">
              ${this.renderPhantoms()}
              ${this.renderMap()}
            </div>
          </div>

          ${this.renderDetailsPanel()}

          <!-- HUD -->
          <div class="hud">
             <sl-button size="small" @click=${this.exportData} title="Export">
                 <sl-icon slot="prefix" name="box-arrow-up"></sl-icon>
             </sl-button>
             <sl-button size="small" @click=${this.importData} title="Import">
                 <sl-icon slot="prefix" name="box-arrow-in-down"></sl-icon>
             </sl-button>
             <sl-button size="small" variant="danger" outline @click=${this.resetMap} title="Reset">
                 <sl-icon slot="prefix" name="trash"></sl-icon>
             </sl-button>
          </div>
        `;
      }
    }

    customElements.define('dungeon-mapper', DungeonMapper);
