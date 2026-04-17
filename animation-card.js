const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;

// ─── ICONE BUNDLE ────────────────────────────────────────────────────────────
const ICONS = [
  { id: "bulb_glow_esplosivo", label: "Bulb glow",          file: "bulb_glow_esplosivo.gif" },
  { id: "bulb_pulse_warm",     label: "Bulb pulse",          file: "bulb_pulse_warm.gif"     },
  { id: "bulb_off",            label: "Bulb off",            file: "bulb_off.png"            },
  { id: "fan_on",              label: "Fan on",              file: "fan_on.gif"              },
  { id: "fan_off",             label: "Fan off",             file: "fan_off.png"             },
  { id: "scaldasalviette_on",  label: "Scaldasalviette on",  file: "scaldasalviette_on.gif"  },
  { id: "scaldasalviette_off", label: "Scaldasalviette off", file: "scaldasalviette_off.png" },
];
const ICON_BASE = "/hacsfiles/animation-card/icons/";
function iconPath(id) {
  const icon = ICONS.find(i => i.id === id);
  return icon ? ICON_BASE + icon.file : null;
}

// ─── AZIONI ──────────────────────────────────────────────────────────────────
const ACTION_TYPES = [
  { id: "none",         label: "Nessuna"         },
  { id: "toggle",       label: "Toggle"          },
  { id: "more-info",    label: "More info"       },
  { id: "navigate",     label: "Naviga"          },
  { id: "call-service", label: "Chiama servizio" },
];

const COMMON_SERVICES = [
  { id: "light.turn_on",           label: "light.turn_on"           },
  { id: "light.turn_off",          label: "light.turn_off"          },
  { id: "light.toggle",            label: "light.toggle"            },
  { id: "switch.turn_on",          label: "switch.turn_on"          },
  { id: "switch.turn_off",         label: "switch.turn_off"         },
  { id: "switch.toggle",           label: "switch.toggle"           },
  { id: "fan.turn_on",             label: "fan.turn_on"             },
  { id: "fan.turn_off",            label: "fan.turn_off"            },
  { id: "fan.toggle",              label: "fan.toggle"              },
  { id: "cover.open_cover",        label: "cover.open_cover"        },
  { id: "cover.close_cover",       label: "cover.close_cover"       },
  { id: "cover.toggle",            label: "cover.toggle"            },
  { id: "climate.set_hvac_mode",   label: "climate.set_hvac_mode"   },
  { id: "media_player.play_media", label: "media_player.play_media" },
  { id: "script.turn_on",          label: "script.turn_on"          },
  { id: "automation.trigger",      label: "automation.trigger"      },
  { id: "homeassistant.turn_on",   label: "homeassistant.turn_on"   },
  { id: "homeassistant.turn_off",  label: "homeassistant.turn_off"  },
  { id: "custom",                  label: "Altro (inserisci)…"      },
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

// ─── SOTTOTESTO ──────────────────────────────────────────────────────────────
const SUBTEXT_FIELDS = [
  { id: "state",        label: "Stato (on/off/…)"  },
  { id: "last_changed", label: "Ultima modifica"    },
  { id: "brightness",   label: "Luminosità (luci)"  },
  { id: "temperature",  label: "Temperatura"        },
  { id: "humidity",     label: "Umidità"            },
  { id: "friendly_name",label: "Nome descrittivo"   },
  { id: "custom_attr",  label: "Attributo custom"   },
  { id: "static_text",  label: "Testo statico"      },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function entityRgb(entity) {
  if (!entity) return null;
  const a = entity.attributes;
  if (a.rgb_color) return a.rgb_color.join(",");
  if (a.hs_color) {
    const [h,s] = a.hs_color;
    const sn=s/100, c=sn, x=c*(1-Math.abs(((h/60)%2)-1)), m=1-c;
    let r=0,g=0,b=0;
    if      (h<60)  {r=c;g=x;b=0;}
    else if (h<120) {r=x;g=c;b=0;}
    else if (h<180) {r=0;g=c;b=x;}
    else if (h<240) {r=0;g=x;b=c;}
    else if (h<300) {r=x;g=0;b=c;}
    else            {r=c;g=0;b=x;}
    return [r+m,g+m,b+m].map(v=>Math.round(v*255)).join(",");
  }
  return null;
}

function formatLastChanged(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now()-new Date(iso))/60000);
  if (diff<1)  return "adesso";
  if (diff<60) return `${diff} min fa`;
  const h=Math.floor(diff/60);
  if (h<24)   return `${h}h fa`;
  return `${Math.floor(h/24)}g fa`;
}

function getSubtextValue(entity, fieldId, cfg) {
  if (!entity) return "";
  const a = entity.attributes;
  switch(fieldId) {
    case "state":        return entity.state;
    case "last_changed": return formatLastChanged(entity.last_changed);
    case "brightness":
      if (entity.state==="off") return "0%";
      return a.brightness!=null ? `${Math.round(a.brightness/2.55)}%` : "";
    case "temperature":  return a.temperature!=null ? `${a.temperature}°` : "";
    case "humidity":     return a.humidity!=null    ? `${a.humidity}%`   : "";
    case "friendly_name":return a.friendly_name||"";
    case "custom_attr":  { const k=cfg?.subtext_custom_attr; return k&&a[k]!=null?String(a[k]):""; }
    case "static_text":  return cfg?.subtext_static_text||"";
    default: return "";
  }
}

