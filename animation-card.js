const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

// ─── ICONE BUNDLE ────────────────────────────────────────────────────────────
// Aggiungere qui nuove icone per renderle disponibili nell'editor
const ICONS = [
  { id: "bulb_glow_esplosivo", label: "Bulb glow",   file: "bulb_glow_esplosivo.gif" },
  { id: "bulb_pulse_warm",     label: "Bulb pulse",   file: "bulb_pulse_warm.gif"     },
  { id: "bulb_off",            label: "Bulb off",     file: "bulb_off.png"            },
  { id: "fan_on",              label: "Fan on",       file: "fan_on.gif"              },
  { id: "fan_off",             label: "Fan off",      file: "fan_off.png"             },
  { id: "scaldasalviette_on",  label: "Scaldasalviette on",  file: "scaldasalviette_on.gif"  },
  { id: "scaldasalviette_off", label: "Scaldasalviette off", file: "scaldasalviette_off.png" },
];

const ICON_BASE = "/hacsfiles/animation-card/icons/";

function iconPath(id) {
  const icon = ICONS.find(i => i.id === id);
  return icon ? ICON_BASE + icon.file : null;
}

// ─── AZIONI ──────────────────────────────────────────────────────────────────
const ACTIONS = [
  { id: "toggle",    label: "Toggle"    },
  { id: "more-info", label: "More info" },
  { id: "navigate",  label: "Navigate"  },
  { id: "none",      label: "Nessuna"   },
];

