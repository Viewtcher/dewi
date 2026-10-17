# dewi. – Arbeitsregeln für Claude

Dieses Projekt ist **dewi.**, Vitos Vokabel-App für sein iPhone 15 Pro (Duolingo-light mit viel Gamification, Maskottchen Dewi, eine Diva-Katze). Kurse: Indonesisch, Englisch (bei App-Sprache Deutsch) und Deutsch (bei App-Sprache Englisch). Die App ist eine einzelne HTML-Datei, die aus Quelldateien gebaut und über GitHub Pages veröffentlicht wird. Auf dem iPhone läuft sie als Safari-Verknüpfung auf dem Home-Bildschirm.

Vito kann nicht programmieren und trifft alle Entscheidungen selbst.

## Grundregel: erst fragen, dann bauen

1. Lies vor jeder Arbeit die betroffenen Abschnitte in `ENTWICKLUNG.md` und den betroffenen Code.
2. **Stelle vor jeder Umsetzung Schritt für Schritt Fragen**, mit Antwortmöglichkeiten und einer Empfehlung samt kurzer Begründung (höchstens 4 Fragen auf einmal). Frag nichts, was du selbst im Code nachlesen kannst.
3. Vito entscheidet. **Erst danach** änderst du Dateien. Ohne seine Antworten wird nichts umgesetzt.
4. Setz genau das Vereinbarte um. Fällt dir unterwegs etwas auf, schlag es vor, statt es heimlich einzubauen.

## Ablauf nach jeder Änderung

1. Nur die Quellen bearbeiten: `app.src.html` und die eingebundenen Dateien (`rounds.js`, `playmodes.js`, `chips.js`, `poker.js`, `pokerui.js`, `shop.js`, `music.js`, `dewi-music.js`, `align.js`, `lang_*.js`, `modules/*.js`). **`index.html` nie direkt bearbeiten.**
2. Bauen: `python build.py` (im Hauptordner). Erzeugt `index.html`.
3. Testen: `npm test --prefix tests`. Alle vier Tests müssen grün sein (test2/test4: „ALLES OK“, test3/test5: „Alle Tests bestanden“). Ändert sich gewolltes Verhalten, Tests anpassen und das offen sagen.
4. **Keine Vorschau-Screenshots von selbst aus.** Bei optischen Änderungen kurz beschreiben, was sich zeigen sollte. Ein Screenshot (Playwright/Chromium) nur, wenn Vito ausdrücklich danach fragt. Spart Token, die ein Bild beim Ansehen kostet.
5. In `ENTWICKLUNG.md` den nächsten Eintrag `## Version NN – Titel` anhängen: was, warum, Technik, Teststand und was nur auf einem echten iPhone prüfbar ist.
6. Commit mit der Nachricht `Version NN – Titel` (darfst du selbst).
7. **Push nach `entwicklung` darfst du selbst, ohne Nachfrage.** Das sichert die Version auf GitHub, verändert aber `main` nicht und veröffentlicht nichts.
   Danach die gebaute `index.html` als Artefakt **„dewi. Vorschau“** neu veröffentlichen (immer dasselbe Artefakt, Titel im `<title>` auf „dewi. Vorschau“ ändern, `icon.png` mitgeben), damit Vito den Stand in Claude testen kann, ohne dass etwas live geht. Die Vorschau hat einen eigenen Spielstand.
8. **Push nach `main` nur nach Vitos ausdrücklichem OK.** Das veröffentlicht die App. Vorher kurz sagen, was live geht.
9. Kurzer Bericht auf Deutsch: was sich geändert hat, was Vito auf dem iPhone prüfen soll. Immer erwähnen, dass es **nicht auf einem echten iPhone getestet** ist (Ton, Haptik, Timing, Sprachausgabe).

## Git-Regeln

- Gearbeitet wird auf dem Zweig `entwicklung`. Dorthin pushst du nach jeder fertigen, getesteten Version ohne Nachfrage, das ist nur eine Sicherung auf GitHub.
- **Veröffentlicht wird nur über `main`.** Sagt Vito „jetzt aktualisieren“/„veröffentlichen“: `entwicklung` nach `main` mergen und pushen (schnelles Vorspulen, falls möglich). Das ist der einzige Push, der eine Bestätigung braucht.
- Kein `git push --force`, kein `git reset --hard`, keine gelöschte Historie, auf keinem der beiden Zweige.
- Alte Sicherungskopien (`data/*.bak.*`) braucht es nicht mehr, Git speichert jede Version. Die vorhandenen bleiben liegen.
- Nach dem Push auf `main` baut GitHub Actions die App erneut, führt die Tests aus und veröffentlicht nur, wenn alles grün ist (`.github/workflows/pages.yml`). Schlägt das fehl, bleibt die alte Version online.
- Arbeitet Vito zwischendurch auch in VS Code: dort vor dem Weitermachen `entwicklung` auschecken und synchronisieren (Pull), damit beide Seiten auf demselben Stand aufbauen.

## Wichtige Technik in Kürze

- Ein Strict-Mode-IIFE in `app.src.html`; Includes über `/*@include datei*/`, die `build.py` einsetzt.
- Spielstand nur im Browser: `localStorage`, Schlüssel `kata.v1`. Er hängt an der Adresse der Seite. Änderungen am Datenformat brauchen eine Migration in `migrate()`.
- Testhaken: `window.__test`, `window.__run(code)`, `window.__introMs=0`, `window.__autoBlind` (wählt den Blind ohne Fenster).
- Details zu Aufbau, Begriffen, Lernlogik und allen Versionen: `ENTWICKLUNG.md`.

