
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
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/tag/tag.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/dropdown/dropdown.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/menu/menu.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/menu-item/menu-item.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/dropdown/dropdown.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/menu/menu.js';
    import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/menu-item/menu-item.js';


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
          background-position: calc(50% + var(--pan-x, 0px)) calc(50% + var(--pan-y, 0px));
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
          transform: translate(var(--pan-x, 0px), var(--pan-y, 0px));
          will-change: transform; /* optimizing for transform changes */
          transition: none; /* Let drag be instant/reactive */
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

        .link-btn {
            position: absolute;
            transform: translate(-50%, -50%); /* Centered on the calculated point */
            z-index: 15;
            transition: opacity 0.2s;
        }

        .link-btn::part(base) {
            background: rgba(var(--sl-color-primary-50-rgb), 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border-color: var(--sl-color-primary-400);
            color: var(--sl-color-primary-600);
        }

        .link-btn:hover::part(base) {
            background: rgba(var(--sl-color-primary-100-rgb), 0.8);
            opacity: 1;
        }

        .link-btn.unlink-btn::part(base) {
             background: rgba(var(--sl-color-danger-50-rgb), 0.5);
             border-color: var(--sl-color-danger-400);
             color: var(--sl-color-danger-600);
        }
        .link-btn.unlink-btn:hover::part(base) {
             background: rgba(var(--sl-color-danger-100-rgb), 0.8);
        }

        .room-node.phantom {
            background-color: rgba(255, 255, 255, 0.5); /* Semi-transparent */
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            color: var(--sl-color-neutral-400);
            border: 2px dashed var(--sl-color-neutral-300);
        }
        .room-node.phantom:hover {
            background-color: var(--sl-color-primary-50);
            color: var(--sl-color-primary-500);
            border-color: var(--sl-color-primary-400);
            opacity: 1 !important;
        }

        @media (hover: hover) {
            /* On desktop, hide links by default */
            .link-btn {
                opacity: 0;
            }

            /* Show when hovering the current room (which precedes them in DOM) */
            .room-node.current:hover ~ .link-btn {
                opacity: 1;
            }

            /* Keep visible when hovering the link itself */
            .link-btn:hover {
                opacity: 1;
            }
        }
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

        .suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        .suggestion-tag {
            cursor: pointer;
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
        this.interactionStart = null;
        this.isPanning = false;
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

      deleteCurrentRoom() {
          if (!this.currentRoom) return;
          if (!confirm("Are you sure you want to delete this room?")) return;

          const room = this.currentRoom;

          // Disconnect all neighbors
          const updates = {};
          ['n','s','e','w'].forEach(dir => {
              if (room.exits[dir]) {
                   const opposites = { n: 's', s: 'n', e: 'w', w: 'e' };
                   let dx = 0, dy = 0;
                   if (dir === 'n') dy = 1;
                   if (dir === 's') dy = -1;
                   if (dir === 'e') dx = 1;
                   if (dir === 'w') dx = -1;
                   const targetId = `${room.x + dx},${room.y + dy}`;
                   const targetRoom = this.rooms[targetId];
                   if (targetRoom) {
                       updates[targetId] = {
                           ...targetRoom,
                           exits: { ...targetRoom.exits, [opposites[dir]]: false }
                       };
                   }
              }
          });

          // Create new rooms object without current room and with neighbor updates
          const newRooms = { ...this.rooms, ...updates };
          delete newRooms[room.id];
          this.rooms = newRooms;

          // Move selection to a neighbor if possible
          const neighborId = Object.keys(updates)[0];
          if (neighborId) {
              const neighbor = this.rooms[neighborId];
              this.currentX = neighbor.x;
              this.currentY = neighbor.y;
          } else if (Object.keys(this.rooms).length === 0) {
              // Map empty - reset
              this.createRoom(0,0,"Start");
              this.currentX = 0;
              this.currentY = 0;
          }
          // Else just stay at currentX/Y (now empty space)

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
        // Load existing global state first (to not overwrite other maps)
        const raw = localStorage.getItem('dungeon-mapper-v2');
        let globalState = raw ? JSON.parse(raw) : { currentMap: this.mapName, maps: {} };

        // Update CURRENT map data
        globalState.maps[this.mapName] = {
            rooms: this.rooms,
            currentX: this.currentX,
            currentY: this.currentY,
            panX: this.panX,
            panY: this.panY
        };
        globalState.currentMap = this.mapName;

        localStorage.setItem('dungeon-mapper-v2', JSON.stringify(globalState));
        this.updateAvailableMaps(globalState);

        const now = new Date();
        this.saveStatus = `Saved ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      }

      loadState() {
        // Try v2 first
        const raw = localStorage.getItem('dungeon-mapper-v2');
        if (raw) {
            try {
                const globalState = JSON.parse(raw);
                this.updateAvailableMaps(globalState);

                const mapName = globalState.currentMap || Object.keys(globalState.maps)[0] || 'Untitled Map';
                this.loadMap(mapName, globalState);
            } catch (e) {
                console.error("Failed to load v2 save", e);
            }
        } else {
            // Fallback to v1 migration
            const v1Raw = localStorage.getItem('dungeon-mapper-v1');
            if (v1Raw) {
                try {
                    const v1State = JSON.parse(v1Raw);
                    this.mapName = 'Imported Map';
                    this.rooms = v1State.rooms || {};
                    this.currentX = v1State.currentX || 0;
                    this.currentY = v1State.currentY || 0;
                    this.panX = -this.currentX * this.TILE_SIZE;
                    this.panY = this.currentY * this.TILE_SIZE;
                    this.saveState(); // Migrate to v2 immediately
                    localStorage.removeItem('dungeon-mapper-v1'); // Clean up
                } catch(e) {
                     console.error("Failed to migrate v1 save", e);
                }
            }
        }
      }

      loadMap(name, globalState = null) {
          if (!globalState) {
              const raw = localStorage.getItem('dungeon-mapper-v2');
              globalState = raw ? JSON.parse(raw) : { maps: {} };
          }

          const mapData = globalState.maps[name];
          if (mapData) {
              this.mapName = name;
              this.rooms = mapData.rooms || {};
              this.currentX = mapData.currentX || 0;
              this.currentY = mapData.currentY || 0;
              this.panX = mapData.panX !== undefined ? mapData.panX : (-this.currentX * this.TILE_SIZE);
              this.panY = mapData.panY !== undefined ? mapData.panY : (this.currentY * this.TILE_SIZE);
              this.saveStatus = 'Loaded ' + name;
          } else {
              // Create new if not found
              this.mapName = name;
              this.rooms = {};
              this.currentX = 0;
              this.currentY = 0;
              this.panX = 0;
              this.panY = 0;
              this.createRoom(0,0, "Start");
          }
           // Update available maps in case this was a new load
          this.updateAvailableMaps(globalState);
      }

      updateAvailableMaps(globalState) {
          this.availableMaps = Object.keys(globalState.maps || {});
      }

      renameMap(newName) {
          if (!newName || newName === this.mapName) return;

          const raw = localStorage.getItem('dungeon-mapper-v2');
          let globalState = raw ? JSON.parse(raw) : { maps: {} };

          // Copy data to new key
          globalState.maps[newName] = globalState.maps[this.mapName];
          // Delete old key
          delete globalState.maps[this.mapName];
          // Update current pointer
          globalState.currentMap = newName;

          localStorage.setItem('dungeon-mapper-v2', JSON.stringify(globalState));

          this.mapName = newName;
          this.updateAvailableMaps(globalState);
          this.requestUpdate();
      }

      createNewMap() {
          let name = "New Map";
          let i = 1;
          while(this.availableMaps.includes(name)) {
              name = `New Map ${i++}`;
          }
          this.loadMap(name); // Will create empty because it doesn't exist
          this.saveState();
      }

      deleteMap(name) {
          if(!confirm(`Delete map "${name}"?`)) return;

          const raw = localStorage.getItem('dungeon-mapper-v2');
          let globalState = raw ? JSON.parse(raw) : { maps: {} };

          delete globalState.maps[name];

          if (Object.keys(globalState.maps).length === 0) {
              // No maps left, create default
              this.mapName = "Untitled Map";
              this.rooms = {};
              this.createRoom(0,0,"Start");
              this.saveState();
          } else if (name === this.mapName) {
              // Deleted current map, load another
              const nextMap = Object.keys(globalState.maps)[0];
              this.loadMap(nextMap, globalState);
              // Save state primarily to update globalState on disk with the deletion
              globalState.currentMap = nextMap;
              localStorage.setItem('dungeon-mapper-v2', JSON.stringify(globalState));
          } else {
              // Deleted other map, just update storage
              localStorage.setItem('dungeon-mapper-v2', JSON.stringify(globalState));
              this.updateAvailableMaps(globalState);
          }
      }

      resetMap() {
        if(confirm("Are you sure? This will delete ALL data for the CURRENT map.")) {
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
        const raw = localStorage.getItem('dungeon-mapper-v2');
        if(!raw) return alert("No data to export.");
        navigator.clipboard.writeText(raw).then(() => {
            alert("All map data copied to clipboard!");
        }).catch(err => {
            console.error(err);
            alert("Failed to copy to clipboard.");
        });
      }

      async importData() {
        // Simple prompt for paste
        const raw = prompt("Paste your map JSON string here (v2 format):");
        if (raw) {
            try {
                // Validate JSON
                const data = JSON.parse(raw);
                if (!data.maps) throw new Error("Invalid v2 format");

                localStorage.setItem('dungeon-mapper-v2', raw);
                this.loadState();
                alert("Maps imported successfully!");
            } catch (e) {
                alert("Invalid JSON data. Ensure it is a valid v2 export.");
            }
        }
      }

      toggleConnection(dir, roomId = null) {
        const sourceRoom = roomId ? this.rooms[roomId] : this.currentRoom;
        if (!sourceRoom) return;

        let dx = 0, dy = 0;
        if (dir === 'n') dy = 1;
        if (dir === 's') dy = -1;
        if (dir === 'e') dx = 1;
        if (dir === 'w') dx = -1;

        const targetX = sourceRoom.x + dx;
        const targetY = sourceRoom.y + dy;
        const targetId = `${targetX},${targetY}`;
        const targetRoom = this.rooms[targetId];

        if (!targetRoom) return;

        // Toggle exit on source room
        const currentExits = { ...sourceRoom.exits };
        const isConnected = !!currentExits[dir];
        currentExits[dir] = !isConnected;

        // Toggle entrance on target room
        const opposite = { n: 's', s: 'n', e: 'w', w: 'e' }[dir];
        const targetExits = { ...targetRoom.exits };
        targetExits[opposite] = !isConnected;

        this.rooms = {
            ...this.rooms,
            [sourceRoom.id]: { ...sourceRoom, exits: currentExits },
            [targetId]: { ...targetRoom, exits: targetExits }
        };

        this.saveState();
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

      getPoint(e) {
          if (e.touches && e.touches.length > 0) {
              return { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
          return { x: e.clientX, y: e.clientY };
      }

      startDrag(e) {
        this.interactionStart = {
            x: e.clientX,
            y: e.clientY,
            target: e.composedPath()[0]
        };
        this.isPanning = false;
        this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }

      doDrag(e) {
        if (!this.interactionStart) return;

        // Check threshold
        if (!this.isPanning) {
            const dx = e.clientX - this.interactionStart.x;
            const dy = e.clientY - this.interactionStart.y;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                this.isPanning = true;
            }
        }

        if (this.isPanning) {
            e.preventDefault();
            this.panX = e.clientX - this.dragStart.x;
            this.panY = e.clientY - this.dragStart.y;
        }
      }

      stopDrag(e) {
        e.currentTarget.releasePointerCapture(e.pointerId);

        if (!this.isPanning && this.interactionStart) {
            // It was a click
            this.handleClick(this.interactionStart.target);
        }

        this.interactionStart = null;
        this.isPanning = false;
      }

      handleClick(target) {
          // Find closest relevant element
          const roomEl = target.closest('.room-node');
          if (roomEl) {
              if (roomEl.classList.contains('phantom')) {
                  const dir = roomEl.dataset.dir;
                  if (dir) this.addRoomAt(dir);
              } else {
                  // Standard room
                  const x = parseInt(roomEl.dataset.x);
                  const y = parseInt(roomEl.dataset.y);
                  if (!isNaN(x) && !isNaN(y)) {
                      this.currentX = x;
                      this.currentY = y;
                  }
              }
          } else {
              // Check for connector click (REMOVED, using buttons now) or new link-btn
              const linkBtn = target.closest('.link-btn');
              if (linkBtn) {
                   const dir = linkBtn.dataset.dir;
                   if (dir) this.toggleConnection(dir);
              }
          }
      }

      // --- Rendering ---

      renderDetailsPanel() {
        if (!this.currentRoom) return '';
        const room = this.currentRoom;

        return html`
            <div class="details-panel" @mousedown=${(e) => e.stopPropagation()}>
                <div class="details-header">
                    <span>Room Details</span>
                    <div style="display: flex; gap: var(--sl-spacing-small);">
                         <sl-switch
                            style="display: flex"
                            size="small"
                            ?checked=${room.explored}
                            @sl-change=${(e) => this.updateCurrentRoom({ explored: e.target.checked })}
                         >Explored</sl-switch>
                         <sl-button size="small" variant="danger" outline @click=${this.deleteCurrentRoom} title="Delete Room">
                             <sl-icon slot="prefix" name="trash"></sl-icon>
                         </sl-button>
                    </div>
                </div>

                <sl-input
                    label="Name"
                    size="small"
                    value=${room.name || ''}
                    @sl-input=${(e) => this.updateCurrentRoom({ name: e.target.value })}
                ></sl-input>

                <div class="suggestions">
                    ${['Start', 'End', 'Hallway', 'Chamber', 'Corridor', 'Trap', 'Stairs'].map(name => html`
                        <sl-tag
                            size="small"
                            variant="neutral"
                            class="suggestion-tag"
                            @click=${() => this.updateCurrentRoom({ name })}
                        >${name}</sl-tag>
                    `)}
                </div>

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
              data-x="${room.x}"
              data-y="${room.y}"
            >
              ${room.name || 'Room'}
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

             const left = targetX * this.TILE_SIZE;
             const top = -targetY * this.TILE_SIZE;

             // If room exists...
             if(this.rooms[targetId]) {
                 // Check if NOT connected to current room
                 if (!this.currentRoom.exits[dir]) {
                     const linkLeft = (this.currentX * this.TILE_SIZE) + (dx * this.TILE_SIZE * 0.5);
                     const linkTop = (-this.currentY * this.TILE_SIZE) - (dy * this.TILE_SIZE * 0.5);

                     return html`
                        <sl-button
                            class="link-btn"
                            size="small"
                            style="left: ${linkLeft}px; top: ${linkTop}px;"
                            data-dir="${dir}"
                            title="Connect"
                        >
                            <sl-icon name="link-45deg" slot="prefix"></sl-icon>
                        </sl-button>
                     `;
                 } else {
                     // Connected - show Unlink button
                     const linkLeft = (this.currentX * this.TILE_SIZE) + (dx * this.TILE_SIZE * 0.5);
                     const linkTop = (-this.currentY * this.TILE_SIZE) - (dy * this.TILE_SIZE * 0.5);
                     return html`
                        <sl-button
                            class="link-btn unlink-btn"
                            size="small"
                            style="left: ${linkLeft}px; top: ${linkTop}px;"
                            data-dir="${dir}"
                            title="Disconnect"
                        >
                            <sl-icon name="x-lg" slot="prefix"></sl-icon>
                        </sl-button>
                     `;
                 }
                 return '';
             }

             // Otherwise show phantom (create new)
             return html`
                <div
                    class="room-node phantom"
                    style="left: ${left}px; top: ${top}px;"
                    data-dir="${dir}"
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
            style="--pan-x: ${this.panX}px; --pan-y: ${this.panY}px;"
            @pointerdown=${this.startDrag}
            @pointermove=${this.doDrag}
            @pointerup=${this.stopDrag}
            @pointercancel=${this.stopDrag}
            @wheel=${this.handleWheel}
          >
            <div class="map-world">
              ${this.renderPhantoms()}
              ${this.renderMap()}
            </div>
          </div>

          ${this.renderDetailsPanel()}

          <!-- HUD -->
          <div class="hud">
             <sl-input
                size="small"
                value=${this.mapName}
                @sl-change=${(e) => this.renameMap(e.target.value)}
                style="width: 200px;"
             ></sl-input>

             <sl-dropdown>
                <sl-button slot="trigger" size="small" caret>Maps</sl-button>
                <sl-menu>
                    <sl-menu-item @click=${this.createNewMap}>
                        <sl-icon slot="prefix" name="plus"></sl-icon> New Map
                    </sl-menu-item>
                    <sl-divider></sl-divider>
                    ${this.availableMaps.map(name => html`
                        <sl-menu-item
                            @click=${() => this.loadMap(name)}
                            ?checked=${name === this.mapName}
                        >
                            ${name}
                            ${name !== this.mapName ? html`
                                <sl-icon-button
                                    name="trash"
                                    slot="suffix"
                                    @click=${(e) => { e.stopPropagation(); this.deleteMap(name); }}
                                ></sl-icon-button>
                            ` : ''}
                        </sl-menu-item>
                    `)}
                </sl-menu>
             </sl-dropdown>

             <sl-divider vertical></sl-divider>

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
