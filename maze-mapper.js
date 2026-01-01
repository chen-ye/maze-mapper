
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


    class DungeonMapper extends LitElement {
      static styles = css`
        :host {
          display: grid;
          grid-template-columns: 1fr 350px;
          height: 100vh;
          width: 100vw;
        }

        @media (max-width: 768px) {
          :host {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }
        }

        /* Map Area */
        .map-viewport {
          background-color: var(--sl-color-neutral-100);
          background-image: radial-gradient(var(--sl-color-neutral-300) 1px, transparent 0);
          background-size: var(--sl-spacing-large) var(--sl-spacing-large);
          background-position: center center;
          position: relative;
          overflow: hidden;
          cursor: grab;
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
          line-height: 16px;
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

        /* Sidebar/Controls */
        .controls {
          background: var(--sl-color-neutral-0);
          border-left: 1px solid var(--sl-color-neutral-200);
          padding: var(--sl-spacing-large);
          display: flex;
          flex-direction: column;
          gap: var(--sl-spacing-medium);
          overflow-y: auto;
          box-shadow: var(--sl-shadow-large);
        }

        .d-pad {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr;
          gap: var(--sl-spacing-2x-small);
          width: 120px;
          margin: 0 auto;
        }

        .d-pad sl-button {
          width: 100%;
          height: 100%;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--sl-spacing-small);
        }

        h1 {
          font-size: var(--sl-font-size-large);
          font-weight: var(--sl-font-weight-bold);
          margin: 0;
          color: var(--sl-color-primary-600);
        }

        .stat-block {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sl-spacing-small);
          font-family: var(--sl-font-mono);
          color: var(--sl-color-neutral-500);
          font-size: var(--sl-font-size-small);
          margin-bottom: var(--sl-spacing-medium);
          text-align: center;
        }

        .save-status {
          font-size: var(--sl-font-size-small);
          color: var(--sl-color-success-600);
          text-align: right;
          min-height: 1rem;
        }

        .exits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: var(--sl-spacing-2x-small);
        }

        .data-tools {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--sl-spacing-small);
            margin-top: auto; /* Push to bottom if space allows */
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
        importOpen: { type: Boolean }
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

      createRoom(x, y, name = "New Room") {
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
          this.createRoom(newX, newY, "Unexplored");
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

      // --- Map Interaction ---

      handleWheel(e) {
        e.preventDefault();
        this.panX -= e.deltaX;
        this.panY -= e.deltaY;
      }

      startDrag(e) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
      }

      doDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.panX = e.clientX - this.dragStart.x;
        this.panY = e.clientY - this.dragStart.y;
      }

      stopDrag() {
        this.isDragging = false;
      }

      // --- Rendering ---

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
              class="room-node ${isCurrent ? 'current' : ''} ${hasHazard ? 'hazard' : ''}"
              style="left: ${left}px; top: ${top}px;"
              @click=${() => { this.currentX = room.x; this.currentY = room.y; }}
            >
              ${room.name || 'Room'}
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
            @mousedown=${this.startDrag}
            @mousemove=${this.doDrag}
            @mouseup=${this.stopDrag}
            @mouseleave=${this.stopDrag}
            @wheel=${this.handleWheel}
          >
            <div class="map-world" style="transform: translate(${this.panX}px, ${this.panY}px);">
              ${this.renderMap()}
            </div>
          </div>

          <!-- Controls Sidepanel -->
          <div class="controls">
            <div class="header-row">
                <h1>Mapper</h1>
                <div class="save-status">${this.saveStatus}</div>
            </div>

            <div class="stat-block">
                <div>X: ${this.currentX}</div>
                <div>Y: ${this.currentY}</div>
            </div>

            <!-- Navigation -->
            <sl-card class="nav-card">
              <div slot="header">Navigation</div>
              <div class="d-pad">
                <div></div>
                <sl-button @click=${() => this.move('n')}>N</sl-button>
                <div></div>
                <sl-button @click=${() => this.move('w')}>W</sl-button>
                <div style="display:grid; place-items:center; color:var(--sl-color-neutral-400);">
                    <sl-icon name="geo-alt-fill"></sl-icon>
                </div>
                <sl-button @click=${() => this.move('e')}>E</sl-button>
                <div></div>
                <sl-button @click=${() => this.move('s')}>S</sl-button>
                <div></div>
              </div>
            </sl-card>

            <sl-divider></sl-divider>

            <!-- Room Editor -->
            <sl-input
                label="Room Name"
                value=${room.name || ''}
                @sl-input=${(e) => this.updateCurrentRoom({ name: e.target.value })}
            ></sl-input>

            <sl-textarea
                label="Notes"
                rows="3"
                resize="auto"
                value=${room.notes || ''}
                @sl-input=${(e) => this.updateCurrentRoom({ notes: e.target.value })}
            ></sl-textarea>

             <sl-input
                label="Hazards / Enemies"
                help-text="Mark hazards to highlight room on map"
                value=${room.hazards || ''}
                @sl-input=${(e) => this.updateCurrentRoom({ hazards: e.target.value })}
            >
                <sl-icon slot="prefix" name="exclamation-triangle"></sl-icon>
            </sl-input>

            <div style="margin-top: var(--sl-spacing-medium);">
                <label style="font-size: var(--sl-input-label-font-size-medium);">Visible Exits</label>
                <div class="exits-grid">
                    <sl-checkbox
                        ?checked=${room.exits?.n}
                        @sl-change=${(e) => this.updateCurrentRoom({ exits: { ...room.exits, n: e.target.checked } })}
                    >N</sl-checkbox>
                    <sl-checkbox
                        ?checked=${room.exits?.s}
                        @sl-change=${(e) => this.updateCurrentRoom({ exits: { ...room.exits, s: e.target.checked } })}
                    >S</sl-checkbox>
                    <sl-checkbox
                        ?checked=${room.exits?.e}
                        @sl-change=${(e) => this.updateCurrentRoom({ exits: { ...room.exits, e: e.target.checked } })}
                    >E</sl-checkbox>
                    <sl-checkbox
                        ?checked=${room.exits?.w}
                        @sl-change=${(e) => this.updateCurrentRoom({ exits: { ...room.exits, w: e.target.checked } })}
                    >W</sl-checkbox>
                </div>
            </div>

            <sl-divider></sl-divider>

            <div style="margin-top: auto;">
                <label style="font-size: var(--sl-input-label-font-size-medium); display:block; margin-bottom: var(--sl-spacing-2x-small);">Data Tools</label>
                <div class="data-tools">
                    <sl-button size="small" @click=${this.exportData}>
                        <sl-icon slot="prefix" name="box-arrow-up"></sl-icon> Export
                    </sl-button>
                    <sl-button size="small" @click=${this.importData}>
                        <sl-icon slot="prefix" name="box-arrow-in-down"></sl-icon> Import
                    </sl-button>
                    <sl-button size="small" variant="danger" outline @click=${this.resetMap} style="grid-column: span 2;">
                        <sl-icon slot="prefix" name="trash"></sl-icon> Reset Map
                    </sl-button>
                </div>
            </div>

          </div>
        `;
      }
    }

    customElements.define('dungeon-mapper', DungeonMapper);