function callHassAction(hass, trigger, config) {
  const action = config[`${trigger}_action`]||"none";
  const entity = config.entity;
  if (action==="none") return;
  if (action==="toggle") {
    const state=hass.states[entity]?.state;
    const domain=entity.split(".")[0];
    const svc=state==="on"?"turn_off":"turn_on";
    hass.callService(["light","switch","fan","input_boolean"].includes(domain)?domain:"homeassistant",svc,{entity_id:entity});
  } else if (action==="more-info") {
    document.querySelector("home-assistant")
      ?.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:entity},bubbles:true,composed:true}));
  } else if (action==="navigate") {
    const path=config[`${trigger}_navigate_path`];
    if (path) history.pushState(null,"",path);
  } else if (action==="call-service") {
    const preset=config[`${trigger}_service_preset`]||"";
    const custom=config[`${trigger}_service_custom`]||"";
    const svcStr=preset==="custom"?custom:preset;
    if (!svcStr) return;
    const [domain,service]=svcStr.split(".");
    let data={};
    try { const raw=config[`${trigger}_service_data`]; if(raw) data=JSON.parse(raw); } catch(e) {}
    if (!data.entity_id) data.entity_id=entity;
    hass.callService(domain,service,data);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR
// ─────────────────────────────────────────────────────────────────────────────
class AnimationCardEditor extends LitElement {
  static get properties() {
    return { hass:{}, config:{}, _entityFilter:{}, _openSections:{} };
  }

  constructor() {
    super();
    this._openSections = { entity:true, nome:false, layout:false, glow:false, azioni:false, shortcut:false };
  }

  setConfig(config) { this.config=config; }

  _fire(config) {
    this.dispatchEvent(new CustomEvent("config-changed",{detail:{config},bubbles:true,composed:true}));
  }
  _set(key,value) { this._fire({...this.config,[key]:value}); }
  _toggleSection(id) { this._openSections={...this._openSections,[id]:!this._openSections[id]}; this.requestUpdate(); }

  _resolveImgSrc(which) {
    const idKey=which==="on"?"icon_on_id":"icon_off_id";
    const pathKey=which==="on"?"icon_on_path":"icon_off_path";
    if (this.config[idKey]==="custom") return this.config[pathKey]||"";
    if (this.config[idKey]) return iconPath(this.config[idKey])||"";
    return which==="on"?ICON_BASE+"bulb_glow_esplosivo.gif":ICON_BASE+"bulb_off.png";
  }

  _resolveGlowColor(which) {
    const entity=this.hass?.states[this.config?.entity];
    const modeKey=`glow_${which}_color_mode`;
    const colKey=`glow_${which}_color`;
    const hexKey=`glow_${which}_color_hex`;
    const mode=this.config?.[modeKey]||"preset";
    if (mode==="entity") return entityRgb(entity)||"255,80,80";
    if (mode==="custom") { const h=this.config?.[hexKey]; return h?hexToRgb(h):"255,200,60"; }
    return this.config?.[colKey]||(which==="on"?"255,200,60":"100,180,255");
  }

  _previewGlowStyle() {
    const entity=this.hass?.states[this.config?.entity];
    const isOn=entity?.state==="on";
    const goa=this.config?.glow_on_active!==false;
    const gofa=this.config?.glow_off_active===true;
    if (isOn&&goa)  { const c=this._resolveGlowColor("on");  return `border:2px solid rgba(${c},0.9);box-shadow:0 0 14px 4px rgba(${c},0.35);`; }
    if (!isOn&&gofa){ const c=this._resolveGlowColor("off"); return `border:2px solid rgba(${c},0.9);box-shadow:0 0 14px 4px rgba(${c},0.35);`; }
    return "border:2px solid rgba(255,255,255,0.2);";
  }

  _iconOptions() {
    return [...ICONS.map(ic=>({value:ic.id,label:ic.label})),{value:"custom",label:"Custom…"}];
  }

  _getAction(trigger) { return this.config?.[`${trigger}_action`]||(trigger==="tap"?"toggle":trigger==="hold"?"more-info":"none"); }
  _getAE(trigger,key) { return this.config?.[`${trigger}_${key}`]||""; }
  _setAction(trigger,value) { this._set(`${trigger}_action`,value); }
  _setAE(trigger,key,value) { this._set(`${trigger}_${key}`,value); }

  _renderActionBlock(trigger,label) {
    const action=this._getAction(trigger);
    const svcPreset=this._getAE(trigger,"service_preset")||"light.toggle";
    const svcCustom=this._getAE(trigger,"service_custom");
    const svcData=this._getAE(trigger,"service_data");
    const navPath=this._getAE(trigger,"navigate_path");
    return html`
      <div class="action-block">
        <div class="action-trigger-label">${label}</div>
        <select class="sel" .value=${action} @change=${e=>this._setAction(trigger,e.target.value)}>
          ${ACTION_TYPES.map(a=>html`<option value="${a.id}" ?selected=${action===a.id}>${a.label}</option>`)}
        </select>
        ${action==="navigate"?html`<ha-textfield label="Path navigazione" .value=${navPath} @change=${e=>this._setAE(trigger,"navigate_path",e.target.value)} placeholder="/lovelace/salotto"></ha-textfield>`:""}
        ${action==="call-service"?html`
          <select class="sel" .value=${svcPreset} @change=${e=>this._setAE(trigger,"service_preset",e.target.value)}>
            ${COMMON_SERVICES.map(s=>html`<option value="${s.id}" ?selected=${svcPreset===s.id}>${s.label}</option>`)}
          </select>
          ${svcPreset==="custom"?html`<ha-textfield label="Servizio (domain.service)" .value=${svcCustom} @change=${e=>this._setAE(trigger,"service_custom",e.target.value)} placeholder="light.set_color_temp"></ha-textfield>`:""}
          <ha-textfield label='Dati JSON (opzionale)' .value=${svcData} @change=${e=>this._setAE(trigger,"service_data",e.target.value)} placeholder='{"brightness":200}'></ha-textfield>
        `:""}
      </div>`;
  }

  _renderGlowColorPicker(which) {
    const modeKey=`glow_${which}_color_mode`;
    const colKey=`glow_${which}_color`;
    const hexKey=`glow_${which}_color_hex`;
    const mode=this.config?.[modeKey]||"preset";
    const preset=this.config?.[colKey]||(which==="on"?"255,200,60":"100,180,255");
    const hexVal=this.config?.[hexKey]||"#ff5050";
    return html`
      <div class="color-mode-row">
        <select class="sel sel-sm" .value=${mode} @change=${e=>this._set(modeKey,e.target.value)}>
          <option value="preset" ?selected=${mode==="preset"}>Preset</option>
          <option value="entity" ?selected=${mode==="entity"}>Segui luce</option>
          <option value="custom" ?selected=${mode==="custom"}>Custom (wheel)</option>
        </select>
        ${mode==="preset"?html`<div class="swatches">${GLOW_COLORS.map(c=>html`<div class="swatch ${preset===c.id?"selected":""}" style="background:${c.hex}" title="${c.label}" @click=${()=>this._set(colKey,c.id)}></div>`)}</div>`:""}
        ${mode==="entity"?html`<span class="note">Usa RGB dell'entità · fallback rosso se non disponibile</span>`:""}
        ${mode==="custom"?html`<div class="color-wheel-row"><input type="color" class="color-wheel" .value=${hexVal} @input=${e=>this._set(hexKey,e.target.value)} @change=${e=>this._set(hexKey,e.target.value)}/><span class="note">${hexVal}</span></div>`:""}
      </div>`;
  }

  _renderGlowIntensity(which) {
    const key=`glow_${which}_intensity`;
    const val=this.config?.[key]??1;
    return html`
      <div class="glow-row">
        <span class="glow-lbl">Intensità</span>
        <div class="slider-row">
          <input type="range" min="0.3" max="2" step="0.1" .value=${val} @input=${e=>this._set(key,parseFloat(e.target.value))}/>
          <span class="slider-val">${val}x</span>
        </div>
      </div>`;
  }

  _renderSubtextSection() {
    const cfg=this.config;
    const enabled=cfg.subtext_fields??["state"];
    const domain=(cfg.entity||"").split(".")[0];
    const visible=SUBTEXT_FIELDS.filter(f=>{
      if (f.id==="brightness")  return domain==="light";
      if (f.id==="temperature") return ["climate","sensor","weather"].includes(domain);
      if (f.id==="humidity")    return ["sensor","climate"].includes(domain);
      return true;
    });
    return html`
      <div class="subtext-list">
        ${visible.map(f=>{
          const isOn=enabled.includes(f.id);
          return html`
            <div class="subtext-row">
              <span class="subtext-label">${f.label}</span>
              <ha-switch .checked=${isOn} @change=${e=>{
                const next=e.target.checked?[...enabled,f.id]:enabled.filter(x=>x!==f.id);
                this._set("subtext_fields",next);
              }}></ha-switch>
            </div>
            ${f.id==="custom_attr"&&isOn?html`<ha-textfield label="Nome attributo (es. current_power)" .value=${cfg.subtext_custom_attr||""} @change=${e=>this._set("subtext_custom_attr",e.target.value)}></ha-textfield>`:""}
            ${f.id==="static_text"&&isOn?html`<ha-textfield label="Testo fisso" .value=${cfg.subtext_static_text||""} @change=${e=>this._set("subtext_static_text",e.target.value)}></ha-textfield>`:""}
          `;
        })}
      </div>`;
  }

  _renderShortcutSection() {
    const cfg=this.config;
    const shortcuts=cfg.shortcuts||[];
    const addShortcut=()=>this._set("shortcuts",[...shortcuts,{label:"Nuova azione",action:"toggle",color:"blue"}]);
    const removeShortcut=i=>this._set("shortcuts",shortcuts.filter((_,idx)=>idx!==i));
    const updateShortcut=(i,key,value)=>this._set("shortcuts",shortcuts.map((s,idx)=>idx===i?{...s,[key]:value}:s));
    const COLORS=["blue","green","amber","red","purple"];
    return html`
      <div class="shortcut-list">
        <div class="note" style="margin-bottom:4px">Max 4 shortcut. Appare il tasto ⋮ a destra della card.</div>
        ${shortcuts.map((s,i)=>html`
          <div class="shortcut-item">
            <div class="shortcut-header">
              <span class="shortcut-num">#${i+1}</span>
              <ha-textfield label="Label" .value=${s.label||""} @change=${e=>updateShortcut(i,"label",e.target.value)} style="flex:1"></ha-textfield>
              <div class="remove-btn" @click=${()=>removeShortcut(i)}>✕</div>
            </div>
            <select class="sel" .value=${s.action||"toggle"} @change=${e=>updateShortcut(i,"action",e.target.value)}>
              ${ACTION_TYPES.filter(a=>a.id!=="none").map(a=>html`<option value="${a.id}" ?selected=${s.action===a.id}>${a.label}</option>`)}
            </select>
            ${s.action==="navigate"?html`<ha-textfield label="Path" .value=${s.navigate_path||""} @change=${e=>updateShortcut(i,"navigate_path",e.target.value)}></ha-textfield>`:""}
            ${s.action==="call-service"?html`
              <select class="sel" .value=${s.service_preset||"light.toggle"} @change=${e=>updateShortcut(i,"service_preset",e.target.value)}>
                ${COMMON_SERVICES.map(sv=>html`<option value="${sv.id}" ?selected=${s.service_preset===sv.id}>${sv.label}</option>`)}
              </select>
              ${s.service_preset==="custom"?html`<ha-textfield label="Servizio" .value=${s.service_custom||""} @change=${e=>updateShortcut(i,"service_custom",e.target.value)}></ha-textfield>`:""}
              <ha-textfield label='Dati JSON' .value=${s.service_data||""} @change=${e=>updateShortcut(i,"service_data",e.target.value)} placeholder='{"brightness":200}'></ha-textfield>
            `:""}
            <div class="color-chips">
              <span class="note">Colore icona:</span>
              ${COLORS.map(c=>html`<div class="color-chip color-chip-${c} ${s.color===c?"selected":""}" @click=${()=>updateShortcut(i,"color",c)}>${c[0].toUpperCase()}</div>`)}
            </div>
          </div>`)}
        ${shortcuts.length<4?html`<button class="add-btn" @click=${addShortcut}>+ Aggiungi shortcut</button>`:""}
      </div>`;
  }

  _renderSection(id,icon,title,content) {
    const open=this._openSections[id];
    return html`
      <div class="section-wrap">
        <div class="section-header" @click=${()=>this._toggleSection(id)}>
          <span class="section-icon">${icon}</span>
          <span class="section-title">${title}</span>
          <span class="section-chevron">${open?"▲":"▼"}</span>
        </div>
        ${open?html`<div class="section-body">${content}</div>`:""}
      </div>`;
  }

  render() {
    if (!this.hass||!this.config) return html``;
    const cfg=this.config;
    const entity=this.hass.states[cfg.entity];
    const isOn=entity?.state==="on";
    const showName=cfg.show_name!==false;
    const subtextFields=cfg.subtext_fields??["state"];
    const name=cfg.name||entity?.attributes?.friendly_name||cfg.entity||"—";
    const imgSrc=this._resolveImgSrc(isOn?"on":"off");
    const iconOpts=this._iconOptions();
    const iconOnId=cfg.icon_on_id||"bulb_glow_esplosivo";
    const iconOffId=cfg.icon_off_id||"bulb_off";
    const glowOnActive=cfg.glow_on_active!==false;
    const glowOffActive=cfg.glow_off_active===true;
    const glowSpeed=cfg.glow_speed||2;
    const layoutMode=cfg.layout_mode||"row";
    const cardHeight=cfg.card_height||56;
    const textAlign=cfg.text_align||"left";
    const nameFontSize=cfg.name_font_size||14;
    const stateFontSize=cfg.state_font_size||12;
    const visibilityEntity=cfg.visibility_entity||"";
    const visibilityState=cfg.visibility_state||"on";

    const subtextValue=subtextFields.map(f=>getSubtextValue(entity,f,cfg)).filter(Boolean).join(" · ");

    const filterText=(this._entityFilter||"").toLowerCase();
    const validDomains=["light","switch","fan","input_boolean","automation","script","media_player","cover","climate","vacuum","lock","alarm_control_panel","humidifier","water_heater"];

    const preview=html`
      <div class="preview" style="${this._previewGlowStyle()}">
        <img src="${imgSrc}" class="prev-img" onerror="this.style.opacity='0.15'"/>
        <div class="prev-info">
          ${showName?html`<span class="prev-name">${name}</span>`:""}
          <span class="prev-state">${subtextValue||(isOn?"On":"Off")}</span>
        </div>
      </div>`;

    const sectionEntity=html`
      <div style="position:relative;">
        <ha-textfield label="Cerca entità" .value=${cfg.entity||""}
          @input=${e=>{this._set("entity",e.target.value);this._entityFilter=e.target.value;this.requestUpdate();}}
          @change=${e=>this._set("entity",e.target.value)}>
        </ha-textfield>
        ${filterText&&filterText.length>1?html`
          <div class="entity-dropdown">
            ${Object.keys(this.hass.states)
              .filter(e=>{if(!validDomains.some(d=>e.startsWith(d+".")))return false;const s=this.hass.states[e];const fn=(s.attributes.friendly_name||"").toLowerCase();return e.toLowerCase().includes(filterText)||fn.includes(filterText);})
              .slice(0,15)
              .map(e=>{const s=this.hass.states[e];const fn=s.attributes.friendly_name;return html`
                <div class="entity-option" @click=${()=>{this._set("entity",e);this._entityFilter="";this.requestUpdate();}}>
                  <div class="entity-option-name">${fn||e}</div>
                  ${fn?html`<div class="entity-option-id">${e}</div>`:""}
                </div>`;})}
          </div>`:""}
      </div>
      <div class="icon-block">
        <span class="icon-block-label">Icona ON</span>
        <select class="sel" .value=${iconOnId} @change=${e=>this._set("icon_on_id",e.target.value)}>
          ${iconOpts.map(o=>html`<option value="${o.value}" ?selected=${iconOnId===o.value}>${o.label}</option>`)}
        </select>
        ${iconOnId!=="custom"
          ?html`<img class="icon-preview" src="${ICON_BASE+(ICONS.find(i=>i.id===iconOnId)?.file||'')}" onerror="this.style.opacity='0.15'"/>`
          :html`<ha-textfield label="Path ON" .value=${cfg.icon_on_path||""} @change=${e=>this._set("icon_on_path",e.target.value)} placeholder="/local/icona.gif"></ha-textfield>`}
      </div>
      <div class="icon-block">
        <span class="icon-block-label">Icona OFF</span>
        <select class="sel" .value=${iconOffId} @change=${e=>this._set("icon_off_id",e.target.value)}>
          ${iconOpts.map(o=>html`<option value="${o.value}" ?selected=${iconOffId===o.value}>${o.label}</option>`)}
        </select>
        ${iconOffId!=="custom"
          ?html`<img class="icon-preview" src="${ICON_BASE+(ICONS.find(i=>i.id===iconOffId)?.file||'')}" onerror="this.style.opacity='0.15'"/>`
          :html`<ha-textfield label="Path OFF" .value=${cfg.icon_off_path||""} @change=${e=>this._set("icon_off_path",e.target.value)} placeholder="/local/icona_off.png"></ha-textfield>`}
      </div>`;

    const sectionNome=html`
      <div class="glow-row">
        <span class="glow-lbl">Mostra nome</span>
        <ha-switch .checked=${showName} @change=${e=>this._set("show_name",e.target.checked)}></ha-switch>
      </div>
      ${showName?html`
        <ha-textfield label="Override nome (opzionale)" .value=${cfg.name||""} @change=${e=>this._set("name",e.target.value)} placeholder="lascia vuoto = friendly_name"></ha-textfield>
        <div class="size-row">
          <span class="glow-lbl">Dimensione nome</span>
          <div class="slider-row">
            <input type="range" min="10" max="22" step="1" .value=${nameFontSize} @input=${e=>this._set("name_font_size",parseInt(e.target.value))}/>
            <span class="slider-val">${nameFontSize}px</span>
          </div>
        </div>`:""}
      <div class="size-row">
        <span class="glow-lbl">Dimensione sottotesto</span>
        <div class="slider-row">
          <input type="range" min="9" max="18" step="1" .value=${stateFontSize} @input=${e=>this._set("state_font_size",parseInt(e.target.value))}/>
          <span class="slider-val">${stateFontSize}px</span>
        </div>
      </div>
      <div class="section-sublabel">Campi sottotesto (concatenati con ·)</div>
      ${this._renderSubtextSection()}`;

    const sectionLayout=html`
      <div class="glow-row">
        <span class="glow-lbl">Modalità</span>
        <select class="sel sel-sm" .value=${layoutMode} @change=${e=>this._set("layout_mode",e.target.value)}>
          <option value="row"  ?selected=${layoutMode==="row"} >Riga (icona + testo)</option>
          <option value="tile" ?selected=${layoutMode==="tile"}>Tile (icona piena + badge)</option>
        </select>
      </div>
      <div class="glow-row">
        <span class="glow-lbl">Allineamento testo</span>
        <select class="sel sel-sm" .value=${textAlign} @change=${e=>this._set("text_align",e.target.value)}>
          <option value="left"   ?selected=${textAlign==="left"}  >Sinistra</option>
          <option value="center" ?selected=${textAlign==="center"}>Centro</option>
        </select>
      </div>
      <div class="glow-row">
        <span class="glow-lbl">Altezza card</span>
        <div class="slider-row">
          <input type="range" min="44" max="120" step="4" .value=${cardHeight} @input=${e=>this._set("card_height",parseInt(e.target.value))}/>
          <span class="slider-val">${cardHeight}px</span>
        </div>
      </div>
      <div class="section-sublabel">Visibilità condizionale</div>
      <ha-textfield label="Entità condizione (opzionale)" .value=${visibilityEntity} @change=${e=>this._set("visibility_entity",e.target.value)} placeholder="es. input_boolean.mostra_card"></ha-textfield>
      ${visibilityEntity?html`<ha-textfield label="Stato che mostra la card" .value=${visibilityState} @change=${e=>this._set("visibility_state",e.target.value)} placeholder="on"></ha-textfield>`:""}`;

    const sectionGlow=html`
      <div class="glow-block">
        <div class="glow-row">
          <span class="glow-lbl">Glow quando ON</span>
          <ha-switch .checked=${glowOnActive} @change=${e=>this._set("glow_on_active",e.target.checked)}></ha-switch>
        </div>
        ${glowOnActive?html`
          <div class="glow-sub">
            <div class="glow-sublbl">Colore ON</div>
            ${this._renderGlowColorPicker("on")}
          </div>
          ${this._renderGlowIntensity("on")}
        `:""}
        <div class="glow-row">
          <span class="glow-lbl">Glow quando OFF</span>
          <ha-switch .checked=${glowOffActive} @change=${e=>this._set("glow_off_active",e.target.checked)}></ha-switch>
        </div>
        ${glowOffActive?html`
          <div class="glow-sub">
            <div class="glow-sublbl">Colore OFF</div>
            ${this._renderGlowColorPicker("off")}
          </div>
          ${this._renderGlowIntensity("off")}
        `:""}
        <div class="glow-row">
          <span class="glow-lbl">Velocità animazione</span>
          <div class="slider-row">
            <input type="range" min="0.5" max="5" step="0.5" .value=${glowSpeed} @input=${e=>this._set("glow_speed",parseFloat(e.target.value))}/>
            <span class="slider-val">${glowSpeed}s</span>
          </div>
        </div>
      </div>`;

    const sectionAzioni=html`
      ${this._renderActionBlock("tap","Click")}
      ${this._renderActionBlock("double_tap","Doppio click")}
      ${this._renderActionBlock("hold","Long press")}`;

    return html`
      <div class="editor">
        ${preview}
        ${this._renderSection("entity",  "📦","Entità & Icone",    sectionEntity)}
        ${this._renderSection("nome",    "🏷️","Nome & Sottotesto", sectionNome)}
        ${this._renderSection("layout",  "📐","Layout",            sectionLayout)}
        ${this._renderSection("glow",    "✨","Glow",              sectionGlow)}
        ${this._renderSection("azioni",  "⚡","Azioni",            sectionAzioni)}
        ${this._renderSection("shortcut","⋮","Shortcut dropdown", this._renderShortcutSection())}
      </div>`;
  }

  static get styles() {
    return css`
      .editor { display:flex; flex-direction:column; gap:8px; padding:4px 0; }
      .preview { border-radius:16px; padding:10px 14px; display:flex; align-items:center; gap:10px;
                 background:var(--card-background-color,#1c1c1c); transition:border .3s,box-shadow .3s; margin-bottom:4px; }
      .prev-img   { width:36px; height:36px; object-fit:contain; flex-shrink:0; }
      .prev-info  { display:flex; flex-direction:column; }
      .prev-name  { font-size:13px; font-weight:500; color:var(--primary-text-color); }
      .prev-state { font-size:11px; color:var(--secondary-text-color); }
      .section-wrap   { border:1px solid var(--divider-color); border-radius:10px; overflow:hidden; }
      .section-header { display:flex; align-items:center; gap:8px; padding:10px 12px; cursor:pointer;
                        background:var(--secondary-background-color); user-select:none; }
      .section-icon   { font-size:16px; }
      .section-title  { flex:1; font-size:13px; font-weight:600; color:var(--primary-text-color); }
      .section-chevron{ font-size:11px; color:var(--secondary-text-color); }
      .section-body   { padding:10px 12px; display:flex; flex-direction:column; gap:8px;
                        border-top:1px solid var(--divider-color); }
      .section-sublabel { font-size:11px; font-weight:500; color:var(--secondary-text-color);
                          text-transform:uppercase; letter-spacing:.06em; margin-top:4px; }
      .entity-dropdown { position:absolute; z-index:999; width:100%; max-height:200px; overflow-y:auto;
                         background:var(--card-background-color); border:1px solid var(--divider-color);
                         border-radius:6px; box-shadow:0 4px 8px rgba(0,0,0,0.2); }
      .entity-option   { padding:8px 12px; cursor:pointer; font-size:13px; border-bottom:1px solid var(--divider-color); }
      .entity-option:hover { background:var(--secondary-background-color); }
      .entity-option-name { color:var(--primary-text-color); font-weight:500; }
      .entity-option-id   { font-size:11px; color:var(--secondary-text-color); }
      .icon-block       { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      .icon-block-label { font-size:12px; color:var(--secondary-text-color); min-width:60px; }
      .icon-preview     { width:36px; height:36px; object-fit:contain; border-radius:6px;
                          background:var(--secondary-background-color); flex-shrink:0; }
      .glow-block  { border:1px solid var(--divider-color); border-radius:8px; overflow:hidden; }
      .glow-row    { display:flex; align-items:center; padding:10px 12px; gap:10px; }
      .glow-row+.glow-row { border-top:1px solid var(--divider-color); }
      .glow-lbl    { font-size:13px; color:var(--primary-text-color); flex:1; }
      .glow-sub    { background:var(--secondary-background-color); padding:10px 12px; border-top:1px solid var(--divider-color); }
      .glow-sublbl { font-size:12px; color:var(--secondary-text-color); margin-bottom:6px; }
      .size-row    { display:flex; align-items:center; gap:10px; padding:2px 0; }
      .color-mode-row  { display:flex; flex-direction:column; gap:6px; }
      .color-wheel-row { display:flex; align-items:center; gap:8px; }
      .color-wheel { width:40px; height:32px; border:none; padding:0; border-radius:6px; cursor:pointer; background:none; }
      .note        { font-size:12px; color:var(--secondary-text-color); font-style:italic; }
      .swatches    { display:flex; gap:6px; flex-wrap:wrap; }
      .swatch      { width:22px; height:22px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:border-color .15s; }
      .swatch.selected { border-color:var(--primary-text-color); }
      .slider-row  { display:flex; align-items:center; gap:8px; flex:1; }
      .slider-row input[type=range] { flex:1; accent-color:var(--primary-color); }
      .slider-val  { font-size:12px; color:var(--secondary-text-color); min-width:30px; text-align:right; }
      .action-block { border:1px solid var(--divider-color); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:8px; }
      .action-trigger-label { font-size:12px; font-weight:600; color:var(--secondary-text-color); text-transform:uppercase; letter-spacing:.05em; }
      .subtext-list { display:flex; flex-direction:column; gap:4px; }
      .subtext-row  { display:flex; align-items:center; padding:6px 0; border-bottom:1px solid var(--divider-color); }
      .subtext-row:last-child { border-bottom:none; }
      .subtext-label { flex:1; font-size:13px; color:var(--primary-text-color); }
      .shortcut-list { display:flex; flex-direction:column; gap:10px; }
      .shortcut-item { border:1px solid var(--divider-color); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:8px; }
      .shortcut-header { display:flex; align-items:center; gap:8px; }
      .shortcut-num { font-size:12px; color:var(--secondary-text-color); min-width:20px; }
      .remove-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--divider-color);
                    display:flex; align-items:center; justify-content:center; cursor:pointer;
                    color:var(--error-color); font-size:13px; flex-shrink:0; }
      .add-btn { background:none; border:1px dashed var(--divider-color); border-radius:8px; padding:8px;
                 color:var(--primary-text-color); font-size:13px; cursor:pointer; width:100%; }
      .color-chips { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .color-chip  { width:22px; height:22px; border-radius:50%; cursor:pointer; font-size:10px; font-weight:600;
                     display:flex; align-items:center; justify-content:center; border:2px solid transparent; transition:border-color .15s; }
      .color-chip.selected { border-color:var(--primary-text-color); }
      .color-chip-blue   { background:#1a3a5c; color:#64b4ff; }
      .color-chip-green  { background:#1a3d2a; color:#64ff96; }
      .color-chip-amber  { background:#3d2a00; color:#ffc83c; }
      .color-chip-red    { background:#3d1a1a; color:#ff6464; }
      .color-chip-purple { background:#2a1a3d; color:#b464ff; }
      .sel    { width:100%; padding:8px; border-radius:6px; background:var(--card-background-color);
                color:var(--primary-text-color); border:1px solid var(--divider-color); font-size:13px; }
      .sel-sm { width:auto; min-width:160px; }
      ha-textfield { width:100%; }
    `;
  }
}

customElements.define("animation-card-editor", AnimationCardEditor);

// ─────────────────────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────────────────────
class AnimationCard extends LitElement {
  static get properties() { return { hass:{}, config:{}, _ddOpen:{} }; }
  constructor() { super(); this._ddOpen=false; }

  static getConfigElement() { return document.createElement("animation-card-editor"); }

  static getStubConfig() {
    return {
      entity:"", name:"", show_name:true, subtext_fields:["state"],
      layout_mode:"row", card_height:56, text_align:"left",
      name_font_size:14, state_font_size:12,
      icon_on_id:"bulb_glow_esplosivo", icon_off_id:"bulb_off",
      glow_on_active:true, glow_on_color_mode:"preset", glow_on_color:"255,200,60", glow_on_intensity:1,
      glow_off_active:false, glow_off_color_mode:"preset", glow_off_color:"100,180,255", glow_off_intensity:1,
      glow_speed:2,
      tap_action:"toggle", double_tap_action:"more-info", hold_action:"none",
      shortcuts:[],
    };
  }

  setConfig(config) { this.config=config; }
  getCardSize()    { return 1; }
  getGridOptions() { return {columns:6,rows:1,min_rows:1,max_rows:1}; }

  _resolveImg(which) {
    const idKey=which==="on"?"icon_on_id":"icon_off_id";
    const pathKey=which==="on"?"icon_on_path":"icon_off_path";
    const id=this.config[idKey];
    if (id==="custom") return this.config[pathKey]||"";
    if (id) return iconPath(id)||"";
    return which==="on"?ICON_BASE+"bulb_glow_esplosivo.gif":ICON_BASE+"bulb_off.png";
  }

  _resolveGlowRgb(which) {
    const entity=this.hass?.states[this.config?.entity];
    const mode=this.config?.[`glow_${which}_color_mode`]||"preset";
    if (mode==="entity") return entityRgb(entity)||"255,80,80";
    if (mode==="custom") { const h=this.config?.[`glow_${which}_color_hex`]; return h?hexToRgb(h):"255,200,60"; }
    return this.config?.[`glow_${which}_color`]||(which==="on"?"255,200,60":"100,180,255");
  }

  _callShortcut(s) {
    const entity=this.config.entity;
    const action=s.action||"none";
    if (action==="none") return;
    if (action==="toggle") {
      const state=this.hass.states[entity]?.state;
      const domain=entity.split(".")[0];
      const svc=state==="on"?"turn_off":"turn_on";
      this.hass.callService(["light","switch","fan","input_boolean"].includes(domain)?domain:"homeassistant",svc,{entity_id:entity});
    } else if (action==="more-info") {
      this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:entity},bubbles:true,composed:true}));
    } else if (action==="navigate") {
      if (s.navigate_path) history.pushState(null,"",s.navigate_path);
    } else if (action==="call-service") {
      const preset=s.service_preset||"";
      const custom=s.service_custom||"";
      const svcStr=preset==="custom"?custom:preset;
      if (!svcStr) return;
      const [domain,service]=svcStr.split(".");
      let data={};
      try { if(s.service_data) data=JSON.parse(s.service_data); } catch(e) {}
      if (!data.entity_id) data.entity_id=entity;
      this.hass.callService(domain,service,data);
    }
  }

  _onPointerDown(e) {
    if (e.target.closest(".dd-btn")||e.target.closest(".dropdown")) return;
    this._holdFired=false;
    this._holdTimer=setTimeout(()=>{ this._holdFired=true; callHassAction(this.hass,"hold",this.config); },500);
  }
  _onPointerUp(e) {
    if (e.target.closest(".dd-btn")||e.target.closest(".dropdown")) return;
    clearTimeout(this._holdTimer);
    if (this._holdFired) { this._holdFired=false; return; }
    if (this._tapTimer) {
      clearTimeout(this._tapTimer); this._tapTimer=null;
      callHassAction(this.hass,"double_tap",this.config);
    } else {
      this._tapTimer=setTimeout(()=>{ this._tapTimer=null; callHassAction(this.hass,"tap",this.config); },250);
    }
  }
  _onPointerCancel() { clearTimeout(this._holdTimer); clearTimeout(this._tapTimer); this._holdFired=false; this._tapTimer=null; }

  _toggleDropdown(e) { e.stopPropagation(); this._ddOpen=!this._ddOpen; this.requestUpdate(); }
  _closeDropdown()   { this._ddOpen=false; this.requestUpdate(); }

  _shortcutIconColor(color) {
    return {blue:"#64b4ff",green:"#64ff96",amber:"#ffc83c",red:"#ff6464",purple:"#b464ff"}[color]||"#aaa";
  }
  _shortcutBgColor(color) {
    return {blue:"rgba(100,180,255,0.15)",green:"rgba(100,255,150,0.15)",amber:"rgba(255,200,60,0.15)",red:"rgba(255,100,100,0.15)",purple:"rgba(180,100,255,0.15)"}[color]||"rgba(255,255,255,0.1)";
  }

  _renderDropdown(shortcuts) {
    if (!shortcuts.length||!this._ddOpen) return html``;
    return html`
      <div class="overlay" @click=${this._closeDropdown}></div>
      <div class="dropdown">
        ${shortcuts.map(s=>html`
          <div class="dd-item" @click=${()=>{ this._callShortcut(s); this._closeDropdown(); }}>
            <div class="dd-icon" style="background:${this._shortcutBgColor(s.color)};color:${this._shortcutIconColor(s.color)}">●</div>
            <span class="dd-label">${s.label}</span>
          </div>`)}
      </div>`;
  }

  render() {
    if (!this.hass||!this.config) return html``;
    const entity=this.hass.states[this.config.entity];

    if (this.config.visibility_entity) {
      const ve=this.hass.states[this.config.visibility_entity];
      if (ve&&ve.state!==(this.config.visibility_state||"on")) return html``;
    }

    if (!entity) return html`<ha-card style="padding:12px;color:var(--error-color)">Entità non trovata: ${this.config.entity}</ha-card>`;

    const isOn=entity.state==="on";
    const showName=this.config.show_name!==false;
    const name=this.config.name||entity.attributes.friendly_name||this.config.entity;
    const img=this._resolveImg(isOn?"on":"off");
    const layoutMode=this.config.layout_mode||"row";
    const cardHeight=this.config.card_height||56;
    const textAlign=this.config.text_align||"left";
    const nameFontSize=this.config.name_font_size||14;
    const stateFontSize=this.config.state_font_size||12;
    const shortcuts=this.config.shortcuts||[];

    const glowOnActive=this.config.glow_on_active!==false;
    const glowOffActive=this.config.glow_off_active===true;
    const speed=this.config.glow_speed||2;
    const intensityOn=this.config.glow_on_intensity??1;
    const intensityOff=this.config.glow_off_intensity??1;

    let glowColor=null, glowIntensity=1;
    if (isOn&&glowOnActive)   { glowColor=this._resolveGlowRgb("on");  glowIntensity=intensityOn;  }
    if (!isOn&&glowOffActive) { glowColor=this._resolveGlowRgb("off"); glowIntensity=intensityOff; }

    const uid=this.config.entity.replace(/[\.\-]/g,"_");
    const subtextFields=this.config.subtext_fields??["state"];
    const subtextValue=subtextFields.map(f=>getSubtextValue(entity,f,this.config)).filter(Boolean).join(" · ");

    const gA=(0.4*glowIntensity).toFixed(2);
    const gB=(0.7*glowIntensity).toFixed(2);
    const s1=`0 0 ${Math.round(6*glowIntensity)}px ${Math.round(2*glowIntensity)}px rgba(${glowColor},${gA})`;
    const s2=`0 0 ${Math.round(20*glowIntensity)}px ${Math.round(6*glowIntensity)}px rgba(${glowColor},${gB})`;
    const glowStyle=glowColor?`animation:glow-anim-${uid} ${speed}s ease-in-out infinite;`:"";
    const glowKf=glowColor?html`<style>@keyframes glow-anim-${uid}{0%,100%{box-shadow:${s1};border-color:rgba(${glowColor},0.7);}50%{box-shadow:${s2};border-color:rgba(${glowColor},1);}}</style>`:"";

    const evts={ "@pointerdown":this._onPointerDown, "@pointerup":this._onPointerUp, "@pointercancel":this._onPointerCancel };
    const ddBtn=shortcuts.length?html`<div class="dd-btn" @click=${this._toggleDropdown}>⋮</div>`:"";

    if (layoutMode==="tile") {
      return html`${glowKf}
        <ha-card class="tile-card" style="height:${cardHeight}px;${glowStyle}"
          @pointerdown=${this._onPointerDown} @pointerup=${this._onPointerUp} @pointercancel=${this._onPointerCancel}>
          <img src="${img}" class="tile-img" alt="${name}"/>
          <div class="tile-overlay" style="text-align:${textAlign}">
            ${showName?html`<span class="tile-name" style="font-size:${nameFontSize}px">${name}</span>`:""}
            ${subtextValue?html`<span class="tile-state" style="font-size:${stateFontSize}px">${subtextValue}</span>`:""}
          </div>
          ${ddBtn}${this._renderDropdown(shortcuts)}
        </ha-card>`;
    }

    return html`${glowKf}
      <ha-card style="height:${cardHeight}px;${glowStyle}"
        @pointerdown=${this._onPointerDown} @pointerup=${this._onPointerUp} @pointercancel=${this._onPointerCancel}>
        <img src="${img}" alt="${name}" style="width:${Math.round(cardHeight*0.64)}px;height:${Math.round(cardHeight*0.64)}px"/>
        <div class="info" style="text-align:${textAlign}">
          ${showName?html`<span class="name" style="font-size:${nameFontSize}px">${name}</span>`:""}
          ${subtextValue?html`<span class="state" style="font-size:${stateFontSize}px">${subtextValue}</span>`:""}
        </div>
        ${ddBtn}${this._renderDropdown(shortcuts)}
      </ha-card>`;
  }

  static get styles() {
    return css`
      ha-card {
        border-radius:20px; border:3px solid rgba(255,255,255,0.15);
        display:flex; flex-direction:row; align-items:center;
        padding:0 10px 0 12px; gap:10px;
        box-sizing:border-box; cursor:pointer;
        user-select:none; -webkit-user-select:none;
        position:relative; overflow:visible;
      }
      img   { object-fit:contain; flex-shrink:0; }
      .info { display:flex; flex-direction:column; justify-content:center; overflow:hidden; flex:1; min-width:0; }
      .name  { color:var(--primary-text-color); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; }
      .state { color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; }
      .tile-card    { border-radius:20px; border:3px solid rgba(255,255,255,0.15); position:relative; overflow:hidden; cursor:pointer; user-select:none; -webkit-user-select:none; display:block; padding:0; }
      .tile-img     { width:100%; height:100%; object-fit:cover; display:block; }
      .tile-overlay { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent,rgba(0,0,0,0.65)); padding:6px 10px; display:flex; flex-direction:column; }
      .tile-name    { color:#fff; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .tile-state   { color:rgba(255,255,255,0.7); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .dd-btn { width:28px; height:28px; border-radius:8px; border:1px solid rgba(255,255,255,0.15);
                display:flex; align-items:center; justify-content:center; cursor:pointer;
                color:var(--secondary-text-color); font-size:18px; line-height:1; flex-shrink:0;
                z-index:5; transition:background .15s; }
      .dd-btn:hover { background:rgba(255,255,255,0.1); color:var(--primary-text-color); }
      .overlay  { position:fixed; inset:0; z-index:98; }
      .dropdown { position:absolute; right:8px; top:calc(100% + 4px); min-width:180px;
                  background:var(--card-background-color); border:1px solid var(--divider-color);
                  border-radius:10px; overflow:hidden; z-index:99; box-shadow:0 4px 16px rgba(0,0,0,0.3); }
      .dd-item  { display:flex; align-items:center; gap:10px; padding:10px 12px; font-size:13px;
                  color:var(--primary-text-color); border-bottom:1px solid var(--divider-color);
                  cursor:pointer; transition:background .1s; }
      .dd-item:last-child { border-bottom:none; }
      .dd-item:hover      { background:var(--secondary-background-color); }
      .dd-icon  { width:22px; height:22px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:10px; }
      .dd-label { flex:1; }
    `;
  }
}

customElements.define("animation-card", AnimationCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        "animation-card",
  name:        "Animation Card",
  description: "Card con gif animata, glow avanzato, layout tile/row, azioni complete e shortcut dropdown.",
  preview:     true,
});