// ─── COLORI GLOW ─────────────────────────────────────────────────────────────
const GLOW_COLORS = [
  { id: "255,200,60",  label: "Giallo caldo", hex: "#ffc83c" },
  { id: "255,120,0",   label: "Arancione",    hex: "#ff7800" },
  { id: "100,180,255", label: "Blu",          hex: "#64b4ff" },
  { id: "100,255,150", label: "Verde",        hex: "#64ff96" },
  { id: "255,80,80",   label: "Rosso",        hex: "#ff5050" },
  { id: "180,100,255", label: "Viola",        hex: "#b464ff" },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR
// ─────────────────────────────────────────────────────────────────────────────
class AnimationCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, config: {}, _entityFilter: {} };
  }

  connectedCallback() {
    super.connectedCallback();
    customElements.whenDefined("ha-entity-picker").then(() => {
      this._pickerReady = true;
    });
  }

  setConfig(config) {
    this.config = config;
  }

  _fire(config) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }

  _set(key, value) {
    this._fire({ ...this.config, [key]: value });
  }

  _resolveImgSrc(which) {
    const idKey   = which === "on" ? "icon_on_id"  : "icon_off_id";
    const pathKey = which === "on" ? "icon_on_path" : "icon_off_path";
    if (this.config[idKey] === "custom") return this.config[pathKey] || "";
    if (this.config[idKey]) return iconPath(this.config[idKey]) || "";
    return which === "on"
      ? ICON_BASE + "bulb_glow_esplosivo.gif"
      : ICON_BASE + "bulb_off.png";
  }

  _previewGlowStyle() {
    const entity  = this.hass?.states[this.config?.entity];
    const isOn    = entity?.state === "on";
    const glowOnActive  = this.config?.glow_on_active  !== false;
    const glowOffActive = this.config?.glow_off_active === true;
    const glowOnColor   = this.config?.glow_on_color   || "255,200,60";
    const glowOffColor  = this.config?.glow_off_color  || "100,180,255";
    if (isOn && glowOnActive)
      return `border:2px solid rgba(${glowOnColor},0.9);box-shadow:0 0 14px 4px rgba(${glowOnColor},0.35);`;
    if (!isOn && glowOffActive)
      return `border:2px solid rgba(${glowOffColor},0.9);box-shadow:0 0 14px 4px rgba(${glowOffColor},0.35);`;
    return "border:2px solid rgba(255,255,255,0.2);";
  }

  _iconOptions() {
    return [
      ...ICONS.map(ic => ({ value: ic.id, label: ic.label })),
      { value: "custom", label: "Custom…" },
    ];
  }

  _onIconSelected(key, e) {
    const val = e.target.value;
    if (val && val !== this.config[key]) this._set(key, val);
  }

  _onActionSelected(key, e) {
    const val = e.target.value;
    if (val && val !== this.config[key]) this._set(key, val);
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const cfg        = this.config;
    const entity     = this.hass.states[cfg.entity];
    const isOn       = entity?.state === "on";
    const name       = cfg.name || entity?.attributes?.friendly_name || cfg.entity || "—";
    const glowOnActive  = cfg.glow_on_active  !== false;
    const glowOffActive = cfg.glow_off_active === true;
    const glowOnColor   = cfg.glow_on_color   || "255,200,60";
    const glowOffColor  = cfg.glow_off_color  || "100,180,255";
    const glowSpeed     = cfg.glow_speed      || 2;
    const tapAction     = cfg.tap_action      || "toggle";
    const holdAction    = cfg.hold_action     || "more-info";
    const iconOnId      = cfg.icon_on_id      || "bulb_glow_esplosivo";
    const iconOffId     = cfg.icon_off_id     || "bulb_off";
    const imgSrc        = this._resolveImgSrc(isOn ? "on" : "off");
    const iconOpts      = this._iconOptions();

    return html`
      <div class="editor">

        <div class="preview" style="${this._previewGlowStyle()}">
          <img src="${imgSrc}" class="prev-img" onerror="this.style.opacity='0.15'"/>
          <div class="prev-info">
            <span class="prev-name">${name}</span>
            <span class="prev-state">${isOn ? "On" : "Off"}</span>
          </div>
        </div>
        <div class="section-label">Entità</div>
        <div style="position:relative;">
          <ha-textfield
            label="Entità (es. light.salotto)"
            .value=${cfg.entity || ""}
            @input=${e => { this._set("entity", e.target.value); this._entityFilter = e.target.value; this.requestUpdate(); }}
            @change=${e => this._set("entity", e.target.value)}
          ></ha-textfield>
          ${this._entityFilter && this._entityFilter.length > 1 ? html`
            <div style="position:absolute;z-index:999;width:100%;max-height:200px;overflow-y:auto;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;">
              ${Object.keys(this.hass.states)
                .filter(e => ["light","switch","fan","input_boolean","automation","script","media_player","cover","climate","vacuum","lock","alarm_control_panel","humidifier","water_heater"].some(d => e.startsWith(d + ".")) && e.includes(this._entityFilter))
                .slice(0, 10)
                .map(e => html`
                  <div style="padding:8px 12px;cursor:pointer;font-size:13px;"
                    @click=${() => { this._set("entity", e); this._entityFilter = ""; this.requestUpdate(); }}>
                    ${e}
                  </div>
                `)}
            </div>
          ` : ""}
        </div>
        <ha-textfield
          label="Nome (opzionale)"
          .value=${cfg.name || ""}
          @change=${e => this._set("name", e.target.value)}
        ></ha-textfield>

        <div class="section-label">Icone</div>

        <div class="icon-block">
          <select
            .value=${iconOnId}
            @change=${e => this._set("icon_on_id", e.target.value)}
            style="width:100%;padding:8px;border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);"
          >
            ${iconOpts.map(o => html`<option value="${o.value}" ?selected=${iconOnId === o.value}>${o.label}</option>`)}
          </select>
          ${iconOnId !== "custom" ? html`
            <img class="icon-preview" src="${ICON_BASE + (ICONS.find(i=>i.id===iconOnId)?.file||'')}"
              onerror="this.style.opacity='0.15'"/>
          ` : html`
            <ha-textfield
              label="Path icona ON"
              .value=${cfg.icon_on_path || ""}
              @change=${e => this._set("icon_on_path", e.target.value)}
              placeholder="/local/mia_icona.gif"
            ></ha-textfield>
          `}
        </div>

        <div class="icon-block">
          <select
            .value=${iconOffId}
            @change=${e => this._set("icon_off_id", e.target.value)}
            style="width:100%;padding:8px;border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);"
          >
            ${iconOpts.map(o => html`<option value="${o.value}" ?selected=${iconOffId === o.value}>${o.label}</option>`)}
          </select>
          ${iconOffId !== "custom" ? html`
            <img class="icon-preview" src="${ICON_BASE + (ICONS.find(i=>i.id===iconOffId)?.file||'')}"
              onerror="this.style.opacity='0.15'"/>
          ` : html`
            <ha-textfield
              label="Path icona OFF"
              .value=${cfg.icon_off_path || ""}
              @change=${e => this._set("icon_off_path", e.target.value)}
              placeholder="/local/mia_icona_off.png"
            ></ha-textfield>
          `}
        </div>

        <div class="section-label">Glow</div>
        <div class="glow-block">

          <div class="glow-row">
            <span class="glow-lbl">Glow quando ON</span>
            <ha-switch
              .checked=${glowOnActive}
              @change=${e => this._set("glow_on_active", e.target.checked)}
            ></ha-switch>
          </div>
          ${glowOnActive ? html`
            <div class="glow-row glow-sub">
              <span class="glow-sublbl">Colore ON</span>
              <div class="swatches">
                ${GLOW_COLORS.map(c => html`
                  <div class="swatch ${glowOnColor === c.id ? "selected" : ""}"
                    style="background:${c.hex}" title="${c.label}"
                    @click=${() => this._set("glow_on_color", c.id)}></div>
                `)}
              </div>
            </div>
          ` : ""}

          <div class="glow-row">
            <span class="glow-lbl">Glow quando OFF</span>
            <ha-switch
              .checked=${glowOffActive}
              @change=${e => this._set("glow_off_active", e.target.checked)}
            ></ha-switch>
          </div>
          ${glowOffActive ? html`
            <div class="glow-row glow-sub">
              <span class="glow-sublbl">Colore OFF</span>
              <div class="swatches">
                ${GLOW_COLORS.map(c => html`
                  <div class="swatch ${glowOffColor === c.id ? "selected" : ""}"
                    style="background:${c.hex}" title="${c.label}"
                    @click=${() => this._set("glow_off_color", c.id)}></div>
                `)}
              </div>
            </div>
          ` : ""}

          <div class="glow-row">
            <span class="glow-lbl">Velocità</span>
            <div class="slider-row">
              <input type="range" min="0.5" max="5" step="0.5"
                .value=${glowSpeed}
                @input=${e => this._set("glow_speed", parseFloat(e.target.value))}
              />
              <span class="slider-val">${glowSpeed}s</span>
            </div>
          </div>

        </div>

        <div class="section-label">Azioni</div>
        <div class="action-grid">
          <select
            .value=${tapAction}
            @change=${e => this._set("tap_action", e.target.value)}
            style="width:100%;padding:8px;border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);"
          >
            ${ACTIONS.map(a => html`<option value="${a.id}" ?selected=${tapAction === a.id}>${a.label}</option>`)}
          </select>
          <select
            .value=${holdAction}
            @change=${e => this._set("hold_action", e.target.value)}
            style="width:100%;padding:8px;border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);"
          >
            ${ACTIONS.map(a => html`<option value="${a.id}" ?selected=${holdAction === a.id}>${a.label}</option>`)}
          </select>
        </div>

        ${tapAction === "navigate" ? html`
          <ha-textfield label="Path navigazione (tap)"
            .value=${cfg.tap_navigate_path || ""}
            @change=${e => this._set("tap_navigate_path", e.target.value)}
            placeholder="/dashboard-home1/salotto">
          </ha-textfield>` : ""}

        ${holdAction === "navigate" ? html`
          <ha-textfield label="Path navigazione (long press)"
            .value=${cfg.hold_navigate_path || ""}
            @change=${e => this._set("hold_navigate_path", e.target.value)}
            placeholder="/dashboard-home1/salotto">
          </ha-textfield>` : ""}

      </div>
    `;
  }

  static get styles() {
    return css`
      .editor { display:flex; flex-direction:column; gap:10px; padding:4px 0; }
      .section-label { font-size:11px; font-weight:500; color:var(--secondary-text-color); text-transform:uppercase; letter-spacing:.06em; margin-top:6px; }

      .preview { border-radius:16px; padding:10px 14px; display:flex; align-items:center; gap:10px; background:var(--card-background-color,#1c1c1c); transition:border .3s,box-shadow .3s; }
      .prev-img { width:36px; height:36px; object-fit:contain; flex-shrink:0; }
      .prev-info { display:flex; flex-direction:column; }
      .prev-name { font-size:13px; font-weight:500; color:var(--primary-text-color); }
      .prev-state { font-size:11px; color:var(--secondary-text-color); }

      ha-entity-picker, ha-textfield, ha-select { width:100%; }

      .icon-block { display:flex; align-items:center; gap:10px; }
      .icon-block ha-select { flex:1; }
      .icon-block ha-textfield { flex:1; }
      .icon-preview { width:40px; height:40px; object-fit:contain; border-radius:6px; background:var(--secondary-background-color); flex-shrink:0; }

      .glow-block { border:1px solid var(--divider-color); border-radius:10px; overflow:hidden; }
      .glow-row { display:flex; align-items:center; padding:10px 12px; gap:10px; }
      .glow-row+.glow-row { border-top:1px solid var(--divider-color); }
      .glow-lbl { font-size:13px; color:var(--primary-text-color); flex:1; }
      .glow-sub { background:var(--secondary-background-color); }
      .glow-sublbl { font-size:12px; color:var(--secondary-text-color); min-width:70px; }

      .swatches { display:flex; gap:6px; flex-wrap:wrap; }
      .swatch { width:22px; height:22px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:border-color .15s; }
      .swatch.selected { border-color:var(--primary-text-color); }

      .slider-row { display:flex; align-items:center; gap:8px; flex:1; }
      .slider-row input[type=range] { flex:1; accent-color:var(--primary-color); }
      .slider-val { font-size:12px; color:var(--secondary-text-color); min-width:28px; text-align:right; }

      .action-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    `;
  }
}

