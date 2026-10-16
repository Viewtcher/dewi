# dewi. – Arbeitsregeln für Claude

Dieses Projekt ist **dewi.**, Vitos Vokabel-App für sein iPhone 15 Pro (Duolingo-light mit viel Gamification, Maskottchen Dewi, eine Diva-Katze). Kurse: Indonesisch, Englisch (bei App-Sprache Deutsch) und Deutsch (bei App-Sprache Englisch). Die App ist eine einzelne HTML-Datei, die aus Quelldateien gebaut und über GitHub Pages veröffentlicht wird. Auf dem iPhone läuft sie als Safari-Verknüpfung auf dem Home-Bildschirm.

Vito kann nicht programmieren und trifft alle Entscheidungen selbst.

## Grundregel: erst fragen, dann bauen

1. Lies vor jeder Arbeit die betroffenen Abschnitte in `ENTWICKLUNG.md` und den betroffenen Code.
2. **Stelle vor jeder Umsetzung Schritt für Schritt Fragen**, mit Antwortmöglichkeiten und einer Empfehlung samt kurzer Begründung (höchstens 4 Fragen auf einmal). Frag nichts, was du selbst im Code nachlesen kannst.
3. Vito entscheidet. **Erst danach** änderst du Dateien. Ohne seine Antworten wird nichts umgesetzt.
4. Setz genau das Vereinbarte um. Fällt dir unterwegs etwas auf, schlag es vor, statt es heimlich einzubauen.

## Ablauf nach jeder Änderung

1. Nur die Quellen bearbeiten: `app.src.html` und die eingebundenen Dateien (`rounds.js`, `playmodes.js`, `chips.js`, `music.js`, `dewi-music.js`, `align.js`, `lang_*.js`, `modules/*.js`). **`index.html` nie direkt bearbeiten.**
2. Bauen: `python build.py` (im Hauptordner). Erzeugt `index.html`.
3. Testen: `npm test --prefix tests`. Alle vier Tests müssen grün sein (test2/test4: „ALLES OK“, test3/test5: „Alle Tests bestanden“). Ändert sich gewolltes Verhalten, Tests anpassen und das offen sagen.
4. **Keine Vorschau-Screenshots von selbst aus.** Bei optischen Änderungen kurz beschreiben, was sich zeigen sollte. Ein Screenshot (Playwright/Chromium) nur, wenn Vito ausdrücklich danach fragt. Spart Token, die ein Bild beim Ansehen kostet.
5. In `ENTWICKLUNG.md` den nächsten Eintrag `## Version NN – Titel` anhängen: was, warum, Technik, Teststand und was nur auf einem echten iPhone prüfbar ist.
6. Commit mit der Nachricht `Version NN – Titel` (darfst du selbst).
7. **Push nach `entwicklung` darfst du selbst, ohne Nachfrage.** Das sichert die Version auf GitHub, verändert aber `main` nicht und veröffentlicht nichts.
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
- Testhaken: `window.__test`, `window.__run(code)`, `window.__introMs=0`.
- Details zu Aufbau, Begriffen, Lernlogik und allen Versionen: `ENTWICKLUNG.md`.

## Agenten

- **Nova** (`.claude/agents/nova.md`): Senior-App-Designerin, gibt Feedback zu Design, Gamification und Lernerlebnis. Ändert nichts.
- **Marlin** (`.claude/agents/marlin.md`): Senior-Entwickler, fragt, legt einen Plan vor und baut erst nach Vitos OK.

## Wie du mit Vito sprichst

- Deutsch, mittel ausführlich, mit kurzem „Warum“. Einfache Lösung vor der optimierten zeigen.
- Kein Fachjargon ohne Erklärung. Git-Schritte in einfachen Worten benennen (Speicherpunkt = Commit, hochladen = Push).

## Offene Punkte (Stand Version 132)

- **In Arbeit: Poker Phase 1** nach `konzept-poker-shop.md` (Etappen 131 Lernlogik ✓, 132 Chips ✓, 133 Poker-Regeln, 134 Poker-Screens). Konzeptbilder: Design-Canvas „dewi. Poker-Screens“, Reihe „Version 2“. Veröffentlichen erst nach Etappe 4.
- Shop (Phase 2) nach den Erfahrungen aus Phase 1. Vorher Fragen stellen.
- Zuordnungen prüfen: `data/align/review_en_de.txt` (offene en→de-Paare). Indonesisch noch offen.
- Auf dem iPhone prüfen: Haptik, Sound, Musik (Checkliste aus Claudios Übergabe, Abschnitt 5), Stimmen.
- Grenzfälle mit Klammern: „Tut es weh?“, „Wie geht es dir heute?“.
