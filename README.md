# Animation Card

Card personalizzata per Home Assistant con gif animata, glow configurabile per stato ON/OFF, e editor visuale integrato.

## Installazione tramite HACS

1. HACS > tre puntini > **Custom repositories**
2. URL repo + tipo **Dashboard**
3. Installa e riavvia HA

## Configurazione

Tutto configurabile via editor visuale. In alternativa via YAML:

```yaml
type: custom:animation-card
entity: light.salotto
name: Salotto
icon_on_id: bulb_glow_esplosivo
icon_off_id: bulb_off
glow_on_active: true
glow_on_color: "255,200,60"
glow_off_active: false
glow_off_color: "100,180,255"
glow_speed: 2
tap_action: toggle
hold_action: more-info
grid_options:
  columns: 6
  rows: 1
```

## Parametri

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `entity` | obbligatorio | Entità HA |
| `name` | friendly_name | Nome visualizzato |
| `icon_on_id` | bulb_glow_esplosivo | ID icona bundle quando ON |
| `icon_off_id` | bulb_off | ID icona bundle quando OFF |
| `icon_on_path` | | Path custom icona ON (se icon_on_id = custom) |
| `icon_off_path` | | Path custom icona OFF (se icon_off_id = custom) |
| `glow_on_active` | true | Glow attivo quando ON |
| `glow_on_color` | 255,200,60 | Colore glow ON (R,G,B) |
| `glow_off_active` | false | Glow attivo quando OFF |
| `glow_off_color` | 100,180,255 | Colore glow OFF (R,G,B) |
| `glow_speed` | 2 | Velocità animazione in secondi |
| `tap_action` | toggle | Azione al tap |
| `hold_action` | more-info | Azione al long press |
| `tap_navigate_path` | | Path navigazione (se tap_action = navigate) |
| `hold_navigate_path` | | Path navigazione (se hold_action = navigate) |

## Icone bundle

| ID | File | Uso consigliato |
|----|------|----------------|
| `bulb_glow_esplosivo` | bulb_glow_esplosivo.gif | Luce ON intensa |
| `bulb_pulse_warm` | bulb_pulse_warm.gif | Luce ON morbida |
| `bulb_off` | bulb_off.png | Luce OFF |

Per usare icone custom: seleziona **Custom…** nell'editor e inserisci il path completo (es. `/local/mia_icona.gif`).

## Aggiungere icone al bundle

Aggiungi il file nella cartella `icons/` del repo e inserisci una voce nell'array `ICONS` in `animation-card.js`.