customElements.define("animation-card-editor", AnimationCardEditor);

// ─────────────────────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────────────────────
class AnimationCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  static getConfigElement() {
    return document.createElement("animation-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      name: "",
      icon_on_id:  "bulb_glow_esplosivo",
      icon_off_id: "bulb_off",
      glow_on_active:  true,
      glow_on_color:   "255,200,60",
      glow_off_active: false,
      glow_off_color:  "100,180,255",
      glow_speed:  2,
      tap_action:  "toggle",
      hold_action: "more-info",
    };
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() { return 1; }

  getGridOptions() {
    return { columns: 6, rows: 1, min_rows: 1, max_rows: 1 };
  }

  _resolveImg(which) {
    const idKey   = which === "on" ? "icon_on_id"  : "icon_off_id";
    const pathKey = which === "on" ? "icon_on_path" : "icon_off_path";
    const id = this.config[idKey];
    if (id === "custom") return this.config[pathKey] || "";
    if (id) return iconPath(id) || "";
    return which === "on"
      ? ICON_BASE + "bulb_glow_esplosivo.gif"
      : ICON_BASE + "bulb_off.png";
  }

  _handleAction(type) {
    const action = type === "tap"
      ? (this.config.tap_action  || "toggle")
      : (this.config.hold_action || "more-info");
    const entity = this.config.entity;
    if (action === "toggle") {
      const state  = this.hass.states[entity]?.state;
      const domain = entity.split(".")[0];
      const svc    = state === "on" ? "turn_off" : "turn_on";
      this.hass.callService(
        ["light","switch","fan","input_boolean"].includes(domain) ? domain : "homeassistant",
        svc, { entity_id: entity }
      );
    } else if (action === "more-info") {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail:{ entityId: entity }, bubbles:true, composed:true }));
    } else if (action === "navigate") {
      const path = type === "tap" ? this.config.tap_navigate_path : this.config.hold_navigate_path;
      if (path) history.pushState(null, "", path);
    }
  }

  _onPointerDown() {
    this._holdTimer = setTimeout(() => { this._holdFired = true; this._handleAction("hold"); }, 500);
  }
  _onPointerUp() {
    clearTimeout(this._holdTimer);
    if (!this._holdFired) this._handleAction("tap");
    this._holdFired = false;
  }
  _onPointerCancel() { clearTimeout(this._holdTimer); this._holdFired = false; }

  render() {
    if (!this.hass || !this.config) return html``;
    const entity = this.hass.states[this.config.entity];
    if (!entity) return html`<ha-card style="padding:12px;color:var(--error-color)">Entità non trovata: ${this.config.entity}</ha-card>`;

    const isOn  = entity.state === "on";
    const name  = this.config.name || entity.attributes.friendly_name || this.config.entity;
    const img   = this._resolveImg(isOn ? "on" : "off");

    const glowOnActive  = this.config.glow_on_active  !== false;
    const glowOffActive = this.config.glow_off_active === true;
    const glowOnColor   = this.config.glow_on_color   || "255,200,60";
    const glowOffColor  = this.config.glow_off_color  || "100,180,255";
    const speed         = this.config.glow_speed       || 2;

    let glowColor = "";
    if (isOn  && glowOnActive)  glowColor = glowOnColor;
    if (!isOn && glowOffActive) glowColor = glowOffColor;

    const uid = this.config.entity.replace(/[\.\-]/g, "_");

    return html`
      ${glowColor ? html`
        <style>
          @keyframes glow-anim-${uid} {
            0%,100% { box-shadow:0 0 6px 2px rgba(${glowColor},0.4); border-color:rgba(${glowColor},0.7); }
            50%     { box-shadow:0 0 20px 6px rgba(${glowColor},0.7); border-color:rgba(${glowColor},1); }
          }
        </style>` : ""}
      <ha-card
        style="${glowColor ? `animation:glow-anim-${uid} ${speed}s ease-in-out infinite;` : ""}"
        @pointerdown=${this._onPointerDown}
        @pointerup=${this._onPointerUp}
        @pointercancel=${this._onPointerCancel}
      >
        <img src="${img}" alt="${name}" />
        <div class="info">
          <span class="name">${name}</span>
          <span class="state">${isOn ? "On" : "Off"}</span>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        border-radius:20px; border:3px solid rgba(255, 255, 255, 0.7);
        display:flex; flex-direction:row; align-items:center;
        padding:0 12px; gap:10px; height:56px;
        box-sizing:border-box; cursor:pointer;
        user-select:none; -webkit-user-select:none;
      }
      img { width:36px; height:36px; object-fit:contain; flex-shrink:0; }
      .info { display:flex; flex-direction:column; justify-content:center; overflow:hidden; }
      .name { color:var(--primary-text-color); font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .state { color:var(--secondary-text-color); font-size:12px; }
    `;
  }
}

customElements.define("animation-card", AnimationCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "animation-card",
  name: "Animation Card",
  description: "Card con gif animata e glow configurabile per qualsiasi entità.",
  preview: true,
});