## Agenten

- **Nova** (`.claude/agents/nova.md`): Senior-App-Designerin, gibt Feedback zu Design, Gamification und Lernerlebnis. Ändert nichts.
- **Marlin** (`.claude/agents/marlin.md`): Senior-Entwickler, fragt, legt einen Plan vor und baut erst nach Vitos OK.

## Wie du mit Vito sprichst

- Deutsch, mittel ausführlich, mit kurzem „Warum“. Einfache Lösung vor der optimierten zeigen.
- Kein Fachjargon ohne Erklärung. Git-Schritte in einfachen Worten benennen (Speicherpunkt = Commit, hochladen = Push).

## Offene Punkte (Stand Version 159)

- **Poker Phase 1 live** (Versionen 131–135, veröffentlicht am 16.10.2026; Rückweg: Zweig `stand-v130`). Version 136 (kleine Poker-Zeile) auf `entwicklung`. Danach spielt Vito 1–2 Wochen; seine Erfahrungen fließen in Phase 2 (Shop) ein.
- Offen aus Phase 1: Designsystem auf den Rest der App übertragen (Startscreen, Module, Survival, Einstellungen), große Flamme im neuen Stil, Sicherung inkl. Chips (Konzept Abschnitt 9, mit dem Shop).
- **Shop (Phase 2) in Arbeit:** 137 Streak-Schutz + Sicherung ✓, Gestaltung im Canvas ✓, 138 Shop mit Mitternacht, Schleife, Neon-Nacht, Streak-Schutz ✓, 139 Startscreen ohne Tab-Leiste ✓, 140 Shop-Kachel wieder entfernt (Shop nur über die Chip-Pille), Vokabelheft-Kachel wie die alte Fortschritt-Karte ✓, 141 Chip-Stapel wieder weg, Pfeil an der Vokabelheft-Kachel ✓, 142 Blind-Chip-Drehung, Einstellungen ohne Beschreibungen, Testbereich mit Textfeldern ✓, 143 echter Münz-Flip mit eigenem Dreh-Sound, wuchtige Royal-Flush-Verdopplung mit Bildschirm-Zucken ✓, 144 Zurück-Wisch vom linken Rand in Vokabelheft/Einstellungen ✓, 145 Tab-Leiste zurück mit Shop statt Einstellungen ✓, 146 Reiter „Home", Leiste auch im Shop, Pfeil mittig auf der Vokabelheft-Kachel ✓. Weitere Artikel aus dem Canvas (Minze, Holo, Herzbrille, Krone, Sonnenuntergang, Holo-Lounge) und Musik-Kits später. Preise in `shop.js` (`SHOP_PRICE`).
- 147: Deutsche Flagge im Deutschkurs, Artikel aus allen deutschen Wörtern entfernt (`data/strip_artikel.py`), Deutschkurs 652 Wörter ✓
- 148: Im Spiel Zahnrad statt Lautstärke-Knopf, öffnet Einstellungen als Ebene übers Spiel, Sound-Karte dort ganz oben ✓
- 149: Kein geschriebener Satz mehr zu Stufe/nächster Wiederholung unter dem Modul-Ergebnis und im Level-up-Screen ✓
- 150: Tab-Leiste sitzt wirklich ganz unten, Seite füllt immer den vollen Bildschirm ✓ (gemeldeter Spalt auf dem iPhone noch nicht live-bestätigt)
- 151: Sound & Musik in einer Kachel mit Regler für Dewis Stimme, OK-Knöpfe im Testbereich, Soundtrack „Indie“, Haus-Symbol, volle Fortschrittsleiste, Fortschritt im Vokabelheft ausklappbar, Vorlesen pro Vokabel (auch Deutsch), Zurück-Wisch überall außer im Spiel ✓
- 152: Erster Sprachscreen nur englisch (vorgewählt), Tipp auf Deutsch schaltet um; Flaggen in beiden Sprachscreens; Hinweis „Weitere Sprachen …“ entfernt ✓
- 153: Leistungsanzeige im Testbereich (fps, laufende Animationen), Grundlage gegen das Heißwerden des iPhones; Maßnahmen folgen nach Vitos Messung ✓
- 154: Swipe-Modul: Ergebnis an der Stelle der Karte (kein Hochrutschen mehr), Karte als eigene Ebene und höchstens ein Update pro Bild gegen das Heißwerden ✓ (Wirkung auf die Wärme noch nicht auf dem iPhone bestätigt)
- 155: Neues Modul „Slots“ (goldener Automat, Zahlen und Früchte im Diva-Comic-Look, Auswahl pro Walze, doppelte Survival-Punkte) zusätzlich zu Reels ✓. Offen: Feinschliff nach Vitos Test, später evtl. Tippen auf hohen Stufen, dann entscheiden, ob Reels ersetzt wird.
- 156/157 (Leuchten, Wirbel, Strom-Sound) hat Vito verworfen; 158 setzt Slots auf den Stand von 155 zurück ✓
- 159: Survival-Screen öffnet ohne Stocken (Solo-Kacheln zählen nur bis 3, `soloCount`) ✓. Dauer-Animationen dort bewusst unverändert.
- Zuordnungen prüfen: `data/align/review_en_de.txt` (offene en→de-Paare). Indonesisch noch offen.
- Auf dem iPhone prüfen: Haptik, Sound, Musik (Checkliste aus Claudios Übergabe, Abschnitt 5), Stimmen.
- Grenzfälle mit Klammern: „Tut es weh?“, „Wie geht es dir heute?“.
