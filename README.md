# 🌟 Animation Card per Home Assistant

Una card Lovelace personalizzata e altamente configurabile per Home Assistant. 
Permette di visualizzare le tue entità utilizzando **icone e GIF animate** e aggiunge un suggestivo **effetto glow (bagliore) dinamico** ai bordi, completamente configurabile in base allo stato dell'entità (ON/OFF).

[![HACS Custom Repository](https://img.shields.io/badge/HACS-Custom_Repository-orange.svg)](https://hacs.xyz/)

## ✨ Caratteristiche Principali

* 🎨 **Editor Visuale Integrato**: Configura ogni singolo aspetto direttamente dall'interfaccia utente, senza dover toccare il codice YAML.
* 💡 **Effetto Glow Dinamico**: Scegli colore, velocità dell'animazione e quando attivare il bagliore (solo ON, solo OFF, o entrambi).
* 🖼️ **Icone Animate Incluse**: Un set di GIF di alta qualità già pronte all'uso.
* 📂 **Supporto Icone Custom**: Puoi facilmente utilizzare le tue icone personali puntando alla cartella `/local/` di Home Assistant.
* 👆 **Azioni Personalizzate**: Supporta `tap_action` e `hold_action` (toggle, more-info, navigazione, nessuna azione).

---

## 🖼️ Icone Incluse (Bundle)

La card include nativamente queste icone. Puoi selezionarle direttamente dal menu a tendina dell'editor visuale.

| Anteprima | ID Icona | File | Uso Consigliato |
| :---: | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/themask1987/animation-card/main/icons/bulb_glow_esplosivo.gif" width="40" height="40"> | `bulb_glow_esplosivo` | `bulb_glow_esplosivo.gif` | Luce ON (animazione intensa) |
| <img src="https://raw.githubusercontent.com/themask1987/animation-card/main/icons/bulb_pulse_warm.gif" width="40" height="40"> | `bulb_pulse_warm` | `bulb_pulse_warm.gif` | Luce ON (pulsazione morbida) |
| <img src="https://raw.githubusercontent.com/themask1987/animation-card/main/icons/bulb_off.png" width="40" height="40"> | `bulb_off` | `bulb_off.png` | Luce OFF (statica) |
| <img src="https://raw.githubusercontent.com/themask1987/animation-card/main/icons/fan_on.gif" width="40" height="40"> | `fan_on` | `fan_on.gif` | Ventilatore ON |
| <img src="https://raw.githubusercontent.com/themask1987/animation-card/main/icons/fan_off.png" width="40" height="40"> | `fan_off` | `fan_off.png` | Ventilatore OFF |
| <img src="https://raw.githubusercontent.com/themask1987/animation-card/main/icons/scaldasalviette_on.gif" width="40" height="40"> | `scaldasalviette_on` | `scaldasalviette_on.gif` | Scaldasalviette ON |
| <img src="https://raw.githubusercontent.com/themask1987/animation-card/main/icons/scaldasalviette_off.png" width="40" height="40"> | `scaldasalviette_off` | `scaldasalviette_off.png` | Scaldasalviette OFF |

> **Vuoi usare le tue icone?** > Nell'editor visivo seleziona **Custom…** e inserisci il percorso del tuo file (es. `/local/mia_icona_animata.gif`).

---

## 🛠️ Installazione

L'installazione consigliata è tramite **HACS** (Home Assistant Community Store).

1. Apri **HACS** in Home Assistant.
2. Clicca sui tre puntini in alto a destra (⋮) e seleziona **Custom repositories** (Repository personalizzati).
3. Incolla l'URL di questo repository: `https://github.com/themask1987/animation-card`
4. Scegli la categoria **Lovelace** (o Dashboard).
5. Clicca su **Aggiungi** e poi cerca "Animation Card" nella lista per installarla.
6. Ricarica la pagina del browser o svuota la cache quando richiesto.

---

## ⚙️ Configurazione

Puoi configurare la card facilmente tramite l'editor visuale fornito, che include anche un'anteprima in tempo reale del bagliore e dell'animazione. 

Se preferisci usare lo YAML, ecco un esempio completo:

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
