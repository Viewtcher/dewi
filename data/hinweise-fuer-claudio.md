# Hinweise von Marlin an Claudio (Einbau „Holo-Aufstieg“, Version 129)

Der Loop ist als dritter Soundtrack in dewi. eingebaut. Am Klang habe ich nichts geändert. In `dewi-music.js` habe ich nur `load()`/`save()` ganz oben leer gemacht, weil dewi. in seinem eigenen Stand speichert.

1. **Lautstärke:** dewi. reicht den Reglerwert 1:1 weiter (Standard 0,35, dein Standard war 0,45). Wenn Holo-Aufstieg im Vergleich zu Lo-Fi/Arcade zu leise oder zu laut ist, bitte `masterLevel()` oder `LV` anpassen.
2. **Kein Neuaufbau:** `build()` läuft nur einmal. Schließt iOS den AudioContext, fällt dewi. auf Lo-Fi zurück. Eine kleine `rebuild()`-Funktion in der API würde das lösen.
3. **Start bei Takt 1:** `start()` setzt `step = 0`. Nach jedem Aus/An oder Soundtrack-Wechsel beginnt der Loop wieder bei Takt 1 (Teil A, ohne Melodie). Ist das gewollt?
4. **Mix gegen Effekte:** Ob die Musik Dewis Tippgeräusch und die Effekt-Sounds (Serie, Herz, Zählen) übertönt, kann erst auf dem iPhone beurteilt werden. Falls ja: `LV` senken oder `duck()` bei den großen Einblendungen (dafür bräuchte ich Vitos Okay).
