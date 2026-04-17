# 🌟 Animation Card per Home Assistant

Una card Lovelace personalizzata e di livello avanzato per Home Assistant. 
Nasce per visualizzare le tue entità utilizzando **icone e GIF animate**, ma si è evoluta in uno strumento potentissimo con **layout multipli**, **menu a tendina per le scorciatoie**, **doppio tocco** e un **glow dinamico** capace di ereditare il colore reale delle tue luci.

[![HACS Custom Repository](https://img.shields.io/badge/HACS-Custom_Repository-orange.svg)](https://hacs.xyz/)

---

## ✨ Novità & Caratteristiche Principali

* 🎨 **Glow Dinamico Intelligente**: Il bagliore ora può seguire il colore RGB/HS reale della tua luce (o usare una ruota colori personalizzata). Puoi regolare l'intensità separatamente per lo stato ON e OFF.
* 📐 **Layout Flessibili (Row & Tile)**: Scegli se visualizzare la card a riga classica (icona + testo) o in modalità **Tile** (icona a piena larghezza con sfumatura e testo sovrapposto). Altezza e allineamento sono completamente configurabili.
* ⚡ **Azioni Avanzate**: Supporto per **Tap**, **Doppio Tap** (finestra di 250ms) e **Long Press**. Puoi innescare menu, navigazioni o chiamare servizi specifici passando anche payload JSON.
* 📝 **Sottotesto Modulare**: Dimentica il semplice "Acceso/Spento". Ora puoi concatenare: *Stato, Ultima modifica (es. "5 min fa"), Luminosità, Temperatura, Umidità, o Attributi custom*.
* 🔘 **Menu Shortcut (⋮)**: Aggiungi fino a 4 azioni rapide accessibili tramite un elegante menu a discesa direttamente dalla card, ognuna con la sua icona colorata.
* 👁️ **Visibilità Condizionale**: Fai apparire o nascondere la card dinamicamente in base allo stato di un'altra entità (es. mostrala solo se c'è un allarme attivo).
* 🛠️ **Editor Visuale a Sezioni**: Configura tutto senza toccare una riga di YAML, grazie a un editor pulito e diviso in sezioni collassabili.

---

## 🛠️ Installazione (HACS)

1. Apri **HACS** in Home Assistant.
2. Clicca sui tre puntini in alto a destra (⋮) e seleziona **Custom repositories**.
3. Incolla l'URL di questo repository: `https://github.com/themask1987/animation-card`
4. Scegli la categoria **Dashboard** e clicca Aggiungi.
5. Cerca "Animation Card" e installala. Ricarica la cache del browser.

---

## ⚙️ Configurazione YAML (Avanzata)

Sebbene l'editor visuale gestisca tutto, ecco un esempio di configurazione YAML per sfruttare le nuove funzioni (Layout Tile, colore RGB ereditato dall'entità e menu shortcuts):

```yaml
type: custom:animation-card
entity: light.salotto
name: Luce Principale
layout_mode: tile
card_height: 90
subtext_fields:
  - state
  - brightness
icon_on_id: bulb_glow_esplosivo
icon_off_id: bulb_off
glow_on_active: true
glow_on_color_mode: entity
glow_on_intensity: 1.2
tap_action: toggle
double_tap_action: more-info
shortcuts:
  - label: Imposta 50%
    action: call-service
    service_preset: custom
    service_custom: light.turn_on
    service_data: '{"brightness_pct": 50}'
    color: amber
