# dewi. – Entwicklerdokumentation

Vokabeltrainer für Indonesisch (Bahasa Indonesia → Englisch), gebaut als einzelne HTML-Datei für das iPhone (Home-Bildschirm-Verknüpfung über Safari). Dieses Dokument hält Aufbau, Regeln und alle Änderungen fest. **Bei jeder Änderung wird der Abschnitt „Änderungsprotokoll“ ergänzt.**

---

## 1. Überblick

| Punkt | Wert |
|---|---|
| Name | dewi. (früher kata.vito) |
| Art | Web-App, eine Datei, kein Framework, kein Server |
| Speicher | `localStorage`, Schlüssel `kata.v1` (Datenversion 2, siehe 4.) |
| Zielgerät | iPhone 15 Pro, Safari → „Zum Home-Bildschirm“ |
| Sprache der Oberfläche | Deutsch |
| Lernsprache | Indonesisch → Englisch (weitere Sprachen später über `LANGS`) |
| Wortschatz | 678 Einträge in 20 Kategorien, 652 mit Beispielsatz |
| Design | dunkel, Indigo-Grundton, bunte Akzente (Gelb, Orange, Pink, Violett, Blau, Cyan, Grün) |
| Hosting | GitHub Pages (Repository `dewi`, Veröffentlichung per GitHub Actions) |

Warum Web-App statt Xcode: Das MacBook Pro 2015 läuft nur bis macOS 12, dafür gibt es kein aktuelles Xcode. Eine Web-App braucht keins.

## 2. Dateien

```
dewi/
├── app.src.html          Gerüst: Stile, Markup, Wortschatz, Beispielsätze, Zustand, Startseite, Vokabelheft, Einstellungen, Dewi, Stempel, Sound.
│                         Bindet die Dateien unten über Zeilen wie /*@include modules/swipe.js*/ ein.
├── rounds.js             ROUNDS: startRound, Wort-Reihe (showItem, nextStep), Kennzeile, finish, levelUp, showEnd
├── playmodes.js          PLAYMODES: Playmode-Wahl für den Survival Mode (Random oder Solo)
├── chips.js              Chips (Währung, seit Version 132): Dewi-Chip als SVG-Symbole, Pille, Survival-Chips, Chipregen
├── poker.js              Poker (seit Version 133): Blinds, Multiplikator, Royal Flush, Serien-Bonus, Auszahlung
├── pokerui.js            Poker-Screens (seit Version 134/135): Blind-Wahl, Dewi-Zone, Dewi-Chips im Kopf, Multiplikator-Animation, Auszahlung, Royal Flush
├── shop.js               Shop und Inventar (Phase 2, seit Version 137/138): Preise, Streak-Schutz, Sicherung, Shop-Screen, Kauf, Ausrüsten, Themes
├── modules/
│   ├── _registry.js      Modul-Register (registerModule, MOD, resolveModule) mit Erklärung der Begriffe
│   ├── _shared.js        Gemeinsame Helfer: Hervorhebung, Wortkacheln, Distraktoren, editDist, Leben-Anzeige
│   ├── intro.js          Modul Kennenlernen (nur für neue Wörter, keine Wertung)
│   ├── blocks.js         Modul Bausteine
│   ├── typing.js         Modul Tippen (inkl. Tippfehler-Toleranz)
│   ├── swipe.js          Modul Swipe
│   ├── gap.js            Modul Lückensatz
│   ├── choice.js         Modul Auswahl
│   ├── reels.js          Modul Reels (Spielautomat)
│   ├── slots.js          Modul Slots (goldener Automat mit Symbolen, Version 155)
│   └── pads.js           Modul Pads (Farben auf leuchtenden Musik-Pads, Version 161)
├── dewi-music.js         Holo-Aufstieg (Claudio): eigenständiges Web-Audio-Modul, stellt window.DewiMusic bereit
├── music.js              Musik: Lo-Fi, Arcade, Synthwave (Reels) und Verbindungsstück zu Holo-Aufstieg
├── build.py              Setzt die Includes ein und baut index.html und icon.png
├── index.html            Fertige Datei zum Hosten (Ergebnis von build.py)
├── icon.png              512×512, Home-Bildschirm-Symbol (vier bunte Blütenblätter)
├── ENTWICKLUNG.md        dieses Dokument
├── CLAUDE.md             Arbeitsregeln für Claude Code (fragen, bauen, testen, dokumentieren, Git)
├── ANLEITUNG-UMZUG.md    Einrichtung auf dem Windows-PC und GitHub Pages
├── tests/                test2.js–test5.js (jsdom), package.json: npm test
├── .github/workflows/    pages.yml: bauen, testen, veröffentlichen
├── .claude/              agents/ (Nova, Marlin), settings.json (Push nur nach Nachfrage)
├── (concept/)            Konzeptbilder: seit Version 130 nicht mehr im Repository, liegen als ZIP im Claude-Chat
└── data/                 Patch-Skripte der einzelnen Versionen und Sicherungen app.src.vNN.bak.html
```

**Wichtig:** Maßgeblich ist `app.src.html`. Die Dateien in `data/` sind Arbeitskopien. Wer Sätze ändert, ändert sie direkt in `app.src.html` (Block `SENT_RAW`).

### Bauen

```
python build.py         # erzeugt index.html (unter Linux/Mac: python3 build.py)
```

`build.py` ersetzt zuerst die Include-Zeilen (`/*@include datei*/`) durch den Dateiinhalt und zerlegt dann `app.src.html` (Titel, Schrift-Link, `<style>`, Markup/Skript) und setzt ein vollständiges HTML-Dokument zusammen: `viewport-fit=cover`, `theme-color #0d1325`, `apple-mobile-web-app-*`-Meta-Tags (Titel „kata.vito“), `apple-touch-icon`.

## 2a. Begriffe (feste Wörter für Gespräch, Doku und Code)

| Ebene | Begriff | Bedeutung | Beispiele / Code |
|---|---|---|---|
| Aufgabe | **Modul** | Eine Übungsart, die ein Wort abfragt | Bausteine (`blocks`), Tippen (`typing`), Swipe (`swipe`), Lückensatz (`gap`), Auswahl (`choice`); dazu das Kennenlernen (`intro`) ohne Wertung |
| Aufgabe | **Karte** | Ein Wort in einem Modul, die kleinste Einheit | „eine Swipe-Karte“ |
| Ablauf | **Playmode** | Welche Module eine Round einsetzt | **Random** (gemischt, nach Stufe) und **Solo** (ein einziges Modul für alle Wörter, z. B. „Solo Swipe“) |
| Runde | **Round** | Eine komplette Abfrage vom Start bis zum Ergebnis | siehe unten |
| Runde | **Daily Round** | Die Pflicht des Tages, immer Playmode Random, ohne Leben, gespielt als **Pokerhand** (seit Version 133). Stages: **Einführung** (neues Wort), **Review** (4 bekannte Wörter + neues Wort am Ende) | `startRound('daily')` |
| Poker | **Hand · Blind · Multiplikator · Royal Flush** | Hand = alle gewerteten Module einer Daily Round. Blind = Einsatz (Small 100, Big 300). Multiplikator = ×0 + 1 je geschafftem Modul. Royal Flush = alles geschafft, Multiplikator × 2 | `poker.js` |
| Runde | **Survival** (früher Freeplay) | Freiwillig, erst nach der Daily Round: alle begonnenen Wörter (auch Stufe 0) einmal, 3 Leben insgesamt, ein Versuch pro Karte, Highscore je Playmode | `startRound('survival')`, `openPlaymodes('survival')` |
| Zustand | **Wackelig** | Wörter auf Stufe 0 oder 1 (Filter im Vokabelheft). Stufe 0 heißt: ein Modul wurde verloren, das Wort ist morgen fällig und hat im Review Vorrang | `isShaky()`, `fallenWords()` |

Weitere feste Wörter: **Stufe** (0 bis 5) des Wortes, **Kennzeile** (die farbige Zeile oben im Modul, z. B. „WIEDERHOLUNG · STUFE 1 · MODUL SWIPE · INS DEUTSCHE · SOLO“), **Kennenlernen** (Phase für neue Wörter, kein Modul mit Wertung).

Früher gebrauchte, jetzt nicht mehr verwendete Wörter: „Fehlerliste“ und „Reparatur“ (seit Version 131 entfallen), „Satz-Übung“ (war die Gruppe aus Auswahl, Lückensatz, Bausteine und Swipe), „Abfrage/Sitzung“ (jetzt Round) und „freiwillig üben“ (jetzt Survival), „Freeplay“ und „Wiederholungsliste“ (seit Version 35 entfallen).

### So sagt man Änderungen
- „Im Modul Swipe soll der falsche Vorschlag schwerer sein“
- „Beim Playmode Solo soll am Ende …“
- „In der Daily Round soll das Modul Lückensatz häufiger kommen“ (betrifft `pickSentenceModule` in `playmodes.js`)
- „Im Survival sollen es 5 Leben sein“

### Ein neues Modul anlegen
1. Datei `modules/<id>.js` mit der Anzeige-Funktion (`showXyz`, liest die laufende Karte aus `S.cur`, ruft am Ende `nextStep` bzw. `finish`) und am Ende `registerModule({id, name, desc, tone, icon, solo, can, fallback, show})`. Details im Kopf von `modules/_registry.js`.
2. Eine Zeile `/*@include modules/<id>.js*/` in `app.src.html` bei den anderen Modulen.
3. Eigene Texte in `EN` ergänzen. Erscheint automatisch als Kachel im Playmode Solo.
4. Soll es auch im Playmode Random vorkommen, in `pickSentenceModule` / `planCards` (`playmodes.js`) eintragen.

### Datenblätter der Module
| Modul | Datei | Braucht | Ersatz | Wertung |
|---|---|---|---|---|
| Kennenlernen | `intro.js` | nichts | nur bei neuen Wörtern | keine |
| Bausteine | `blocks.js` | Beispielsatz mit mindestens 2 Wörtern oder Alltagssatz | Swipe | 1 Fehler erlaubt |
| Tippen | `typing.js` | nichts | – | 2 Fehler erlaubt (3 Versuche), Tippfehler-Toleranz je Stufe |
| Swipe | `swipe.js` | nichts | – | kein Fehler erlaubt (1 Versuch) |
| Lückensatz | `gap.js` | Beispielsatz mit Lücke | Auswahl, dann Swipe | 1 Fehler erlaubt |
| Auswahl | `choice.js` | Beispielsatz | Swipe | 1 Fehler erlaubt |
| Reels | `reels.js` | Beispielsatz mit mind. 3 Wörtern | Auswahl | Daily: 1 Fehler erlaubt, Survival: 0 |
| Pads | `pads.js` | Farbwort | Auswahl | Daily: 1 Fehler erlaubt, Survival: 0 |
| Slots | `slots.js` | Wort mit Symbol (Zahl 0–10 oder Frucht) | Auswahl | Daily: 1 Fehler erlaubt, Survival: 0; alles richtig = doppelte Survival-Punkte |

## 3. Aufbau des Skripts (`app.src.html`)

Reihenfolge im `<script>`:

1. **Wortschatz** – `LANGS.id.cats`: Liste `[Kategoriename, Textblock]`. Eine Zeile = `indonesisch = englisch`; Alternativen mit ` / `, Hinweise in Klammern. Daraus entstehen `L.words` (`{k, id, en, cat}`) und `L.catCount`. `k` = kleingeschriebenes indonesisches Wort, eindeutig.
2. **Beispielsätze** – `SENT_RAW` → `SENT[k] = {id, tpl, en, slot}` (Format siehe 5.).
3. **Hilfsfunktionen** – `fold`, `normId`, `normEn`, Datum (`ymd`, `parse`, `addDays`), `shuffle`.
4. **Zustand** – `defaults`, `load`, `save`, `migrate`, `today`, `daily`, `listOf`, `listWords`, `plan`, `streak`, `record`.
5. **Farben & Effekte** – Paletten, `flameSvg`, `burst` (Konfetti), `reduceMotion`.
6. **Oberfläche** – `render`, `homeView`, `bookView`/`renderList`, `settingsView` und die jeweiligen `bind…`.
7. **Abfrage** – Sitzung, Schritte, Übungen, Auswertung (siehe 6.).

### Antwortprüfung (Tippen)

- `normId`: Kleinbuchstaben, Akzente weg, alles außer a–z/0–9 entfernt. Groß-/Kleinschreibung, Bindestriche, Leerzeichen sind egal.
- `normEn`: zusätzlich Klammern raus, Kontraktionen aufgelöst (`can't` → `can not`, `it's` → `it is` …), führendes `to/a/an/the` entfernt.
- Englisch → Indonesisch akzeptiert **alle** indonesischen Wörter mit derselben normalisierten englischen Bedeutung (z. B. `kenapa` und `mengapa` für „why“) und zeigt die anderen als „Auch richtig“.
- Bei Indonesisch → Englisch zählt jede der mit ` / ` getrennten Alternativen.

## 4. Zustand und Datenformat

```js
state = {
  v: 2,                       // Datenversion
  lang: 'id' | null,
  dayOffset: 0,               // nur für „Einen Tag vorspulen“ (Testbereich)
  progress: { id: { [key]: { l: 0..5, d: 'YYYY-MM-DD' } } },
  list:     { id: { [key]: { n: Fehlerzähler, s: 'YYYY-MM-DD' (seit) } } },
  daily:    { date, newCount, extra, lt, got: [keys] }, // got = heute richtig gewertete Wörter (Survival-Stufe nur einmal pro Tag)
  flawed:   { 'YYYY-MM-DD': true },                 // Tage, an denen ein Modul verloren wurde: grauer Stempel ohne Holo
  best:     { id: { random: n, typing: n, … } },    // Survival-Rekorde je Playmode
  done:     { 'YYYY-MM-DD': true }                  // Tage mit erfüllter Tagesaufgabe (Serie)
}
```

- `l` = Stufe. 0 bedeutet „auf der Fehlerliste“, 1–5 sind die Lernstufen.
- `d` = nächster Fälligkeitstag. Wörter auf der Fehlerliste haben `d = '9999-12-31'` (`FAR`), sind also nie automatisch fällig.
- Datumsstrings sind lokale Daten (kein UTC), `today()` berücksichtigt `dayOffset`.
- Sicherung (Einstellungen → „Sicherung erstellen“): JSON `{app:'kata', v:1, exported, data:{lang,ui,flawed,best,progress,list,daily,done,…}}`. Das `v:1` ist das Format der Hülle und bleibt gleich.

### Migration (`migrate()`)

Läuft beim Laden, nach dem Einspielen einer Sicherung und nach dem Zurücksetzen. Fehlt `state.list` (alte Daten oder alte Sicherung), werden alle Wörter mit Stufe 0 auf die Fehlerliste gesetzt (`n:1`, `s:` gestern, damit sie sofort als Pflichtwort in Frage kommen) und ihr `d` auf `FAR` gesetzt. Außerdem wird `daily.lt` ergänzt.

## 5. Beispielsätze

Datei-/Blockformat, eine Zeile pro Wort:

```
makan | Saya mau makan sekarang. | I want to [eat] now.
```

- Feld 1: Schlüssel (indonesisches Wort, Groß-/Kleinschreibung egal)
- Feld 2: indonesischer Satz
- Feld 3: englischer Satz; die **eckige Klammer** markiert das englische Gegenstück des Wortes. In der Auswahl-Übung wird sie durch das indonesische Wort ersetzt („I want to **makan** now.“). Genau ein Klammerpaar pro Zeile.

Abdeckung: 652 von 678 Wörtern. Die 26 Alltagssätze (Kategorie „Sätze für den Alltag“, z. B. „saya mengerti“) haben keinen Beispielsatz, weil sie selbst Sätze sind; sie werden nur über Bausteine geübt. Vier kurze Wörter dieser Kategorie (ayo, hati-hati, awas, sebentar) haben einen Beispielsatz.

**Qualitätshinweis:** Die Sätze sind einfach gehalten und wurden maschinell geschrieben. Einzelne unnatürliche Formulierungen sind möglich; eine Durchsicht durch eine Muttersprachlerin oder einen Muttersprachler ist empfohlen.

## 6. Lernlogik (Stand Version 131)

### 6.1 Daily Round

Keine Leben. Ein Modul pro Wort, nie zweimal dasselbe Modul hintereinander (`chooseModule`). Fehlerrecht: Bausteine, Lückensatz, Auswahl, Reels **1 Fehler** (2 Versuche), Tippen **2 Fehler** (3 Versuche), Swipe **kein** Fehler. Keine Sperre: die Daily Round ist immer spielbar.

| Stage | Inhalt |
|---|---|
| Einführung | genau 1 neues Wort (Kennenlernen in drei Takten, keine Wertung) |
| Review | 4 bekannte Wörter, Auswahl in dieser Reihenfolge: **1.** fällige Wörter auf Stufe 0, am längsten wartende zuerst; **2.** die 2 am längsten überfälligen; **3.** zufällige weitere fällige; **4.** aufgefüllt mit noch nicht fälligen (früheste Fälligkeit zuerst). In der Round gemischt. Ohne neues Wort 5 Wörter. Zum Schluss das neue Wort noch einmal, bevorzugt mit Tippen oder Bausteine |

- Ohne bekannte Wörter besteht die erste Round nur aus Einführung und neuem Wort am Ende.
- Sind mehr als 4 Wörter auf Stufe 0 fällig, kommen die übrigen an den nächsten Tagen dran.
- „Noch eine Runde“ startet eine weitere Daily Round mit einem neuen Wort (solange es ungesehene Wörter gibt).

### 6.2 Bewertung (`record()`)

- **Richtig:** Stufe +1 (max. 5), nächster Termin nach `INTERVALS = [1, 3, 7, 14, 30]` Tagen. Ein Wort auf Stufe 0 steigt so auf Stufe 1 und kommt morgen wieder („Gerettet!“). Neues Wort am Ende: Stufe 1.
- **Verloren:** Stufe 0, fällig **morgen**, Fehlerzähler `n` des Wortes +1. Der Zähler bleibt auch nach dem Retten im Wort (`progress[k].n`), damit Dewi „Zum {n}. Mal …“ sagen kann (`bad_again` ab `n` ≥ 2).
- Die Einführung wird nicht gewertet.
- Datenform eines Wortes: `{l: Stufe 0–5, d: fällig ab 'JJJJ-MM-TT', n: Fehler insgesamt (nur wenn > 0)}`.

### 6.3 Wackelige Wörter (ersetzt die Fehlerliste)

- Die Fehlerliste, die Reparatur-Stage und jede Sperre der Daily Round sind mit Version 131 entfallen.
- Vokabelheft: Filter **„Wackelig“** zeigt Wörter auf Stufe 0 und 1 (`isShaky`). Die Marke **„wackelig“** steht nur an Wörtern auf Stufe 0. Englisch „Shaky“ / „shaky“.
- Startscreen: Dewi stichelt, wenn 4 oder mehr Wörter auf Stufe 0 stehen (`home_fallen`).
- **Migration (in `migrate()`, läuft bei jedem Start und nach dem Einspielen alter Sicherungen):** Wörter aus `state.list` gehen auf Stufe 0, fällig ab dem Tag, an dem sie auf die Liste kamen (spätestens heute), Fehlerzähler übernommen; danach ist `state.list` leer. Wörter mit der alten Fälligkeit `FAR` werden heute fällig. Offene Runs mit Reparatur-Karten verfallen.

### 6.4 Tagesplan, Serie und Stempel

`plan()` liefert `{fresh, review}` (das eine neue Wort oder `null`, Review-Wörter gemischt).

- Der Tag zählt für die Serie, sobald eine Daily Round zu Ende gespielt wurde (`state.done`). Mit verlorenem Modul in der ersten Round des Tages zusätzlich `state.flawed[Tag]`: der Stempel ist grau, ohne Holo (`stampSvg(mood, phase, flawed)`).

### 6.4a Daily Round als Pokerhand (seit Version 133, Screens seit 134/135)

- Ablauf: „Play now“ → **Blind-Wahl** (Small 100 / Big 300) → Einführung → Review (die Hand) → **Auszahlung** (mit Royal Flush) → Serien-Einblendung (nur bei der ersten Round des Tages).
- Wer zahlt: erste Round des Tages Dewi (Small), sonst man selbst; leeres Konto: Dewi rettet einmal am Tag, danach Hand ohne Einsatz.
- Multiplikator ×0, +1 je geschafftem Modul; verloren: Small bleibt, Big −1 (nie unter 0). Royal Flush (alles geschafft) verdoppelt.
- Auszahlung nur am Ende: `(Einsatz + Serien-Bonus) × Multiplikator`. Serien-Bonus nach der Serie vor der Hand: 7 +10 %, 14 +20 %, 30 +30 %, 50 +40 %, 100 +50 %, 365 +100 %.
- Pausierte Daily-Hand verfällt um Mitternacht samt Einsatz; kein Verwerfen. Details: `poker.js` (Regeln) und `pokerui.js` (Screens).

### 6.5 Survival (früher Freeplay)

- Spielbar erst nach der Daily Round und mit mindestens 5 bekannten Wörtern. Die Karte auf dem Startbildschirm ist immer sichtbar; vorher ist der Knopf gesperrt und nennt den Grund.
- Playmode: Random oder Solo (ein Modul), Rekord je Playmode (`state.best[lang][playmode]`).
- Alle begonnenen Wörter (seit Version 131 auch Stufe 0) je einmal, gemischt. **3 Leben insgesamt**, pro Karte ein Versuch, auch beim Tippen. Alle geschafft = Round gewonnen.
- Score: 1 Punkt je richtigem Wort, Serienbonus bei 3 in Folge +2, 5 +3, 10 +5, 15 +8, danach alle 5 weiteren +8. Ein Fehler setzt die Serie zurück.
- Richtig: Stufe +1 und neuer Termin, aber nur einmal pro Tag und Wort (`daily.got`). Ein Wort auf Stufe 0 lässt sich so auch im Survival retten. Falsch: ändert nichts am Fortschritt.
- Neuer Rekord: Feier (Dewi, Konfetti, Sound). Sonst „Noch X bis zum Rekord“.

## 7. Oberfläche und Effekte

- **Tabs:** Heute · Vokabelheft · Einstellungen.
- **Heute:** Plankarte (Wiederholungen / neue Vokabeln / aus der Fehlerliste), Fehlerliste-Karte, Serie mit Flamme und Wochenpunkten, Fortschritt als gestapelter Balken mit Legende (Stufe 1–5, Fehlerliste, Noch neu).
- **Vokabelheft:** einklappbare Kategorien, Suche (Indonesisch/Englisch), Filter Alle · Fällig · Gelernt · Neu · Fehlerliste, Stufen als fünf Punkte.
- **Einstellungen:** neue Wörter pro Tag (1–5), Anleitung für die tägliche Erinnerung (iOS Kurzbefehle), Sicherung per Text, Sprache, Testbereich (Tag vorspulen, alles zurücksetzen). Zwei-Schritt-Bestätigung für gefährliche Knöpfe (`twoStep`).
- **Effekte:** Puls-Ring bei jeder Taste und atmendes Leuchten im Eingabefeld, Pop/Shake bei Ergebnis, Konfetti (`burst`), Regenbogen-Flamme als SVG mit vier eigenen Umrissen (`FLAME_PATHS`: breite Außenform mit Seitenzunge, drei kleinere Innenformen), Regenbogen-Verlauf Violett → Blau → Cyan → Grün → Gelb → Orange → Pink, nach innen heller bis weißglühend, Spitze wiegt sich per SMIL-Formverlauf (`wob()` erzeugt Varianten der Pfade), zusätzlich Flackern per CSS, drei aufsteigende Funken, langsam rotierender Farbton; grau und ruhig bei Serie 0), Vollbild-Level-up bei richtigem Wort (siehe 7.1), „Serie verlängert!“-Sprung. `prefers-reduced-motion` schaltet alle Animationen ab.
- **Marke:** `kata.` + kursives, etwas kleineres, cyanfarbenes „vito“.

### 7.1 Level-up-Vollbild (`levelUp(c, r)`)

Erscheint nach jedem **richtig** gelösten Wort (nach dem Tippen, wenn auch die Satz-Übung richtig war). Inhalt: rotierende Regenbogen-Strahlen, Überschrift („Level up!“, „Neues Wort!“, „Gerettet!“ für Wörter von der Fehlerliste, „Stufe gehalten“ bei Stufe 5), Abzeichen mit der neuen Stufe und Konfetti, Stufenleiste mit fünf Segmenten, die nacheinander aufleuchten, Wort = Bedeutung und nächster Termin. Dauer etwa 1,9 s, Tippen schließt sofort. Die Ergebniskarte liegt darunter und ist bereits fertig. Bei `prefers-reduced-motion` entfällt die Animation. Stil: `.lvl*` im CSS.

## 8. Tests

Seit Version 130 liegen die Tests im Repository unter `tests/` (jsdom). Sie laden die gebaute `index.html`, spielen Abläufe über die Oberfläche durch und prüfen Lernlogik, Module, Moments, Endbildschirme, Musik und Übersetzungen.

| Datei | Erfolgsmeldung |
|---|---|
| `tests/test2.js` | `ALLES OK` |
| `tests/test3.js` | `Alle Tests bestanden` |
| `tests/test4.js` | `ALLES OK` |
| `tests/test5.js` | `Alle Tests bestanden` |

Ausführen (im Hauptordner, nach `python build.py`): einmalig `npm ci --prefix tests`, dann `npm test --prefix tests`. Bei jedem Push auf `main` laufen dieselben Tests in GitHub Actions (siehe 10.).

Früher (bis Version 129) lagen die Tests im Arbeitsordner der Cloud-Sitzung unter `jt/`.

## 9. Entscheidungen aus der Planung (Fragerunden)

| Thema | Entscheidung |
|---|---|
| Lernsprache | Indonesisch, Übersetzung Englisch |
| Wortschatz | eingebaute Datenbank mit Alltagswortschatz (678 Einträge) |
| Richtung | zufällig gemischt |
| Antwortform | Tippen, großzügig bei Groß-/Kleinschreibung, Akzenten, Bindestrichen |
| Neue Wörter pro Tag | einstellbar 1–5, Standard 1 |
| Intervalle | 1, 3, 7, 14, 30 Tage |
| Viele Fälligkeiten | alle abfragen, kein Limit |
| Design | dunkel; bunter für mehr Motivation |
| Extras | Serie, Sicherung per Text, 3 Versuche beim Tippen |
| Plattform | Web-App für den Home-Bildschirm; Erinnerung über iOS-Kurzbefehle |
| Satz-Übung | indonesisches Wort im englischen Satz **und** Bausteine, Bausteine-Richtung zufällig |
| Phasen | 3 (Kennenlernen, Satz-Übung, Tippen) |
| Wiederholungen | je nach Stufe (1–2 mit Satz-Übung, 3–5 nur Tippen) |
| Bewertung | jede Phase zählt |
| Beispielsätze | für alle Wörter |
| Mehrere neue Wörter | Wort für Wort durch alle Phasen |
| Falsche Wörter | nur in die Fehlerliste (nicht mehr automatisch morgen) |
| Verlassen der Liste | nach 1× richtig |
| Pflichtwort | das mit den meisten Fehlern |
| Üben der Liste | kurzer Durchlauf |
| Versuche Satz-Übung | 1 |
| Von mir gesetzt (nicht abgefragt) | 4 Antwortmöglichkeiten, 2 überzählige Kacheln, Alltagssätze nur mit Bausteine |

## 10. Veröffentlichen (GitHub Pages)

Seit Version 130 liegt dewi. im öffentlichen GitHub-Repository `dewi`. Gearbeitet wird lokal in VS Code mit Claude Code (Regeln in `CLAUDE.md`).

1. Änderung in den Quellen, `python build.py`, Tests grün, Eintrag hier.
2. Commit (`Version NN – Titel`), dann Push auf `main`.
3. GitHub Actions (`.github/workflows/pages.yml`) baut neu, führt test2–5 aus und veröffentlicht nur bei Erfolg `index.html` und `icon.png`. Schlägt etwas fehl, bleibt die alte Version online.
4. Adresse: `https://<benutzer>.github.io/dewi/`. In Safari öffnen → Teilen → „Zum Home-Bildschirm“.

Einstellung im Repository: Settings → Pages → Source „GitHub Actions“.

Hinweise: Der Spielstand hängt an der Adresse. Beim Umzug von einer anderen Adresse in den Einstellungen unter „Sicherung“ den Text kopieren und in der neuen App einspielen. Safari-Tab und Home-Bildschirm-App haben **getrennten** Speicher. Für die tägliche Erinnerung: Kurzbefehle → Automation → Tageszeit → „URL öffnen“. Die Schrift kommt von Google Fonts; ohne Netz greifen Systemschriften.

---

## Änderungsprotokoll

### Version 27 – Name und Anrede durch Dewi

- **Namensfrage beim ersten Start:** Reihenfolge jetzt App-Sprache → **Name** → Lernsprache (`nameView`/`bindName`). Eingabe wird mit `cleanName` bereinigt (Steuerzeichen, `<>{}` entfernt, Leerzeichen zusammengefasst, höchstens 20 Zeichen) und ist **überspringbar**. Bestehende Nutzer werden einmal gefragt (`state.nameAsked` ist für sie noch `false`).
- **Anrede in Sprüchen:** Neue Sprüche mit Platzhalter `{who}` (`WHO_QUIPS`, DE und EN, in allen Kategorien inklusive der Stufen hi/mid/lo) werden zu den bisherigen Pools hinzugemischt. `whoName()` liefert mit 65 % den Namen, sonst einen **Spitznamen** (`NICKS`: Choom, Chief, Digga, Boss, Bestie, Meister; EN: Choom, Chief, Bro, Boss, Bestie, Champ). Ohne Namen immer ein Spitzname. Die Sprüche sind weiter bissig, mit Slang. Etwa ein Drittel aller Sprüche enthält eine Anrede.
- **Einstellungen:** Neue Karte „Dein Name“ (Feld + Speichern, `bindSettings`), leeres Feld = nur Spitznamen. Rückmeldung „Gespeichert.“
- Zustand: `name` und `nameAsked` in `defaults()`, `migrate()` und in der Sicherung; „Alles zurücksetzen“ löscht beides, die Frage kommt dann wieder.
- Sicherheit: Der Name wird beim Anzeigen wie jeder Spruchtext escaped (`esc`), Platzhalter werden in einem Durchgang ersetzt, der Name kann also nicht selbst als Platzhalter wirken.
- Englisch: alle neuen Texte übersetzt. Tests (12g): Ablauf, Bereinigung, Überspringen, 20 Zeichen, Reihenfolge, 1440 Sprüche ohne Platzhalter-Reste, Verhältnis Name zu Spitzname, Englisch ohne Umlaute, HTML-Schutz, Einstellungen speichern und leeren, Sicherung, Zurücksetzen. Ältere Tests setzen jetzt `nameAsked:true`. Datei: `data/patch_name.py`, Stand davor `data/app.src.v26.bak.html`.

### Version 26 – Rosa Umrandung für die heutige Marke

- Die Umrandung der Marke von heute in der Wochenleiste ist jetzt Dewi-Pink `#f566b9` (wie ihre Mütze) statt Orange (`button.day.now .st`). Stand davor `data/app.src.v25.bak.html`.

### Version 25 – Weniger Abstand zwischen Stempel und Motiv

- Beim Neigen wirkte zwischen Dewi und dem Poststempel mit Tick ein Hohlraum: Der Tiefenunterschied der Parallax-Ebenen war zu groß (Motiv −2,6, Stempel +3,8 = 6,4 SVG-Einheiten). Neue Werte: Hintergrund −0,4, Motiv −1,0, Holo +0,5, Stempel +1,2 (Unterschied Motiv/Stempel nur noch 2,2). Der Stempel liegt damit sichtbar auf der Marke statt darüber zu schweben. Glanzpunkt unverändert. Stand davor `data/app.src.v24.bak.html`. Tests unverändert bestanden.

### Version 24 – Marke bleibt fest, nur Neigung und Parallax

- Änderungswunsch: Der Ankerpunkt der großen Marke liegt fest in der Mitte, die Marke wandert nicht mehr über den Bildschirm. Es bleibt nur eine Neigung in 3D plus Parallax.
- **Keine Verschiebung mehr:** Das `transform` der Karte enthält nur noch `perspective`, `rotateX`, `rotateY` und `scale` (Drehpunkt = Mitte). Die Feder-Simulation (`makeStampSim`) bleibt, ihre Position `x/y` ist jetzt nur noch der „virtuelle Zug“, aus dem die Neigung (bis 32°) entsteht. Neu: `px`/`py` (−1 bis 1) aus der Neigung.
- **Fünf Parallax-Ebenen** im SVG (`.pl-bg`, `.pl-art`, `.pl-holo`, `.pl-glare`, `.pl-mark`), die per CSS-Variablen `--px`/`--py` verschieden weit gegeneinander wandern: Hintergrund −0,9, Dewi-Motiv −2,6 (hinter der Fläche), Holo-Schimmer +1,8, Stempel mit Tick +3,8 (schwebt darüber), jeweils in SVG-Einheiten. Ein **Glanzpunkt** (`.pl-glare`, Radialverlauf, Screen-Überblendung) wandert mit der Neigung und wird heller, je stärker man neigt (`--g`).
- Holo-Rechtecke sind größer als die Marke (−8 bis 68), damit beim Verschieben keine Kanten sichtbar werden. Die Wochenleiste ohne Variablen zeigt alles in Ruhelage (Fallback 0).
- Schatten bleibt unter der Marke an Ort und Stelle und wächst nur leicht. Hinweistext: „Ziehen, um die Marke zu neigen.“
- Tests: keine Translation im Transform, fünf Ebenen vorhanden, Neigung begrenzt auf 32°, Parallax folgt der Neigung und geht zurück auf 0. Datei: `data/patch_parallax.py`, Stand davor `data/app.src.v23.bak.html`.

### Version 23 – Bessere Physik beim Verschieben der Marke

- Problem: Die Marke folgte dem Finger nur zu etwa 35–45 % und kehrte mit einer festen Zeitkurve (0,55 s) zurück. Das wirkte träge.
- Neu: eine echte **Feder-Simulation** (`makeStampSim`, Euler-Schritte mit 240 Hz, läuft in `requestAnimationFrame`).
  - **Halten:** Position folgt dem Finger fast 1:1 über eine steife, fast kritisch gedämpfte Feder (k 900, Dämpfung 0,9). Weiche Begrenzung mit `tanh` statt hartem Anschlag (maximal 120 px seitlich, 150 px vertikal). Die Marke wächst auf 108 %.
  - **Neigung:** folgt Offset und Geschwindigkeit, also schneller Zug = stärkere Neigung (bis 26°). Eigene Feder pro Achse.
  - **Loslassen:** unterdämpfte Rückholfeder (k 420, Dämpfung 0,42): federt kurz über die Ruhelage hinaus und ist nach etwa 0,6 s zur Ruhe.
  - **Ruhezustand:** leichtes Wiegen kommt jetzt aus derselben Simulation (kein CSS-Konflikt mehr); bei „Bewegung reduzieren“ aus.
- **Schatten** ist ein eigenes Element (`.sv-shadow`), das beim Anheben weiter wegrückt, größer und blasser wird. Damit muss kein Filter pro Bild neu berechnet werden. Die Ebene hat `will-change:transform`.
- Behobener Fehler beim Entwickeln: Die Begrenzung der Neigung hatte ein falsches Vorzeichen, wodurch die Neigung nach dem Loslassen hängen blieb. Dafür gibt es jetzt einen Test.
- Tests: Responsivität (nach 0,1 s über 55 % der Zielposition), 1:1-Folgen, weiche Begrenzung, Neigung nach Zugrichtung, Überschwingen, Ruhe unter 0,9 s, Neigung geht zurück, stabil bei großen Zeitsprüngen. Messung im Browser: 61 Bilder pro Sekunde. Datei: `data/patch_physik.py`, Stand davor `data/app.src.v22.bak.html`.

### Version 22 – Stempel-Briefmarken in der Serie

- Jeder erledigte Tag in der Wochenleiste zeigt jetzt eine **quadratische Briefmarke mit Zackenrand** (Perforation per SVG-Maske) mit **Dewi vollflächig**, schiefem **Poststempel mit grünem Tick** unten rechts. Offene Tage bleiben leere Kästchen, heute ist orange markiert. Neue Funktion `stampSvg(mood,phase)`.
- **Holo-Effekt nach Balatro-Holo-Joker:** wellenförmig wandernde Cyan-Magenta-Farbbänder (`mix-blend-mode` color/overlay/screen), feines Hologramm-Raster, fünf blinkende Glitzer-Sternchen, wandernder heller Streifen. Alles per SMIL-Animation im SVG; bei „Bewegung reduzieren“ (`reduceMotion()`) entfallen die Animationen.
- **Mienen:** zehn Stimmungen (`STAMP_KEYS`: schelmisch, cool, überlegen, überheblich, überrascht, gemein, gelangweilt, zufrieden, genervt, schlafend). Neue Dewi-Miene `content` (geschlossene, nach oben gewölbte Augen).
- **Zufall ohne Wiederholung:** `stampFor(datum)` würfelt pro Tag einmal und speichert in `state.stamps` (`{datum: miene}`); ausgeschlossen werden die Miene des Vor- und des Folgetags. So bleibt eine Marke stabil, auch nach Neuaufbau oder Neustart. `stamps` ist in der Sicherung und im Standardzustand.
- **Große Ansicht:** Tippen/Klicken auf eine Marke öffnet sie zentriert (`openStamp`, Overlay `.stampview`). Mit **Maus (Klicken und Ziehen) oder Finger** wird sie angehoben (Schatten wächst), gesenkt und geneigt (3D, `perspective`), Versatz und Neigung sind begrenzt; beim Loslassen federt sie zurück. Pointer Events mit `touch-action:none`, damit die Seite beim Ziehen nicht scrollt. Im Ruhezustand wiegt sich die Marke leicht. Schließen per ×, Klick daneben oder Escape; Seiten-Scrollen ist gesperrt, solange sie offen ist. Unter der Marke stehen Datum und Miene sowie ein Hinweis.
- Englische Texte ergänzt. Tests (Abschnitt 12f): 25 Läufe ohne gleiche Miene hintereinander, Zackenrand, Speicherung, Stabilität, Öffnen, Ziehen nach oben/unten, Rückfedern, Schließen (×, Hintergrund, Escape), Englisch, Sicherung. Datei: `data/patch_stempel.py` + `data/stamps_block.js`, Stand davor `data/app.src.v21.bak.html`.
- Hinweis: Die Holo-Überblendung nutzt `mix-blend-mode` in SVG. Auf dem iPhone nach dem Hochladen prüfen, ob sie genauso aussieht wie in Chrome.

### Version 21 – Eigene Feuer-Zeichnung nach Emoji-Vorbild mit Regenbogen

- Das echte Emoji ist wieder durch eine **eigene SVG-Flamme** ersetzt, die sich am iPhone-Feuer orientiert: breiter Körper, Spitze nach rechts oben, kleine Zunge links, drei Schichten nach innen kleiner und eine helle Kernflamme (`FLAME_PATHS`, neu gezeichnet).
- **Regenbogen zurück**, als Farbverlauf von unten nach oben: unten Violett/Blau, dann Cyan und Grün, oben Gelb, Orange und Pink (`grad(1..3)`; innere Schichten jeweils heller, Kern weißglühend). Der alte Dauer-Farbwechsel (`flhue`) bleibt weg, weil der Verlauf ihn ersetzt.
- **Animation wie in Version 4/5, aber mit den neuen Formen:** jede Schicht verformt sich im eigenen Takt (`wob` + `<animate attributeName="d">`), die Zungen lecken gegeneinander, die Spitze wiegt sich (`sway`), der Kern pulsiert (`corepulse`).
- **Funken bleiben:** drei aufsteigende Funken (Rosa, Gelb, Cyan).
- Bei 0 Tagen grau und ruhig. Tests für die Serien-Karte wieder auf die SVG-Flamme gestellt. Datei: `data/patch_feuer2.py`, Stand davor `data/app.src.v20.bak.html`. Die Emoji-Variante aus Version 20 ist damit abgelöst.

### Version 20 – Feuer-Emoji statt gezeichneter Flamme

- Die SVG-Flamme (`FLAME_PATHS`, `wob`, Formverlauf, Regenbogen-Farbverlauf, Farbwechsel `flhue`) ist ersetzt durch das **Feuer-Emoji 🔥**. Auf dem iPhone ist das automatisch das Apple-Emoji, sonst die jeweilige System-Variante.
- `flameSvg(streak,big)` liefert jetzt ein `div.fl` mit `span.fe` (Emoji) und einer SVG-Ebene `svg.fp` für die Funken. Die Funktion heißt aus Kompatibilitätsgründen weiter so.
- Animation: sanftes Wiegen und Pulsieren (`@keyframes femoji`, 1,7 s, Drehung ±2°, leichtes Strecken von unten aus), dazu Leuchten per `drop-shadow`.
- **Funken bleiben:** drei aufsteigende Funken in Rosa, Gelb und Cyan (`.em`, `@keyframes ember`), wie zuvor.
- Bei 0 Tagen: Emoji grau, abgedunkelt und still, ohne Funken. „Reduzierte Bewegung“ schaltet alle Animationen ab.
- Größen: klein auf der Startseite (`--fs:40px`), groß am Ende (`--fs:66px`). Test für die Serien-Karte angepasst. Datei: `data/patch_emoji.py`, Stand davor `data/app.src.v19.bak.html`.

### Version 19 – Farben passend zu Dewi

- Grundfarben von Nachtblau auf dunkles Aubergine umgestellt: `--bg #1a0f24`, `--surface #251634`, `--raised #301d42`, `--line #4a2f63`; Text cremeweiß `#fbefe9`, gedämpfte Texte in helles Lila.
- Hauptfarbe (`--accent`) von Gelb auf Dewi-Pink `#f566b9`, neue Variable `--grad` (Pink-Verlauf) für Hauptknopf und aktive Auswahl-Knöpfe; Knopf-Schatten und Glüh-Animation in dunklerem Pink.
- Plankarte und Level-up-Bildschirm in Violett/Pink, Muster der Plankarte rosa statt golden; Tab „Heute“ pink, „Einstellungen“ violett.
- **Regenbogen bleibt:** `--rainbow`, `--c-*`, Kategorie-/Wochentagsfarben, Stufenfarben, Konfetti, Ringe und Level-Badge sind unverändert.
- `theme-color` und Icon-Mitte passend zur neuen Hintergrundfarbe (`build.py`). Datei: `data/patch_farben.py`, Stand davor `data/app.src.v18.bak.html`. Tests bestehen weiterhin.

### Version 18 – Dewi ersetzt Tokek

- Neues Maskottchen **Dewi**, eine eitle weiße Diva-Katze mit pinker Katzenkapuze, Schleifen, Perlenohrringen und großen blauen Augen. Vorlage war die Illustration des Nutzers, umgesetzt als flaches Vektor-SVG im Stil des früheren Frosch-/Gecko-Kopfs (nur Kopf, keine Animation). Ausgeschnittene Foto-Varianten wurden verworfen (Qualität der Collage zu niedrig).
- `dwSvg(mood)` baut die Figur aus Parametern pro Stimmung (`DWM`): Kopfneigung, Brauen, Augen (Lid, Pupillenposition, Neigung, Pupillengröße), Mund (`DW` Mundformen `smirk`, `pout`, `flat`, `tiny`, `osm`, `tongue`, `evil`) und Extras (Pfötchen, Zornader, Glitzer, Ausrufezeichen, Weinglas, Zzz). Clip-IDs über Zähler `dwId`.
- **Zehn Stimmungen:** `haughty` (überheblich), `bored` (gelangweilt), `annoyed` (genervt), `sly` (schelmisch, Zwinkern mit Zunge), `shades` (Sonnenbrille + Wein), `sleep` (Schlafmaske mit aufgemalten Augen), `mean` (gemein, Reißzähne), `superior` (überlegen, geschlossene Lider, Kinn hoch), `uninterested` (desinteressiert, schaut auf die Pfote), `surprised` (leicht überrascht).
- `MOODS` ordnet jeder Situation eine Liste möglicher Stimmungen zu; `sayQuip` wählt zufällig eine davon.
- **Sprüche komplett neu**, durchgehend bissig mit jungem Online-Slang (z. B. „Hm, not bad. Du kannst ja doch was.“), weiterhin nach Form der letzten Antworten (`hi/mid/lo`) abgestuft; DE und EN.
- **Schalter entfernt:** Dewi ist immer an. Der Abschnitt in den Einstellungen und die zugehörigen EN-Texte sind gelöscht; `state.quips` bleibt aus Kompatibilitätsgründen im Stand und in der Sicherung, wird aber ignoriert.
- CSS: Klasse `.dw` statt `.gk`, alte Gecko-Keyframes entfernt.
- Dateien: `data/patch_dewi.py` + `data/dewi_block.js` (Patch), Stand davor `data/app.src.v17.bak.html`. Konzeptbilder in `concept/` (Konzept 1–8, `dewi_alle.png`).
- Tests (Abschnitt 12b) angepasst: Dewi-Klassen, kein Schalter, `quips:false` wird ignoriert; alle Tests bestehen.

### Version 17 – Gecko nur noch als Kopf

- Tokek besteht nur noch aus dem Kopf (kein Körper, Arme, Beine, Schwanz). Das ist niedlicher und einfacher zu animieren. `geckoSvg` zeichnet die Gruppe `.head` (Kopf, Augenwülste, Augen, Lider, Brauen, Mund, Wangen); Zzz und Funken liegen außerhalb. viewBox `12 10 176 128`.
- Animation: Kopf wiegt leicht hin und her (`gtilt`), blinzelt, wippt; beim Jubeln hüpft er schneller. Entfernt: Schwanz- und Armanimationen. Größen: 104 px (Startseite), 80 px (klein), 140 px (Level-up).
- Stand davor: `data/app.src.v16.bak.html`.

### Version 16a – Kleine Textänderung

- Englischer Knopf „Keep practicing (optional)“ heißt jetzt „Keep practicing“ (deutsch unverändert „Freiwillig weiter üben“).

### Version 16 – Kulante Rechtschreibung, strenger je höher die Stufe

- Beim Tippen sind kleine Tippfehler erlaubt (z. B. „selamat tingal“ für „selamat tinggal“). Erlaubte Fehler = Wortlänge geteilt durch einen Teiler je Stufe (`TYPO_DIV=[4,4,6,9,14,∞]`, abgerundet): Stufe 0–1 großzügig, Stufe 2–4 zunehmend streng, **Stufe 5 exakt** (nur Groß-/Kleinschreibung, Leerzeichen, Akzente und Umlaut-Umschreibung bleiben egal). Neue Wörter und Fehlerlisten-Wörter zählen als Stufe 0.
- Abstand: Damerau-Levenshtein (`editDist`), Buchstabendreher zählt als ein Fehler. Gilt in beiden Richtungen und für beide App-Sprachen. Antworten unter 3 Zeichen und kurze Wörter (Länge < 4) bleiben streng.
- Schutz: Ist die Eingabe die exakte Schreibweise eines **anderen** Vokabelworts (z. B. „sama“ statt „lama“), gilt sie nie als Tippfehler (`ownAnswers`).
- Rückmeldung: Bei akzeptiertem Tippfehler zeigt das Ergebnis „Kleiner Tippfehler. Richtig geschrieben: …“. Bei einer knapp verfehlten Eingabe steht „Fast! Achte auf die Schreibweise.“ statt „Nicht ganz“.
- Dateien: `data/patch_typo.py`; Stand davor `data/app.src.v15.bak.html`. Test: Tippfehler-Matrix je Stufe, Groß-/Kleinschreibung, anderes echtes Wort, kurzes Wort.

### Version 15 – Wiederholung: nur 1 Pflichtwort pro Tag

- Von den fälligen Wörtern ist täglich nur **eines** Pflicht (das am längsten überfällige, bei Gleichstand zufällig). `plan()` liefert jetzt `rev` (Pflichtwiederholung) und `revVol` (alle übrigen fälligen Wörter) statt `due`. `daily.rvm` merkt, dass die Pflichtwiederholung heute erledigt ist.
- Neue Karte **Wiederholungsliste** auf der Startseite mit den wartenden Wörtern. Der Knopf „Freiwillig nachholen“ erscheint erst nach der Pflicht und startet bis zu 5 Wörter (`startSession('rvol')`), genau wie bei der Fehlerliste.
- Die Serie zählt, wenn Pflichtwiederholung, neue Wörter und Pflichtwort der Fehlerliste erledigt sind. Freiwilliges ändert daran nichts. Nicht nachgeholte Wörter bleiben fällig und stauen sich in der Liste.
- Hinweistexte in den Einstellungen angepasst. Dateien: `data/patch_review1.py`; Stand davor `data/app.src.v14.bak.html`.
- Tests angepasst (Tag 3 und 4 des Ablaufs) und ergänzt (7 fällige Wörter: 1 Pflicht, Liste mit 6, freiwillige Sitzung, Serie).

### Version 14 – Lückensatz und 3 Leben pro Modul

- **Lückensatz statt Bausteinkasten** für Wörter mit Beispielsatz: Die Übersetzung steht vollständig da, der indonesische Satz ist fertig bis auf eine Lücke, nur das Lernwort wird eingesetzt. Auswahl aus 4 Wörtern (Lernwort plus 3 Ablenker; gleiche Kategorie bevorzugt, gleiche Wortanzahl, andere Bedeutung). Funktionen: `gapParts`, `gapTiles`, `showGap`. Findet sich das Wort nicht im Satz, fällt die Übung auf die Bedeutungs-Auswahl zurück. Pro Wort wird zufällig zwischen Lückensatz und Auswahl gewählt.
- **Bausteine** (ganzen Satz zusammensetzen) gibt es nur noch für die „Sätze für den Alltag“, weil dort das ganze Wort der Satz ist.
- **3 Leben in jedem Modul** (Auswahl, Lückensatz, Bausteine, Tippen), angezeigt als Herzen (`hearts`, `livesHtml`, `setLives`). Ein Fehler kostet ein Leben, das Modul läuft weiter. Bei 0 Leben wird aufgelöst und das Wort zählt als falsch. Wer nach einem Fehler noch innerhalb der 3 Leben richtig antwortet, hat das Modul bestanden (wie beim Tippen schon vorher).
- Dateien: `data/patch_lives.py`; Stand davor `data/app.src.v13.bak.html`. Neue Texte stehen im `EN`-Wörterbuch.
- Tests: Lückensatz (Lücke, 4 Wörter, 3 Leben, Fehler, Auflösung), Auswahl und Bausteine mit Leben, Tippen mit Herzen; Hilfsfunktion `play()` kann beide Modi.

### Version 13 – Maskottchen Tokek und Sprüche

- **Tokek**, ein Cartoon-Gecko im Stil der Duolingo-Eule, als reines SVG (`geckoSvg(mood)`), kein Bild nötig. Stimmungen: `happy`, `cheer` (Arme hoch, Funken, Hüpfen), `smug` (halbe Lider, Augenbraue, Schmunzeln), `sad` (Träne), `sleep` (zZz, bei Serie 0). Animationen: Wippen, Schwanz, Blinzeln; bei „reduzierte Bewegung“ stehen sie still. Die Clip-ID pro Gecko ist über den Zähler `gkId` eindeutig.
- **Sprüche** in `QUIPS` (Deutsch und Englisch getrennt, kein Eintrag im `EN`-Wörterbuch). Ton: sarkastisch, leicht von oben herab. Die Freundlichkeit hängt von der **Form** ab: `state.form` speichert die letzten 12 Antworten (1/0), `formTier()` ergibt `hi` (≥ 85 %), `mid`, `lo` (< 60 %). Kategorien mit Stufen: `home_due`, `home_done`, `ok`, `bad`.
- **Neckische Sonderfälle:** `bad_rare` (Wort mit Stufe ≥ 3 falsch), `bad_again` (Fehlerlisten-Wort zum ≥ 2. Mal falsch), `ok_try2` (erst beim 2./3. Versuch), `ok_run` (jede 3. richtige Antwort in Folge).
- **Wo er erscheint:** Sprachwahl und Lernsprache, Startseite (Auswahl nach Lage: neu, schlafend bei Serie 0, Fehlerliste ≥ 4, Serie ≥ 7, erledigt, fällig), Einführungskarte, Ergebnis nach jedem Wort, Level-up-Vollbild (bleibt jetzt 2,6 s), Sitzungsende, Einstellungen.
- **Einstellung „Maskottchen Tokek“** (An/Aus, `state.quips`, Standard an). `state.form` und `quips` sind in der Sicherung.
- Dateien: `data/patch_mascot.py` (angewendeter Patch); Stand davor `data/app.src.v12.bak.html`. Danach wurde die Gecko-Grafik per Hand nachgebessert (längere Arme vor dem Kopf, Zehenpolster, kräftigere Wangen).
- Tests: Gecko und Spruch auf Start- und Einführungsseite, Stimmungsklassen, An/Aus, englische Sprüche, gespeicherte Form, Sicherung.

### Version 12 – Sprachumschaltung Deutsch / Englisch

- **App-Sprache** (`state.ui` = `'de'|'en'`) für Oberfläche, Bedeutungen und Beispielsätze. Wahl beim ersten Start (Vorschlag nach `navigator.language`) und in den Einstellungen („App-Sprache“). Bestehende Nutzer bekommen `ui` automatisch per `migrate()` nach Handy-Sprache.
- Technik: deutsche Texte sind die Schlüssel des Wörterbuchs `EN`; `t(s,…)` liefert die englische Fassung, `{0}` wird ersetzt. Neue Texte immer in `EN` ergänzen (der Test prüft, dass jedes `t('…')` übersetzt ist).
- Wortdaten: `data/de1-3.txt` (Format `key | deutsche Bedeutung | deutscher Satz mit [Slot]`), 678 Bedeutungen, 652 Sätze. `gl(w)`, `glFirst`, `sentOf(w)` wählen je nach Sprache. Die deutschen Texte sind maschinell geschrieben und sollten von Muttersprachlern geprüft werden.
- Abfrage Deutsch: Indonesisch ↔ Deutsch. Antwortprüfung `normDe` (ä→ae, ö→oe, ü→ue, ß→ss, führende Artikel ignoriert), `normG`. Richtungen heißen jetzt `id2gl`/`gl2id`.
- Vokabelheft-Suche findet Indonesisch sowie deutsche und englische Bedeutung. Sicherung enthält `ui`.
- Dateien neu: `data/de1.txt`, `de2.txt`, `de3.txt`, `ui_new.js`, `patch_i18n.py`; Stand davor: `data/app.src.v11.bak.html`.
- Tests: jsdom-Test auf beide Sprachen erweitert (Sprachwahl, Umschalten, englischer Durchlauf, Umlaute, Migration, Übersetzungs-Vollständigkeit). Alle bestehen.

### Version 11 – Weißer Knopf „Noch eine neue Vokabel“

- Der Knopf `#extra` hat jetzt Klasse `.btn.light`: weißer Hintergrund, dunkle Schrift (`#0d1325`), grauer Schatten wie bei den anderen 3D-Knöpfen.
- Stand davor als `data/app.src.v10.bak.html`.

### Version 10 – Mini-Flammen raus, Zahl wechselt die Farbe

- **Entfernt:** die drei Mini-Flammen am Kartenrand (`miniFlame`, `.acc`, `.mini`).
- **Geändert:** Die Serien-Zahl hat immer genau **eine** Farbe und wechselt durch den Regenbogen (`@keyframes numcolor`, 6 s: Pink → Gelb → Grün → Cyan → Blau → Violett), Schein per `text-shadow: currentColor`. Der Verlaufstext aus Version 9 entfällt.
- Der animierte Regenbogen-Rahmen der Karte bleibt.
- **Tests:** Prüfung auf Mini-Flammen entfernt (jetzt: keine `.acc`).
- Stand davor als `data/app.src.v9.bak.html`.

### Version 9 – Serien-Karte mit Regenbogen-Rahmen

- **Entfernt:** die drei zusätzlichen Seitenzungen (`.tg`) der großen Flamme. Der Umriss mit seiner eigenen linken Zunge bleibt.
- **Neu:** Die Zahl der Serie (Startbildschirm und Endbildschirm) leuchtet in animierten Regenbogenfarben (Verlaufstext, `lvlslide`, Schein per `drop-shadow`), nur bei Serie > 0.
- **Neu:** Die Serien-Karte hat einen animierten Regenbogen-Rahmen (`conic-gradient` als `border-box`-Hintergrund, Winkel `--ang` per `@property` animiert, `ringspin`), leichter Schein außen. Funktioniert ab iOS 16.4; in älteren Browsern bleibt der Rahmen ein statischer Regenbogen.
- **Neu:** Drei kleine Regenbogen-Flammen (`miniFlame()`, Klasse `.mini`) sitzen als Akzent auf der oberen Kante der Karte und wiegen sich versetzt.
- **Tests:** 4 Formverläufe in der großen Flamme, 3 Mini-Flammen an der Karte.
- Stand davor als `data/app.src.v8.bak.html`.

### Version 8 – Flamme lodert statt zu wachsen

- **Problem:** Die CSS-Animationen `fl1`–`fl4` haben die Schichten mit `scale`/`skew` gestreckt, die Flamme wurde nur nach oben gezogen.
- **Geändert:** Streck-Animationen entfernt. Stattdessen: `wob()` verschiebt jetzt Punkte vor allem seitlich (je höher, desto mehr, Fuß bleibt stehen) mit eigener Phase pro Punkt, sodass Spitze und Zungen gegeneinander lecken; sechs Zwischenstände pro Schicht, Takte 0,95–1,9 s. Drei zusätzliche Zungen (`.tg`: rechts, links unten, mittig oben) wachsen, kippen und ziehen sich zurück. Die ganze Flamme wiegt sich leicht (`.sway`, ±2,2°), der Kern pulsiert (`corepulse`).
- Farbverläufe auf `userSpaceOnUse` umgestellt, damit Schichten und Zungen denselben Regenbogen zeigen.
- **Tests:** Es müssen 7 Formverläufe (4 Schichten + 3 Zungen) vorhanden sein.
- Stand davor als `data/app.src.v7.bak.html`.

### Version 7 – Flamme neu gezeichnet

- **Geändert:** Flamme nach Vorbild eines Referenzbildes neu gezeichnet (eigene Formen, keine Kopie): vier unterschiedliche Umrisse statt einer skalierten Form, Seitenzunge links, hohe geschwungene Spitze, losgelöste Funken. Regenbogen bleibt. Animation: Formverlauf der Pfade (`<animate attributeName="d">`, nur ohne „Bewegung reduzieren“), CSS-Flackern, Funken (`.em`, `@keyframes ember`), Farbtonrotation. `flameSvg()` ersetzt Kreis-Funken durch Tropfen-Funken; `FLAME_D` entfällt.
- **Tests:** Flammenprüfung angepasst (4 Schichten, 4 `animate`, 3 Funken).
- Stand davor als `data/app.src.v6.bak.html`.

### Version 6 – Regenbogen-Flamme und Level-up-Vollbild

- **Geändert:** `flameSvg()` neu: Regenbogen-Verlauf (eindeutige Verlauf-ID pro Flamme, damit mehrere Flammen gleichzeitig funktionieren), weiße Glanzschichten innen, drei Funken, Farbton dreht sich langsam (`flhue`). Vier `path`-Schichten und graue Variante bei Serie 0 bleiben.
- **Neu:** Vollbild-Level-up bei richtigem Wort (`levelUp`), Konfetti-Ebene über der Animation (`.confetti` z-index 80).
- **Tests:** Prüfung auf Level-up-Anzeige, Flammenverlauf, Funken und doppelte IDs ergänzt.
- Stand davor als `data/app.src.v5.bak.html` gesichert.

### Version 5 – Mehrphasiges Lernen und Fehlerliste

- **Neu:** Beispielsätze für 652 Wörter (indonesisch + englisch mit Markierung), eingebettet als `SENT_RAW`.
- **Neu:** Neue Wörter durchlaufen drei Phasen: Kennenlernen (mit Beispielsatz) → Satz-Übung → Tippen.
- **Neu:** Satz-Übung in zwei Arten: Auswahl der Bedeutung des Wortes im englischen Satz (4 Antworten, 1 Versuch) und Bausteine-Satzbau (zufällige Richtung, 2 überzählige Kacheln, 1 Versuch).
- **Neu:** Wiederholungen je nach Stufe: Stufe 1–2 Satz-Übung + Tippen, Stufe 3–5 nur Tippen.
- **Neu:** Fehlerliste mit Fehlerzähler; Pflichtwort pro Tag (meiste Fehler, bei Gleichstand das älteste); Verlassen der Liste nach 1× richtig auf Stufe 1; freiwilliges Weiterüben; Karte auf dem Startbildschirm, Filter und Marke im Vokabelheft.
- **Geändert:** Falsche Wörter kommen nicht mehr automatisch morgen wieder, sondern nur über die Fehlerliste. „Jede Phase zählt“: ein Fehler in Satz-Übung oder Tippen schickt das Wort auf die Liste.
- **Geändert:** `record(w, ok, type)` (Typ `new` / `review` / `list`), `plan()` liefert zusätzlich `mand` und `vol`, `showEnd()` setzt den Serien-Tag nur, wenn nichts mehr offen ist, Start-Sitzung `startSession(mode)`.
- **Geändert:** Plankarte zeigt bei Pflichtwort eine dritte Zahl; Legende „Nochmal“ heißt jetzt „Fehlerliste“; Sicherung enthält `list`.
- **Daten:** Datenversion 2 mit automatischer Migration (Stufe-0-Wörter → Fehlerliste). Alte Sicherungen bleiben einspielbar.
- **Tests:** Test-Skript auf den neuen Ablauf umgeschrieben (u. a. Migration, Pflichtwort-Auswahl, Alltagssätze nur Bausteine).
- **Dokumentation:** diese Datei angelegt.

### Version 4 – Flamme im Duolingo-Stil

- 8-Bit-Flamme verworfen („passt nicht in den Vibe“); ersetzt durch SVG-Flamme aus vier Schichten (`FLAME_D`, Skalierung 1 / .76 / .54 / .33, Farben `#ff7a00`, `#ff9600`, `#ffc800`, `#fff3a6`), jede Schicht mit eigenem Flacker-Keyframe `fl1`–`fl4`; grau und ruhig bei Serie 0.
- Flamme auf dem Startbildschirm und groß auf dem Endbildschirm.

### Version 3 – Mehr Farbe und Spielgefühl

- Markenname **kata.vito**, „vito“ kursiv, etwas kleiner, in Cyan.
- Bunte Akzente: Farbvariablen `--c-*`, Kategorien, Wochentage der Serie, Stufen-Farben, Regenbogenbalken oben in der Plankarte und im Fortschrittsbalken.
- Effekte: Puls-Ring und Leuchten beim Tippen (wechselnde Farben pro Taste), Konfetti bei richtigen Antworten, „Serie verlängert!“-Animation, Pop/Shake bei Ergebnissen. Reduzierte Bewegung wird respektiert.
- Icon: vier bunte Blütenblätter statt einfarbig.

### Version 2 – Erste Vorschau und Feinschliff

- Fehlerbehebungen: Zwei-Schritt-Knöpfe wurden nach der Aktion nicht zurückgesetzt; Test hing wegen laufender Intervalle.
- Prüfung per jsdom-Ablauftest eingeführt.

### Version 1 – Erste Fassung

- Einzel-Datei-Web-App für Safari/Home-Bildschirm mit Sprachwahl (Indonesisch), 678 Wörtern in 20 Kategorien, zufälliger Richtung, Tipp-Abfrage mit 3 Versuchen (großzügige Auswertung), Stufensystem (1, 3, 7, 14, 30 Tage; falsch → Stufe 0, morgen wieder), 1–5 neue Wörter pro Tag, alle fälligen Wiederholungen ohne Limit, dunklem Design, Serie, Vokabelheft mit Suche und Filtern, Sicherung per Text, Testbereich („Einen Tag vorspulen“, „Alles zurücksetzen“).
- Hosting-Entscheidung: GitHub Pages (Nutzer hat GitHub-Konto), `build.py` erzeugt `index.html` und `icon.png`.

---

## Offene Punkte / Ideen

- Beispielsätze von einer Muttersprachlerin oder einem Muttersprachler prüfen lassen.
- Nach dem Hosten: Verhalten der iOS-Kurzbefehle für die tägliche Erinnerung prüfen.
- Weitere Sprachen über `LANGS` ergänzen (Wortschatz + Sätze im gleichen Format).
- Optional: Tonausgabe der Wörter, Hören-Übung.

## Version 28 – Dewi bewegt sich (minimale Schleifen)
- Jede der 10 Stimmungen hat eine eigene, sehr dezente Dauerschleife (nur `transform`, GPU-schonend): Überheblich = langsames Kippen/Heben, Gelangweilt = träges Wiegen, Genervt = kurzes Zittern, Schelmisch = Kopfneigen, Sonnenbrille = leichtes Schweben, Schlafend = Atmen, Gemein = leichtes Pulsieren, Überlegen = stolzes Heben, Desinteressiert = Kopf zur Seite, Überrascht = kurzer Puls.
- Stärke: höchstens ca. 2,2° Drehung und 3,5 % Größe.
- Neuer Spruch: Dewi poppt einmal auf (`dwpop`), danach läuft die Schleife.
- Nur bei Dewi neben der Sprechblase (Start, Ergebnis, Session), nicht in der Stempel-Ansicht.
- „Bewegung reduzieren“ schaltet alles ab (globale Regel).
- Patch: `data/patch_loops.py`, Backup: `data/app.src.v27.bak.html`; Test 12h.

## Version 29 – Dewi tippt ihren Text (Animal-Crossing-Stil)
- Sprechblasen-Text erscheint Zeichen für Zeichen (ca. 28 ms), kurze Pause bei Komma (110 ms), längere bei Satzende (190 ms).
- Technik: jedes Zeichen ist ein `<span class="c">`, anfangs `visibility:hidden`. Der Platz ist damit sofort reserviert, die Blase springt nicht in der Größe. Ein `MutationObserver` startet das Tippen bei jeder neuen Blase, egal wo sie gerendert wird.
- Tippen auf die Blase zeigt den ganzen Text sofort. „Bewegung reduzieren“ zeigt ihn gleich komplett.
- Screenreader lesen den vollständigen Text über `aria-label`.
- Patch: `data/patch_tippen.py`, Backup: `data/app.src.v28.bak.html`.

## Version 30 – Sounds
- Alle Töne entstehen per Web Audio direkt im Browser, es gibt keine Audiodateien. Die App bleibt eine einzige Datei.
- **Tipp-Blips (weich, niedlich):** Zu Dewis Tippen gibt es bei jedem zweiten Buchstaben einen Blip. Jede der 10 Stimmungen hat eigene Tonhöhe, Länge und Glide (gelangweilt tief und lang, überrascht hoch und steigend, schelmisch wackelnd). Jeder Buchstabe weicht leicht in der Tonhöhe ab.
- **Richtig / Falsch (frech):** Richtig = knapper Doppel-Ping. Falsch = spöttisches „wuup wuup“ (zwei fallende Töne). Beim erneuten Versuch gibt es nur einen kurzen Abwärtston.
- **Session-Ende:** Jingle in drei Varianten: gut (3 Töne), perfekt (5 Töne plus Glitzern), schwach (zwei fallende Töne).
- **Stempel-Klonk:** Tiefer Thump mit Papier-Rauschen, wenn die Serie verlängert wird. In der großen Stempelansicht gibt es ein Glitzern.
- **UI-Klicks** (leise) für Buttons, Kacheln, Tabs und Optionen. **Dewi-Aufpoppen:** kleines Plopp bei jeder neuen Blase.
- **Einstellungen:** neue Karte „Sound“ mit An/Aus und Lautstärkeregler (0–100, Schritt 5). Standard: an, 40. Beim Verschieben des Reglers kommt ein Probeton. Beides ist in der Sicherung enthalten (`sound`, `vol`).
- Erkennung per `MutationObserver` (neue `.res`-Ergebnisse, `.fb.bad`-Hinweise, neue Blasen) und Klick-Listener. Dadurch musste keine der vielen Übungsstellen einzeln angepasst werden.
- Hinweise: iOS startet Audio erst nach der ersten Berührung. Davor ist die allererste Blase stumm. Der Seitenschalter des iPhones wirkt bei Web-Audio nicht zuverlässig, deshalb der eigene Schalter.
- Patch: `data/patch_sound.py` (+ `data/sound_block.js`), Backup: `data/app.src.v29.bak.html`; Test 12i.

## Version 31 – Slot-Machine-Gewinnsound und Tastentöne
- **Richtig-Sound neu:** wie ein Gewinn am Spielautomaten. Ein schneller Aufstieg über 8 Töne (Triangle plus Chip-Obertöne), dann ein Jackpot-Akkord (C-Dur über zwei Oktaven) mit tiefem Schlag, dazu ein Münzregen aus 7 hohen Metall-Pings und ein Rauschen wie fallende Münzen. Dauer etwa 1 Sekunde.
- **Tastentöne:** Bei jedem Buchstaben, den du selbst in ein Textfeld schreibst (Antwort, Name), gibt es einen kurzen Tipp-Klick mit leicht wechselnder Tonhöhe. Löschen klingt tiefer. Die Erkennung läuft über ein globales `input`-Ereignis, nur bei beschreibbaren `.field`-Feldern.
- Alles bleibt über den Sound-Schalter und die Lautstärke steuerbar.
- Patch: `data/patch_sound2.py`, Backup: `data/app.src.v30.bak.html`; Tests in 12i erweitert.

## Version 32 – Swipe-Modus (neues Lernmodul)
- Neue Übung im Stil von Tinder: Das Wort steht oben auf einer Karte, darunter links und rechts je ein Vorschlag. Einer ist richtig, der andere ähnlich, aber falsch.
- **Bedienung:** Karte mit Finger oder Maus nach links oder rechts ziehen (kippt mit, die gewählte Seite leuchtet pink auf). Ab ca. 70 px oder bei schnellem Wischen wird die Seite gewählt, sonst springt die Karte zurück. Alternativ tippt man auf einen der beiden Buttons. Am PC gehen die Pfeiltasten links und rechts.
- **Richtung:** pro Karte zufällig Indonesisch → Deutsch/Englisch oder umgekehrt. Die richtige Seite wechselt zufällig.
- **Ähnlicher falscher Vorschlag:** Bewertung aus gleicher Kategorie, kleinem Schreibabstand (Damerau-Levenshtein) und ähnlicher Länge, plus etwas Zufall unter den besten Kandidaten. Ausgeschlossen sind alle gültigen Antworten, auch Wörter mit gleicher Übersetzung.
- **Einbindung:** Swipe ersetzt zufällig (ca. 30 %) die Satz-Übung eines Wortes (Auswahl, Lückensatz oder Bausteine). So erscheint es bei neuen Wörtern, Wiederholungen bis Stufe 2 und der Fehlerliste. Ab Stufe 3 gibt es nur Tippen, daher dort kein Swipe.
- **Wertung:** ein Versuch. Falsch = zählt wie bei den anderen Übungen als Fehler (Fehlerliste), Dewi kommentiert wie sonst. Das Ergebnis zeigt Wortpaar und Beispielsatz.
- **Sound:** neuer Swoosh beim Wegfliegen der Karte, dazu der normale Richtig- oder Falsch-Sound.
- Test-Hook: `window.__swipeP` überschreibt die Swipe-Wahrscheinlichkeit (nur für Tests, Standard 0,3).
- Patch: `data/patch_swipe.py` (+ `data/swipe_block.js`), Backup: `data/app.src.v31.bak.html`; Test 12j.
- Weitere Ideen aus der Vorschlagsliste: Paare zuordnen, Hören (Sprachausgabe), Buchstaben-Puzzle, Blitzrunde, Emoji-Zuordnung, Fehlende Buchstaben, Außenseiter.

## Version 33 – Moduswahl für Wiederholungsliste und Fehlerliste
- **Neue Übersicht:** „Freiwillig nachholen“ (Wiederholungsliste) und „Freiwillig weiter üben“ (Fehlerliste) öffnen jetzt zuerst die Seite „Wie willst du üben?“. Die Tagesabfrage („Abfrage starten“) bleibt unverändert und ohne Moduswahl.
- **Kacheln:** Oben die breite Regenbogen-Kachel **Zufällig** (Standard, alle Übungen gemischt wie bisher), darunter je ein Einzelmodus: **Bausteine**, **Tippen**, **Swipe** (mit „NEU“-Marke), **Lückensatz**, **Auswahl**, dazu eine Platzhalter-Kachel „Bald mehr“. Konzeptbild: `concept/modi.png`.
- **Einzelmodus:** Alle Wörter der Runde laufen nur mit dieser Übung durch. Die Kennzeile zeigt in Pink „Nur Swipe“ usw. Wörter ohne passenden Beispielsatz bekommen in Satz-Modi ersatzweise eine Swipe-Karte (Bausteine → Swipe, Lückensatz → Auswahl → Swipe, Auswahl → Swipe).
- **Wertung:** Gleich wie in der zufälligen Abfrage. Ein richtiges Wort steigt eine Stufe, ein falsches kommt auf die Fehlerliste. Dafür endet ein Einzelmodus nach der einen Übung direkt mit der Wertung (`nextStep` ruft `finish(true)`, wenn keine Schritte mehr übrig sind).
- **Nur Wiederholung und Fehlerliste:** Neue Wörter behalten ihr Kennenlernen und gehören nicht zu den Einzelmodi.
- **Wörter pro Runde:** 5 / 10 / Alle (nur Werte unter der Wortanzahl werden angeboten). Standard 10, die Wahl wird gemerkt (`state.roundN`) und ist in der Sicherung enthalten. Früher waren es immer höchstens 5.
- Patch: `data/patch_modes.py` (+ `data/modes_block.js`), Backup: `data/app.src.v32.bak.html`; Tests 12d angepasst, neu 12k (alle fünf Modi, 5 Wörter, nur die gewählte Übung, Runde endet).

## Version 34 – Struktur und Begriffe (Modul, Playmode, Daily Round, Freeplay)
- **Neue Begriffe** (Kapitel 2a): Modul, Karte, Playmode (Random oder Solo), Round (Daily Round oder Freeplay). Sie gelten in der App, im Code und in dieser Doku.
- **In der App umbenannt:** „Abfrage starten“ → „Daily Round starten“, „Freiwillig nachholen“ → „Freeplay: nachholen“, „Freiwillig weiter üben“ → „Freeplay: weiter üben“, „Abfrage beendet“ → „Round beendet“, Moduswahl-Seite → „Playmode“ mit Kachel **Random** und dem Bereich „Solo · nur ein Modul“, „Wörter pro Runde“ → „Wörter pro Round“. Die Kennzeile zeigt „Modul Swipe“ statt „Satz-Übung · Swipe“, im Solo-Playmode dazu ein pinkes „Solo“.
- **Code umgebaut:** Jedes Modul liegt in einer eigenen Datei unter `modules/`, dazu `rounds.js` und `playmodes.js`. `build.py` setzt sie über `/*@include …*/` wieder zu einer einzigen `index.html` zusammen. Die App sieht gleich aus und verhält sich gleich.
- **Modul-Register:** `registerModule` (siehe `modules/_registry.js`). Die Playmode-Wahl baut ihre Kacheln aus dem Register, ein neues Modul braucht keine Änderung an der Playmode-Seite mehr.
- **Kartenreihe statt Schritte:** Jedes Wort bekommt eine Liste von Modul-Kennungen (`planCards`), z. B. `['intro','swipe','typing']` (Random, neues Wort) oder `['swipe']` (Solo Swipe). Der alte Zwischenbegriff „Satz-Übung“ (`sent`) entfällt; das Satz-Modul wird beim Planen gewählt, nicht erst beim Anzeigen.
- **Ersatzmodule:** `can(w)` und `fallback` je Modul; `resolveModule` folgt der Kette (Bausteine → Swipe, Lückensatz → Auswahl → Swipe, Auswahl → Swipe).
- Umbenannt im Code: `startSession` → `startRound` (Arten `daily`, `freeplay_review`, `freeplay_list`), `openModes` → `openPlaymodes`, `S.mode` → `S.playmode`, `data-mode` → `data-playmode`. Die HTML-Ids `#start`, `#rvol`, `#vol` bleiben.
- Tests: Kennzeilen-Prüfungen und Playmode-Wahl angepasst, Test 12k heißt jetzt „Solo“.
- Patch: `data/refactor_modules.py` (Dateien auslagern) und `data/patch_struktur.py` (Registrierung, Begriffe); Backup: `data/app.src.v33.bak.html`.

## Version 35 – Neue Daily Round, Reparatur, Survival
- **Daily Round neu:** keine Leben; Fehlerrecht je Modul (Tippen 2 Fehler, Swipe keiner, sonst 1); Stages Reparatur, Einführung (3 Sekunden Sperre), Review (4 bekannte Wörter + neues Wort am Ende); ein Modul pro Wort, nie zweimal dasselbe hintereinander. Details in Kapitel 6.
- **Fehlerliste sperrt die Daily Round:** Jede Daily Round beginnt mit der Reparatur, bis die Liste leer ist. Verlorene Reparatur-Wörter werden mit anderem Modul wieder angestellt.
- **Graue Stempel:** Ein Tag mit verlorenem Modul zählt für die Serie, bekommt aber einen grauen Stempel ohne Holo (`state.flawed`).
- **Survival ersetzt Freeplay:** nur nach der Daily Round, 3 Leben insgesamt, Score mit Serienbonus, Rekord je Playmode, Feier bei neuem Rekord. Die Wiederholungsliste und die Knöpfe „Freeplay“ entfallen.
- **Entfernt:** Einstellung „Neue Vokabeln pro Tag“ (immer genau 1 neues Wort pro Daily Round), `newPerDay`, `dq.rvm`, `planCards`, `pickSentenceModule`, Leben-Herzen in der Daily Round.
- **Code:** `rounds.js` komplett neu (Karten statt Phasen, `chooseModule`, `settleCard`, `showSurvivalEnd`), `playmodes.js` nur noch Survival-Wahl, Module nutzen `triesFor(id)`, `roundLives()` und `resultNote()`. `plan()` liefert `{repair, fresh, review}`.
- **Tests:** `window.__test` schaltet `window.__run` (Prüfzugang) frei, `window.__force` erzwingt ein Modul, `window.__introMs` setzt die Sperrzeit. Neue Testdatei für den Ablauf, alte Prüfungen (Sounds, Swipe, Stempel, Rechtschreibung) übernommen.
- **Offen:** Dewi erklärt, wie man das neue Wort einsetzt (vorerst übersprungen); Anzeige der Fehlerrechte pro Modul.

## Version 36 – Survival-Karte immer sichtbar
- Die Survival-Karte steht von Anfang an auf der Startseite. Der Knopf ist gesperrt (mit Schloss und Grund), bis die Daily Round heute geschafft ist und mindestens 5 Wörter bekannt sind.

## Version 37 – Neuer Name „dewi.“
- Markenname, Seitentitel und Home-Bildschirm-Name heißen jetzt **dewi.** (früher kata.vito). Der Willkommenstext erklärt nicht mehr „Kata“.
- Intern bleiben `kata.v1` (Speicherschlüssel) und `app:'kata'` (Sicherung) unverändert, damit dein Fortschritt und alte Sicherungen weiter funktionieren.

## Version 38 – Logo: drehender 3D-Holo-Diamant
- Neben „dewi.“ dreht sich ein echter 3D-Diamant (Brillantschliff mit 8 Seiten: Tischfläche, Krone, Spitze). Er wird per Canvas gezeichnet (`GEM`, `.gem`), Flächen nach Tiefe sortiert, Rückseiten weggelassen. Die Farbe jeder Fläche folgt einem Holo-Verlauf plus Licht, dazu Glanz auf lichtzugewandten Flächen und drei Funken. Kein Haken wie bei den Stempeln.
- Bei „Bewegung reduzieren“ steht er in fester Pose.

## Version 39 – Streak-Flamme ausprobiert und wieder entfernt
- Eine Regenbogenflamme um die Streak-Karte wurde gebaut, gefiel nicht und wurde wieder entfernt. Der Umriss ist wie vorher (rotierender Regenbogenrahmen). Konzeptbilder bleiben in `concept/streakflame*.png`.

## Version 40 – Neues Modul „Reels“ (Spielautomat)

**Idee:** Ein Satz, drei Walzen. Hebel ziehen, dann jede Walze antippen, wenn das richtige Wort auf der roten Linie steht. Lernen soll sich wie Spielen anfühlen, ohne frustrierend zu sein.

**Ablauf (`modules/reels.js`)**
- Nur Wörter mit Beispielsatz ab 3 Wörtern (in beiden Sprachen); sonst Ersatzmodul Auswahl.
- Richtung zufällig: (a) Satz in App-Sprache oben, Walzen tragen Indonesisch; (b) indonesischer Satz oben, Walzen tragen die Übersetzung. Bei Sätzen über 3 Wörter drehen nur drei Walzen (gelerntes Wort plus Nachbarn), der Rest steht als Text („ich ▮ ▮ ▮“).
- Jede Walze hat 6 Wörter (1 richtig, 5 falsche aus dem Satzvorrat). Antippen rastet auf das nächste Wort ein.
- Richtig: Walze rastet grün ein, Gewinn-Klang. Falsch: Walze zuckt rot, Buzzer, dreht nach einer halben Sekunde wieder an.
- Fehlerrecht über `TRIES.reels=2`: Daily Round 1 Fehler frei, der zweite verliert das Modul; Survival: der erste verliert das Modul (und ein Leben). Bei Verlust zeigen die Walzen die Lösung.
- **Jackpot** (alle drei beim ersten Stopp): rein kosmetisch, Schild „JACKPOT“, goldene Walzen, Konfetti, Fanfare. Keine Wirkung auf Stufen oder Punkte.
- Erscheint im Daily-Round-Pool, im Survival-Random-Pool und als eigene Solo-Kachel (mit Rekord).
- **Bewegung reduzieren** (Systemeinstellung): statt Automat eine Auswahlliste je Stelle, gleiche Regeln.

**Optik:** pinker Automat mit Goldrand, laufende Glühbirnen (schneller beim Drehen), Neon-Schild, Hebel mit roter Kugel (ziehen oder antippen), Zahlungslinie mit Pfeilen, Leuchten beim Drehen.

**Dewi unter dem Automat:** neue Stimmung `cash` (Dollar-Pupillen, Grinsen, Glitzer, minimale Schleife wie die anderen). Eigene Sprüche (de/en, mehrere Varianten) für: bereit, richtiger Stopp, Fehler, Jackpot, Gewinn, verloren (`reels_*` in `QUIPS`/`MOODS`).

**Sounds** (Web Audio, `SFX`): `lever` (Ratschen und Kachunk), `whirr`, `tick` (pro Wort), `thunk` (Stopp), `rwin` (Münz-Klang), `rbad` (Buzzer), `jackpot` (Arpeggio, Akkord, Münzregen). Das Ergebnis-Feld ist mit `data-snd` vorab markiert, damit der automatische Richtig/Falsch-Ton nicht doppelt kommt.

**Haptik** (`haptic()` in der Sound-Gruppe): `navigator.vibrate` wo vorhanden; auf dem iPhone (Safari ab iOS 18) über einen versteckten `<input type=checkbox switch>`, dessen Umlegen einen Tick auslöst. Leichter Tick beim Hebel und Stopp, stärker bei richtig, Salve beim Jackpot. **Auf dem echten iPhone zu prüfen**, hier nicht testbar. Der Jackpot-Verlauf läuft teils über Zeitgeber, iOS erlaubt Haptik eventuell nur direkt nach einer Berührung.

**Tests:** `test4.js` (Daten, Hebel, Stopp, Sperre vor dem Hebel, Fehler/Respawn, Jackpot, Survival-Regel, Liste, Sprüche, Sounds, Haptik). Die Hilfsfunktion `play()` in den älteren Tests spielt Reels mit.

**Geändert:** `modules/reels.js` (neu), `rounds.js` (`TRIES`), `app.src.html` (Dewi cash, Sprüche, Sounds, Haptik, CSS, EN-Texte, Einbindung).

## Version 41 – Neues App-Icon

- `icon.png` (512×512) zeigt jetzt Dewi mit Sonnenbrille und Weinglas auf dunklem Violett mit rosa Glühen, leichtem Schatten und Verlauf nach unten. Ohne abgerundete Ecken und ohne Transparenz, weil iOS die Rundung selbst setzt.
- Erzeugt wird es aus Dewis Vektorgrafik der App (`dwSvg('shades')`), also immer im selben Stil wie die App: `node data/make_icon.js` (braucht Playwright und eine gebaute `index.html`). Der alte Pillow-Block in `build.py` ist entfernt, damit ein Neubau das Icon nicht überschreibt. Altes Icon: `data/icon.old.png`.
- Pink auf Pink hatte zu wenig Kontrast (erster Entwurf), deshalb der dunkle Grund.

## Version 42 – Reels überarbeitet

- **Nur 3 Wörter pro Walze** (1 richtig, 2 falsche), vorher 6.
- **Langsamer:** etwa 3 bis 4 Wörter pro Sekunde (`RL_V`), vorher 8 bis 10.
- **Tippen irgendwo auf den Automaten** stoppt die nächste Walze, immer **von links nach rechts** (`R.stopNext`). Die aktive Walze hat einen goldenen Rahmen. Richtig: Walze wird grün, die nächste ist dran. Falsch: Walze zuckt, dreht neu, bleibt die aktive. Tippen während des Zuckens oder vor dem Hebel wird ignoriert. Der Hebel behält seine eigene Bedienung.
- Wortlängen: falsche Wörter höchstens 9 Zeichen, lange Wörter bekommen kleinere Schrift.
- Tests (test4.js) um Reihenfolge, Tempo und 3 Wörter ergänzt.

## Version 43 – Reels: neuer Ablauf, Kacheln, Diamantenregen, Musik

**Ablauf (`modules/reels.js`)**
- Alle drei Walzen rasen von Anfang an (`RL_FAST`, unscharf). **Der Hebel macht nur die linke Walze langsam** (`RL_SLOW`, etwa 2 Wörter pro Sekunde). Tippen irgendwo auf den Automaten stoppt sie auf der Kachel an der Linie.
- Richtig: Walze wird grün, die **nächste wird automatisch langsam** (ohne neuen Hebelzug), bis alle drei sitzen.
- Falsch: Walze wird kurz **grau**, rüttelt mit Buzzer, dreht danach wieder langsam und ist erneut dran. Fehlerrecht unverändert (Daily: 1 frei, Survival: 0). Während des Rüttelns und vor dem Hebel werden Tipps ignoriert.
- Wörter sind **Kacheln** (3 pro Walze, mittlere Kachel auf der Linie, aktive Walze mit Goldrahmen).
- Alle richtig: kurzer **Diamantenregen** (`diamondRain`, gefärbte Facetten-Diamanten wie das Logo, bei Jackpot mehr) und Klang `gems`. Jackpot bleibt rein kosmetisch.

**Musik (`music.js`, live per Web Audio, keine Dateien)**
- Zwei Loops: **Lo-Fi** (76 BPM, Akkorde Fmaj7–Em7–Dm7–Cmaj7, weiche Keys, Bass, Beat) in der ganzen App; **Synthwave** (118 BPM, Am–F–C–G) nur im Modul Reels. Der Wechsel passiert automatisch mit Überblendung (der Takt-Timer schaut, ob `.smain.rl` auf dem Bildschirm ist).
- Synthwave wird **mit jeder gelockten Walze voller**: 0 Kick und Bass, 1 plus Hats und Arpeggio, 2 plus Snare und Pad, 3 plus Lead. Bei Fehler duckt die Musik kurz, bei Verlust wird sie leise.
- **Standardmäßig aus.** Lautsprecher-Knopf neben der Sprachanzeige (Startseite) und in der Kopfzeile jeder Round; in den Einstellungen eigener Block „Musik“ mit An/Aus und eigener Lautstärke (`state.music`, `state.mvol`). Unabhängig vom Effekt-Sound-Schalter.
- Pausiert, wenn die App im Hintergrund ist. Auf dem iPhone startet Ton erst nach der ersten Berührung.

**Sonstiges:** `tone()` und `noise()` können auf einen eigenen Ausgang (`dest`) schreiben, `noise()` auch Hochpass.
**Tests:** `test4.js` neu geschrieben (Rasen, Hebel, Reihenfolge, grau/Rütteln, Regen, Liste, Musik inkl. Schichten).

## Version 44 – Reels: keine rote Linie, Automat wegwerfen

- **Rote Zahlungslinie und Pfeile entfernt.** Die Kachel in der Mitte jeder Walze ist die Auswahl, sie hat einen zarten Rand, bei der aktiven Walze goldfarben. Hinweistext: „in der Mitte“.
- **Weg mit dem Scrollen:** Nach dem Ende zeigt sich nur der Hinweis „← Wische den Automaten nach links“. Wischt man den Automaten nach links (mindestens 70 px, nach 0,7 s bei Verlust bzw. 1,2 s bei Gewinn, damit der Diamantenregen nicht weggewischt wird), fliegt er mit Geräusch aus dem Bild (`SFX.tossed`: Luftzug, Aufprall, klirrendes Metall; Haptik). Zu kurzes Wischen federt zurück.
- Danach verschwindet der Automat und der lange Hinweistext, Dewi sagt einen Spruch (`reels_toss`), und Ergebnis plus „Weiter“ stehen an seiner Stelle, ohne Scrollen.
- Mit Tastatur oder Hilfsmitteln: Automat fokussieren, Enter oder Leertaste wirft ihn weg. Bei „Bewegung reduzieren“ gibt es keinen Automaten, das Ergebnis kommt sofort.
- Die Musik merkt sich den Stand (`data-lk`, `data-end` an `.smain.rl`), damit sie nach dem Wegwerfen nicht abfällt.

## Version 45 – Feinschliff
- Der Automat fliegt schneller aus dem Bild (0,38 s statt 0,62 s), der Wurf-Klang ist entsprechend vorgezogen.
- Die Random-Kachel im Survival behält ihre Farben (Pink, Violett, Türkis), aber der Verlauf ist nicht horizontal festgelegt: zwei große, gegenläufig kreisende und leicht pulsierende Farbebenen (`.mrand::before/::after`, `mrswirl`, 11 s und 17 s) lassen die Farben in alle Richtungen ineinanderfließen. Bei „Bewegung reduzieren“ steht sie still. Dabei fiel der helle Standardrand des Buttons weg (`border:0`).

## Version 46 – Schloss-Icon statt Emoji
- Auf dem gesperrten Survival-Knopf steht jetzt ein gezeichnetes Schloss (SVG `LOCKIC`, Strichstärke und Farbe passen zum Text) statt des Emojis 🔒. Es nimmt die Farbe des Knopfes an. Sonst gibt es kein Schloss-Emoji mehr in der App.

## Version 47 – Hilfe-Fragezeichen statt Beschreibungen

**Idee:** Die Module sollen sich selbst erklären. Die Beschreibungszeilen („Setze den Satz aus den Bausteinen zusammen“ usw.) sind aus Bausteinen, Swipe, Lückensatz, Auswahl und Reels **entfernt**. Wer doch Hilfe braucht, tippt auf ein kleines **weißes „?“** direkt an der Aufgabe (oben rechts am Satz bzw. am Wort/der Karte, `helpBtn(id)` in `rounds.js`; Tippfläche 44 px).

- **Dewi erklärt:** Tippen öffnet eine Blase mit Dewi und einem kurzen Text pro Modul (`help_blocks`, `help_typing`, `help_swipe`, `help_gap`, `help_choice`, `help_reels` in `QUIPS`, de/en, Dewi-Stimmung je Modul). Mit der Maus reicht Hovern (nur Anzeige), Tippen öffnet sie fest. Ein Tipp daneben (dieser Tipp wird verschluckt, löst also nichts aus), das „?“ oder Esc schließt sie. Die Blase steht bevorzugt **über** der Aufgabe, damit der Satz sichtbar bleibt, sonst darunter.
- **Erstes Mal:** Wenn ein Modul zum ersten Mal vorkommt, geht die Blase von selbst auf und Dewi hängt an: „Wenn du mal nicht weiterweißt, tipp aufs Fragezeichen.“ (`help_first`). Gemerkt in `state.helpSeen`. Die Einführung (Kennenlernen) hat kein „?“. In den Tests ist das Auto-Öffnen aus (`window.__helpAuto` schaltet es ein).
- Solo-Kacheln im Survival behalten ihre Kurzbeschreibung.
- `mascot()` wurde in `mascotHtml(mood,text,cls)` und `mascot()` geteilt, damit die Hilfe einen festen Text zeigen kann.
- Tests: `test4.js` prüft für alle sechs Module Fragezeichen, fehlende Beschreibung, Öffnen, Schließen, Tipp daneben, Auto-Öffnen nur beim ersten Mal. In den älteren Tests liest die Hilfsfunktion `T()` Satz und Wort ohne das „?“.

## Version 48 – Hilfe in Dewis normaler Sprechblase, kurz
- Das Pop-up aus Version 47 ist weg (kein Rahmen, kein Hintergrundschleier). Dewi erklärt jetzt in der **bereits bestehenden Sprechblase** (`.mascot.sm`, wie überall sonst in der App): Bei Reels ersetzt sie den Spruch unter dem Automaten, bei den anderen Modulen erscheint sie im Fluss direkt unter der Aufgabe (`.helpm`). Nochmal aufs „?“ tippen (oder Esc) schließt sie wieder.
- Die Texte sind **so lang wie die Beschreibungen auf den Solo-Kacheln** im Survival (rund 30 bis 40 Zeichen, bei Reels 41), im Dewi-Ton: z. B. „Bau den Satz aus den Wortkacheln.“. Beim ersten Mal hängt sie „Nicht weiter? Tipp aufs Fragezeichen.“ an (`help_first`).
- Tests: Länge der Hilfetexte darf höchstens 10 Zeichen von der Kachel-Beschreibung abweichen.

## Version 49 – Dewi in jedem Modul, genervter Seufzer beim „?“
- **Bug:** Dewi tauchte nur in Reels und im Kennenlernen auf. Jetzt erscheint sie in **jedem Modul von selbst** (unter der Aufgabe, in ihrer normalen Sprechblase) mit einem Spruch aus einem Pool von 8 (`QUIPS.task`, de/en, wechselnde Stimmungen). In Reels bleibt die Blase unter dem Automaten.
- **Neue Stimmung „sigh“:** halb geschlossene, nach oben rollende Augen, runder Mund und ein kleines Atemwölkchen, das davonzieht; sanftes Einsinken (Schleife ≤ 2 %), eigener Tippton.
- **„?“** lässt Dewi genervt seufzen und **nur** die Kurzbeschreibung des Moduls vorlesen (identisch zur Survival-Kachel), ergänzt durch einen von 5 zufälligen Sprüchen (`QUIPS.help_x`, z. B. „… Wie kann man das nicht gleich verstehen? *seufz*“). Kein Hinweis aufs Fragezeichen mehr (`help_first`, `helpSeen` und die Auto-Öffnung sind entfernt). Nochmal Tippen würfelt einen neuen Spruch, Esc schließt nichts mehr, weil Dewi immer da ist.
- Tests angepasst (Dewi vorhanden, Seufz-Mood, Beschreibung enthalten, 5 Varianten). Backups: `data/app.src.v47.bak.html`, `data/rounds.v47.bak.js`.

## Version 50 – Bausteine nur noch mit Gelerntem
- **Problem:** Beim Bausteine-Modul enthielten die Sätze oft mehrere Wörter, die noch nie gelernt wurden.
- **Neu:** Ein Satz kommt nur dran, wenn höchstens **1 Wort unbekannt** ist (das Zielwort selbst und Eigennamen zählen als bekannt) und er **höchstens 7 Wörter** hat (`BLOCKS_MAX_UNKNOWN`, `BLOCKS_MAX_TOKENS` oben in `modules/blocks.js`). „Gelernt“ heißt: Wort steht im Fortschritt mit Stufe ≥ 1. Passt kein Satz, nimmt die App wie sonst ein anderes Modul (Fallback Swipe).
- Die **Ablenker-Kacheln** (2 falsche Zusatzwörter) stammen jetzt ebenfalls aus gelernten Wörtern, damit man nicht über Unbekanntes stolpert.
- Wachsender Wortschatz = mehr mögliche Sätze (frisch ca. 56 von 678 Wörtern, nach 200 gelernten ca. 529). Schärfer/lockerer stellbar über die zwei Konstanten.
- Tests B1–B3. Backup: `data/blocks.v49.bak.js`.

## Version 51 – Bausteine mit leeren Feldern
- Im Bausteine-Modul zeigt die Antwortzeile jetzt **so viele leere, gestrichelte Felder, wie Wörter gebraucht werden**. Jede angetippte Kachel füllt das nächste Feld (wie beim Lückensatz), Antippen einer gefüllten Kachel nimmt sie zurück. Mehr Kacheln als Felder gehen nicht.
- „Prüfen“ ist erst aktiv, wenn alle Felder gefüllt sind. Felder verraten nur die Anzahl, nicht die Wortlänge (alle gleich breit).
- Tests: Prüfung „Antwort hat Kacheln“ zählt jetzt `#ans2 button` statt Kinder.

## Version 52 – Dewi über der Aufgabe, Herz-Animation, Herz-Regeneration
- **Dewi steht jetzt über der Aufgabe** (Reihenfolge in jedem Modul: Kennzeile, Herzen, Dewi, Aufgabe), damit man ihre Sprechblase nicht mit der Aufgabe verwechselt. Auch bei Reels (die Blase war dort unter dem Automaten).
- **Herzen** pulsieren ganz langsam der Reihe nach (4,8 s Zyklus, 13 % größer, versetzt um 0,7 s), wie eine Regenerations-Welle (`hbeat`, bei „Bewegung reduzieren“ aus).
- **Herz-Regeneration im Survival:** Bei **8 richtigen in Folge** kommt ein verlorenes Herz zurück (`HEART_STREAK=8`, `HEART_MAX=3` in `rounds.js`), nie mehr als 3. Das Herz poppt mit rosa Leuchten auf (`heal`), mit Sound und Vibration; im Ergebnis steht „Serie von 8: ein Herz kommt zurück!“. Bei vollen Herzen passiert nichts, die Serie zählt trotzdem weiter (16, 24 …).
- Tests L1–L6. Backups: `data/app.src.v50.bak.html`, `data/rounds.v50.bak.js`, `data/reels.v50.bak.js`.

## Version 53 – Solo-Queue ohne Ersatzmodul (Bugfix)
- **Fehler:** Im Survival-Solo erschien manchmal ein anderes Modul (z. B. Swipe statt Bausteine). Ursache: Jedes Modul hat ein Ersatzmodul (`fallback`) für Wörter, bei denen es nicht passt, und die Solo-Queue nahm alle gelernten Wörter. Seit Version 50 passen die Bausteine nur noch zu Sätzen mit höchstens 1 unbekanntem Wort, deshalb sprang der Ersatz oft ein (bei 40 gelernten Wörtern bei 14 davon). Dazu zeigte die Kennzeile „Modul Swipe · Solo“.
- **Neu (für alle Solo-Module):** Die Queue enthält nur Wörter, die zum gewählten Modul passen (`soloWords`). Karten, die während der Round nicht mehr passen, werden übersprungen, nie ein fremdes Modul.
- **Gesperrt bei zu wenig:** Mit weniger als 3 passenden Wörtern (`SOLO_MIN`) ist die Solo-Kachel ausgegraut mit Hinweis „Noch zu wenige passende Wörter (n/3)“, und `startRound` verweigert den Start.
- Random und Daily Round sind unverändert (dort bleibt der Ersatz in Ordnung).
- Tests S1–S5. Backups: `data/playmodes.v51.bak.js`, `data/rounds.v51.bak.js`.

## Version 54 – Lückensatz: gesuchtes Wort hervorgehoben
- Im deutschen Satz oben ist jetzt das Wort **gelb unterstrichen**, das in die Lücke gehört (wie im Modul Auswahl). Die gestrichelte Lücke im indonesischen Satz hat dieselbe gelbe Farbe, so sieht man die Zuordnung sofort. Quelle ist die Satzvorlage mit eckigen Klammern (`s.tpl`), per `hlSlot`.
- **Eigener Fehler behoben:** Die Leerfelder der Bausteine (Version 51) hießen `.slot` und überschrieben dadurch das gelbe Wort im Modul Auswahl (hätte dort eine gestrichelte Box gezeigt). Jetzt heißen sie `.bslot`.
- Tests G1–G2. Backups: `data/gap.v53.bak.js`, `data/app.src.v53.bak.html`.

## Version 55 – Kachel „Gamemodes“ mit Survival darin
- Die Home-Kachel „Survival“ heißt jetzt **Gamemodes** (Text: „Spiele über die Daily Round hinaus, mit Leben, Score und Rekorden.“, Button „Gamemodes öffnen“, id `gm`). Sie ist nie gesperrt.
- Der Button öffnet die neue Seite **Gamemodes** (`openGamemodes` in `playmodes.js`) mit der **Survival-Kachel genau wie bisher** (Wörterzahl, Rekord, Sperre mit Grund, Button „Survival starten“, id `surv`; Code unverändert in `survivalCard()`), darunter eine gestrichelte Kachel „Bald mehr“ für spätere Gamemodes.
- Ablauf: Home → Gamemodes → Survival starten → Playmode-Wahl (Random/Solo). Der Zurück-Pfeil in der Playmode-Wahl führt jetzt zurück zu Gamemodes, dort zurück zur Startseite.
- Tests angepasst: erst `#gm`, dann `#surv`. Backups: `data/app.src.v54.bak.html`, `data/playmodes.v54.bak.js`.

## Version 56 – Bausteine schenken noch nicht gelernte Wörter
- **Problem:** Schon nach 2 gelernten Wörtern kam Bausteine mit Sätzen wie „Selamat pagi, bu.“, in denen man „bu“ noch gar nicht kennt.
- **Neu:** Noch nicht gelernte Wörter stehen **schon fest im Satz** (gelb, gestrichelt, nicht antippbar). Man setzt nur die übrigen Kacheln ein, die leeren Felder liegen dazwischen. Das Zielwort zählt weiter als bekannt, Eigennamen auch.
- **Grenzen** (oben in `modules/blocks.js`): höchstens **2 geschenkte Wörter** (`BLOCKS_MAX_GIVEN`), mindestens **2 Kacheln selbst setzen** (`BLOCKS_MIN_FREE`), höchstens 7 Wörter. Passt kein Satz, wählt die App ein anderes Modul bzw. überspringt die Karte im Solo.
- **Beide Richtungen:** Beim Bauen ins Indonesische steht das unbekannte Wort direkt im Satz. Beim Bauen ins Deutsche/Englische wird die Entsprechung aus dem Vokabelheft gesucht (z. B. bu = Frau) und fest eingesetzt. Findet sich keine, wird nur die machbare Richtung verwendet, sonst gibt es den Satz nicht.
- Die Richtung wird zufällig unter den machbaren gewählt. Mehr passende Sätze am Anfang (frisch 92 statt 56 von 678).
- Tests P1–P6, B1 angepasst. Backups: `data/blocks.v54.bak.js`, `data/app.src.v55.bak.html`.

## Version 57 – Geschenkte Wörter sauber umrandet
- **Fehler:** Der Umriss der geschenkten Wörter (Version 56) erbte vom Kachel-Stil einen Rand mit 1,5 px an den Seiten und 3 px unten. Gestrichelt wirkte die untere Linie doppelt so dick, mit Rucklern an den unteren Ecken.
- **Neu:** `.tile.given` hat jetzt einen **gleichmäßigen, durchgehenden gelben Rand (2 px)** und einen sanft gelb getönten Hintergrund, gleiche Höhe wie die Kacheln. Im Ergebnis (richtig/falsch) behalten sie ihre gelbe Farbe, nur die selbst gesetzten Kacheln färben sich grün bzw. rot.
- Die leeren Felder (`.bslot`) bleiben gestrichelt (2 px, Violett), jetzt mit `box-sizing:border-box` und exakt gleicher Höhe wie die Kacheln.
- Backup: `data/app.src.v56.bak.html`.
- Zusatz: „Prüfen“ in Bausteine tut nichts, solange nicht alle Felder gefüllt sind (Sicherung gegen einen seltenen Absturz, der im Test auftrat, wenn Prüfen bei halb gefüllten Feldern ausgelöst wurde).

## Version 58 – Unbekannte Wörter (sir, madam …) nicht mehr abgefragt
- **Ursache:** Die App hielt großgeschriebene Wörter mitten im Satz („Bu“, „Pak“, „Anda“) für Eigennamen (`isProper`) und zählte sie deshalb immer als bekannt. Dadurch musste man in den Bausteinen „Bu“ setzen und in den Reels auf „madam“ oder „sir“ stoppen, ohne es je gelernt zu haben.
- **Neu:** `isName()` in `modules/_shared.js` kennt nur echte Eigennamen (Liste `PROPER_EXTRA`: Orte, Vornamen, Monate, Wochentage auf Deutsch/Englisch). Anreden wie „Bu“/„Pak“ sind jetzt unbekannte Wörter. Bausteine und Reels nutzen `isName` für den Lernstand.
- **Reels:** Das Fenster aus drei Walzen **weicht unbekannten Wörtern aus** (es wird das Fenster mit den wenigsten gewählt, es muss das Zielwort enthalten). Lässt sich ein unbekanntes Wort nicht vermeiden, ist seine Walze **von Anfang an grün eingerastet** („voreingestellt“, Mindestens `RL_MIN_OWN=2` von 3 Walzen stoppt man selbst, das Zielwort immer). Ist ein Satz in einer Richtung nicht machbar, wird die andere genommen, sonst gibt es den Satz nicht.
- **Richtung Indonesisch → Deutsch/Englisch:** Gibt es zu einem unbekannten Wort keine Entsprechung im Vokabelheft (wie bei „Bu“), wird nur die Richtung ins Indonesische benutzt, wo das Wort fest sichtbar eingesetzt wird.
- **Weitere Module:** Auswahl, Tippen, Swipe und Lückensatz fragen nur das Zielwort ab, dort gab es das Problem nicht.
- Fehler nebenbei behoben: Steht das Zielwort nicht als eigenes Wort im Satz (z. B. „dua belas“ in „kedua belas“), wurde der mittlere Satzteil fälschlich als Zielwort gewertet. 
- Tests R1–R5 (Reels, neu), P1 angepasst; die Testumgebung kann Vorgaben mit `window.__rlAll` abschalten. Backups: `data/reels.v57.bak.js`, `data/blocks.v57.bak.js`, `data/_shared.v57.bak.js`.

## Version 59 – Reels nur mit bekannten Wörtern, keine vorgesetzten Walzen
- **Entscheidung:** Vorgesetzte Walzen (Version 58) nehmen den Spielspaß. Darum gibt es Reels jetzt **nur noch bei Sätzen, in denen alle drei Walzen Wörter tragen, die schon gelernt sind** und zusammen im Satz stehen (`RL_MIN_OWN=3`). Es gibt keine feste Mindestzahl an gelernten Wörtern: Sobald sich aus gelernten Wörtern ein sinnvolles Dreierfenster ergibt, kann Reels vorkommen, auch in der Review-Phase mit denselben Wörtern. Das Zielwort zählt als bekannt.
- Das Fenster wird weiterhin so gewählt, dass es das Zielwort enthält und möglichst nur Bekanntes trägt; findet sich keins, kommt Reels für dieses Wort nicht dran (Random/Daily: anderes Modul, Solo: Karte wird übersprungen).
- **Solo:** Die Reels-Kachel ist gesperrt („Noch zu wenige passende Wörter (n/3)“), bis mindestens 3 passende Wörter da sind. Gilt unverändert für alle Solo-Module.
- Der Mechanismus für voreingestellte Walzen bleibt im Code (`RL_MIN_OWN=2` würde sie wieder erlauben), wird aber nicht benutzt.
- Tests R1–R5 neu. Backup: `data/reels.v58.bak.js`.

## Version 60 – Keine Sätze mit unbekannten Wörtern in Auswahl und Lückensatz, Reels ohne grauen Rest
- **Anlass:** Im Reels-Beispiel stand „Sama-sama, senang membantu.“ oben, obwohl nur „Sama-sama“ (you are welcome) gelernt war. Dazu zeigte ein grauer Rest neben den Walzen („… happy to help“) die unbekannten Wörter.
- **Reels:** Der Satz oben bleibt (Entscheidung), der **graue Rest neben den Walzen ist weg**.
- **Auswahl und Lückensatz:** Sie zeigen ebenfalls den ganzen Beispielsatz. Darum kommen sie jetzt nur noch dran, wenn der **ganze Satz aus gelernten Wörtern** besteht (`sentKnown()` in `modules/_shared.js`; Zielwort und Eigennamen zählen als bekannt). Sonst nimmt die App ein anderes Modul (Lückensatz → Auswahl → Swipe), im Solo wird die Karte übersprungen bzw. die Solo-Kachel gesperrt, bis genug Sätze passen.
- Testflag `window.__rlAll` schaltet die Regeln für die alten Tests aus. Tests K1–K3. Backups: `data/choice.v59.bak.js`, `data/gap.v59.bak.js`, `data/reels.v59.bak.js`.

## Version 61 – Testbereich
- Versteckt in den Einstellungen: 7× schnell auf die Überschrift „Einstellungen" tippen. „Testbereich verstecken" schließt ihn wieder.
- Sprungziele: Erster Start (alles leer inkl. Sprach-/Namensabfrage), 2 Wörter, 10 Wörter, 10 %, 50 %, Alle Wörter. Gelernt werden die ersten x Wörter in Listenreihenfolge (wie die App sie einführt), gemischte Stufen 1–5, ein Teil heute fällig, 1–3 Wörter auf der Fehlerliste (realistisch wie im Alltag, nicht mehr jedes 11. Wort).
- Vor dem ersten Sprung wird der echte Stand gesichert (localStorage `kata.v1.backup`); weitere Sprünge überschreiben die Sicherung nicht. „Echten Fortschritt wiederherstellen" spielt ihn zurück.
- Jeder Sprung braucht zweimal Tippen.

## Version 62 – Home: Daily Round und Streak in einer Karte
- Die Streak-Karte ist in die Daily-Round-Karte gewandert: erst der Plan mit Start-Button, darunter Flamme, Tageszahl und Wochenleiste.
- Nach der Daily Round dreht sich die Reihenfolge: die große Flamme mit der Serie steht oben (Belohnungsmoment, leichtes Leuchten), darunter „Für heute geschafft." und ggf. der Extra-Button.
- Die Fehlerliste-Karte ist vom Home entfernt. Die Reparatur steht weiter als Zahl im Plan.
- Reihenfolge: Daily Round (mit Streak), Gamemodes, Fortschritt.
- Die Gamemodes-Karte wird nach der Daily Round hervorgehoben (rosa Rahmen) mit dem Text „Noch Lust auf mehr?".

## Version 63 – Streak kompakt (Variante D)
- Die Streak ist jetzt eine schmale Fußzeile unter dem Button der Daily-Round-Karte, vor und nach der Daily Round gleich: kleine Flamme, „X Tage in Folge" und 7 kleine Tages-Kästchen (erledigt = Farbverlauf, mit Fehlern = grau, heute = Rahmen).
- Die Kästchen erledigter Tage sind antippbar und öffnen weiter die Marke (Briefmarke) in der großen Ansicht.
- Die Hervorhebung der Karte nach der Daily Round entfällt (die Streak ist kein Vordergrund mehr).
- Nach der Daily Round bekommt die Gamemodes-Karte den umlaufenden Regenbogen-Rahmen mit Glühen (wie früher die Streak-Karte).

## Version 64 – Marken in drei Stufen
- Die Wochen-Kästchen in der Streak-Fußzeile sind wieder Marken (Mini-Briefmarken, 26 px). Tippen öffnet weiter die große Ansicht.
- Drei Stufen pro Tag (`stampKind`):
  - **Verpasst:** keine Daily Round an einem vergangenen Tag nach dem ersten gespielten Tag. Farblose Marke ohne Haken, Dewi schaut enttäuscht (neue Emotion `sad`: schräge Brauen, Blick nach unten, Schmollmund, Träne). Wird nicht gespeichert. Tage vor dem ersten Spieltag bleiben leere Kästchen, heute offen ebenfalls.
  - **Mit Fehlern:** Daily Round gespielt, aber ein Modul verloren. Farbige Marke ohne Holo, nette Miene aus `STAMP_OK` (zufrieden, schelmisch, überrascht, cool).
  - **Fehlerfrei:** Holo-Marke (wie bisher), Miene aus `STAMP_HOLO` (schelmisch, cool, überlegen, überheblich, überrascht, zufrieden).
- Weiterhin gilt: nie dieselbe Miene wie am Vor- oder Folgetag. Früher gespeicherte Mienen bleiben, nur die Stufe (grau/farbig/Holo) wird neu bestimmt.
- Große Ansicht: Unterzeile „Enttäuscht · verpasst" bzw. „… · mit Fehlern".

## Version 65 – Neues Modul „Reihenfolge"
- Neue Datei `modules/order.js`, Modul-Kennung `order`, Kachel „Reihenfolge" (grün, NEU) in den Playmodes (Random und Solo).
- Aufgabe: Oben steht die Übersetzung, darunter liegen die Wörter des indonesischen Satzes durcheinander. Man zieht die Kacheln in die richtige Reihenfolge und tippt „Prüfen". Ein Versuch (`TRIES.order=1`), danach grün/rot je Kachel und der richtige Satz.
- Bedienung: Kachel ziehen (Finger oder Maus). Die anderen weichen live aus (Platzhalter wandert, die Kacheln gleiten), beim Loslassen rastet die Kachel ein. Pfeiltasten verschieben die fokussierte Kachel (Barrierefreiheit, Tests). Keine Tipp-Alternative, wie entschieden.
- Regeln (`orderPair`): nur Wörter bis Stufe 2 (inkl. neue Wörter und Fehlerliste), Satz mit 4 bis 7 Wörtern, alle Wörter des Satzes gelernt (das Zielwort zählt als gelernt), die Startreihenfolge ist nie schon richtig. Sonst Fallback auf Swipe.
- Folge: Im Solo-Modus gilt dieselbe Stufen-Grenze, die Kachel bleibt gesperrt, bis genug passende Wörter da sind.
- Technik: Pointer Events mit Pointer-Capture, `touch-action:none` auf den Kacheln, `position:fixed` für die gezogene Kachel mit Kalibrierung des Bezugspunkts, FLIP-Animation für die Geschwister.
- Test: Maus- und Touch-Ziehen in Chromium geprüft (Playwright), Pfeiltasten und Auswertung in jsdom.

## Version 66 – Reihenfolge: feste Steine, früher verfügbar, durchgehende Linien
- Der Platzhalter beim Ziehen hat jetzt einen durchgehenden, neutralen Rahmen (vorher gestrichelt und gelb, was beim Verschieben verbuggt wirkte und wie ein fester Stein aussah).
- Noch nicht gelernte Wörter des Satzes sind jetzt feste Steine (gelb umrandet, wie bei Bausteine) an ihrer richtigen Stelle und nicht verschiebbar. Das passende Wort in der Übersetzung oben ist gelb unterstrichen (wie bei Auswahl). Die freien Kacheln werden um die festen Steine herum sortiert; die festen Steine behalten immer ihren Platz (`layout()` setzt nach jedem Zug die Reihenfolge neu zusammen).
- Grenzen: höchstens 2 feste Steine, mindestens 2 freie Kacheln, 4 bis 7 Wörter. Passende Übersetzung wird über `blockEquiv` gefunden; ohne Zuordnung ist das Wort für das Modul nicht möglich (Fallback Swipe).
- Die Stufen-Grenze (bis Stufe 2) ist entfernt: das Modul kann bei jeder Stufe vorkommen. Im Solo-Modus zählen deshalb alle passenden Wörter.
- Bei genau 2 freien Kacheln ist der Start zufällig (50 %) schon richtig; sonst wäre die Antwort immer „tauschen". Ab 3 freien Kacheln ist der Start nie richtig.
- Verfügbarkeit (Messung, Wörter in Listenreihenfolge gelernt): bei 8 Wörtern 1 Karte (vorher 0), bei 40 Wörtern 5 (vorher 4), bei 80 Wörtern 9 (vorher 6), bei 150 Wörtern 23 (vorher 12).

## Version 67 – Reihenfolge: sanfteres Verschieben
- Die Kacheln gleiten jetzt 0,32 s mit weichem Auslaufen statt 0,18 s (`ORDER_GLIDE`), das Einrasten beim Loslassen dauert 0,22 s.
- Pause zwischen zwei Platzwechseln: 230 ms (`ORDER_COOLDOWN`). Die gezogene Kachel folgt dem Finger weiter sofort; nach der Pause wird die aktuelle Fingerposition noch einmal geprüft, damit nichts hängen bleibt.
- Randzone: Die äußeren 22 % einer Kachel lösen keinen Platzwechsel aus (`ORDER_EDGE`). Das verhindert das Hin-und-her-Springen an der Grenze zwischen zwei Kacheln.
- Messung (Chromium, wildes Hin- und Herziehen): etwa 5 Platzwechsel pro Sekunde, vorher bis zu 15 und mehr. Die drei Werte stehen oben in `modules/order.js` und lassen sich leicht nachstellen.

## Version 68 – Reihenfolge: Prüfen erst nach dem ersten Verschieben
- Der Button „Prüfen" ist gesperrt, bis zum ersten Mal eine Kachel verschoben wurde (Ziehen oder Pfeiltasten). So drückt man ihn nicht aus Reflex.
- Bei genau 2 freien Kacheln kann der Start zufällig schon richtig sein; dann muss man trotzdem einmal tauschen und zurücktauschen, um zu prüfen. Das betrifft nur seltene Sätze mit festen Steinen.

## Version 69 – Englisch als zweite Lernsprache
- Neue Sprache „Englisch" neben Indonesisch: 665 Wörter in denselben 20 Kategorien (Indonesisch hat 678), jedes Wort mit einem eigenen englischen Satz und deutscher Übersetzung. Die Sprachwahl zeigt beide Sprachen.
- Englisch ist nur wählbar, wenn die App-Sprache Deutsch ist (`needsDe`). Bei App-Sprache Englisch ist der Kurs ausgeblendet; eine gespeicherte Lernsprache Englisch wird dann zurückgesetzt, die App fragt wieder nach der Sprache.
- Fortschritt und Fehlerliste sind pro Sprache getrennt (`state.progress.en`, `state.list.en`). Streak, Marken und Tagesabschluss bleiben gemeinsam (`state.done`).
- Technik: Alle Lernwörter einer Sprache tragen einen Schlüssel-Vorsatz (`kp`). Englisch: `en:` (z. B. `en:hello`), Indonesisch bleibt ohne Vorsatz, damit alte Sicherungen und Fortschritte unverändert funktionieren. `sentKeys()` liefert die Schlüssel des laufenden Kurses; Wortpool, Ablenker und Eigennamen-Erkennung (`poolOf`, `isProper`) arbeiten pro Sprache.
- Schreibweisen: Eingabe in britischer oder amerikanischer Schreibweise wird akzeptiert (`alts`, z. B. colour für color, grey für gray, flat für apartment). Angezeigt wird immer die amerikanische.
- Texte: Hinweis „ins Englische" statt „ins Indonesische"; Suchfeld „Suchen auf Englisch oder Deutsch". Kategorienamen sind dieselben wie bei Indonesisch.
- Inhalt entsteht aus `data/en/01.txt` bis `06.txt` (Format: `english = Deutsch | englischer Satz | deutscher Satz mit [Wort]`). Prüfung mit `data/en/check.py` (Wort ganzes Wort im Satz, genau eine Klammer, keine doppelten Schlüssel, keine Sonderzeichen), Erzeugung von `lang_en.js` mit `data/make_en.py`.
- Test: neue Datei `test5.js` (Sprachwahl, Ausblenden bei App-Sprache Englisch, Schlüssel und Sätze aller 665 Wörter, mehrere Tage Daily Round mit allen Modulen, getrennter Fortschritt, Schreibvarianten); `test2`, `test3`, `test4` laufen weiter durch. In Chromium geprüft: Sprachwahl, Startseite, Einführung, Tippen. Nicht auf einem echten iPhone getestet.
- Hinweis: Stellen, an denen Englisch inhaltlich noch dünn ist: einzelne deutsche Beispielsätze (Trennbare Verben) sind mit Infinitiv-Konstruktionen gebaut, damit die Lücke genau ein Wort ist.

## Version 70 – Gelernte Vokabel in jedem Satz markiert
- Prüfung aller Module: Einführung, Auswahl, Lückensatz und Swipe (nach der Antwort) markierten das Wort schon, Tippen zeigt nur das Wort. Bausteine, Reels und Reihenfolge zeigten den Satz oben ohne Markierung der gelernten Vokabel (Reihenfolge nur die Übersetzung der festen Steine).
- Jetzt ist die gelernte Vokabel in Bausteine, Reels und Reihenfolge im Satz oben gelb unterstrichen (gleiche Optik wie Auswahl und Lückensatz, Klasse `.slot`). Bei Reihenfolge bleiben die Markierungen für feste Steine zusätzlich bestehen.
- Neue Hilfen in `modules/_shared.js`: `wordSpan` (Wort im Satz finden, erst exakt, dann gebeugte Form), `markTokens`, `learnedIdx`, `promptHtml`.
- Gebeugte Wörter: Bei 8 indonesischen Wörtern stand das Wort im Satz in anderer Form (menjawab → jawab, mengambil → ambil, membuka → buka, menutup → tutup, melakukan → lakukan, hati → berhati, tagihan → tagihannya, dua belas → kedua belas). Diese Form wird jetzt markiert, auch in den Hinweisen unter den Antworten (`hlId`).
- Test: alle 652 indonesischen und 665 englischen Wörter haben eine Markierung auf beiden Satzseiten; `test5.js` prüft zusätzlich im laufenden Spiel Bausteine, Reels, Reihenfolge, Lückensatz und Auswahl.

## Version 71 – Geschenkte Wörter dezent lila, Reels ohne geschenkte Walzen
- Geschenkte (feste) Wörter sind nicht mehr gelb, damit man sie nicht mit der gesuchten Vokabel verwechselt: Die Kachel in Bausteine und Reihenfolge ist jetzt dezent lila (blasse Füllung, dünner Rand, gedämpfte Schrift). Gelb bleibt allein der gesuchten Vokabel vorbehalten.
- Reihenfolge: Die Übersetzung oben markiert die Wörter der festen Steine in derselben dezenten Farbe (lila Unterstreichung, Klasse `.gv`), die gelernte Vokabel bleibt gelb (`.slot`).
- Reels: Der Mechanismus für voreingestellte, schon eingerastete Walzen ist entfernt. Alle drei Walzen müssen selbst gestoppt werden (das war schon so, der tote Code ist jetzt weg). Der Test-Schalter `__rlAll` bleibt.
- Technik: `markTokens(text, gesucht, klasse, geschenkt, klasse2)` und `promptHtml(w, text, seite, geschenkt)` in `modules/_shared.js`.
- Test: test2 bis test5 laufen durch; Optik in Chromium geprüft (Bausteine-Zeile mit geschenktem Wort, Satz mit gelber und lila Markierung). Nicht auf einem echten iPhone getestet.

## Version 72 – Alle abgefragten Wörter markiert
- Bisher war im Satz oben nur die gelernte Vokabel gelb. Jetzt sind alle Wörter markiert, die man in der Aufgabe selbst liefern muss.
- Bausteine und Reihenfolge: Der Satz oben ist komplett gelb, außer den geschenkten Wörtern (dezent lila), weil der ganze Satz gebaut wird. Ist der Satz oben in der Lernsprache (Bausteine), sind die noch unbekannten Wörter lila, alles andere gelb. Ist es die Übersetzung, sind die Wörter lila, deren Gegenstück in der Lernsprache geschenkt ist.
- Reels: Gelb sind die Übersetzungen der drei Walzen-Wörter. Die Zuordnung läuft über das Wörterbuch (`alignOf`); Wörter ohne Eintrag (z. B. gebeugte Formen) werden nur markiert, wenn die Zahl der offenen Plätze genau passt, damit keine Artikel oder Füllwörter versehentlich gelb werden. Die gelernte Vokabel ist immer markiert.
- Technik in `modules/_shared.js`: `alignOf`, `glPrompt`, `idPrompt`; `blockPrompt` (blocks.js), `reelsPrompt` (reels.js), `orderGlHtml` (order.js). `promptHtml` entfällt.
- Test: für alle Wörter beider Sprachen wird die Markierung in Bausteine, Reihenfolge und Reels geprüft (mindestens ein gelbes Wort, bei Bausteine gelb plus lila = alle Wörter des Satzes); test2 bis test5 laufen durch. Nicht auf einem echten iPhone getestet.

## Version 73 – Survival-Kachel mit Herz-Optik
- Die Survival-Kachel im Gamemodes-Tab ist jetzt farbig: Verlauf von sattem Rot zu Dewi-Pink mit hellem Glanz oben rechts, weißer Text, weißer Button mit roter Schrift und kräftigem Schatten (Klasse `.survcard`).
- Oben auf der Kachel liegen drei glänzende Herzen, passend zu den 3 Leben. Sie pochen leicht nacheinander (Doppelschlag, `shbeat`). Bei „Bewegung reduzieren" stehen sie still.
- Gesperrt (Daily Round noch nicht geschafft oder zu wenige Wörter): Farbe und Herzen bleiben sichtbar, nur blasser und etwas entsättigt; die Herzen pochen nicht, der Button ist durchscheinend mit Schloss, der Grund steht darunter.
- Test: test2 bis test5 laufen durch; beide Zustände in Chromium angesehen (gesperrt und frei). Nicht auf einem echten iPhone getestet.

## Version 74 – Survival-Kachel kompakter, Auswahl im Survival-Look
- Kachel kompakter: Titel und Rekord (bzw. Sperr-Grund) links, die drei Herzen kleiner rechts in derselben Zeile, darunter der Button. Die Kachel ist etwa halb so hoch wie vorher.
- Die Beschreibung („20 Wörter, 3 Leben, ein Versuch pro Frage. Wie weit kommst du?") steckt hinter einem Fragezeichen neben dem Titel. Antippen klappt sie auf und wieder zu.
- Survival-Auswahl (Spielart wählen): Der Hintergrund ist rot-pink getönt (Verlauf oben und rechts, Klasse `.sin.surv`), in der Kopfzeile stehen die drei kleinen Herzen. So erkennt man sofort, dass man im Survival-Bereich ist. Die Kacheln bleiben gut lesbar.
- Fehler beim Bau behoben: Das Klickfeld des Fragezeichens (`.qh::after`) überdeckte zuerst die ganze Kachel; es ist jetzt am Fragezeichen verankert.
- Test: test2 bis test5 laufen durch; Gamemodes (gesperrt, frei, Beschreibung offen) und Auswahl in Chromium angesehen. Nicht auf einem echten iPhone getestet.

## Version 75 – Survival: Kachel wieder rot-pink, Auswahl-Hintergrund pink
- Die Survival-Kachel im Gamemodes-Tab hat wieder den Verlauf von Version 74 (Rot zu Pink). Die Pink-Variante wurde zurückgenommen, gemeint war der Hintergrund der Auswahl.
- Der Hintergrund der Survival-Auswahl (Random und Solo-Module) ist jetzt durchgehend pink: oben ein helles Pink-Leuchten, darunter ein Verlauf von Pink zu dunklem Magenta über die ganze Seite (Klasse `.sin.surv`). Die Kacheln bleiben gut lesbar.
- Test: test2 bis test5 laufen durch; Kachel und Auswahl in Chromium angesehen. Nicht auf einem echten iPhone getestet.

## Version 76 – Weiter ohne Scrollen, Tippen oder Wischen geht weiter
- Swipe: Nach dem Wischen schrumpft der Bereich der weggeflogenen Karte weich auf null (`.swstage.collapsed`). Ergebnis und Weiter-Button rücken direkt unter die zwei Antworten und liegen ohne Scrollen im Bild (gemessen im 393×700-Fenster: Button endet bei 606 von 700 Pixeln).
- Alle Module: Taucht ein Weiter-Button auf (`#nx`, `#next`, bei Bausteine und Reihenfolge der umbenannte Prüfen-Button), scrollt die Seite ihn bei Bedarf sanft ins Bild (`scrollIntoView`, 20 px Abstand unten). Bei „Bewegung reduzieren" ohne Animation. Die Einführung ist ausgenommen, dort steht der Button ohnehin im Bild.
- Schneller weiter: Nach der Antwort geht ein Tipp auf die freie Fläche (nicht auf Buttons, Kacheln, Walzen, Fragezeichen) oder ein waagerechter Wisch (mehr als 60 px) wie der Weiter-Button. Eine Schutzzeit von 450 ms nach dem Erscheinen des Buttons verhindert, dass der Tipp der Antwort selbst gleich weiterblättert.
- Technik: ein gemeinsamer Block am Ende von `rounds.js` (Beobachter auf dem Sheet, delegierte Klick- und Pointer-Ereignisse).
- Test: test2, test4, test5 laufen durch; in Chromium geprüft: Swipe (Button im Bild, Tipp geht weiter) und Auswahl (Button scrollt ins Bild, Wisch geht weiter). Nicht auf einem echten iPhone getestet.

## Version 77 – Survival: Live-Score in Regenbogenfarben
- Im Survival steht unter der Kopfzeile, rechtsbündig, eine eigene Score-Zeile (Variante B, bewusst klein): links „SCORE", rechts die Zahl in Regenbogenfarben, die langsam durchläuft (`scflow`, 4 s, wie die Streak-Zahl), darunter klein der Rekord („Rekord: 9.200"). Übersteigt der Score den Rekord, steht dort „Neuer Rekord!". Zähler „1 / 30" und Stumm-Knopf bleiben oben.
- Nach jedem Modul, das Punkte bringt, wird die Zahl kurz auf etwa 140 % größer, tickt in 100er-Schritten nach oben (insgesamt ca. 0,6 s) und federt zurück. Bei „Bewegung reduzieren" springt sie ohne Effekt auf den neuen Wert.
- Zwei Nullen überall: intern zählt weiter 1 Punkt, angezeigt wird ×100 (`fmtSc`, mit Tausenderpunkt bei Deutsch, Komma bei Englisch). Betrifft Live-Score, „+100 Punkte" im Ergebnis, Endbildschirm, Rekord-Texte, Survival-Kachel und Auswahl. Gespeicherte Rekorde bleiben unverändert und werden nur anders angezeigt, es ist also keine Umrechnung der Daten nötig.
- Die Kennzeile zeigt im Survival nur noch „Survival · Modul …", der Score steht ja jetzt in der eigenen Zeile.
- Technik: `scoreRow()` in `sheetBody`, `scoreTick()` wird nach `settleCard` und nach dem Rendern angestoßen (idempotent über `S.shown`). Neuer EN-Text: „Neuer Rekord!".
- Test: test2 bis test5 laufen durch (zwei Testtexte an das neue Format angepasst); Zeile und Hochzählen in Chromium angesehen. Nicht auf einem echten iPhone getestet.

## Version 78 – Score: schnelleres Hochzählen, „SCORE" bleibt frei
- Das Hochzählen läuft jetzt flüssig und schnell durch viele Zwischenwerte (alle ca. 28 ms, z. B. 4.600 → 4.623 → 4.651 → … → 4.700) statt in 100er-Schritten. Es startet mit Tempo und läuft am Ende sanft aus; Dauer ca. 0,5 bis 0,9 s je nach Zuwachs. Die Funktion `fmtRaw` formatiert beliebige Zwischenwerte.
- Das Wort „SCORE" bekommt rechts 30 px Abstand (`.scl{margin-right}`), damit die auf 140 % wachsende Zahl es nicht überdeckt.
- Test: test2 bis test5 laufen durch; Zwischenwerte in Chromium mitgelesen. Nicht auf einem echten iPhone getestet.

## Version 79 – Survival: variable Punkte statt immer 100
- Jedes richtige Wort bringt jetzt krumme, abwechslungsreiche Punkte, z. B. 91, 186, 279. Der Score zählt nun direkt in diesen Punkten (nicht mehr 1 Punkt ×100).
- Grundpunkte je Modul (leicht = weniger, schwer = mehr): Swipe 61, Auswahl 73, Lückensatz 88, Reels 97, Reihenfolge 112, Bausteine 124, Tippen 149 (`SURV_BASE`).
- Perfekt-Bonus: +25 %, wenn das Wort ohne „?" (Hilfe) und ohne Tippfehler richtig war (`c.helped`, `c.typo`).
- Serien-Multiplikator auf die Punkte des Worts: ab 3 in Folge ×1,5, ab 5 ×2, ab 10 ×2,5, ab 15 ×3, ab 20 ×4 (`survMult`). Der alte feste Serienbonus (+2, +3 …) entfällt.
- Anzeige wie gewünscht nur das Ergebnis: „+186 Punkte" plus bisher „· 3 in Folge". Keine Aufschlüsselung, keine Chips. Keine Abzüge bei Fehlern, keine Herz-Boni.
- Alte Rekorde (bisher 1 Punkt je Wort) werden einmalig ×100 umgerechnet (`state.bestV=2`, auch im Export gespeichert, damit ein Import nicht doppelt rechnet). Ein alter Rekord von 47 steht dann als 4.700 da. Neue Punkte sind meist niedriger pro Wort als 100 bei leichten Modulen, aber mit Serie deutlich höher, ein alter Rekord kann also anfangs schwer zu knacken sein.
- Hochzähl-Effekt läuft jetzt direkt in Punkten (Dauer richtet sich nach dem Zuwachs).
- Test: test2 bis test5 laufen durch (Score-Tests auf die Formel umgestellt); Migration in Chromium geprüft (47 → 4.700, nicht doppelt). Nicht auf einem echten iPhone getestet.

## Version 80 – Reels: Markierung im Satz stimmt jetzt (Indonesisch und Englisch)
- Problem: In Reels waren oft zu wenige Wörter unterstrichen (z. B. bei „I learn English" fehlte „Englisch", bei „saya makan nasi" nur „Reis"). Ursache: Die Zuordnung zwischen den Sätzen kannte nur Wörterbuch-Grundformen. Gebeugte Formen (makan = esse, lernen = lerne, jeder = jeden) und Wörter ohne Eintrag (English) fanden keinen Partner.
- Neue Zuordnung (`alignOf` in `_shared.js`, wirkt auch bei Bausteine, Reihenfolge und den anderen Modulen):
  - Wörterbuch mit allen Bedeutungen plus die echten gebeugten Formen aus den Beispielsätzen (aus jedem Satz mit Klammerwort wird „Form im Satz = Form in der Übersetzung" gelernt).
  - Mehrwort-Einträge (z. B. „terima kasih" = danke, „noch nicht").
  - Grundformen-Suche: englisch -s/-ed/-ing, indonesisch Vor- und Nachsilben (me-, ber-, di-, -kan, -nya …).
  - Ähnliche Wortformen (lernen/lerne, jeder/jeden, Kind/Kinder) und verwandte Wörter ohne Eintrag (English/Englisch).
  - Kleine Wörter (saya = ich/mein, dia = er/sie/sein, di = in/im, ke = zu/nach, mit, für …) fest hinterlegt.
- Reels (`reelsMarks` in `reels.js`): Markiert werden genau die Wörter, die den drei Walzen entsprechen. Hat ein Walzen-Wort keinen sicheren Partner, wird das nächstliegende freie Wort an ähnlicher Stelle genommen, aber nie Artikel oder „ist/sind" (der/die/das, the/a/is). Steht ein Walzen-Wort im Satz doppelt (z. B. zweimal „ich"), wird der passende Partner mitmarkiert. Das gelernte Zielwort wird nur zusätzlich markiert, wenn es im Fenster liegt (vorher konnte es ein viertes Wort färben).
- Prüfung über alle Reels-Sätze (beide Kurse, beide Richtungen, alle Fenster um das Zielwort, 3.935 Fälle): Fälle mit zu wenig Markierung von 2.344 auf 291 gesunken. Die übrigen sind fast alle berechtigt (Walzen-Wort ohne Gegenstück, z. B. „gibt es", „tut weh", „di"). 55 Stichproben von Hand gelesen, alle passend.
- Test: test2 bis test5 laufen durch; „I learn English every day" in beiden Richtungen: oben „Ich lerne jeden Tag Englisch" mit Ich, lerne, Englisch markiert. Nicht auf einem echten iPhone getestet.

## Version 81 – Gamemodes-Kachel: Rand 50 % schneller
- Der Regenbogen-Rand der Gamemodes-Kachel dreht sich jetzt in 3 s statt 4,5 s (50 % schneller, `.gmcard.streakcard.on`). Die Serien-Karte behält ihr altes Tempo.
- Test: Bau läuft durch, nur eine CSS-Zeile. Nicht auf einem echten iPhone getestet.

## Version 82 – Daily-Round-Kachel ruhiger, mit Dewi-Emote des Tages
- Das Blumenmuster im Hintergrund ist weg. Die Kachel hat einen wärmeren Verlauf (Violett zu Pink, mehr Pink unten rechts) mit weichem rosa Schimmer von innen. Der Regenbogen-Streifen oben bleibt.
- Die Zahlen sind kleiner: 30 px statt 46 px, engerer Abstand, die Beschriftung darunter bleibt. Die Kachel ist dadurch niedriger.
- Oben rechts steht hinter dem Inhalt ein Dewi-Emote des Tages (`.plan-dw`, ca. 122 px, 34 % deckend, leicht entsättigt, rechts angeschnitten). Es nutzt Dewis vorhandene Gesichter samt ihrer leichten Eigenbewegung (`.dw.m-…`), nicht antippbar.
- Auswahl passend zum Stand und trotzdem täglich anders (`homeEmote`): Daily Round offen: genervt, gelangweilt, hochnäsig, verschmitzt, seufzend, desinteressiert, fies. Geschafft: Sonnenbrille, überlegen, überrascht, Cash, verschmitzt. Innerhalb des Stands rückt es jeden Kalendertag um eins weiter.
- Test: test2 bis test5 laufen durch; mehrere Tage und beide Zustände in Chromium angesehen. Nicht auf einem echten iPhone getestet.

## Version 83 – Fehlerbehebung: Musik, Random-Button, Survival-Hintergrund, Gamemodes ohne Sperre
- **Musik** (`music.js`): Wahrscheinlichste Ursache für das gelegentliche Verstummen: iOS meldet nach App-Wechsel, Sperrbildschirm oder Unterbrechung den Zustand „interrupted" statt „suspended". Das wurde nicht wieder angestoßen. Jetzt wird der Ton bei jedem Zustand außer „running" wieder gestartet (Tick alle 90 ms, bei Berührung, bei `pageshow` und `focus`, plus `onstatechange`). Ein beendeter Audio-Kontext wird neu aufgebaut. Solange der Ton angehalten ist, werden keine Noten vorgeplant (der Takt läuft danach nicht mehr durcheinander). Die Pegel-Automation wurde sauber verankert (Ausblenden der alten Spur, Einblenden der neuen) und das Dämpfen läuft nur noch bei einer Änderung statt alle 90 ms, damit sich keine Ereignisse stauen und das Einblenden nicht überschrieben wird. Der Wechsel Reels (Synth) zurück zu Lo-Fi wurde in Chromium mehrfach durchgespielt (Home, Reels, Auswahl, Reels, Home): Modus und Zustand stimmen jedes Mal. Nicht auf einem echten iPhone getestet, deshalb bitte beobachten, ob es weiterhin vorkommt.
- **Random-Button** (Survival-Auswahl): Die zwei riesigen, gegenläufig kreisenden Farbebenen (Ursache der Animationsfehler an den Rundungen) sind weg. Neu: Arcade-Look mit fließendem Neon-Verlauf (Pink, Violett, Blau, Türkis, nahtlos), feinen Streifen, dicker Unterkante, weißer Schrift mit Schatten und einem Würfel, der leicht wackelt. Der Verlauf wird nur über die Hintergrundposition bewegt, es dreht sich nichts mehr. Bei „Bewegung reduzieren" steht alles still.
- **Hintergrund der Survival-Auswahl**: Jetzt tiefes Violett (heller oben, dunkel unten) statt Pink.
- **Gamemodes ohne Daily-Round-Pflicht**: Survival ist jederzeit startbar. Gesperrt bleibt es nur, wenn weniger als 5 bekannte Wörter da sind. Die Gamemodes-Kachel auf der Startseite hat jetzt immer den Regenbogen-Rand, der Text lautet vor der Daily Round „Spiele jederzeit, mit Leben, Score und Rekorden."
- Test: test2 bis test5 laufen durch (die zwei Tests zur Sperre vor der Daily Round auf die neue Regel umgestellt). Nicht auf einem echten iPhone getestet.

## Version 84 – Survival-Kachel im Arcade-Stil des Random-Buttons
- Die Survival-Kachel (Gamemodes-Tab) übernimmt den Look des Random-Buttons: fließender, nahtloser Farbverlauf, feine Streifen, heller Innenrahmen, dicke dunkle Unterkante, Titel in Großbuchstaben mit Schatten, Hinweistext fett mit Schatten. Dieselbe Animation (`mrflow`, 5 s), es dreht sich nichts, nur die Hintergrundposition wandert.
- Die Farben bleiben die der Survival-Kachel: Rot (#ff2f55) über Pink (#ff4a86) zu hellem Rosa (#ff7ac6) und zurück. Weißer Button, die drei Herzen mit sanftem Schlag und das Fragezeichen bleiben.
- Gesperrt (weniger als 5 bekannte Wörter): wie bisher blasser und entsättigt, ohne Animation. Bei „Bewegung reduzieren" steht alles still.
- Test: test2 bis test5 laufen durch; freie und gesperrte Kachel in Chromium angesehen. Nicht auf einem echten iPhone getestet.

## Version 85 – Arcade-Stil auch für Daily-Round- und Gamemodes-Kachel
- Beide Kacheln der Startseite übernehmen den Stil von Random-Button und Survival-Kachel: fließender, nahtloser Verlauf (nur die Hintergrundposition wandert), feine Streifen, heller Innenrahmen, dicke dunkle Unterkante, weiße Schrift mit Schatten, weißer Button mit dicker Kante.
- Daily Round: Verlauf von tiefem Indigo über Violett zu Magenta, Animation 6 s. Beschriftung „Heute dran" kräftig, die Zahlen in Weiß, „Für heute geschafft." in Großbuchstaben. Der Button „Daily Round starten" ist weiß mit violetter Schrift und pulsiert weiß (`planpulse`). Die Serien-Zeile unten ist angepasst (heller Text, gelbe Zahl).
- Gamemodes: Verlauf von Blau über Himmelblau zu Türkis, Animation 5 s, Titel „GAMEMODES" groß, weißer Button mit blauer Schrift. Der Regenbogen-Rand ist entfernt (wie gewünscht), ebenso der Regenbogen-Streifen oben auf der Daily Round.
- Das Dewi-Emote oben rechts auf der Daily Round entfällt (Wunsch). Der Code dazu (`homeEmote`, `.plan-dw`) wurde entfernt.
- Farbthemen jetzt: Daily Round Violett-Magenta, Gamemodes Blau-Türkis, Survival Rot-Pink, Random Neon (Pink-Violett-Blau-Türkis).
- Bei „Bewegung reduzieren" stehen die Verläufe still.
- Test: test2 bis test5 laufen durch; beide Zustände der Startseite (Daily offen und geschafft) in Chromium angesehen. Nicht auf einem echten iPhone getestet.

## Version 86 – Score in Arcade-Schrift, kursiv
- Der Live-Score im Survival und die große Punktzahl am Ende des Survival (Klasse `.bigword.arc`) sind jetzt in der Pixel-Schrift „Press Start 2P" gesetzt (klassische Spielautomaten-Optik) und kursiv. Die Schrift hat keine eigene Kursivform, der Browser neigt sie leicht. Sie kommt wie die anderen Schriften von Google Fonts (zusätzlicher `family=Press+Start+2P` im Link). Ohne Netz fällt sie auf Courier New bzw. die Monospace-Schrift des Geräts zurück.
- Der Live-Score ist dadurch breiter und mit 15 px etwas kleiner gesetzt. Das Wort „SCORE" sitzt jetzt auf Höhe der Zahl und hat 46 px Abstand, damit die auf 140 % wachsende Zahl es nicht überdeckt. Der Regenbogen-Verlauf und der Hochzähl-Effekt bleiben.
- Test: test2 bis test5 laufen durch; Darstellung in Chromium mit der echten Schrift angesehen (Live-Score und Endbildschirm). Nicht auf einem echten iPhone getestet.

## Version 87 – Zweiter Soundtrack: Casino-Arcade
- Neuer Loop „Casino-Arcade" (`arcadeStep` in `music.js`): Dur-Folge C, Am, F, G, 124 BPM, 4 Takte à 16 Schritte, live per Web Audio erzeugt wie die anderen Loops (keine Dateien). Wippender Oom-Pah-Bass (Rechteck und Dreieck), Bassdrum, Snare-Rauschen, Akkordstöße auf den Offbeats, Glockenmelodie (Sinus plus kurzer Oberton) und ein Glitzer-Arpeggio.
- Einstellungen: Unter Musik erscheint, sobald die Musik an ist, ein zweiteiliger Schalter „Lo-Fi / Arcade" (`state.mtrack`, Standard Lo-Fi, bleibt beim Zurücksetzen der Lernstände erhalten). Der Wechsel überblendet sofort.
- Wo er läuft: überall statt Lo-Fi, außer im Modul Reels (dort bleibt der Synthwave mit Intensität pro gelockter Walze).
- Dynamik im Survival: Stufe 0 bis 3. Außerhalb des Survivals und beim Start Stufe 1 (Bass, Drums, Stöße, Hi-Hat, Arpeggio). Ab 4 richtigen in Folge Stufe 2 (Glockenmelodie dazu, zusätzlicher Basssprung), ab 10 Stufe 3 (Oktav-Doppelung, 16tel-Hi-Hat, kleiner Lauf am Taktende). Nur noch ein Leben: eine Stufe höher. Maximal Stufe 3.
- Neuer EN-Text: „Soundtrack". Der Hinweistext unter Musik nennt jetzt beide Loops.
- Test: test2 bis test5 laufen durch. In Chromium geprüft: Schalter erscheint nur bei Musik an, Wechsel Lo-Fi ↔ Arcade ↔ Reels-Synth, Stufen im Survival, alle Stufen laufen fehlerfrei durch (ein Probe-Rendering von 24 s mit allen drei Stufen liegt als WAV bei). Auf einem echten iPhone nicht gehört, die Lautstärke und das Klangbild bitte kurz prüfen.

## Version 88 – Game-Over-Sound im Survival
- Neuer Sound `gameover` („Arcade-Absturz“): sechs fallende Rechteck-Töne, Sturz-Glissando, tiefer Schlag mit Rauschen.
- Spielt beim Verlust des letzten Herzens und ersetzt dort den normalen Falsch-Sound (Flag `window.__gover` in `settleCard`, ausgewertet in `scanSnd`).
- Musik wird dabei 4 s lang auf 20 % gedimmt (`music.js`). Keine Vibration.
- Der Endscreen-Sound bleibt unverändert.

## Version 89 – Daily-Round-Kachel aufgeräumt
- Offener Zustand: nur noch Titel „DAILY ROUND“, großer pulsierender Knopf „Play now“ und darunter die unveränderte Streak-Zeile.
- Entfernt: „Heute dran“, Zahlen für Reparatur/Neue Vokabel/Review und der Hinweistext zur Fehlerliste (der Run zeigt das selbst).
- Erledigt-Zustand unverändert (gleiche Größe). Streak-Zeile ohne Warnung, wie gewünscht.
- Tests angepasst (D6, D7, „Englisch: Startseite“).

## Version 90 – Startscreen poliert (Schritt 1 von 3: Startscreen → Diamanten-Währung → Shop)
- Daily Round dominiert: Titel 30 px, mehr Innenabstand, Abstand Titel–Button 16 px, Button 56 px hoch.
- Game Modes leiser: dunkle Fläche mit animiertem blau-türkisem Rand (padding-box/border-box-Trick), kleiner türkiser Titel, farbiger Arcade-Button.
- Großes Datum auf dem Startscreen entfernt.
- Streak: bei 0 Tagen „Starte deine Serie“ statt „0 Tage in Folge“; alle Wochen-Kästchen tragen ein Tageskürzel (`data-d` + `::after`, `wdAbbr()`).
- Schriftregel: Kachel-Titel und Buttons (`.btn.primary` und Kachel-Buttons) in Großbuchstaben, Fließtext normal.
- Tab-Leiste: dickere Icons (2,4 px), aktiver Tab mit farbiger Pille und gefülltem Icon.
- Dewi-Sprüche auf dem Startscreen (home_new/home_due/home_done, DE+EN, mit und ohne Name) drehen sich jetzt um die Serie statt den Button zu wiederholen.
- Musik-Knopf: war schon neutral im Aus-Zustand und pink nur bei laufender Musik – keine Änderung nötig.

## Version 91 – Diamanten-Währung (Schritt 2 von 3)
- Neue Datei `gems.js` (per `/*@include gems.js*/` vor rounds.js). State: `gems` (Kontostand), `gemShown` (zuletzt angezeigter Wert), `gemSurv` ({d,n}: Survival-Diamanten heute).
- Verdienen (Tuning „mittel“, Ziel: ein Cosmetic ≈ 1 Woche tägliches Spielen):
  - Daily Round geschafft (erstes Mal am Tag): +10, ohne verlorenes Modul +5.
  - Jedes neue Wort und jeder Stufen-Aufstieg in der Daily: +1.
  - Streak-Meilensteine: 3 → 10, 7 → 25, 14 → 50, 30 → 100, 50 → 150, 100 → 300, 365 → 1.000.
  - Survival: halb so viele wie geschaffte Wörter, +10 bei neuem Rekord, max. 30 pro Tag.
- Gutschrift sofort in `state.gems` (Abbrechen kostet nichts). Endscreens zeigen eine Zeile „+N“ mit Aufschlüsselung.
- Startscreen: Pille rechts oben mit dem rotierenden 3D-Juwel und Zahl in Press Start 2P; das Juwel ist aus dem Logo verschwunden.
- Einsammeln: bis zu 12 Diamanten fliegen aus der Daily-Kachel in die Pille (Web Animations API), Zahl tickt pro Treffer hoch, Pille hüpft, Sound `gems` + `tick`. Bei reduzierter Bewegung nur die Zahl.
- Konstanten-Name `GEMV` (weil `GEM` schon der 3D-Juwel-Renderer ist).
- Fix: Erledigt-Zustand der Daily-Kachel bekommt wieder eine kleinere Überschrift (22 px).

## Version 92 – Sprach-Chip kompakt
- Der Sprach-Knopf oben rechts zeigt statt „Indonesisch“/„Englisch“ nur noch Flagge + Kürzel: 🇮🇩 ID bzw. 🇬🇧 EN (`.langchip`, Kürzel aus `L.code`).
- Der volle Sprachname steht weiter im aria-label für VoiceOver.

## Version 93 – Zahlen-Schrift Lilita One
- Press Start 2P (kursiv) ersetzt durch **Lilita One**, gerade, mit hartem Schatten darunter. Neue Variable `--num`.
- Gilt nur für Zahlen: Live-Score (21 px), Survival-Endscore (44–60 px), Diamanten-Pille (18 px), Diamanten-Zeile auf Endscreens (22 px), Streak-Zahlen (Kachel, Endscreen, Streak-Karte), Level-Badge, Zahlen in `.num`.
- Titel bleiben Bricolage Grotesque, Fließtext Instrument Sans.
- Google-Fonts-Link lädt Lilita One statt Press Start 2P.
- Begründung: Pixelschrift wird kursiv zackig, ist sehr breit/dünn, der Tausenderpunkt verschwindet und sie passte stilistisch nicht zu Dewi und den Arcade-Kacheln. Vergleichsbild: data/fontvergleich.png.

## Version 94 – Score weiß, Währung dünner
- Live-Score im Survival: Regenbogen-Verlauf entfernt, jetzt weiß mit leichtem Glow (`text-shadow` 10 px weiß 45 %). Schrift bleibt Lilita One, Hochzähl-Bump bleibt.
- Diamanten-Pille im Hauptmenü: Zahl in der App-Schrift Bricolage Grotesque 600, 16 px, ohne Schatten (Lilita One gibt es nur in einer Stärke und wirkte dort zu dick).

## Version 95 – Erledigt-Kachel ohne Morgen-Hinweis
- In der Daily-Kachel (erledigt) entfallen die Sätze „Morgen kommt 1 Wiederholung dran.“, „Morgen kommen N Wiederholungen dran.“ und „Morgen steht noch keine Wiederholung an.“
- Der Hinweis zur Fehlerliste („Die nächste Daily Round startet mit der Reparatur …“) bleibt, weil er erklärt, warum der Button „Fehlerliste reparieren“ heißt.

## Version 96 – Erledigt-Kachel noch ruhiger
- Erledigt-Zustand der Daily-Kachel: Eyebrow „Heute“ entfernt (doppelt zu „Für heute geschafft.“) und der Fehlerlisten-Hinweis gestrichen. Es bleiben Überschrift (24 px), Button und Streak-Zeile.
- Test D6 prüft jetzt den Knopf „Fehlerliste reparieren“ statt des alten Hinweistexts.

## Version 97 – Streak-Flamme im Arcade-Stil (Pixel-Art)
- `flameSvg()` neu: Pixel-Flamme aus Quadraten (16×20), harter dunkler Schatten, `shape-rendering: crispEdges`. Drei Spitzen-Varianten flackern in Stufen (`steps(1)`, 0,8 s), dazu drei kleine Pixel-Funken (`.em`). Alte Pfad-Flamme (`FLAME_PATHS`, `wob`, Verlaufs-Defs) entfernt.
- Farbe nach Serie: 1–6 Tage Orange/Gelb, ab 7 Pink, ab 30 Blau, ab 100 Violett (`PF_COL`). Ohne Serie: Grau, kein Flackern, ohne Glow.
- Reduzierte Bewegung: nur ein Bild, keine Funken.
- Streak-Zahl auf dem Endscreen wechselt nicht mehr durch den Regenbogen, sondern pulsiert Orange ↔ Gelb (`numcolor`).
- Gilt in der Daily-Kachel (24×30 px) und auf dem Endscreen der Daily Round (72×90 px).

## Version 98 – Kopfzeile als Statusleiste
- Startscreen-Kopf neu: links runder Sprach-Knopf nur mit Flagge (🇮🇩/🇬🇧, 44 px, `#chlang.langbtn`), rechts Serien-Pille (Pixel-Flamme + Zahl, `stPill()`) und Diamanten-Pille. Das „dewi.“-Logo und der Musik-Knopf sind auf dem Startscreen entfernt.
- Musik schaltet man in den Einstellungen (dort schon vorhanden), in den Modulen bleibt der Lautsprecher im Kopf.
- Die Serien-Pille ist grau ohne Serie, gelb-orange mit Serie. Beide Pillen 40 px hoch, Diamanten-Zahl 17 px.
- Andere Ansichten (Sprachwahl, Namensabfrage) behalten das Logo.
- Test M2/M4 angepasst (Kopfzeile prüfen, Musik über Einstellungen einschalten).

## Version 99 – Fragezeichen mit Erklärung auf Daily- und Gamemodes-Kachel
- Beide Kacheln haben oben rechts einen runden „?“-Knopf (`.cq`, `cqBtn()`); Tippen klappt den Erklärtext in der Kachel auf, nochmal Tippen schließt ihn (`aria-expanded`, Knopf wird gefüllt).
- Daily Round (offen und erledigt): „Starte einen kurzen zufälligen Run und lerne eine neue Vokabel!“
- Gamemodes: „Keine Lust auf neue Vokabeln? Vertiefe was du bereits kennst und sammle Diamanten, indem du deinen Highscore steigerst!“
- Die feste Beschreibung unter „GAMEMODES“ („Spiele jederzeit …“ / „Noch Lust auf mehr? …“) ist entfernt, die Kachel besteht jetzt aus Titel und Button.
- EN-Übersetzungen ergänzt. Der Erklärtext ist standardmäßig zugeklappt.

## Version 100 – Diamant dunkler, Streak-Zeile aufgeräumt, ruhige Gamemodes-Kachel

**Was sich geändert hat**
- **Diamant (Währungs-Pille):** Der Farbwechsel läuft nur noch durch Violett, Rosa und Blau (Farbwinkel ca. 248–332°, vorher der ganze Regenbogen). Die Farben sind dunkler und weniger gesättigt, der weiße Glanz ist schwächer. Grün und Hellblau, die geblendet haben, kommen nicht mehr vor.
- **Streak in der Daily-Round-Kachel:** Der Text neben der Flamme ist weg. Es bleiben nur die Pixel-Flamme und die große Zahl (in Lilita One). Bei 0 Tagen steht dort „0".
- **Gamemodes-Kachel („C · Ruhige Vollfläche"):** Einfarbiger Verlauf Blau → Türkis ohne Streifen und ohne Animation. Dunkler Button mit weißer Schrift. Titel weiß in Großbuchstaben, „?" oben rechts bleibt.

**Warum:** Die Daily Round soll die einzige „laute" Kachel sein. Die Gamemodes-Kachel bleibt ruhig und konkurriert nicht mehr mit ihr.

**Technik:** `app.src.html` (Gem-Zeichnung, `streakHtml`, `.gmcard`-CSS). Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

**Offen:** Die violette Flamme ab 100 Tagen hat auf der violetten Kachel wenig Kontrast. Als Nächstes steht Schritt 3 an, der Shop.

## Version 101 – Startscreen im Survival-Stil
- **Gamemodes** ist jetzt ein Mini-Banner wie „Random" im Survival: eine Zeile mit Gamepad-Icon, Titel „GAMEMODES" und der Zeile „Gamemodes öffnen". Die ganze Fläche ist der Öffnen-Knopf (`#gm.gmmain`), das „?" sitzt rechts in der Zeile und klappt den Erklärtext darunter auf. Der Verlauf Blau → Türkis und der dunkle Unterrand bleiben.
- **Fortschritt-Karte** (`.card.prog`): größere Rundung (20 px) und ein türkiser Unterrand (5 px), passend zu den Karten im Survival.
- **Daily Round** bleibt unverändert, sie ist die einzige große Kachel. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.
- Nicht umgesetzt (so entschieden): violetter Hintergrundverlauf und Abschnitts-Überschriften.

## Version 102 – Streak-Zahl in der Daily-Kachel farbig nach Zustand
- Die Zahl neben der Flamme ist ab Streak 1 orange-gelb (`#ffc83d`, wie in der Serien-Pille oben rechts), bei Streak 0 halbtransparentes Grau-Weiß passend zur grauen Flamme.
- Betroffen: `.plan .streak.foot b` und `.plan .streak.foot:not(.on) .sn`. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 103 – Musik standardmäßig an
- Neuer Standard: `music:true` (Lautstärke 35, Soundtrack Lo-Fi). Wer die App neu startet, hat die Musik also an.
- Bestehende Stände (auch deiner) werden einmalig auf „an" gestellt (Merker `musDef`, Funktion `migrate()`). Wer die Musik danach selbst ausschaltet, behält „aus".
- **iOS-Einschränkung:** Safari spielt erst nach der ersten Berührung Ton ab. Die Musik startet daher beim ersten Tippen auf den Bildschirm, nicht schon beim Öffnen der App (der bestehende `wake`-Handler übernimmt das).
- Test M1 angepasst (Standard „an"), M3 schaltet vorher aus. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 104 – Gamemodes-Banner: dezente Streifen und Pfeil
- Das Gamemodes-Banner bekommt dieselben Querstreifen wie die Daily Round, aber nur etwa ein Drittel so stark (Deckkraft 2,5 % statt 7 %) und ohne Animation. Es wirkt jetzt wie dasselbe Material in leiser, ohne mit der Daily Round zu konkurrieren.
- Die zweite Zeile „Gamemodes öffnen" ist durch einen weißen Pfeil (`.gmgo`) rechts neben dem Titel ersetzt. Der Text bleibt als `aria-label` am Knopf.
- Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 105 – Survival-Kachel im Stil des Gamemodes-Banners
- Die Survival-Kachel in den Gamemodes folgt jetzt demselben Prinzip wie das Gamemodes-Banner auf dem Startscreen: ruhiger Verlauf Rot → Pink, dezente Querstreifen (2,5 %), keine Animation, kein Glow außen, ein Pfeil und das „?" rechts.
- Die ganze Kachel ist der Start-Knopf (`#surv`, Klasse `.svgo`). Der weiße Button „Survival starten" entfällt; der Text bleibt als `aria-label`. Links stehen Titel und Rekord, rechts die drei Herzen (schlagen weiter leicht), dann Pfeil und „?". Der Erklärtext klappt unter der Kachel-Zeile auf.
- Gesperrt (zu wenig Wörter): Kachel gedämpft, Herzen ausgeblendet, Schloss statt Pfeil, der Grund steht unter dem Titel.
- Der Klassenname `.smain` ist im Spielfeld schon vergeben, deshalb heißt die neue Klasse `.svgo`.
- Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 106 – Fragezeichen hinter dem Namen, kleiner
- Die „?"-Knöpfe sitzen jetzt direkt hinter dem Namen des Modus statt oben rechts in der Ecke: „DAILY ROUND ?", „GAMEMODES ?" und „SURVIVAL ?". Sie sind kleiner (22 statt 30 px, Schrift 12 px).
- Gamemodes-Banner: Icon, Titel und „?" stehen links, der Pfeil rechts. Die ganze Kachel ist weiter antippbar (`gmcard.onclick`), außer auf dem „?" und dem Erklärtext.
- Survival-Kachel: Titel + „?" links, darunter der Rekord, rechts Herzen und Pfeil. Auch hier öffnet ein Tipp auf die Kachel das Spiel (außer auf dem „?" und dem Erklärtext); gesperrt bleibt sie zu.
- Technik: Ein `display:grid` auf dem „?" ließ den Knopf in der Titelzeile in die nächste Zeile umbrechen; jetzt `inline-block`.
- Tests 2–5 grün (ein einmaliger Timing-Ausreißer in Test 4 war beim Wiederholen weg). Nicht auf einem echten iPhone getestet.

## Version 107 – Sprechblase im Animal-Crossing-Stil, Charaktere vorbereitet
**Sprechblase**
- Neue Form: helle Fläche (`#fff6fb`) mit weich-welligem Rand (unterschiedliche Eckradien), 2 px Rand in der Farbe des Charakters, dunkler Schatten darunter. Der Zeiger zu Dewi ist größer und ebenfalls gerundet.
- Namensschild: kleines Label oben links, das über den Rand der Blase ragt – Farbe des Charakters, Name in Großbuchstaben, weißer Rand (`.bubble .nt`).
- Kein „weiter"-Dreieck (so entschieden). Der Schreibmaschinen-Effekt bleibt.
- Die Sonderfarben der Blase beim Level-Aufstieg entfallen, dort gilt jetzt dieselbe helle Blase.

**Charakter-Struktur (für den späteren Shop)**
- Neue Tabelle `CHARS`. Ein Eintrag enthält: `id`, `name`, `color` (Schild und Blasenrand), `art(mood)` (HTML der Figur), `quips` und `moods` (fehlt eine Kategorie, greifen Dewis Sprüche), optional `blip` (eigene Tipp-Stimme) und `price` in Diamanten.
- `activeChar()` liefert den aktiven Charakter; `sayQuip()` und `mascotHtml()` nutzen ihn. Dewi ist der einzige Eintrag und bleibt der Standard.
- Spielstand: `state.chars` (Liste der besessenen Charaktere, immer mit `dewi`) und `state.char` (aktiver). Bestehende Stände werden in `migrate()` ergänzt.
- Einen neuen Charakter hinzufügen heißt künftig: ein Eintrag in `CHARS` plus Zeichenfunktion. Der Kauf im Shop kommt in Schritt 3.
- Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 108 – Neues Wort in drei Takten statt einer Textwand
Vorher war die Einführung ein Screen mit acht Blöcken und einem Countdown, der das Weiterkommen blockierte. Gelesen wird dabei viel, gemerkt wenig: Erinnerung entsteht durch Abrufen, nicht durch Anschauen.

**Neuer Ablauf (Modul `intro`, drei Karten statt einer)**
1. **Sehen** – nur „NEUES WORT", das Wort in der Lernsprache, die Übersetzung, Lautsprecher und Kategorie. Kein Countdown mehr: Das Wort selbst ist der Knopf (`#wtap`, pulsierender Hinweis „Tippe das Wort an."). Die Wartezeit fließt so ins Wort statt in den Button.
2. **Wiedererkennen** – „Erkennst du es wieder?" mit dem Wort und zwei Optionen. Unverlierbar: Eine falsche Wahl wird nur grau und zeigt „Fast! Schau nochmal hin.", es kostet kein Leben und zählt nicht in die Wertung.
3. **Anwenden** – der Beispielsatz mit Lücke (`.gapslot`), zwei Optionen in der Lernsprache. Nach der richtigen Wahl steht der vollständige Satz da und wird vorgelesen. Ohne Beispielsatz entfällt dieser Takt.

**Aussprache (`say(text)`)**
- Nutzt die Stimmen des Geräts (`speechSynthesis`), es sind keine Audiodateien nötig. Sprachen: `id-ID` und `en-US`.
- Ist keine passende Stimme installiert, bleibt die Funktion still, statt mit deutscher Stimme vorzulesen. Ob dein iPhone eine indonesische Stimme hat, müsstest du direkt testen (Einstellungen → Bedienungshilfen → Gesprochene Inhalte).
- Gesprochen wird automatisch bei Takt 1 und 2 (nur wenn Sound an ist) und jederzeit über den Lautsprecher-Knopf.

**Farbregel für die ganze App:** Lernsprache = Pink, Deutsch/Englisch = Weiß oder Grau. Dafür sind Gelb (`.ex .xi b`, `.sentbox .slot`) und Türkis (`.ex .xe b`, Rand von `.ex`) ersetzt worden.

**Technik:** Die Takte laufen über `introBeat1/2/3` in `modules/intro.js`; `introSoon()` überspringt die Übergänge, wenn `window.__introMs===0` (Tests). Die Optionen heißen `.iopt` mit `data-r`, damit sie nicht mit dem Auswahl-Modul (`.opt`) verwechselt werden. Alle fünf Testdateien haben eine Hilfsfunktion `skipIntro()` bekommen; die Countdown-Tests A2/A3 prüfen jetzt die drei Takte. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 109 – Vorlesen nur auf Knopfdruck, Kopfzeile weg, „good afternoon" korrigiert
- **Vorlesen** startet nicht mehr von selbst. Es passiert nur noch, wenn du den Lautsprecher in Takt 1 antippst. Die automatischen Aufrufe in Takt 1, 2 und 3 sind entfernt.
- **Kicker-Zeile** („Daily Round · Review 1 von 4 · Modul Bausteine · ins Englische") ist nicht mehr sichtbar. Sie bleibt als unsichtbarer Text im Dokument, damit Screenreader die Stelle in der Round weiterhin ansagen und die Tests sie prüfen können (`.kicker` mit `clip-path`).
- **Wortliste Englisch:** `good afternoon` heißt jetzt „guten Nachmittag" statt „guten Tag", auch im Beispielsatz („[Guten Nachmittag], mein Freund."). Vorher kollidierte es mit `hello`/`hi` und war beim Satzbau nicht lösbar.
- Nicht geändert (so entschieden): die übrigen 13 Paare mit gleicher deutscher Hauptbedeutung (`ice cream`/`ice` = Eis, `map`/`card` = Karte, `she`/`they` = sie, `to`/`too` = zu, `thank you`/`thanks` = danke, `easy`/`light`, `tomorrow`/`morning`, `in front of`/`before`, `health`/`bless you`, `fine`/`good`, `eat`/`food`, `go`/`walk`, `poor`/`arm`). In den meisten Fällen macht der Satz klar, was gemeint ist.
- Ein Versuch, den Satz von `bless you` um Kontext zu erweitern („Bless you! Thanks."), ließ eine Englisch-Round in Test 5 hängen und wurde zurückgenommen.
- Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 110 – Endscreen der Daily Round in zwei Schritten
Vorher standen Ergebnis, Serie, Diamanten, Stempel-Hinweis, Dewi-Spruch und Fehlerliste gleichzeitig auf einem Screen. Jetzt bekommt jede Belohnung ihren Moment.

- **Schritt 1 (`endResult`):** „x von y Module geschafft", die Diamanten mit Aufschlüsselung, der Stempel-Hinweis, Dewis Kommentar und die Änderungen an der Fehlerliste. Unten ein großer „Weiter"-Knopf (`#endnext`).
- **Schritt 2 (`endStreak`):** nur die Serie, mittig, mit großer Pixel-Flamme (120×150 px) und der Zahl in 72 px. Darunter „Serie verlängert!" oder „Die Serie läuft weiter.".
- **Zurück zum Startscreen:** Schritt 2 schließt sich nach 2,8 Sekunden von selbst (`endTimer`), der „Fertig"-Knopf geht sofort. `closeSheet()` räumt den Timer auf, damit nichts nachträglich zuschnappt. In Tests (`window.__test`) läuft der Timer nicht.
- Der Survival-Endscreen bleibt unverändert, er zeigt ohnehin nur Punkte.
- Tests: Die Runner aller fünf Dateien klicken jetzt `#endnext`; B2/B3 in Test 2 ignorieren die beiden Endscreen-Zeilen beim Prüfen der Modul-Reihenfolge. Tests 2–5 grün.

**Nachtrag zu Version 109:** Die Wortliste des Englischkurses wird aus `data/en/*.txt` gepflegt, `lang_en.js` ist daraus erzeugt. „good afternoon" ist jetzt in beiden Dateien auf „guten Nachmittag" geändert, sonst wäre die Korrektur beim nächsten Erzeugen verloren gegangen.

Nicht auf einem echten iPhone getestet.

## Version 111 – Markierung im deutschen Satz: im Zweifel keine Markierung
**Das Problem:** Im Bausteine- und Reihenfolge-Modul wurden Wörter pink markiert, die gar nicht gefragt waren, etwa „zusammen" in „Guten Morgen, zusammen." (die Kachel `everyone` war geschenkt) und „gut" in „Gute Nacht, schlaf gut." (`well` war geschenkt).

**Die Ursache:** `glPrompt()` arbeitete nach dem Prinzip „erst den ganzen Satz markieren, dann die geschenkten Wörter abziehen" (Parameter `all`). Abgezogen wurde aber nur, was `alignOf()` sicher zuordnen konnte. Diese Zuordnung ist eine Heuristik aus dem Kurswörterbuch und trifft nicht jedes Paar; bei „everyone → zusammen" und „well → gut" scheiterte sie, und wegen der Grundeinstellung blieben die Wörter markiert.

**Die Lösung:** Die Logik ist umgedreht. Markiert wird nur noch, was nachweislich zugeordnet ist, unsichere Wörter bleiben neutral. Damit kann die Anzeige nichts Falsches mehr behaupten, auch bei künftigen Sätzen nicht. Der Parameter `all` ist entfallen.

**Drei Rollen, drei Farben** (`markTokens()` nimmt jetzt eine dritte Gruppe):
- gelernte Vokabel (kommt aus der Satzvorlage, zuverlässig) → pink, Klasse `slot`
- selbst zu übersetzen (sicher zugeordnet) → weiß mit hellem Unterstrich, neue Klasse `ask`
- geschenkt (sicher zugeordnet) → lila, Klasse `gv`; geschenkt schlägt immer die anderen beiden

Passend zur Farbregel aus Version 109 ist der deutsche Satz damit nicht mehr pink; pink bleibt der Lernsprache und der gelernten Vokabel vorbehalten.

**Geprüft:** Beide gemeldeten Sätze sind korrekt (siehe v111_preview.png), dazu die ersten 39 Satzpaare des Englischkurses stichprobenartig. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 112 – „Heute geschafft" passt jetzt in eine Zeile
- Der Text im Erledigt-Zustand der Daily-Kachel heißt statt „Für heute geschafft." nur noch **„Heute geschafft"** (Englisch: „Done for today"). Vorher füllte er bei 24 px fast die ganze Breite, und das „?" rutschte allein in die nächste Zeile.
- Als Absicherung schrumpft die Überschrift auf schmalen Geräten mit: `font-size:clamp(20px,6.2vw,24px)`, dazu `text-wrap:nowrap`, damit Text und „?" zusammenbleiben.
- Geprüft bei 393, 375 und 320 px Breite: eine Zeile, Schriftgröße 24 / 23,25 / 20 px (v112_preview.png).
- Tests 2–5 grün (zwei Tests prüfen den Text und wurden angepasst). Nicht auf einem echten iPhone getestet.

## Version 113 – Reihenfolge-Modul: richtige Markierung und Greifpunkte
**Markierung (`glPrompt`, Nachbesserung zu Version 111)**
- Version 111 markierte nur, was `alignOf()` sicher zuordnen konnte. Im Reihenfolge-Modul gibt es aber nie geschenkte Wörter, dort muss man immer den ganzen Satz bauen – trotzdem waren nur einzelne Wörter markiert („Das **Hotel** ist *teuer*."). Die Markierung zeigte damit nur, wo die Zuordnung geklappt hatte, also eine interne Information ohne Wert.
- Jetzt wird von den geschenkten Wörtern aus gerechnet, denn das sind wenige oder gar keine:
  - **keine geschenkten Wörter** → der ganze Satz ist gesucht und wird pink unterstrichen (Klasse `slot`);
  - **alle geschenkten Wörter sicher zugeordnet** → alles Übrige ist gesucht und wird pink; die geschenkten bleiben einfach weiß ohne Unterstrich, wie in den anderen Modulen;
  - **ein geschenktes Wort nicht zuordenbar** → nur die gelernte Vokabel wird markiert, statt etwas Falsches zu behaupten.
- Die weiße Zusatzfarbe `ask` aus Version 111 ist damit wieder entfallen.

**Greifpunkte und Wackeln**
- Jede bewegliche Kachel hat links ein Greifpunkt-Muster (`.grip`, zwei Punktreihen aus einem CSS-Verlauf, keine Grafikdatei). Feste Kacheln haben es nicht, der Unterschied ist sofort sichtbar.
- Die erste bewegliche Kachel wackelt beim Erscheinen zweimal kurz (`.otile.wig`, 0,7 s, startet nach 0,35 s) und hört auf, sobald man sie anfasst. Bei „Bewegung reduzieren" im System entfällt das Wackeln.

Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 114 – Offener Run: „Weiterspielen"
Bricht man eine Round mit dem X ab oder verlässt die App, war der Fortschritt bisher weg. Jetzt wird der laufende Run gespeichert und lässt sich fortsetzen.

**Speichern (`saveRun` in `rounds.js`)**
- Vor jeder Karte wird ein Schnappschuss nach `state.run` geschrieben: Lernsprache, Art (daily/survival), Playmode, die Stelle im Run, die Wörter als Schlüsselliste, dazu Leben, Punkte, Serie, bereits gewertete Wörter, Reparatur-Merker und Rekord.
- Wörter stehen als Schlüssel drin, nicht als Objekte. Beim Laden prüft `openRun()`, ob die Lernsprache passt und alle Wörter noch existieren; sonst gilt der Run als ungültig und verschwindet stillschweigend.
- Gelöscht wird der Schnappschuss am Ende der Round (`showEnd`, `showSurvivalEnd`) und beim bewussten Neustart.
- **Grenze:** Die angefangene Karte beginnt beim Fortsetzen von vorn. Halb gesetzte Kacheln und angefangene Eingaben lassen sich nicht sinnvoll wiederherstellen; alles davor bleibt erhalten.

**Fortsetzen**
- **Gamemodes:** ganz oben eine Kachel im Stil der Random-Kachel, aber grün-türkis und mit Play-Symbol statt Würfel. Text: „WEITERSPIELEN", darunter Playmode, Punktestand, verbleibende Wörter und Leben. Ohne offenen Survival-Run erscheint die Kachel gar nicht.
- **Startscreen:** Bei einer offenen Daily Round heißt der Knopf „Weiterspielen" statt „Play now" und setzt fort, statt neu zu starten.

**Rückfrage beim Neustart (`askDiscard`)**
- Startet man eine Round, während ein Run offen ist, erscheint ein kleines Fenster: „Offener Run: Survival / Wenn du neu startest, ist der alte Run weg." mit „Trotzdem neu starten", „Weiterspielen" und „Abbrechen".
- Das verhindert, dass ein guter Survival-Score aus Versehen verloren geht. Beim Fortsetzen über die Kachel oder den Startscreen kommt keine Rückfrage.

**Gültigkeit:** Der Run bleibt, bis er beendet oder verworfen wird – auch über Tage hinweg.

**Tests:** Neuer Abschnitt R1–R11 in Test 2 (Speichern, Fortsetzen mit Punkten/Leben/Stelle, Rückfrage, Verwerfen, Daily Round, Löschen am Ende). Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 115 – Herzen im Tipp-Modul und vollständigere Markierung
**Herzen (`modules/typing.js`)**
- Die Lebensanzeige stand als einziges Modul unter dem Prüfen-Knopf statt oben unter der Kopfzeile. Sobald die Tastatur aufging, war sie aus dem Bild. Sie steht jetzt wie überall direkt nach der Kicker-Zeile.

**Markierung: Teilmarkierung statt Rückzug auf die Vokabel (`glPrompt`)**
- Lässt sich ein geschenktes Wort nicht zuordnen, wurde seit Version 113 nur die gelernte Vokabel markiert. Bei „Mein Nachbar ist sehr nett." (geschenkt: `kind`) blieb so nur „Nachbar" übrig.
- Jetzt wird in diesem Fall alles markiert, was sicher zu einer gesuchten Kachel gehört; nur die unklaren Wörter bleiben neutral. Dasselbe Beispiel: „**Mein Nachbar ist sehr** nett." – vier von vier gesuchten Wörtern, und „nett" bleibt korrekt unmarkiert.
- Ein sicher erkanntes geschenktes Wort wird nie markiert; die Regel „nie etwas Falsches behaupten" gilt weiter.

**Hilfswörterbuch (`alexBuild`, Tabelle `SUP`)**
- Wörter wie `is`, `kind`, `the`, `very`, `because` sind keine Vokabeln des Kurses und standen deshalb in keiner Zuordnungstabelle, obwohl sie ständig in Sätzen vorkommen. Die bestehende Hilfstabelle für Pronomen und Präpositionen ist auf rund 90 Einträge erweitert worden (Hilfsverben, Artikel, Frage- und Zeitwörter, häufige Adjektive), jeweils mit den gebeugten deutschen Formen.
- Wirkung auf den Englischkurs (661 Bausteine-Sätze „ins Englische"): unklare Fälle von 100 auf 70 gesunken, und von den gesuchten Wörtern sind jetzt 677 von 730 sicher zuordenbar statt 514. Die Tabelle verbessert auch die Hervorhebungen in den anderen Modulen.

Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 116 – Artikel bei allen deutschen Substantiven
Vorarbeit für den Deutschkurs, hilft aber schon jetzt im Englischkurs.

- **349 Glossen** haben einen Artikel bekommen: `neighbor = der Nachbar`, `water = das Wasser`, `street = die Straße`. Die Zuordnung steht in `data/artikel.py` (344 Einträge), angewendet auf `data/en/*.txt`; `lang_en.js` ist neu erzeugt. Eine Sicherung der alten Dateien liegt in `data/en.bak/`.
- **Bewusst ohne Artikel:** Wochentage, Monate, „Sie", „Prost" und „Einkaufen" (22 Stellen).
- **Tippen bleibt unverändert:** `normDe()` entfernt einen führenden Artikel schon immer, „Nachbar" wird also weiterhin akzeptiert.
- **Satzsuche (`wordSpan`):** Ein führender Artikel wird beim Suchen im Satz übersprungen, sonst fände „der Nachbar" das „Nachbar" in „Mein Nachbar ist sehr nett." nicht mehr.
- **Zuordnungstabelle (`alexBuild`):** Jede Glosse wird doppelt eingetragen, mit und ohne Artikel, damit die Hervorhebungen weiter greifen.
- **Test R8** (Reihenfolge) war bisher zufallsabhängig: Ein einzelner Zug kann die Kacheln versehentlich korrekt sortieren. Der Test schiebt jetzt so lange, bis die Reihenfolge wirklich falsch ist.

Tests 2–5 grün. Nicht auf einem echten iPhone getestet. Als Nächstes der Deutschkurs selbst.

## Version 117 – Deutsch als Lernsprache
Der Deutschkurs entsteht durch Umkehrung des Englischkurses, ohne neue Inhalte zu schreiben.

**Erzeugung (`data/make_de.py` → `lang_de.js`)**
- Aus `englisches Wort = deutsche Glosse | englischer Satz | [deutscher] Satz` wird `deutsche Glosse = englisches Wort | deutscher Satz | englischer Satz mit [Klammer]`. Die Klammer um das englische Wort setzt das Skript selbst.
- **655 Wörter, 655 Sätze, 20 Kategorien.** 10 Einträge entfallen, weil ihre deutsche Glosse schon vergeben ist (`thanks`, `they`, `walk`, `good`, `light`, `ice`, `card`, `before`, `too`, `bless you`).
- Die Form ohne Artikel kommt als Schreibvariante dazu: „der Nachbar" wird getippt auch als „Nachbar" akzeptiert (358 Wörter mit Varianten).

**Einbindung in die App**
- `needsEn:true` – der Deutschkurs ist nur sichtbar, wenn die App auf Englisch steht, spiegelbildlich zum Englischkurs mit `needsDe`. Die Sprachauswahl und die Prüfung beim Start berücksichtigen beides.
- `DE_SENT_RAW` wird wie der Englischkurs in `SENT` eingelesen, mit Vorsatz `de:`.
- **Schreibweise:** `fold()` schreibt jetzt ä/ö/ü/ß als ae/oe/ue/ss aus. Vorher fiel „ß" beim Vergleich einfach weg („Straße" → „strae"), „Strasse" und „Straße" gelten nun als gleich.
- **Wortformen:** `alexStems()` hat einen deutschen Zweig bekommen (Endungen -en/-er/-es/-em/-e/-n/-s, ge…t). Vorher wären für Deutsch die indonesischen Regeln gelaufen.
- **Funktionswörter (`GLUE_DE`):** Artikel, Pronomen, Hilfsverben und Präpositionen gelten im Deutschkurs als bekannt. Sie sind keine Vokabeln, stehen aber in fast jedem Satz; ohne sie wären Lückensatz, Auswahl und Reihenfolge kaum verfügbar. Wirkung: Bausteine 568 → 638, Auswahl 194 → 265, Walzen 309 → 444, Reihenfolge 161 → 231 von 655 Wörtern.
- **Fehler nebenbei gefunden:** Die Richtungsangabe hieß im Deutschkurs „ins Indonesische", weil `toIdl()` nur zwei Sprachen kannte. Jetzt „ins Deutsche" / „into German".

**Geprüft:** Alle 655 Wörter in allen acht Modulen gerendert, keine Fehler. Fünf Tagesrunden am Stück durchgespielt, keine JavaScript-Fehler. Tests 2–5 (Indonesisch und Englisch) grün. Nicht auf einem echten iPhone getestet.

**Offen:** Die deutschen Sätze sind Übersetzungen für Deutschsprachige, keine Lehrsätze für Deutschlerner. Fälle und Pluralformen werden nicht eigens geübt.

## Version 118 – Die Wort-Zuordnung steht jetzt in den Daten
**Das Problem.** Die App hat zur Laufzeit geraten, welches Wort im Satz welchem Wort in der Übersetzung entspricht: Kurswörterbuch, Hilfsliste, Endungsregeln, Ähnlichkeitsmaß und zuletzt sogar die Position im Satz. Maschinelle Wortzuordnung zwischen zwei Sprachen ist ein echtes Forschungsproblem, keine Fleißarbeit – jede weitere Regel hat nur verschoben, wo es schiefging. Bei Deutsch (Beugung, Zusammensetzungen, freie Wortstellung) war es am schlimmsten.

**Die Lösung.** Die Zuordnung wird einmal offline berechnet, streng geprüft und als Tabelle ausgeliefert. Zur Laufzeit wird nur noch nachgeschlagen.

**Datenformat (`align.js`, erzeugt aus `data/align/`)**
- Je Satzpaar zwei Zahlenreihen, eine pro Satz, eine Zahl je Wort. Gleiche Zahl = einander entsprechende Wörter, 0 = keine Entsprechung. Mehrere Wörter dürfen dieselbe Zahl tragen („nach Hause gehen" ↔ „pulang").
- Schlüssel: `<Wortschlüssel>:<Sprache der Übersetzung>`, zum Beispiel `en:neighbor:de`.
- **1969 Satzpaare** insgesamt (Indonesisch↔Englisch 652, Indonesisch↔Deutsch 652, Englisch↔Deutsch 665). Der Deutschkurs nutzt die englisch-deutschen Paare seitenverkehrt mit.

**Erzeugung (`data/align/build.py`)**
- Wörterbuch aus den Kursdaten selbst, dazu eine gepflegte Liste von Funktionswörtern je Sprachpaar (`data/align/lex.py`).
- Zuordnung gierig nach Trefferqualität, Überkreuzungen erlaubt („Ich esse jeden Tag einen Apfel" ↔ „I eat an apple every day") und mehrteilige Entsprechungen („habe … gekauft" ↔ „beli").
- **Strenge Prüfung:** Bleibt ein Wort ohne Entsprechung, das kein erlaubtes Füllwort ist (Artikel, Hilfsverb, Partikel), gilt das Paar als offen und kommt nicht in die Tabelle. Aktuell **1113 von 1969 geprüft (57 %)**, daraus 1520 Einträge.

**Verhalten in der App**
- Mit geprüfter Zuordnung: exakt, weil nur nachgeschlagen wird.
- Ohne: Es wird nur die gelernte Vokabel markiert, die steht als Klammer in den Daten.
- Sind gar keine Wörter geschenkt (Reihenfolge-Modul, viele Bausteine-Aufgaben), wird der ganze Satz markiert – das ist ohne jede Zuordnung richtig.
- **Damit kann keine Markierung mehr falsch sein.** Sie kann unvollständig sein, und mit jeder geprüften Charge wird sie vollständiger.

**Entfernt:** `alignOf`, `alexBuild`, `alexOpts`, `alexStems`, `fzMatch` und die Funktionswortlisten im Walzen-Modul – rund 150 Zeilen Rate-Logik.

**Geprüft:** Stichprobe von 22 Zuordnungen von Hand kontrolliert, alle korrekt. Markierung vorhanden bei 542 von 661 Bausteine-Paaren (Englisch), 463 von 638 (Deutsch), 548 von 672 (Indonesisch). Fünf Tagesrunden im Deutschkurs ohne Fehler. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

**Nächster Schritt:** Die 856 offenen Satzpaare in Blöcken durchgehen; ich lege dir die unsicheren Fälle vor.

## Version 119 – Zuordnung Englisch–Deutsch ausgebaut
- Das Hilfswörterbuch (`data/align/lex.py`) ist um rund 120 Einträge gewachsen: gebeugte Verbformen (trägt, liest, isst, öffnet, kostet), häufige Substantive (Kinder, Englisch, Musik, Geburtstag, Damen, Herren, Einwohner), Präpositionen in ihren tatsächlichen Übersetzungen (for → zum, at → nachts, to → in) und feste Wendungen (there are → es gibt, again → noch einmal, good luck → viel Glück).
- Der deutsche Wortstamm-Zerleger erkennt jetzt auch Verbendungen (-t, -st, -te, -ten), das Vorsilben-ge und nimmt den Umlaut zurück (trägt → tragt → trag).
- **Englisch ↔ Deutsch: 512 von 665 Paaren geprüft (77 %)**, vorher 414. Insgesamt 1246 von 1969 (63 %), daraus 1750 Einträge in `align.js`.
- Indonesisch bleibt vorerst, wie es ist (auf Wunsch: Vito prüft nur Englisch und Deutsch).
- Die 153 offenen englisch-deutschen Paare stehen in `data/align/review_en_de.txt` zum Gegenlesen.
- Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 120 – Sprachauswahl mit Bestätigung
Betrifft beide Startscreens: „Sprache / Language" (App-Sprache) und „Welche Sprache lernst du?" (Lernsprache).

- **Größere Abstände:** Zwischen den Zeilen jetzt 14 px Abstand, Zeilen etwas höher (18 px Polsterung), Rand 2 px.
- **Bestätigen statt sofort auswählen:** Ein Tipp wählt die Sprache nur vor – pinker Rand, zarter pinker Hintergrund und ein Häkchen rechts (`aria-pressed`). Übernommen wird sie erst mit dem Knopf „Weiter / Continue" bzw. „Weiter".
- **Keine Vorauswahl:** Der Weiter-Knopf ist gesperrt, bis man eine Sprache antippt. So trifft man bewusst eine Entscheidung und bekommt nicht versehentlich den ersten Eintrag.
- Technik: gemeinsame Hilfsfunktion `bindPick(selektor, schlüssel, knopf, fertig)` für beide Seiten. Die Testläufe klicken nach der Auswahl zusätzlich den Weiter-Knopf (`#uigo` / `#langgo`).
- Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 121 – Sprachauswahl: zwei Korrekturen
- **Doppelte Markierung behoben:** Die anfangs vorgeschlagene Sprache (nach Handy-Sprache, Klasse `sug`) behielt ihren Rand, auch wenn man eine andere antippte. Jetzt wird beim Antippen der `sug`-Hinweis von allen Zeilen entfernt; markiert ist nur noch die tatsächlich gewählte (`aria-pressed`).
- **Dewis Spruch wechselt mit:** Tippt man auf dem App-Sprach-Screen eine Sprache an, startet Dewis Sprechblase neu in genau dieser Sprache (`previewUiMascot`). So hört und sieht man die Sprache, bevor man mit „Weiter" bestätigt. Die App-Sprache selbst wird erst mit „Weiter" gesetzt; die Vorschau ändert `state.ui` nicht.
- Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 122 – Module oben ausgerichtet, Ergebnis-Screen ganzflächig antippbar
**Nach oben gerückt:** Die Modul-Inhalte waren vertikal zentriert (`justify-content:center`), seit die unsichtbare Kicker-Zeile keinen Platz mehr braucht, entstand oben ein toter Streifen. Jetzt oben ausgerichtet (`flex-start`, 8 px Abstand). Die Aufgabe beginnt direkt unter der Fortschrittsleiste, das untere Drittel bleibt für den Daumen frei.

**Tippen zum Fortfahren:** Auf einem Ergebnis-Screen führt ein Tipp irgendwo weiter, nicht mehr nur der „Weiter"-Knopf. Umgesetzt als ein einziger Handler am Sheet, der auslöst, wenn ein `.res`-Ergebnisblock und ein aktiver Knopf (`#next`/`#nx`) da sind. Echte Bedienelemente (Knöpfe, Eingaben, das „?") lösen selbst aus, daher kein Doppelsprung. Die Einführung rendert kein `.res` und bleibt unberührt. Der „Weiter"-Knopf bleibt als klare Handlungsaufforderung stehen; ein eigener Hinweis ist auf Wunsch nicht dabei.

**Zu Vitos Vorschlag (nur rechter Rand, leuchtend):** verworfen zugunsten der ganzen Fläche – größeres Ziel (Fitts), keine Verwechslung mit einer Wischgeste, passendes Genre-Muster (Duolingo).

**Fehler beim Einbau:** Der Handler stand zunächst vor der Definition von `sheet` und wurde durch das try/catch stillschweigend verschluckt. Jetzt direkt nach `const … sheet=$('#sheet')`.

**Nicht geändert (so entschieden):** kein Hinweis-Pfeil/-Text; das Tippen gilt nur für die Ergebnis-Screens der Module, nicht für die Einführung. Die End-Screens der Daily Round (eigener Ablauf) behalten ihre Knöpfe.

Geprüft: Hintergrund-Tipp führt auf der Frage nicht weiter, auf dem Ergebnis schon; direkter Knopf-Klick genau ein Schritt. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 123 – Herzen in der Kopfzeile, Teilfüllung und zwei große Einblendungen
**Kopfzeile im Survival:** Herzen und Score stehen jetzt auf einer Höhe – Herzen links, „SCORE" mit Zahl rechts (`.scrow` als Flex-Zeile mit `space-between`, neue `.scline` für Label und Zahl). Die Herzen sind damit aus dem Modul-Inhalt in die Kopfzeile gewandert; `roundLives()` liefert nur noch einen leeren String, die Aufrufe in den Modulen bleiben wirkungslos stehen.

**Teilfüllung der Herzen:** Das nächste leere Herz füllt sich von unten nach oben, je nach Fortschritt zur Regeneration (8 richtige in Folge = ein Herz zurück). Umgesetzt mit einem `clipPath`-Rechteck über einer zweiten Herz-Kontur (`hearts(n,g,p)`, `healProg()`); bei jeder Antwort aktualisiert `setLives()` den Stand mit.

**Zwei große Einblendungen, je eigener Charakter** (gemeinsame Hülle `moment()`, hängt am `body`, ein Tipp schließt):
- **Herz zurück** (`heartMoment`, Survival): großes rosa Herz, Aufploppen mit Herzschlag, pulsierender rosa Schein, Funkenflug, „+1 · HERZ ZURÜCK · 8 richtige in Folge". Erscheint 420 ms nach der Antwort über dem Ergebnis.
- **Serie** (`streakMoment`, Ende der Daily Round): die Pixel-Flamme steigt von unten auf, warmer Schein, aufsteigende Funken, darunter die Zahl groß und „Tage in Folge" plus „Serie verlängert!".

**Ablauf am Ende der Daily Round:** Ergebnis → Tipp auf „Weiter" → große Serien-Einblendung → ein Tipp → Startscreen. Der frühere zweite Sheet-Screen (`endStreak`) und das automatische Schließen nach 2,8 s sind entfallen.

**Technik:** Die Einblendungen liegen am `body` und nicht im Sheet, damit der Flächen-Tipp der Ergebnis-Screens (Version 122) nicht mitfeuert. Im Testmodus schließen sie ohne Ausblend-Verzögerung. Bei „Bewegung reduzieren" sind alle Animationen aus. Zwei Testläufe klicken jetzt die Einblendung selbst statt eines Knopfes darin.

Tests 2–5 grün. Nicht auf einem echten iPhone getestet.

## Version 124

**Fehler behoben:** Die Einblendungen (Herz, Serie) saßen links statt in der Bildschirmmitte. Ursache: Das Grid des Overlays hatte eine Spalte nur so breit wie der Inhalt und startete links. Jetzt eine volle Spalte (`grid-template-columns:minmax(0,100%)`), gemessen: Flamme, Zahl und Texte liegen exakt auf der Mitte.

**Level-up der Serien-Zahl:** Bei gewachsener Serie rutscht die alte Zahl nach oben weg, die neue springt von unten herein (Überschwinger), leuchtet hell auf, dazu ein Lichtring und ein Funkenschub genau beim Einrasten (ca. 0,9 s). Bei Tag 1 oder ohne Wachstum bleibt die Zahl statisch.

**Meilensteine** (7, 14, 30, 60, jede 100): Klasse `ms`, pulsierender Glanz an der Zahl, Zeile „Meilenstein!", mehr Funken (90 statt 46), längerer Sound, stärkere Haptik.

**Neue Sounds** (`SFX`): `heartback` (zwei weiche Herzschläge, danach Glitzer; ersetzt `gems`), `streakup` (aufsteigende Glockentöne, heller Akkord beim Einrasten), `milestone` (Fanfare mit Glitzer). Die Zahl rastet im Takt zum Akkord ein. Bei „Bewegung reduzieren" ist nur die neue Zahl sichtbar.

Tests 2–5 grün. Nicht auf einem echten iPhone getestet (Ton, Haptik).

## Version 125

**Neues-Wort-Screen (Takt 1 der Einführung) neu aufgebaut:** zentriert und in ruhigen Schritten statt alles auf einmal.
1. Das Wort poppt groß in die Bildschirmmitte (Überschwinger, kurzer rosa Lichtschein, leises Glocken-Pling `SFX.wordin`). Darunter nur der Lautsprecher-Knopf.
2. Erster Tipp: die Übersetzung blendet sich unter dem Wort ein.
3. Zweiter Tipp: weiter zu „Erkennst du es wieder?".

**Entfernt:** Dewi samt Sprechblase, Kategorie-Label, „Neues Wort"-Überschrift, zweiter Lautsprecher, Textzeile „Tippe das Wort an". Als Tipp-Hinweis bleibt nur ein kleiner pulsierender Punkt unten. Ein Tipp irgendwo auf dem Screen genügt (Lautsprecher spielt nur die Aussprache).

**Takt 2 und 3** (`.introc`): Überschrift, Wort und Satz jetzt mittig ausgerichtet, damit die Folge einheitlich wirkt.

**Tests:** In den Tests (`__introMs=0`) springt ein Tipp direkt zu Takt 2. Test 3 prüft jetzt „zentriertes Wort, ohne Dewi". Tests 2–5 grün. Bei „Bewegung reduzieren" ohne Animation. Nicht auf einem echten iPhone getestet.

## Version 126

**Endscreens als Bühne:** Der Ergebnis-Screen der Daily Round und das Survival-Ende laufen jetzt als zentrierte, zeitlich gestaffelte Animation (wie die Serien-Einblendung). Ein Tipp auf die Bühne überspringt den Ablauf bis zum Endzustand, der Knopf erscheint am Ende.

**Daily Round:** „x von y" zählt von 0 hoch (Tick-Ton mit steigender Tonhöhe) und rastet mit Wucht, Akkord und Konfetti ein (Konfetti nur bei perfekter Runde). Dann „Module geschafft", die Diamanten-Pille und die Einzelposten (Round, Perfekt, Wörter, Serie-Bonus) fliegen nacheinander ein, die Summe zählt bei jedem Posten mit hoch. Zum Schluss Dewi mit Spruch, Fehlerlisten-Änderungen und „Weiter".

**Survival:** Der Score zählt von 0 hoch (Dauer 0,9–2,3 s je nach Punkten). Bei neuem Rekord wird die Zahl golden und pulsiert, dazu Fanfare (`milestone`), 80 Funken und „Neuer Rekord! Vorher: …". Ohne Rekord rastet die Zahl ruhig ein und es steht der Abstand zum Rekord da. Danach Diamanten, Dewi, Knöpfe.

**Technik:** Helfer `stageSeq()` (Ablaufplan mit Überspringen), `countTo()` (Hochzählen), `stageTap()`. Neue Sounds `counttick`, `lockin`, `gemitem`. In den Tests (`__test`) steht alles sofort im Endzustand. Bei „Bewegung reduzieren" ohne Hochzählen. Tests 2–5 grün. Nicht auf einem echten iPhone getestet (Ton, Haptik, Timing).

## Version 127

**Endscreen der Daily Round entschlackt:** Entfernt sind die Aufschlüsselung der Diamanten (Round, Perfekt, Wörter, Serien-Bonus), der Satz zu grauem Stempel und Holo sowie die Listen „Von der Fehlerliste gestrichen" und „Neu auf der Fehlerliste". Übrig: „x von y" (zählt hoch), „Module geschafft", die Diamantensumme (zählt hoch), Dewi, „Weiter".

**„Fehlerliste" aus der Oberfläche genommen:** Sie ist nur noch im Vokabelheft-Tab sichtbar (Filter „Fehlerliste" und Marke „Fehlerliste ×n" an den Wörtern). Geändert wurden der Zusatz-Button der Daily Round (jetzt „Noch eine Runde"), die Rückmeldung nach einer Antwort („Das Wort kommt bald wieder." / „…kommt gleich nochmal dran." / „Geschafft. Das Wort kommt morgen wieder (Stufe 1).") und die Fortschrittsanzeige auf dem Start (Stufe 0 statt „Fehlerliste"). Dewis Sprüche zur Liste bleiben bewusst unverändert (Entscheidung des Nutzers).

**Neues Wort, Beispielsatz:** Die Übersetzung markiert das gemeinte Wort jetzt pink unterstrichen wie in den Modulen (vorher nur fett in fast gleicher Farbe). Primär nach der Klammer der Vorlage (bei allen Beispielsätzen aller vier Kurspaarungen vorhanden), ersatzweise nach der geprüften Zuordnung. Geprüft: Die Zuordnung allein markiert zu breit („Mein Name ist" statt „Name") und bei deutschen Artikeln gar nichts, deshalb steht die Klammer vorn.

Tests 2–5 grün (Test 2 und 4 an den neuen Wortlaut angepasst). Nicht auf einem echten iPhone getestet.

## Version 128

**Serien-Einblendung nur beim ersten Spielen des Tages:** Spielt man die Daily Round am selben Tag erneut (z. B. „Noch eine Runde"), endet sie nach dem Ergebnis-Screen. Der Knopf heißt dann „Fertig" und schließt direkt zum Startscreen, ohne Serien-Einblendung. Technik: `showEnd()` reicht `first:firstToday` an `endResult(E)` weiter; `#endnext` öffnet `streakMoment(E)` nur bei `E.first`. Geprüft im Browser: Durchgang 1 „Weiter" mit Serie, Durchgang 2 „Fertig" ohne Serie. Tests 2–5 grün. Nicht auf einem echten iPhone getestet.


## Version 129 – Hintergrundmusik „Holo-Aufstieg“

> **Hintergrundmusik „Holo-Aufstieg“** (Okt. 2026, Sound: Claudio, Einbau: Marlin)
> Endloser Web-Audio-Loop (D-Moll, 112 BPM, 16 Takte) aus `dewi-music.js`. Er läuft überall durchgehend und startet nach der ersten Nutzer-Geste. Im Reels-Modul kommt ein Arpeggio dazu (`DewiMusic.setReelsMode`). In den Einstellungen gibt es Musik an/aus und einen eigenen Musik-Regler, getrennt von den Effekt-Sounds. Die Musik pausiert automatisch, wenn die App im Hintergrund ist.

**Wichtigster Fund beim Einbau:** dewi. hatte schon ein vollständiges Musiksystem (`music.js`, seit Version 43/83/103: standardmäßig an, Start bei der ersten Berührung, Einstellungsblock mit An/Aus, Regler und Soundtrack-Wahl, ein gemeinsamer `AudioContext` in `SND.ctx`, Pausieren im Hintergrund). Holo-Aufstieg ist deshalb als **dritter Soundtrack** neben Lo-Fi und Arcade eingebaut, nicht als zweites System.

**Entscheidungen (Vito):** dritter Soundtrack; Claudios Datei bleibt klanglich unverändert und wird über ein Verbindungsstück gesteuert; im Reels-Modul läuft bei gewähltem Holo-Aufstieg das Arpeggio mit, bei Lo-Fi und Arcade bleibt der Synthwave wie bisher; Holo-Aufstieg ist für alle Stände einmalig voreingestellt (Merker `holoDef`, danach bleibt die eigene Wahl); Absenken (Ducking) wie bei den anderen Soundtracks.

**Technik**
- `dewi-music.js` ist im Build vor `music.js` eingebunden. Einzige Änderung an Claudios Datei: `load()`/`save()` ganz oben speichern nichts mehr (von Claudio selbst so vorgesehen). Gespeichert wird nur in dewi.s `state` (`music`, `mvol`, `mtrack`).
- Verbindungsstück in `music.js` (`HOLO`, `holoWant`, `holoRun`, `holoStop`): übergibt `SND.ctx` an `DewiMusic.unlock()`, startet/stoppt über `setEnabled()`, reicht `state.mvol/100` an `setVolume()` weiter, startet erst, wenn der Kontext nach der ersten Berührung läuft. Läuft alle 90 ms im vorhandenen `musTick()`, schaltet aber nur bei Änderungen.
- **Reels-Arpeggio** wird am Bildschirm erkannt (`.smain.rl`), nicht an einzelnen Ein- und Ausstiegsstellen. Es geht dadurch bei jedem Verlassen (Ende, Abbruch, Zurück) von selbst wieder aus.
- **Ducking** über `DewiMusic.duck()`: Game Over im Survival (3 s), falsche Walze (0,8 s), verlorene Reels-Runde (2,5 s). Je Ereignis genau einmal.
- Hintergrund/Vordergrund regelt Claudios Modul selbst (pausiert, läuft an derselben Stelle weiter); das Verbindungsstück greift dann nicht ein.
- **Rückfall:** Schließt iOS den `AudioContext` (selten) oder wirft das Modul einen Fehler, kann es sich nicht neu aufbauen (`HOLO.failed`). dewi. spielt dann sofort Lo-Fi (in Reels Synthwave) bis zum nächsten Öffnen, statt still zu werden.
- Einstellungen: Soundtrack-Wahl mit drei Knöpfen (Lo-Fi, Arcade, Holo-Aufstieg / „Holo Ascent“, Klasse `.seg.three`), neuer Hinweistext, Lautstärke-Regler nur bei eingeschalteter Musik aktiv (`disabled`).
- Migration: `if(!state.holoDef){state.holoDef=1;state.mtrack='holo';}` in `migrate()`; `holoDef` bleibt beim Zurücksetzen der Lernstände erhalten.

**Tests:** Neuer Block H1–H19 in `test4.js` (Voreinstellung, Start über den vorhandenen Kontext, kein Neustart pro Takt, Reels an/aus, Ducking, Regler, Wechsel Holo ↔ Lo-Fi, Einstellungen mit drei Soundtracks, Regler-Sperre, Umstellung und Beibehalten der eigenen Wahl, Rückfall bei Modulfehler). Tests 2–5 grün. Zusätzlich in echtem Chromium mit dem echten Modul: Start nach dem ersten Tippen, `MUS.holo` an, Lautstärke 0,35 übernommen, Wechsel auf Lo-Fi.

**Nicht geprüfbar ohne iPhone:** Klang und Mischung, Lautstärkeverhältnis zu den Effekt-Sounds, Lautlos-Schalter, Sperrbildschirm und Anruf, der Loop-Übergang. Die Abnahme-Checkliste dazu steht in der Übergabe von Claudio (Abschnitt 5).

**Hinweise für Claudio (nicht von Marlin geändert)**
1. Lautstärke: dewi. gibt den Reglerwert 1:1 weiter (Standard 0,35, Claudios Standard war 0,45). Ist Holo-Aufstieg im Vergleich zu Lo-Fi und Arcade zu leise oder zu laut, wäre eine Anpassung des Pegels in `masterLevel()` oder `LV` Claudios Sache.
2. Das Modul baut sich nur einmal auf (`if (!ctx) build(...)`). Wird der `AudioContext` von iOS geschlossen, gibt es keinen Weg zum Neuaufbau. Eine kleine `rebuild()`- oder `reset()`-Funktion in der API würde den Rückfall auf Lo-Fi überflüssig machen.
3. `start()` setzt immer `step = 0`. Nach jedem Soundtrack-Wechsel oder Aus/An beginnt der Loop bei Takt 1 (nur Teil A, ohne Melodie). Gewollt?
4. Ob die Musik Dewis Tippgeräusch und die neuen Effekt-Sounds (Serien-Einblendung, Herz, Zählen) überdeckt, muss auf dem iPhone gehört werden. Falls ja: eine feste Absenkung im Mix (`LV`) oder gezieltes `duck()` bei den großen Einblendungen. Letzteres wäre in dewi. ein kleiner Einbau, braucht aber Vitos Okay.


## Version 130 – Umzug auf den PC und GitHub Pages

> **Umzug:** dewi. liegt jetzt in einem öffentlichen GitHub-Repository und wird lokal in VS Code mit Claude Code weiterentwickelt. Jeder Push auf `main` wird automatisch gebaut, getestet und auf GitHub Pages veröffentlicht.

**Entscheidungen (Vito):** Windows-PC mit VS Code, Git und Python; öffentliches Repository `dewi`; automatisch bauen und testen vor jeder Veröffentlichung; alle Dateien ins Repository (auch alte Sicherungen), außer den Konzeptbildern; Anmeldung in Claude Code mit dem Claude-Abo; Claude committet selbst, Push nur nach Vitos Freigabe.

**Wie hochgeladen:** Direkt aus der Cloud-Sitzung im Browser (GitHub-Verbindung + Claude-GitHub-App). Weiterarbeiten geht sowohl hier im Browser als auch lokal in VS Code; der gemeinsame Stand ist das Repository.

**Neu im Projekt**
- `tests/`: test2–test5 aus der Cloud-Sitzung, Pfad jetzt relativ (`path.join(__dirname,'..')`), `package.json` mit `npm test`, `package-lock.json` für gleiche Versionen überall.
- `.github/workflows/pages.yml`: Python 3.12 → `build.py` → Warnung, falls die hochgeladene `index.html` nicht frisch gebaut war → Node 22 + jsdom → test2–5 → nur `index.html` und `icon.png` werden veröffentlicht.
- `CLAUDE.md`: Arbeitsregeln (erst fragen, dann bauen; Ablauf nach jeder Änderung; Git-Regeln; Sprache und Berichtsstil).
- `.claude/settings.json`: Bauen, Testen, `git add` und `git commit` ohne Nachfrage erlaubt, `git push` fragt immer (gilt laut Claude-Code-Doku auch im Auto-Modus).
- `.gitignore` (node_modules, Cache), `.gitattributes` (Zeilenenden immer LF, damit Windows `build.py` und die Tests nicht stört).
- `ANLEITUNG-UMZUG.md`: Schritt-für-Schritt-Einrichtung.
- Agenten Nova und Marlin: Pfade auf den Repository-Ordner umgestellt.

**Warum Actions statt „Branch veröffentlichen“:** So wird nie eine ungetestete oder vergessene Version live, und auf der Seite landen nur die zwei Dateien, die die App braucht.

**Bekannt und so entschieden:** Die Text-Sicherung nimmt Diamanten (`gems`), Figuren (`char`, `chars`) und Musik-Einstellungen nicht mit. Beim Umzug starten die Diamanten deshalb bei 0. Vito hat entschieden, das so zu lassen.

**Nicht übernommen:** `concept/` (Konzeptbilder, für die App nicht nötig; Vito hat sie als `2a-`/`2b-dewi-konzept.zip` im Claude-Chat) und `out/dewi-projekt.zip` (alter Projekt-Schnappschuss vom 9. Okt.). Alles andere ist im Repository.

**App selbst unverändert.** Tests im neuen Ordner und in einer frischen Kopie wie in GitHub Actions grün. Nicht auf einem echten iPhone getestet; der Umzug selbst (GitHub, Pages, Spielstand übertragen) passiert erst auf Vitos PC.


## Version 131 – Lernlogik ohne Fehlerliste (Poker Phase 1, Etappe 1)

> **Die Fehlerliste ist weg.** Ein verlorenes Modul setzt das Wort auf Stufe 0, es ist morgen fällig und kommt im Review zuerst dran. Keine Reparatur-Stage, keine Sperre der Daily Round mehr. Grundlage: `konzept-poker-shop.md` (Nova, 16.10.2026), Abschnitt 1.

**Entscheidungen (Vito):** Plan in vier Etappen freigegeben (131 Lernlogik, 132 Chips, 133 Poker-Regeln, 134 Poker-Screens), veröffentlicht wird erst nach Etappe 4. Name im Vokabelheft „Wackelig“ (Stufe 0–1). Survival enthält jetzt auch Wörter auf Stufe 0. Sind mehr als 4 Wörter auf Stufe 0 fällig, kommen die am längsten wartenden zuerst. Für spätere Etappen schon entschieden: Serien-Bonus gilt auch auf Dewis Gratis-Blind; während der Hand ändern sich nur Kopfzeile und Poker-Leiste, die Module bleiben; Meilensteine an den Bonus-Stufen (7, 14, 30, 50, 100, 365); kleine Flamme im neuen Stil jetzt, große später; Diamant nur noch Zierde beim Royal Flush; Marlin entwirft alle neuen Sprüche, Vito prüft.

**Technik**
- `record()`: richtig = Stufe +1 (Stufe 0 → 1, morgen); verloren = `{l:0, d:morgen, n:n+1}`. Rückgabe `saved:true`, wenn ein Wort von Stufe 0 gerettet wurde („Gerettet!“, Dewi `lvl_saved`, Hinweis „Geschafft. Das Wort kommt morgen wieder (Stufe 1).“).
- `plan()` ohne `repair`: Vorrang für fällige Stufe-0-Wörter (`fallenWords()`, nach Fälligkeit sortiert), danach die bisherige Auswahl. `dailyCards()`, Kennzeile, Run-Speicher (`rf`, `cleared`) und `settleCard()` ohne Reparatur-Zweige.
- `listOf()`/`listWords()` entfallen, neu `isShaky()` und `fallenWords()`. Der Fehlerzähler liegt jetzt im Wort (`progress[k].n`); `bad_again` gilt für jedes Wort mit `n` ≥ 2.
- Migration in `migrate()` (siehe 6.3), wiederholbar und gefahrlos bei leerer Liste. `openRun()` verwirft Runs mit Reparatur-Karten.
- Hinweis nach verlorenem Modul: „Das Wort fällt auf Stufe 0 und kommt morgen wieder.“ (vorher „… kommt bald wieder.“).
- Startscreen: kein „Reparatur“ mehr, „Noch eine Runde“ erscheint, solange es neue Wörter gibt. Dewi-Spruch `home_list` heißt jetzt `home_fallen` (ab 4 Wörtern auf Stufe 0), Texte ohne Fehlerliste. `lvl_saved` umformuliert.
- Testbereich: die 1–3 „Fehlerwörter“ sind jetzt Wörter auf Stufe 0 (gestern fällig, mit Fehlerzähler).
- Doku: Kapitel 2a und 6 neu geschrieben.

**Neue Sprüche und Texte (Entwurf Marlin, bitte prüfen)**
- `home_fallen`: „{n} Wörter sind auf Stufe 0 gerutscht. Ich sag nix. Ich guck nur sehr laut.“ · „{n} Wörter wackeln. Ich hab sie im Blick. Und dich auch.“ · mit Name: „{who}, {n} Wörter auf Stufe 0. Ich sag nix. Ich starre nur.“ (EN entsprechend)
- `lvl_saved`: „Gerettet! Von Stufe 0 zurück ins Leben. Redemption Arc.“ · „Na endlich, das Wort steht wieder. Wurde auch Zeit.“

**Tests:** test2 Abschnitt D neu (Stufe 0 + morgen fällig + Zähler, grauer Stempel, keine Sperre, Vorrang im Review, keine Reparatur, Retten auf Stufe 1, Migration der alten Liste, Reihenfolge „am längsten wartend“, Survival mit Stufe 0, Vokabelheft-Filter und Marke); B4, C4, E4, F12 angepasst; test3 Spruchschlüssel `home_fallen`; test4 D9 (neuer Hinweistext) und V4 (Testbereich). Dabei gefunden und behoben: Beim allerersten Fehler eines neuen Wortes wäre der Fehlerzähler leer geblieben. Tests 2–5 grün.

**Nicht auf einem echten iPhone getestet.** Zu prüfen nach Etappe 4: Vokabelheft-Filter „Wackelig“, Spruch auf dem Startscreen, Übergang eines alten Spielstands mit Fehlerliste.


## Version 132 – Chips als Währung (Poker Phase 1, Etappe 2)

> **Aus Diamanten werden Chips.** Der Dewi-Chip (Novas Bauteil aus dem Design-Canvas „dewi. Poker-Screens“) ersetzt den Diamanten in der Pille, auf den Endscreens und im Reels-Regen. Alte Kontostände werden einmalig × 10 gerechnet. Grundlage: `konzept-poker-shop.md`, Abschnitte 0 und 4.

**Entscheidungen (Vito):** eigener Chip-Sound (Klackern statt Glitzer); die Pille ist bis zum Shop nur Anzeige (kein Knopf); der Chip in der Pille steht ruhig, alle paar Sekunden läuft ein Glanz darüber.

**Technik**
- Neue Datei `chips.js` ersetzt `gems.js`. Der Chip liegt einmal pro Variante (pink, gold, holo, grau, leer) als `<symbol>` in einer unsichtbaren Sammlung im Dokument (`chipSprite()` beim Start) und wird über `chipSvg(tone, klasse)` mit `<use>` eingesetzt. Verläufe und Gesichtsmaske gibt es nur einmal. CSS-Klasse `.dchip` (`.chip` war schon für Knöpfe vergeben).
- Zustand: `state.chips`, `state.chipShown`, `state.chipSurv`. Migration in `migrate()`: `chips = gems × 10`, `chipShown = gemShown × 10`, alte Felder werden gelöscht, Merker `chipV` (steht bewusst nicht in `defaults()`, sonst würde die Umrechnung übersprungen).
- Pille `#chippill`: ab 10.000 abgekürzt mit einer Nachkommastelle, abgerundet (`fmtChipShort`: 12,5K · 1,2M, Komma bei Deutsch, Punkt bei Englisch). Vorlesetext nennt die volle Zahl. Überall sonst volle Zahl (`fmtChip`).
- Survival: `chipSurvival(words)` = 5 pro Wort, höchstens 300 pro Tag, kein Rekord-Bonus mehr. Endscreen-Zeile `chipLine()`.
- Entfallen: `GEMV.daily/perfect/word`, `GEM_MILES` (Meilenstein-Auszahlungen), der Wort-Bonus nach jedem Modul, der 3D-Diamant (`GEM`, Canvas-Schleife). Der Endscreen der Daily Round kennt jetzt `E.chips` (ab Version 133 die Auszahlung der Pokerhand).
- Reels: `chipRain()` statt `diamondRain()` (pinke, goldene und Holo-Chips), Sound `chips`.
- Sound `chips`: fünf kurze Klacker (Rauschen + kurzer Rechteck-Klick + dumpfer Ton), wird beim Einfliegen in die Pille und auf Endscreens gespielt. Der Glitzer `gems` bleibt für spätere Holo- und Royal-Flush-Momente.
- Schrift Archivo (variabel, auch breit und kursiv) wird jetzt mitgeladen, für die Heldenzahlen ab Version 133/134.
- Texte: „sammle Chips“ in der Gamemodes-Erklärung, „{0} Chips“.

**Übergang bis Version 133:** Die Daily Round bringt keine Chips. Chips gibt es nur im Survival.

**Tests:** test4 neuer Block „Chips“ (C1–C8: Migration × 10 und nur einmal, Abkürzung, Survival-Grenze, Pille, Varianten, keine Diamanten mehr, Chipregen), M2 und E4/E6 angepasst; test2 B5b (keine Chips aus der Daily Round). Zusätzlich im echten Chromium über Pixelfarben geprüft (ohne Screenshot): Chip in der Pille 28 × 28 px, Gesicht und Rand in den richtigen Farben, alle fünf Varianten. Dabei gefunden und behoben: Zusammenstoß mit der vorhandenen Klasse `.chip`. Tests 2–5 grün.

**Nicht auf einem echten iPhone getestet:** Klang des Chip-Klackerns, Glanz in der Pille, Darstellung der Chips in Safari.


## Version 133 – Poker-Regeln (Poker Phase 1, Etappe 3)

> **Die Daily Round ist eine Pokerhand.** Vor jeder Hand wählt man Small Blind (100) oder Big Blind (300). Jedes geschaffte Modul hebt den Multiplikator um 1, alles geschafft verdoppelt ihn (Royal Flush). Am Ende zahlt das Haus (Einsatz + Serien-Bonus) × Multiplikator aus. Grundlage: `konzept-poker-shop.md`, Abschnitte 2 und 3. Die Screens sind noch ein Behelf, gestaltet wird in Version 134.

**Entscheidungen (Vito):** Der Serien-Bonus richtet sich nach der Serie **vor** der Hand (was die Flamme bei der Blind-Wahl zeigt). Royal Flush gilt immer, auch bei kleinen Händen. Ist das Konto leer und Dewi hat heute schon gerettet, spielt man **ohne Einsatz** weiter (Auszahlung 0), damit Lernen nie an Chips scheitert.

**Regeln (alle in `poker.js`)**
- Erste Daily Round des Tages: Small Blind zahlt Dewi; Big Blind freiwillig, voller Betrag selbst. „Noch eine Runde“: beide selbst. Reicht das Konto nicht für den Small Blind, zahlt ihn Dewi einmal am Tag (`daily().rescue`), danach Hand ohne Einsatz. Der eigene Einsatz wird beim Start abgebucht.
- Multiplikator ×0, +1 je geschafftem Modul. Verloren: Small bleibt stehen, Big −1 (nie unter 0). Das Kennenlernen zählt nicht.
- Royal Flush: alle Module geschafft → × 2. Auszahlung nur am Ende: `(Einsatz + Bonus) × Multiplikator`. Bonus = Einsatz × Prozent, gerundet.
- Serien-Bonus: 7 +10 %, 14 +20 %, 30 +30 %, 50 +40 %, 100 +50 %, 365 +100 % (`BONUS_STEPS`). Meilenstein-Moment genau an diesen Tagen (`STREAK_MILES`) mit „Serien-Bonus jetzt +X %“; 60 und jedes 100. ist kein Meilenstein mehr (außer 100).
- Offene Hand: X oder Schließen pausiert (wie der offene Run aus Version 114, jetzt mit `hand` und `date`). Eine pausierte Daily-Hand verfällt um Mitternacht samt Einsatz (`openRun`). Eine Hand, die gerade auf dem Bildschirm läuft, darf über Mitternacht zu Ende gespielt werden.
- Kein Verwerfen: „Play now“ und „Noch eine Runde“ setzen eine offene Hand fort; der Startscreen zeigt dann „Weiterspielen“. Survival-Start bei offener Hand fragt ohne „Trotzdem neu starten“. Survival selbst bleibt wie bisher.

**Behelf bis Version 134:** Blind-Wahl als kleines Fenster (`chooseBlind`), Zeile „Small Blind 100 · +10 % … ×3“ im Kopf der Round (`pokerRow`), auf dem Endscreen die Chip-Zeile und die Rechnung (`payoutLine`, z. B. „100 + 10 · ×5 · ×2 Royal Flush“, bei ×0 mit eigenem Einsatz „Einsatz weg“).

**Tests:** test2 neuer Block P (P1–P24): alle Rechenbeispiele aus dem Konzept (Small +900/+300/+200/+100, Big +2.700/+600/±0/−300, 30 Tage Big Royal Flush 3.900), Multiplikator-Grenzen, Bonus-Stufen, Meilensteine, wer zahlt (Dewi, selbst, Rettung, ohne Einsatz), Abbuchung, echte Hand mit ×0, Pausieren, kein Verwerfen, Verfallen um Mitternacht, Meilenstein an Tag 7, Bonus erst ab der nächsten Hand, Blind-Wahl-Fenster. B5b: erste Hand bringt 200 Chips. In allen Testdateien wählt `window.__autoBlind="small"` den Blind automatisch (nur mit `window.__test`). Tests 2–5 grün.

**Nicht auf einem echten iPhone getestet.** Kein eigener iPhone-Check nötig, die Screens kommen in Version 134.


## Version 134 – Poker-Screens: Blind-Wahl und Hand (Poker Phase 1, Etappe 4a)

> **Die Hand sieht jetzt aus wie im Konzept.** „Play now“ öffnet die Blind-Wahl als eigenen Screen: Dewi oben mit Spruch und „?“, in der Mitte „DEIN EINSATZ“ mit Bonus-Pille und zwei großen Dewi-Chips. Ein Tipp auf einen Chip, er gleitet weg, die Hand beginnt. Während der Hand zeigen Dewi-Chips im Kopf den Fortschritt, darunter Dewis Kopf und die Poker-Leiste mit dem goldenen Multiplikator. Grundlage: `konzept-poker-shop.md` Abschnitte 0 und 5, Design-Canvas „dewi. Poker-Screens“, Reihe „Version 2“ (Blind2, Hand2).

**Entscheidungen (Vito):** Etappe 4 in zwei Versionen (134 Blind-Wahl und Hand, 135 Auszahlung, Royal Flush, Startscreen). Blind-Wahl als ganzer Screen. Dewis Gesicht reagiert während der Hand auf jedes Modul (ohne Text). Auf den Ergebnis-Screens der Module entfällt während der Hand der kleine Dewi samt Spruch, weil oben schon ihr Kopf sitzt.

**Technik (neue Datei `pokerui.js`)**
- `showBlindStage(kind, o)`: Screen im Round-Blatt mit X (schließen ohne Einsatz), Chip-Pille (`chipPill('chippill2')`), Dewi-Zone (Kopf 76 px + Sprechblase mit Schreibmaschine), „DEIN EINSATZ“ + Bonus-Pille (kleine Flamme im neuen Stil, `FLAME_SM`), zwei Chip-Knöpfe (pink Small, gold Big; Schild GRATIS / RETTUNG / OHNE EINSATZ; Big ausgegraut ohne 300 Chips), leere Aktionszone (56 px). Tipp: Chip gleitet weg (0,42 s), Sound `chips`, dann `startRound`. Ersetzt das Behelfsfenster aus Version 133.
- `chipTrack()` im Kopf statt Fortschrittsbalken und Zähler: geschafft = Holo-Chip mit Schimmer, solange der Royal Flush möglich ist, sonst pink (Small) bzw. gold (Big); verloren = grau; aktuell = gestrichelt; offen = leerer Kreis. Das Ergebnis je Karte steht in `items[i].ok` und wird mit dem offenen Run gespeichert.
- `handZone()` = Dewi-Kopf (`h.face`, gesetzt in `handSettle`: überlegen, ab ×4 Dollar-Augen, solange Royal Flush drin; sonst überheblich; nach Fehler genervt) + `pkBar()` (Einsatz-Chip, Bonus, Multiplikator in Archivo 52 px kursiv, breit, gold). Das „?“ (`.dzq`, eigene Klasse, nicht `.qh`, weil daran die Modul-Hilfe hängt) tauscht die Leiste gegen Dewis Erklärung, passend zum Blind.
- Multiplikator-Animation einmal pro Karte (`c.pkAnim`): +1 springt hoch mit Chip-Klick (`chipclick`, Haptik), −1 rutscht runter (alte Zahl fällt weg, neue kommt von oben), verloren beim Small Blind blinkt die Zahl grau.
- Modul Reels: Dewi unter dem Automaten ist in der Hand ausgeblendet, ihr Gesicht oben übernimmt die Stimmung der Reels-Sprüche.
- Neue Sprüche `blind_dewi`, `blind_self`, `blind_rescue`, `blind_none` (DE/EN, siehe unten), Hilfetexte für Blind-Wahl und Hand.
- Survival unverändert (Balken, Score, Leben).

**Neue Sprüche (Entwurf Marlin, bitte prüfen)**
- Gratis: „Small Blind geht heute aufs Haus. Gewöhn dich nicht dran.“ · „Der Small Blind ist geschenkt. Der Big Blind ist Charakter.“
- Selbst zahlen: „Dein Geld, deine Entscheidung. Ich würde Big nehmen. Aber ich mach ja auch keine Fehler.“ · „Einsatz bitte. Das Haus wartet nicht gern.“
- Rettung: „Pleite? Süß. Den Small Blind übernehme ich. Einmal.“ · „Ich leih dir was. Zinsen zahlst du in Respekt.“
- Ohne Einsatz: „Keine Chips, keine Rettung mehr. Spiel trotzdem, für die Ehre.“ · „Heute spielst du um nichts. Lernen tust du trotzdem.“

**Tests:** test2 P23–P27 (Blind-Wahl-Screen, Dewi-Zone, „?“ hin und zurück, Start mit Abbuchung, Chips im Kopf, Erklärung je Blind) und neuer Block Q1–Q10 (gestrichelter aktueller Chip, Multiplikator springt, Holo-Chips, kein kleiner Dewi im Ergebnis, Animation nur einmal, Big rutscht runter, Chips werden gold/grau, Dewi genervt, Chips nach dem Fortsetzen, Small blinkt grau). Dabei gefunden und behoben: Das „?“ mit Klasse `.qh` löste die Modul-Hilfe aus. Tests 2–5 grün. Zusätzlich im echten Chromium gemessen (ohne Screenshot): Blind-Wahl und Hand passen auf 390 × 844 und 375 × 667 ohne Scrollen, Kopf und Poker-Leiste ohne Überlauf, Chips im Kopf je 40 px.

**Nicht auf einem echten iPhone getestet:** Wirkung von Archivo (offline im Test nicht geladen), Gleit- und Zahlen-Animationen, Chip-Klick und Haptik, Schimmer der Holo-Chips.


## Version 135 – Poker-Screens: Auszahlung, Royal Flush, Startscreen (Poker Phase 1, Etappe 4b)

> **Phase 1 ist fertig.** Das Ende der Hand ist jetzt eine eigene Bühne: Ergebnis-Chips fliegen ein, der Gewinn zählt als Heldenzahl hoch, darunter klein die Rechnung. Beim Royal Flush leuchtet „ROYAL FLUSH“ zwischen zwei Diamanten, Chips regnen und eine eigene Casino-Fanfare spielt. Bei ×0 rutscht der Einsatz-Chip zu Dewi, und es bleibt eine graue 0. Auf dem Startscreen zeigt eine offene Hand „Big Blind 300 · ×3 · verfällt um Mitternacht“, ab 21 Uhr stichelt Dewi. Grundlage: `konzept-poker-shop.md` Abschnitt 5, Design-Canvas „Auszahlung2“ und „Royal2“.

**Entscheidungen (Vito):** eigene Casino-Fanfare für den Royal Flush; bei ×0 gleicher Aufbau mit grauer 0, der Chip rutscht zu Dewi; Abend-Sticheln ab 21 Uhr (Konzept: ca. 20 Uhr).

**Technik (`pokerui.js`)**
- `payoutStage(E)` ersetzt für Pokerhände den Endscreen aus Version 126 (`endResult` bleibt nur für Runs von vor Version 133). Aufbau: Chip-Pille (zählt vom alten zum neuen Kontostand hoch, `chipShown` wird gleich gesetzt, damit der Startscreen nicht noch einmal Chips einfliegen lässt), Dewi-Zone (erst nur Kopf, am Ende Spruch, „?“ erklärt die Rechnung), Ergebnis-Chips (Holo beim Royal Flush, sonst pink/gold, verloren grau), Heldenzahl in Archivo 64 px mit Einsatz-Chip davor, Rechnung „300 + 🔥90 ×5 ×2“ (Multiplikator gold), Knopf „Weiter“ (erste Round, dann Serie) bzw. „Fertig“.
- Ablauf mit `stageSeq`/`countTo`: Chips einzeln (je 90 ms, Chip-Klick) → Heldenzahl → Rechnung → beim Royal Flush Titel, Aufblitzen des „×2“, Fanfare, Haptik, Chipregen → Hochzählen → Einrasten → Dewis Spruch → Knopf. Royal Flush ca. 4 s, normale Hand ca. 3 s, ein Tipp springt ans Ende.
- ×0: kein Hochzählen; der Einsatz-Chip fliegt verkleinert zu Dewis Kopf, Heldenzahl grau „0“, für Screenreader „Einsatz weg“.
- Sound `royal`: Lauf über acht Töne nach oben, Schlussakkord mit Bass, Glöckchen-Funkeln, Münzklackern.
- Startscreen: `openHandHint()` unter „Weiterspielen“; `lateHand()` ab 21 Uhr bei offener Hand → Spruch `home_late` (Testhaken `window.__hour`).
- Kleine iPhones (max. 700 px hoch): kompaktere Abstände und Heldenzahl 52 px; der Lichtschein hinter dem Royal Flush wird abgeschnitten (sonst ließ er den Screen scrollen).

**Neue Sprüche (Entwurf Marlin, bitte prüfen)**
- Royal Flush: „Okay. Respekt. Für genau drei Sekunden.“ · „Royal Flush. Ich tu so, als hätte ich's kommen sehen.“
- Gute Hand (ab ×3): „{n} von {m}. Für deine Verhältnisse fast elegant.“ · „Solide Hand. Das Haus zahlt. Zähneknirschend.“
- Knappe Hand (×1–×2): „Gewonnen ist gewonnen. Knapp ist auch eine Kunstform.“ · „Das reicht für ein Trinkgeld. An mich.“
- ×0 mit eigenem Einsatz: „Danke für die Spende. Das Haus gewinnt immer.“ · „Dein Einsatz wohnt jetzt bei mir. Er fühlt sich wohl.“
- ×0, Dewi hat gezahlt: „Nichts gewonnen, nichts verloren. Außer Würde.“ · „Gratis verzockt. Das muss man auch erst schaffen.“
- Ab 21 Uhr: „Deine Hand liegt noch auf dem Tisch. Um Mitternacht kassiere ich sie.“ · „Tick, tack. Um Mitternacht gehört dein Einsatz mir.“
- Erklärung „?“: „Einsatz plus Serien-Bonus, mal Multiplikator. Alles richtig gibt doppelt. Mathe, Darling. Keine Magie.“

**Tests:** test2 B5b, P14/P14b, P21/P21b/P21c (Auszahlung, ×0, Royal Flush mit +1.000, Holo-Chips, Dewi mit Dollar-Augen), P28–P31 (Hinweis auf dem Startscreen, Sticheln ab 21 Uhr, nicht vorher, Folge-Hand schließt mit „Fertig“); test4 E4/E6 um `chipclick` und `royal`; test3 kennt die Stimmung `cash`. Tests 2–5 grün. Zusätzlich im echten Chromium mit echten Zeitabläufen (nicht im Testmodus) durchgespielt: Royal Flush, ×0 und normale Hand auf 390 × 844 und 375 × 667 ohne Fehler, ohne Scrollen, Endzustand vollständig (Heldenzahl, Pille, Spruch, Knopf).

**Nicht auf einem echten iPhone getestet:** Fanfare und Chip-Klick, Haptik, Chipregen, Schrift Archivo, Gesamtlänge der Bühne. Prüfliste für Phase 1 siehe Bericht an Vito.


## Version 136 – Poker-Zeile klein wie im Survival, Dewi nur in den Modulen

> **Weniger ist mehr während der Hand.** Die Dewi-Zone mit Kachel (Version 134) ist weg. Unter den Dewi-Chips steht jetzt nur eine kleine Zeile wie Herzen und Score im Survival: rechts der Einsatz-Chip mit Betrag, ein kleines ×, der Multiplikator weiß leuchtend in der Score-Schrift und ein kleines „?“. Dewi erscheint in der Hand wieder in jedem Modul (Ergebnis-Screens mit Spruch, unter dem Reels-Automaten).

**Entscheidungen (Vito, nach dem ersten Test auf dem iPhone):** Dewi soll in der Daily Round wie vorher in jedem Modul zu sehen sein; dafür oben weder Dewi noch Kachel. Links in der Zeile bleibt frei (der Serien-Bonus steht auf der Blind-Wahl und in der Auszahlung). Die Regeln erklärt ein kleines „?“ an der Zeile, der Text erscheint darunter.

**Technik:** `pkBar()` in `pokerui.js` ist jetzt die Zeile `#pkrow` (Höhe 40 px wie `.scrow`); Multiplikator `.pkm` in `var(--num)` 21 px mit dem Leuchten von `.scnum`. Animationen bleiben (hoch mit Chip-Klick, runter beim Big Blind, grau blinken beim Small Blind). `#pkq` blendet `#pkhelp` ein und aus. Rückbau aus Version 134: kein Ausblenden von Dewi auf Ergebnis-Screens und unter Reels, keine Gesichts-Weiterleitung. Blind-Wahl und Auszahlung behalten ihre Dewi-Zone.

**Vorschau-Ablauf (neu):** Jeder Stand von `entwicklung` kann vorab als Artefakt „dewi. Vorschau“ in Claude geöffnet werden, ohne Pull Request und ohne dass etwas live geht. Die Vorschau hat ihren eigenen Spielstand (eigene Adresse), der echte Spielstand auf GitHub Pages bleibt unberührt.

**Tests:** test2 P24, P26/P26b, P27, Q2, Q4, Q6, Q8, Q10 an die Zeile angepasst (Zahl ohne ×, Dewi im Modul). Tests 2–5 grün. Im echten Chromium gemessen: Zeile 40 px, kein Überlauf bei 390 und 375 px.

**Nicht auf einem echten iPhone getestet:** Leuchten und Animation der Zahl, Größe des „?“.


## Version 137 – Streak-Schutz, Inventar und Sicherung (Shop Phase 2, Etappe 1)

> **Der Streak-Schutz funktioniert.** Er rettet genau einen verpassten Tag, wird beim nächsten Öffnen automatisch eingesetzt und hinterlässt einen eisblauen Stempel. Kaufen kann man ihn ab der Shop-Etappe; die Technik dahinter steht jetzt. Die Sicherung nimmt ab jetzt alles mit außer der offenen Hand. Grundlage: `konzept-poker-shop.md` Abschnitte 7 und 9.

**Plan Phase 2 (Vito):** 1) Streak-Schutz, Inventar, Sicherung (diese Version) · 2) Gestaltungsrunde mit Nova im Design-Canvas · 3) Shop-Screen mit Kauf · 4) Dewi-Fell und -Kopf · 5) Themes. Preise wie im Konzept, später nachjustieren (`SHOP_PRICE` in `shop.js`). Startangebot: 1 Fell, 1 Kopf-Teil, 1 Theme, Streak-Schutz.

**Entscheidungen (Vito):** Fehlen mehr Tage, als Schutze da sind, bleiben alle im Vorrat (sie werden nur eingesetzt, wenn sie die Serie wirklich retten). Eigener kleiner Moment beim Einsatz. Getestet wird mit dem Shop (kein Knopf im Testbereich). Sicherung mit allem außer der offenen Hand, auch Musik und Sound.

**Technik (`shop.js`, `app.src.html`)**
- Zustand: `shields` (0–2), `shielded` {Tag: true}, `owned` [], `equip` {} (die letzten beiden für die Cosmetics ab Version 139).
- `applyShields()` läuft beim Aufbau des Startscreens: Lücke zwischen dem letzten gespielten Tag und gestern; passt sie in den Vorrat, werden alle Tage der Lücke geschützt und `shieldNote` gesetzt, sonst passiert nichts.
- `streak()` überbrückt geschützte Tage, zählt sie aber nicht mit (Serienzahl bleibt stehen, auch für die Bonus-Stufen des Pokers).
- Stempel: neue Stufe `ice` (`stampKind`), eisblau eingefärbt, ohne Haken, Miene „Cool“, Beschriftung „geschützt“ bzw. „Streak-Schutz“.
- Moment `shieldMoment()`: eisblauer Schild, „Streak-Schutz eingesetzt“, „Deine Serie bleibt bei {n} Tagen.“, Dewi-Spruch, Rest im Vorrat. Einmalig.
- Sicherung `backupData()`: der ganze Zustand außer `run`, `dayOffset`, `dev`, `devTest`, `shieldNote`; Format `v:2`. Alte Sicherungen lassen sich weiter einspielen. Ändert die Entscheidung aus Version 130 (Diamanten waren nicht drin).

**Neue Sprüche (Entwurf Marlin, bitte prüfen):** „Du warst weg. Ich hab's vertuscht. Gern geschehen.“ · „Eis drauf, Serie gerettet. Diesmal.“

**Tests:** test4 neuer Block SH1–SH11 (Einsatz bei einem verpassten Tag, Moment und Einmaligkeit, eisblauer Stempel, zu viele Tage = Schutze bleiben, zwei Tage mit zwei Schutzen, keine Bonus-Stufe durch geschützte Tage, Serie wächst danach weiter, kein Einsatz ohne Serie, Sicherung vollständig ohne offene Hand, Einspielen ohne erneute Umrechnung × 10). Tests 2–5 grün.

**Nicht auf einem echten iPhone getestet:** Farbe des eisblauen Stempels, der Moment. Ausprobieren erst mit dem Shop möglich.


## Version 138 – Der Shop: Umkleide, Fell, Kopf, Theme, Streak-Schutz (Shop Phase 2, Etappe 2)

> **Der Shop ist da.** Neue Kachel „Shop“ im Hauptmenü unter Gamemodes, und ein Tipp auf die Chip-Pille öffnet ihn ebenfalls. Oben die Umkleide mit Dewi und ihrem Kommentar, darunter Cosmetics, Extras und Consumables. Antippen probiert an, Themes färben den Screen als Vorschau. Startangebot: Fell „Mitternacht“ (Selten, 6.000), Kopf „Schleife“ (Gewöhnlich, 2.500), Theme „Neon-Nacht“ (Selten, 6.000), Streak-Schutz (1.000, höchstens 2 im Vorrat). Gestaltung: Design-Canvas „dewi. Poker-Screens“, Reihe „Phase 2: Shop“.

**Entscheidungen (Vito):** Entwürfe im Canvas passen. Im Hauptmenü kommt nur die Shop-Kachel dazu, bestehende Kacheln bleiben unverändert. Startartikel wie auf der Auswahltafel markiert. Chip-Pille öffnet den Shop. Kein Sparziel auf der Kachel. Alles in einer Version (Shop, Schutz, Fell, Kopf, Theme).

**Technik**
- `shop.js`: `SHOP_ITEMS` (inkl. Gratis-Artikel Classic-Fell, kein Kopf, Dewi Classic), `openShop`/`renderShop`/`shopAct`/`closeShop`, Kaufen zieht Chips ab und rüstet Cosmetics gleich aus, Streak-Schutz erhöht den Vorrat. `applyTheme()` setzt `data-theme` auf `<html>`; Vorschau während der Anprobe, beim Schließen zurück auf das ausgerüstete Theme; beim Start wird das gekaufte Theme gesetzt.
- Dewi (`dwSvg(mood, look)`): Fell über `DW_FUR` (Kapuze und Ohren; Mitternacht mit Sternen), Kopf-Teil über `dwHeadItem()` in der gedrehten Kopf-Gruppe, dadurch sitzt die Schleife in allen Stimmungen gleich (Test). Ohne `look` = aktuelle Ausstattung, also überall in der App. Stempel nutzen `DW_PLAIN` (Original), damit alte Tage nicht umgefärbt werden.
- Theme „Neon-Nacht“ als `:root[data-theme=neon]` (Hintergrund, Flächen, Linien, Akzent). Fest bleiben Lernsprachen-Pink, Grün/Rot und Holo. Einige Poker- und Shop-Stellen haben noch feste Farben und färben nicht mit (später beim Designsystem-Durchgang).
- Hauptmenü: Kachel `.shopcard` im Stil von Gamemodes (Violett-Pink statt Blau); Chip-Pille auf dem Startscreen ist jetzt ein Knopf.
- Kleine iPhones: nur die Artikel-Liste scrollt, Umkleide kompakter, Kaufen-Knopf bleibt sichtbar.

**Neue Sprüche (Entwurf Marlin, bitte prüfen):** „Probier ruhig an. Anfassen kostet nichts. Noch.“ · „Mitternacht mit Sternen. Endlich versteht mich jemand.“ · „Die Schleife. Süß, aber gefährlich.“ · „Neon-Nacht. Fühlt sich teuer an.“ · „Ein Tag frei, ohne dass ich es merke. Fast.“

**Tests:** test4 neuer Block SP1–SP15 (Kachel unter unverändertem Gamemodes, Pille öffnet Shop, Reiter, Anprobe, Kauf und Ausrüsten mit Abzug, Gratis-Fell, Theme-Vorschau, zu wenig Chips, „Nur meine“, Streak-Schutz kaufen, Schließen setzt Vorschau zurück, Schleife in allen Stimmungen, Stempel im Original, gekauftes Theme bleibt, Sicherung mit Käufen); C5 angepasst. Dabei gefunden und behoben: Kachel und Shop-Screen hatten dieselbe ID. Tests 2–5 grün. Im echten Chromium gemessen: Shop passt auf 390 × 844 und 375 × 667 ohne Überlauf.

**Nicht auf einem echten iPhone getestet:** Farben von Mitternacht und Neon-Nacht, Sitz der Schleife, Sound beim Kaufen. In der Vorschau zum Ausprobieren im Testbereich Chips sammeln oder per Survival.


## Version 139 – Startscreen ohne Tab-Leiste: Zahnrad, Vokabelheft-Kachel, goldener Shop, Chip-Stapel

> **Der Startscreen wird zum Hauptmenü.** Die Tab-Leiste unten ist weg. Oben rechts neben den Chips sitzt ein Zahnrad, das die Einstellungen öffnet. Die Streak-Pille oben ist weg, weil die Serie schon in der Daily-Round-Kachel steht und nur dort zählt. Die Fortschritt-Kachel ist jetzt eine schmale dunkelblaue Kachel „Vokabelheft“ im Stil von Gamemodes; der Fortschrittsbalken steht im Vokabelheft oben. Die Shop-Kachel ist golden und hat mehr Abstand zu Gamemodes. In der Daily-Round-Kachel oben rechts liegen zwei gestapelte Dewi-Chips, obendrauf dreht sich ein goldener Chip um die senkrechte Achse.

**Entscheidungen (Vito):** Zahnrad öffnet direkt die Einstellungsseite (kein Menü). Vokabelheft-Kachel schmal wie Gamemodes, dunkelblau. Shop im Gold-Verlauf. Chip-Stapel klein oben rechts in der Kachelecke, dreht sich immer (auch nach geschaffter Runde).

**Technik**
- `<nav id="tabs">` samt CSS und Code entfernt; untere Polsterung der Seite von 104 auf 40 px.
- Navigation über `data-v`: `render()` bindet alle `[data-v]` im aktuellen Screen an `go()`. Zahnrad `#gear` (`data-v="settings"`), Vokabelheft-Kachel `.bookcard` (`data-v="book"`), Zurück-Pfeil `.backbtn` (`data-v="home"`) in Vokabelheft und Einstellungen.
- `stPill()` und `.stpill` entfernt.
- Reihenfolge der Kacheln: Daily Round, Gamemodes, Shop, Vokabelheft. Abstand zwischen den Kacheln 16 px (`.gmcard+.gmcard`).
- Shop-Kachel: Gold-Verlauf (#ffd45c → #e88a0c) mit Glanz oben, dunkelbraune Schrift und Icon-Linien.
- `chipStack()`: zwei gestauchte pinke Chips (`preserveAspectRatio="none"`, Kante per Schatten) und ein goldener Chip mit `rotateY`-Animation (2,8 s). Bei „Bewegung reduzieren“ steht er still.
- EN: „Vokabelheft öffnen“, „Einstellungen öffnen“.

**Tests:** test4 neu NV1–NV7 (keine Tab-Leiste/Streak-Pille, Zahnrad, Chip-Stapel, Vokabelheft-Kachel, Zurück-Pfeile); SP1 auf drei Kacheln angepasst; test2 D17 und test3 (Englisch-Start, Namensfrage, Sound-Einstellungen) öffnen Heft und Einstellungen jetzt über Kachel bzw. Zahnrad. Tests 2–5 grün. Im echten Chromium gemessen (390 × 844 und 375 × 667, Runde offen und geschafft): kein seitlicher Überlauf, Chip-Stapel überlappt den Titel nicht.

**Nicht auf einem echten iPhone getestet:** Wirkung des Golds, Drehung des Chips (Ruckeln, Akku), Antippen des Zahnrads neben der Chip-Pille.


## Version 140 – Shop-Kachel weg, Vokabelheft-Kachel wie die alte Fortschritt-Karte

> **Zurück zur Ruhe im Hauptmenü.** Die goldene Shop-Kachel ist wieder weg, der Shop bleibt über die Chip-Pille oben erreichbar. Die Vokabelheft-Kachel sieht jetzt wieder aus wie die alte Fortschritt-Karte: „FORTSCHRITT“, „X von Y Wörtern begonnen“ und der bunte Balken, aber ohne die Liste der Stufen darunter. Die Liste steht jetzt im Vokabelheft selbst, direkt wenn man die Kachel antippt.

**Entscheidung (Vito):** Shop-Kachel entfernen, Shop nur über die Pille. Vokabelheft-Kachel wie im Screenshot: Balken ohne Stufen-Liste, die Liste erst auf der Vokabelheft-Seite.

**Technik**
- Shop-Kachel (`SHOPIC`, `#shopbtn`, `.shopcard`) komplett aus `homeView()` und dem CSS entfernt. `openShop()` bleibt unverändert, erreichbar über `#chippill`.
- Die Vokabelheft-Kachel ist jetzt ein `<button class="card prog bookcard">` (kein schmaler `gmcard`-Knopf mehr): Eyebrow „Fortschritt“, Text, Balken – dieselbe Berechnung wie im Vokabelheft, nur ohne `.legend`. Klick/Enter navigiert wie bisher über `data-v="book"`.
- CSS: `.bookcard` setzt nur noch die Button-Grundlagen zurück (Breite, Schrift, Cursor), die Optik kommt von `.card.prog` (dieselbe Klasse wie zuvor auf dem Startscreen).

**Tests:** test4 SP1 und NV3 angepasst (keine Shop-Kachel mehr im Hauptmenü, Vokabelheft-Kachel mit Balken ohne Liste), SP-Block öffnet den Shop jetzt über die Chip-Pille statt über die Kachel. test3 prüft das aria-label der Kachel statt eines Kachel-Titels. Tests 2–5 grün. Im echten Chromium gemessen (390 × 844 und 375 × 667): keine Shop-Kachel mehr, Vokabelheft-Kachel ohne Überlauf, Klick öffnet das Vokabelheft mit der Stufen-Liste oben.

**Nicht auf einem echten iPhone getestet:** Antippbarkeit der ganzen Karte als Knopf, Wirkung ohne die Shop-Kachel im Alltag.


## Version 141 – Chip-Stapel wieder weg, Pfeil an der Vokabelheft-Kachel

> **Zwei kleine Korrekturen.** Der drehende Chip-Stapel in der Daily-Round-Kachel ist wieder raus, er war zu unruhig fürs Auge. Die Vokabelheft-Kachel hat jetzt oben rechts denselben kleinen Pfeil wie die Gamemodes-Kachel, damit klar ist, dass man sie antippen kann.

**Entscheidung (Vito):** Chip-Stapel entfernen. Pfeil-Symbol wie bei Gamemodes ergänzen.

**Technik**
- `chipStack()` und das zugehörige CSS (`.dstack`, `@keyframes dsspin`) entfernt, `.plan h2` ohne den dafür reservierten Platz rechts.
- Vokabelheft-Kachel: neue Kopfzeile `.bookrow` stellt „Fortschritt“ und einen Pfeil (`.bookgo`, gleiche Form wie `.gmgo`, in `var(--muted)`) nebeneinander.

**Tests:** test4 NV2 prüft jetzt, dass kein Chip-Stapel mehr da ist; NV3 prüft zusätzlich den Pfeil. Tests 2–5 grün. Im echten Chromium gemessen (390 × 844 und 375 × 667): kein Überlauf, Pfeil sitzt sauber in der Ecke.

**Nicht auf einem echten iPhone getestet:** Wie ruhig die Daily-Round-Kachel jetzt wirkt.


## Version 142 – Blind-Chip dreht sich, schlankere Einstellungen, Testbereich mit Textfeldern

> **Drei Korrekturen auf einmal.** Beim Antippen eines Blind-Chips in der Daily Round dreht sich der Chip jetzt einmal um die senkrechte Achse und glänzt dabei, statt wegzurutschen. Die Einstellungen haben ihre Erklärtexte verloren – die Bedienelemente sprechen für sich, nur „Tägliche Erinnerung“ ist als reiner Erklär-Abschnitt ganz raus. Der Testbereich ist jetzt immer sichtbar (keine sieben Tipps mehr auf die Überschrift) und funktioniert über zwei Textfelder: Anzahl Wörter freischalten und Anzahl Chips, jeweils mit eigenem Zurücksetzen-Knopf, wirkt sofort beim Drücken von Enter.

**Entscheidungen (Vito):** Chip-Drehung ersetzt den bisherigen Abgang. „Tägliche Erinnerung“ fällt als Abschnitt komplett weg. Testbereich wirkt sofort bei Enter, ohne automatische Sicherung im Hintergrund. Freigeschaltete Wörter einfach auf Stufe 1, heute fällig (keine gestreuten Stufen mehr).

**Technik**
- `pokerui.js`/CSS: `.bschip.go .bscwrap` dreht sich mit `rotateY(360deg)` und schrumpft dabei aus (`bsspin`, 0,5 Sek.), ein Glanzstreifen läuft einmal quer über den Chip (`bsshine`). Rundenstart wartet jetzt 520 ms statt 420 ms. Ersetzt das alte Wegrutschen (`bsgo`).
- `settingsView()`: alle `<p class="hint">`-Erklärsätze entfernt außer der Sicherungs-/Namens-Rückmeldung (`#nmflash`, jetzt leer) und dem Testdatum bei „Testen“ (nur noch das Datum, ohne Erklärsatz). Abschnitt „Tägliche Erinnerung“ komplett gestrichen.
- Testbereich: `devCard()` ohne Sichtbarkeits-Flag, keine sieben Tipps auf `#sethead`, kein `state.dev`/`state.devTest` mehr. Zwei Formulare `#devwordsf`/`#devchipsf` mit Zahlenfeld, Enter löst `devSetWords()`/`devSetChips()` aus (Wörter: die ersten X Wörter auf Stufe 1, heute fällig, Rest unberührt; Chips: direkt gesetzt). Je ein „Zurücksetzen“-Knopf daneben (Wörter: Fortschritt der Lernsprache leeren; Chips: auf 0). Die alte Sicherung/Wiederherstellung des echten Standes (`DEV_BAK`, „Testphase aktiv“) ist komplett entfallen, ebenso die sechs Lernphasen-Knöpfe.

**Tests:** Neuer Block V1–V7 in test4 für den Testbereich (sofort sichtbar, Eingabe setzt Wörter/Chips, Zurücksetzen, Kappung über die Wortzahl hinaus). Keine Tests verweisen mehr auf die entfernten Beschreibungstexte. Tests 2–5 grün. Im echten Chromium geprüft: Chip-Drehung läuft (`bsspin`, 0,5 s), Einstellungen zeigen nur noch Bedienelemente plus Testdatum, Testbereich ist ohne Geheim-Tipps sofort da.

**Nicht auf einem echten iPhone getestet:** Wie die Drehung mit Glanz auf dem Gerät wirkt (Timing, Haptik dazu), ob die Einstellungen ohne Erklärtexte noch selbsterklärend genug sind.


## Version 143 – Echter Münz-Flip, eigener Dreh-Sound, wuchtige Verdopplung bei Royal Flush

> **Drei Korrekturen an der Daily Round.** Die Zeile „Small Blind 100 · ×0 · verfällt um Mitternacht“ unter „Weiterspielen“ ist weg. Die Blind-Chips drehen sich beim Antippen jetzt wirklich als Münze mit Vorder- und Rückseite (nicht mehr nur ein flaches Drehbild) und haben einen eigenen, dazu passenden Dreh-Sound statt des alten Chip-Klackerns. Und wenn am Ende der Daily Round ein Royal Flush den Betrag verdoppelt, passiert das jetzt in zwei Schritten mit Wumms: erst der normale Betrag, dann ein kräftiger Schlag mit Sound, Vibration, einer „×2“-Marke, die einschlägt, und der ganze Bildschirm zuckt und blitzt kurz auf.

**Entscheidungen (Vito):** Echter Münz-Flip (statt nur schnellerem Drehbild). Neuer eigener Dreh-Sound (statt den Chip-Klack-Sound zu verlängern). Erst normal zählen, dann sichtbar verdoppeln (statt den verdoppelten Betrag sofort anzuzeigen). Die Verdopplungs-Animation lässt den ganzen Bildschirm kurz mitreagieren (statt nur den Betragsbereich).

**Technik**
- `openHandHint()` und die Zeile „Small Blind … · verfällt um Mitternacht“ komplett entfernt (Funktion, beide Aufrufstellen unter „Weiterspielen“, `.ohint`-CSS).
- Echter Münz-Flip: `chips.js` bekommt `chipBackSvg(tone)` für eine passende Rückseite (gleiche Farben wie die Vorderseite). Die Blind-Buttons zeigen jetzt `.bscwrap` mit zwei übereinanderliegenden Seiten (`.bscface.bscfront`/`.bscback`, Rückseite per `backface-visibility` vorgedreht). `@keyframes bsflip` dreht den Chip einmal um 360°, dabei wird bei 180° kurz die Rückseite sichtbar; `bsshine` läuft wie bisher als Glanzstreifen quer drüber. Rundenstart wartet weiterhin die 0,5 Sek. ab.
- Eigener Sound: neue `spinchip`-Stimme in der `SFX`-Tabelle (kurzes Schwirren mit einem kleinen Funkeln am Ende), ersetzt den bisherigen `chips`-Sound bei der Blind-Auswahl.
- Royal-Flush-Verdopplung in `payoutStage()` (`pokerui.js`): Statt direkt den verdoppelten Betrag hochzuzählen, zählt die Zahl zuerst auf den einfachen Betrag (`Math.round(Auszahlung/2)`). Nach einer kurzen Pause: die „×2“-Marke (`#erfx2`, bis dahin per `hidden` versteckt) schlägt mit einer Lupen-Animation ein (`.rfx2.punch`/`@keyframes rfx2punch`), die Zahl macht einen Sprung nach oben und zurück (`.slam`/`@keyframes eslam`), ein neuer wuchtiger `doubleup`-Sound (tiefer Schlag, kurzer Knack, dann ein helles Funkeln) spielt zusammen mit einem kräftigeren Vibrationsmuster, und der ganze Auszahlungs-Bildschirm zuckt kurz (`.paystage.dbl`/`@keyframes stageShake`) und blitzt einmal weiß-golden auf (`::after`-Overlay, `@keyframes stageFlash`). Dann steht der tatsächliche, verdoppelte Betrag da. Die alte, unbenutzte `pomult.flash`/`pmflash`-Hervorhebung ist entfernt (sie wurde durch die neue „×2“-Marke ersetzt).
- `#epay` zeigt jetzt bei Royal Flush „Einsatz ×Multiplikator ×2“ (die „×2“ als eigenes, anfangs verstecktes Element) statt einer festen Zahl.

**Tests:** test2 P28/P31 (keine Hinweiszeile mehr beim offenen Hand-Zustand) angepasst. B5b und P21 (Royal-Flush-Texte) an das neue Leerzeichen vor „×2“ angepasst, prüfen inhaltlich weiterhin denselben verdoppelten Betrag. Tests 2–5 grün (test2/test4: „ALLES OK“, test3/test5: „Alle Tests bestanden“).

**Nicht auf einem echten iPhone getestet:** Wie der Münz-Flip mit echter Perspektive wirkt, die Lautstärke/Balance des neuen Dreh- und Verdopplungs-Sounds, ob das Bildschirm-Zucken auf dem Gerät angenehm wuchtig oder zu heftig wirkt, das neue Vibrationsmuster bei der Verdopplung.


## Version 144 – Vom linken Rand zurückwischen

> **Neue Geste.** Im Vokabelheft und in den Einstellungen kommt man jetzt auch zurück zum Startbildschirm, wenn man vom linken Bildschirmrand nach rechts wischt – wie der bekannte Zurück-Wisch auf dem iPhone. Der Pfeil oben links bleibt zusätzlich da.

**Entscheidungen (Vito):** Gilt nur für die normalen Menüs (Vokabelheft, Einstellungen), nicht für Shop, Spielmodus-Auswahl, Blind-Auswahl oder eine laufende Lernrunde – dort gibt es schon andere Wisch-Gesten (irgendwo wischen = weiter, das Swipe-Modul), die sich sonst in die Quere kämen. Schmaler Rand-Bereich wie beim iPhone (rund 24 px). Kein mitziehender Bildschirm, nur ein einfacher Schwellenwert, der sofort zurückspringt.

**Technik**
- Ein globaler `pointerdown`/`pointerup`-Zuhörer (einmalig gesetzt, nicht bei jedem `render()`) merkt sich die Startposition, wenn sie innerhalb von 24 px vom linken Rand liegt, kein Sheet offen ist (`sheet.hidden`) und kein Bedienelement getroffen wurde. Beim Loslassen: mindestens 60 px nach rechts, höchstens 70 px hoch/runter (dieselben Schwellen wie beim bestehenden „irgendwo wischen = weiter" in `rounds.js`) und aktuell `view==='book'` oder `'settings'` → `go('home')`, genau wie ein Klick auf den Zurück-Pfeil.
- Da die Prüfung `sheet.hidden` verlangt, greift die Geste nie, während Shop, Spielmodus-Auswahl, Blind-Auswahl oder eine Runde offen sind (die laufen alle über das `#sheet`-Overlay), und auch nicht auf dem Startbildschirm selbst (da gibt es kein Zurück-Ziel).

**Tests:** Keine automatisierten Tests für Touch-Gesten (die Testumgebung simuliert kein Pointer-Dragging); Tests 2–5 unverändert grün. Im echten Chromium mit simulierten Zeigerereignissen geprüft: Wisch vom Rand bringt im Vokabelheft und in den Einstellungen zurück zum Start, auf dem Startbildschirm passiert nichts, ein Wisch, der nicht am Rand beginnt, löst nichts aus.

**Nicht auf einem echten iPhone getestet:** Wie sich die Geste mit echtem Finger und echtem Safari-Verhalten (z. B. gleichzeitiges Scrollen) anfühlt, ob 24 px als Trefferbereich am Gerät leicht genug zu treffen sind.


## Version 145 – Tab-Leiste zurück, mit Shop statt Einstellungen

> **Die Leiste ist wieder da.** Unten im Hauptmenü gibt es wieder die drei Reiter wie vor Version 139 – nur steht jetzt an der Stelle der Einstellungen der Shop. Einstellungen bleiben über das Zahnrad oben erreichbar, das es seit Version 139 gibt. Die Leiste ist auf allen drei Bildschirmen (Start, Vokabelheft, Einstellungen) sichtbar.

**Entscheidungen (Vito):** Leiste wie früher, Shop an der Stelle der Einstellungen. Zahnrad oben bleibt zusätzlich für die Einstellungen. Leiste bleibt auch in den Einstellungen sichtbar (kein Reiter markiert, da Einstellungen keiner der drei Reiter ist).

**Technik**
- `<nav class="tabs" id="tabs">` und die zugehörige CSS (`.tabs`, `.tabs-in`) wieder eingebaut (waren seit Version 139 aus Markup und JS entfernt, einzelne `.tab`-Regeln standen als totes CSS noch da). Dritter Reiter heißt jetzt `#shoptab` (eigenes schlichtes Einkaufstüten-Symbol, Farbe Gold `var(--c-yellow)`) statt `data-v="settings"`.
- `render()`/`applyStatic()`: Leiste wird wie früher ein-/ausgeblendet (versteckt nur auf den Auswahlbildschirmen für App-Sprache/Name/Lernsprache) und übersetzt; der aktuelle Reiter (Heute/Vokabelheft) bekommt `aria-current`, der Shop-Reiter nie, weil er kein eigener Bildschirm ist, sondern den Shop als Sheet öffnet.
- Reiter-Klicks sind einmalig gebunden (`Heute`/`Vokabelheft` rufen `go()`, `#shoptab` ruft `openShop()`), nicht bei jedem `render()` neu, weil die Leiste selbst nie neu gezeichnet wird.
- `.app`-Innenabstand unten wieder auf 104 px (Platz für die fixe Leiste), vorher 40 px ohne Leiste.

**Tests:** test4 NV1–NV7 angepasst und erweitert (Leiste da statt weg, zeigt Heute/Vokabelheft/Shop statt Einstellungen, aktiver Reiter markiert, Shop-Reiter öffnet/schließt den Shop, Vokabelheft-Reiter navigiert und wird aktiv markiert). test3 prüft die englische Leiste (Today/Wordbook/Shop, keine Einstellungen). Tests 2–5 grün. Im echten Chromium auf 390 × 844 und 375 × 667 gemessen: Leiste sitzt fix unten ohne horizontalen Überlauf, auf dem kleinen iPhone braucht die unterste Kachel etwas Scrollen, ist dann aber vollständig sichtbar und nicht von der Leiste verdeckt.

**Nicht auf einem echten iPhone getestet:** Wie die Leiste mit der Haus-Leiste/Safe-Area auf einem echten Gerät zusammenspielt, Treffergenauigkeit der drei Reiter mit dem Finger.


## Version 146 – „Heute" heißt „Home", Leiste auch im Shop, Pfeil mittig auf der Vokabelheft-Kachel

> **Drei kleine Korrekturen.** Der erste Reiter heißt jetzt „Home" statt „Heute" (auf Deutsch und Englisch gleich). Die Tab-Leiste bleibt jetzt auch sichtbar, während der Shop offen ist – Heute und Vokabelheft schließen den Shop dabei automatisch mit, wenn man sie antippt. Der Pfeil auf der Vokabelheft-Kachel sitzt jetzt mittig auf der ganzen Kachel statt oben in der Kopfzeile.

**Entscheidungen (Vito):** „Home" auf Deutsch und Englisch gleich (statt „Start").

**Technik**
- Reiter-Beschriftung: `data-k="Heute"` → `data-k="Home"`, EN-Eintrag `"Home": "Home"` ergänzt.
- Leiste im Shop: `.sheet` bekommt beim Öffnen des Shops die Klasse `shop-open` (`openShop()`), die per CSS ihren `z-index` unter den der Leiste senkt (`.sheet.shop-open{z-index:5}`, Leiste bleibt bei 10) – die Leiste liegt dadurch über dem Shop statt darunter. Damit der „Kaufen/Ausrüsten"-Knopf am unteren Rand des Shops nicht unter der Leiste verschwindet, bekommt `.sin.shop` in diesem Zustand 104 px Platz unten (derselbe Wert wie beim `.app`-Innenabstand für die Leiste). Die Klasse wird beim Schließen eines beliebigen Sheets in `closeSheet()` wieder entfernt, damit sie nicht an den nächsten Bildschirm (Spielmodus-Auswahl, Blind-Auswahl) weitergegeben wird – nur der Shop bekommt die sichtbare Leiste, wie gewünscht.
- Heute/Vokabelheft-Reiter schließen beim Antippen zuerst einen offenen Shop (`if(SHOP)closeShop();`) und wechseln dann erst die Ansicht, damit die Leiste auch im Shop normal funktioniert statt nur sichtbar, aber wirkungslos zu sein. Der Shop-Reiter selbst wird beim Öffnen aktiv markiert (`aria-current`), weil er sonst als einziger Bildschirm ohne markierten Reiter dagestanden hätte.
- Pfeil auf der Vokabelheft-Kachel: `.bookcard` bekommt `position:relative` und rechts 46 px Platz; `.bookgo` sitzt jetzt absolut positioniert, senkrecht mittig auf der ganzen Kachel (`top:50%;transform:translateY(-50%)`) statt in der Kopfzeile neben der Eyebrow.

**Tests:** test3 prüft die englische Leiste jetzt auf „Home" statt „Today". test4 NV1d2/d3 (jetzt NV1d2/e/f/g) um die Prüfung erweitert, dass die Leiste im Shop sichtbar bleibt und der Shop-Reiter aktiv markiert ist, und dass Vokabelheft/Heute den Shop beim Antippen mitschließen. Tests 2–5 grün. Im echten Chromium gemessen: Pfeil weicht nur 2 px von der exakten Kachel-Mitte ab und überlappt weder den Fortschrittstext noch den Balken (selbst bei „678 Wörtern", dem größten vorkommenden Zahlenwert); im Shop sitzt der „Kaufen"-Knopf 36 px über der Leiste, nicht darunter verdeckt.

**Nicht auf einem echten iPhone getestet:** Wie sich „Home" statt „Heute" auf Deutsch liest, ob die Leiste über dem Shop auf dem Gerät optisch stört oder zu viel wirkt.



## Version 147 – Deutsche Flagge, keine Artikel mehr

> **Zwei Korrekturen.** Im Deutschkurs zeigt der Sprachknopf oben links jetzt 🇩🇪 statt eines Globus. Und die Artikel aus Version 116 sind wieder raus: Aus „der Nachbar" wird „Nachbar", im Deutschkurs genauso wie bei den deutschen Bedeutungen im Englischkurs. Ziel der App ist ein spielerischer Einstieg, nicht perfekte Grammatik – die Artikel haben im Deutschkurs mehr gestört als geholfen.

**Entscheidungen (Vito):** Artikel überall entfernen (Deutschkurs und Englischkurs). Wörter, die ohne Artikel gleich aussehen würden, nur einmal behalten – das Nomen fällt weg.

**Technik**
- Flagge: Die Zuordnung im Startscreen-Kopf kannte nur `id`/`en`, Deutsch fiel auf 🌐 zurück. `de:'🇩🇪'` ergänzt.
- Neues Skript `data/strip_artikel.py` (Gegenstück zu `data/artikel.py`): entfernt in `data/en/*.txt` nur „der/die/das + ein einzelnes großgeschriebenes Wort" (314 Zeilen), doppelte Varianten danach fallen weg. Bewusst unverändert: „das dort" (that), „das hier" (this) – das sind Pronomen, keine Artikel –, „eine Million" (Zahl) und die feste Wendung „Die Rechnung bitte". Danach `make_en.py`, `make_de.py` und `data/align/emit.py` neu ausgeführt.
- Deutschkurs jetzt **652 statt 655 Wörter:** „der Morgen", „das Essen", „der Arm" entfallen, weil sie ohne Artikel wie „morgen", „essen", „arm" aussähen (die bleiben). „dort" fällt nicht mit „das dort" zusammen, weil „das dort" seinen Artikel als Pronomen behält. Englischkurs unverändert 665 Wörter, nur die deutschen Bedeutungen ohne Artikel.
- Zuordnungstabelle (`align.js`): Schlüssel des Deutschkurses folgen automatisch („de:nachbar:en"), 1 geprüfter Eintrag eines entfallenen Wortes fällt weg (1750 → 1749). Die Satz-Zuordnung selbst ändert sich nicht, weil die Sätze gleich bleiben.
- `migrate()`: Fortschritt im Deutschkurs wandert auf die neuen Schlüssel („de:der nachbar" → „de:nachbar"), ebenso Tageslisten (`daily.lt`/`got`) und ein offener Run. Fortschritt der drei entfallenen Wörter wird gelöscht und **nicht** mit morgen/essen/arm vermischt; ein offener Run mit einem entfallenen Wort wird verworfen. Läuft bei jedem Start, findet nach dem ersten Mal nichts mehr.
- Unverändert: Tippen akzeptiert weiterhin auch „der Nachbar" (`normDe` ignoriert einen führenden Artikel), Artikel in Sätzen gelten weiter als bekannte Füllwörter (`GLUE_DE`).

**Nebeneffekt:** Ohne Artikel passen im Deutschkurs mehr Wörter in die Satz-Module: Lückensatz 43 → 56, Reihenfolge 99 → 190 Wörter.

**Tests:** Neuer Block DK1–DK7 in test4 (Flagge, keine Artikel mehr außer Pronomen/Zahlen, die drei entfallenen Wörter, Übertragung von Fortschritt, Tagesliste und offenem Run, Englischkurs ohne Artikel). Tests 2–5 grün. Zusätzlich alle 652 Deutsch- und 665 Englischwörter in jedem passenden Modul gerendert, keine Fehler.

**Nicht auf einem echten iPhone getestet:** Sprachausgabe der Wörter ohne Artikel (z. B. wie „Essen" vs. „essen" klingt, falls beides in einer Runde vorkommt), Flagge auf dem Gerät.


## Version 148 – Zahnrad statt Lautstärke im Spiel, Sound-Einstellungen ganz oben

> **Im Spiel (Daily Round, Survival) steht oben rechts jetzt das Zahnrad statt des Lautsprecher-Knopfs** – die Sound-Einstellungen sind sowieso dort erreichbar. Tippt man es an, legen sich die Einstellungen als Ebene übers laufende Spiel, ohne irgendetwas zu pausieren oder zu beenden; der Zurück-Pfeil führt exakt zurück ins Spiel. Dafür steht die Karte „Sound" (An/Aus, Lautstärke) in den Einstellungen jetzt ganz oben, vor „App-Sprache".

**Entscheidungen (Vito):** Zahnrad öffnet die Einstellungen als Ebene über dem Spiel (nicht wie der ×-Knopf mit Pausieren/Beenden). Gleiches Zahnrad-Symbol wie im Hauptmenü.

**Technik**
- `rounds.js`: Im Kopf des Spiel-Sheets (`sheetBody()`) ersetzt der Zahnrad-Knopf (`#setgear`, gleiches Icon `GEARIC` wie im Hauptmenü) den bisherigen Lautsprecher-Knopf (`musIcon()`).
- Neue Funktion `openSettingsOverlay()`: baut ein eigenes Element `#setov` (einmalig an `document.body` gehängt), füllt es mit `settingsView()` und zeigt es über dem Spiel-Sheet (`.setov`, `z-index:35`, das Sheet selbst liegt auf 30). Der Zurück-Pfeil darin schließt nur das Overlay (`ov.hidden=true`) statt wie sonst zum Startscreen zu navigieren – das laufende Spiel (`S`) bleibt währenddessen unberührt im Hintergrund stehen.
- `bindSettings()` bekommt einen optionalen Parameter `root` (Standard: der normale Einstellungen-Bildschirm), damit dieselbe Funktion wortgleich auch die Felder im Overlay bedient. „Alles zurücksetzen" und „Sicherung einspielen" beenden zusätzlich ein offenes Spiel und schließen das Overlay, bevor sie den Zustand überschreiben, damit keine Spielreste mit neuen Daten kollidieren.
- Einstellungen-Reihenfolge: Die Karte „Sound" steht jetzt vor „App-Sprache" (betrifft beide Stellen, da `settingsView()` für den normalen Bildschirm und das Overlay dieselbe Funktion ist). „Musik" bleibt an ihrem bisherigen Platz, da nur nach den Sound-Einstellungen gefragt war.
- Der alte Lautsprecher-Knopf (`musIcon()`, `.musbtn`) bleibt im Code stehen, wird aber nirgends mehr aufgerufen – unschädlich, aber bei Gelegenheit aufräumbar.

**Tests:** M10 in test4 geändert (prüfte bisher den Lautsprecher-Knopf im Modul, jetzt das Zahnrad) und um M10b/M10c erweitert: Antippen öffnet das Overlay mit „Sound" als erster Karte, Zurück-Pfeil schließt es wieder und das Spiel läuft unverändert weiter. Tests 2–5 grün. Zusätzlich mit Playwright/Chromium geprüft: Overlay liegt sichtbar über dem Spiel-Sheet, nach dem Schließen sind Quit-Knopf und Spielstand (`S`) noch da.

**Nicht auf einem echten iPhone getestet:** Wie sich das Ebenen-Layout (Overlay über Sheet) mit der Safe-Area und etwaigen Übergangs-Rucklern auf einem echten Gerät anfühlt.


## Version 149 – Keine geschriebene Stufe/nächste Wiederholung mehr

> **Unter dem Ergebnis jedes Moduls stand bisher ein Satz wie „Stufe 3 von 5. Nächste Wiederholung in 2 Tagen." (oder bei falsch/gerettet ähnlich) – das soll man nicht sehen.** Der Satz ist jetzt überall weg, Dewis Kommentar reicht als Rückmeldung. Im großen Level-up-Zwischenbildschirm fällt aus demselben Grund die Textzeile unter dem Stufen-Kreis weg – der Kreis mit der großen Zahl und die 5 Punkte darunter zeigen die Stufe schon bildlich.

**Entscheidungen (Vito):** Unter dem Modul-Ergebnis bleibt gar kein Ersatz-Satz stehen. Im Level-up-Screen fällt die Zeile komplett weg (nicht nur der Wiederholungs-Teil).

**Technik**
- `resultNote()` in `rounds.js` ist die gemeinsame Stelle für alle Module (Tippen, Auswahl, Swipe, Lückensatz, Bausteine, Reihenfolge, Reels) – sie gibt für die Daily Round jetzt in allen drei Fällen (falsch, gerettet, normal richtig) einen leeren String zurück. Der Survival-Zweig (Punkte, Serie, „Ein Leben weniger.") ist unverändert, weil der nichts mit Stufe/Wiederholung zu tun hat.
- `levelUp()`: Die Zeile `.lvl-sub` („Stufe {Level} von 5 · nächste Wiederholung …") ist entfernt. Übrig bleiben Beschriftung („Level up!"/„Gerettet!"/„Neues Wort!"/„Stufe gehalten"), der Stufen-Kreis mit der Zahl, die 5 Punkte darunter, das Wortpaar und Dewis Kommentar.
- Die nun ungenutzten Übersetzungstexte (6 Varianten der beiden Sätze) bleiben in den Sprachdateien stehen, falls sie später wieder gebraucht werden – unschädlich.

**Tests:** test4 D9 prüfte bisher den Wortlaut dieses Satzes bei falscher Antwort; jetzt prüft er stattdessen direkt im Spielstand, dass das Wort auf Stufe 0 fällt, und dass im Ergebnis kein „Stufe"/„Wiederholung"-Text mehr auftaucht. Tests 2–5 grün.

**Nicht auf einem echten iPhone getestet:** Wie sich der jetzt kürzere Ergebnis-Bildschirm (ohne den Satz) auf dem iPhone liest und ob er optisch leer wirkt.


## Version 150 – Tab-Leiste sitzt wirklich ganz unten

> **Auf dem echten iPhone war unter der Tab-Leiste ein schmaler Spalt zu sehen** – nicht im App-Lila, sondern in der Standard-Hintergrundfarbe des Browsers (fast schwarz), die durchschimmerte. Das sah billig aus. Grund: Bei kurzen Bildschirmen (wie dem Startscreen) war die Seite selbst kürzer als das Display, darunter kam der Browser-Hintergrund statt unserem zum Vorschein, genau dort, wo die Leiste sitzt. Die Seite füllt jetzt immer mindestens die volle Bildschirmhöhe, mit unserem eigenen Hintergrund.

**Entscheidungen (Vito):** Beheben wie vorgeschlagen (Seite füllt immer den ganzen Bildschirm).

**Technik**
- `html` bekommt `min-height:100%` und explizit `background:var(--bg)` (vorher nur auf `body` gesetzt, `html` selbst hatte keinen eigenen Hintergrund).
- `body` bekommt zusätzlich `min-height:100vh` (mit `100dvh` als zweiter, modernerer Wert direkt danach – Browser, die `dvh` kennen, nehmen automatisch den zweiten).
- Damit ist die Seite nie kürzer als der sichtbare Bildschirm, auch bei kurzen Ansichten wie dem Startscreen, und der Browser-eigene Hintergrund (der bei `color-scheme:dark` fast schwarz statt unserem Lila ist) kommt nirgends mehr zum Vorschein.

**Tests:** Keine automatisierte Prüfung dafür möglich (reine Layout-Metrik auf echtem Gerät), Tests 2–5 bleiben unverändert grün. Zusätzlich mit Chromium im iPhone-Format (390×844) gemessen: Dokument- und Body-Höhe entsprechen jetzt exakt der Bildschirmhöhe, die Tab-Leiste endet exakt am unteren Rand (vorher kürzer als die Bildschirmhöhe bei kurzen Ansichten).

**Nicht auf einem echten iPhone getestet:** Ob der Spalt auf dem Gerät jetzt wirklich weg ist – das war ja gerade der gemeldete Fehler, den ich nur im Code und in Chromium nachvollziehen konnte, nicht 1:1 auf dem iPhone.


## Version 151 – Sound & Musik in einer Kachel, volle Fortschrittsleiste, Vorlesen im Vokabelheft, Zurück-Wisch überall

> **Acht Änderungen auf einmal.** (1) Sound und Musik stehen in einer Kachel ganz oben in den Einstellungen: oben Sound An/Aus, darunter Regler für Musik (mit Soundtrack-Wahl), Soundeffekte und – neu – Dewis Stimme. (2) Im Testbereich gibt es einen „OK“-Knopf, weil man auf dem iPhone die Zahl sonst nicht bestätigen konnte. (3) Der Soundtrack „Holo-Aufstieg“ heißt jetzt „Indie“. (4) Der Home-Reiter zeigt ein Haus statt eines Kalenders. (5) Die Fortschritt-Kachel im Vokabelheft ist ausklappbar. (6) Die Fortschrittsleiste ist immer voll und zeigt, wie sich die begonnenen Wörter auf die Stufen verteilen – so sieht man den Regenbogen schon von Anfang an. (7) Jede Vokabel im Vokabelheft hat einen Lautsprecher zum Vorlesen. (8) Zurück-Wischen geht jetzt überall außer im laufenden Spiel und klappt auf dem iPhone viel zuverlässiger.

**Entscheidungen (Vito):** Kachel-Aufbau: Sound An/Aus, dann Musik, Soundeffekte, Dewis Stimme. „Dewis Stimme“ steuert Blubbern und Vorlesen zusammen. Je ein Regler, ganz links = aus, Sound-Schalter macht alles still (auch Musik). Fortschritt im Vokabelheft beim Öffnen immer eingeklappt. Vorlesen über einen Lautsprecher-Knopf pro Zeile. Deutschkurs-Stimme gleich mit beheben. Wisch: breiterer Rand und robustere Technik, zusätzlich in Shop, Gamemodes-Auswahl, Blind-Wahl und Einstellungen im Spiel.

**Technik**
- **Ton:** Neuer Wert `state.dvol` (Dewis Stimme), startet beim Update auf dem bisherigen Effekt-Wert, damit nichts plötzlich leiser oder lauter wird. Das Blubbern läuft über einen eigenen Lautstärke-Knoten `SND.dgain` (`acDewi()`), unabhängig von den Effekten. `say()` (Gerätestimme) hängt jetzt an `dvol` und am Sound-Schalter; vorher las es auch bei ausgeschaltetem Sound vor. `musicOn()` prüft jetzt auch den Sound-Schalter.
- **Musik nur noch über den Regler:** Der Musik-An/Aus-Schalter ist weg, `state.music` folgt dem Regler (`mvol>0`). Umstellung bestehender Stände (einmalig, `mus151`): Wer die Musik aus hatte, bekommt den Regler auf 0. Die Soundtrack-Wahl bleibt immer sichtbar.
- **Vorlesen im Deutschkurs:** `VOICELANG` kannte kein Deutsch (`de:'de-DE'` ergänzt), dort wurde bisher nie etwas vorgelesen – weder in der Einführung noch sonst.
- **Testbereich:** Zahlenfeld, „OK“ (Absenden des Formulars) und „Zurücksetzen“ in einer Zeile, das Feld wird dadurch schmaler (im iPhone-Format 114 px).
- **Indie:** Nur der angezeigte Name ändert sich. Intern heißt der Soundtrack weiter `holo`, damit gespeicherte Wahlen erhalten bleiben.
- **Fortschrittsleiste:** Neue gemeinsame Funktion `progParts()` für Startscreen und Vokabelheft. Die Segmente teilen sich 100 % unter den begonnenen Wörtern (Stufe 5 links bis Stufe 0 rechts); „Noch neu“ ist nicht mehr in der Leiste, steht aber weiter im Text („29 von 678“) und in der aufgeklappten Legende. Ohne begonnene Wörter bleibt die Leiste leer.
- **Ausklappen:** Die Kachel ist ein Knopf (`#bptog`) mit Pfeil nach unten, aufgeklappt zeigt er nach oben und die Stufen-Legende erscheint. `bookView()` baut sie immer eingeklappt.
- **Vorlesen im Vokabelheft:** Lautsprecher (`.spkrow`, 36 px) zwischen Wort und Stufen-Punkten, ein Klick-Listener auf der Liste ruft `say(w.id)` auf.
- **Zurück-Wisch (`EDGESW`):** Startstreifen 48 statt 24 px. Touch- statt Pointer-Ereignisse: Safari bricht Pointer-Gesten ab, sobald der Finger leicht nach oben oder unten wandert, weil es das für Scrollen hält – vermutlich der Grund, warum es am iPhone so selten klappte. Erkannt wird ein Wisch ab 60 px nach rechts, solange er nicht steiler als 45° ist; deutlich senkrechte Bewegungen (Scrollen) brechen ab. Starten auf Reglern, Eingabefeldern und der seitlich scrollbaren Filterleiste löst nichts aus. Ziel: Einstellungen im Spiel → zurück ins Spiel; offenes Sheet ohne laufendes Spiel (Shop, Gamemodes, Playmodes, Blind-Wahl) → derselbe Knopf wie oben links; Vokabelheft/Einstellungen → Startscreen; während einer Round, ihres Endscreens, einer Rückfrage oder eines Feier-Moments → nichts. Mit der Maus am Computer funktioniert dieselbe Geste.

**Tests:** Die Musik-Prüfungen H14/H15, M4, M13/M14 nutzen jetzt den Regler statt des weggefallenen An/Aus-Schalters, M10b erwartet „Sound & Musik“ als erste Kachel. Neuer Block V1–V29 in test4: Haus-Symbol, Kachel-Reihenfolge, Indie, Dewis Stimme auf 0 stumm (auch Vorlesen), Sound aus macht Musik und Dewi still, deutsche Stimme, OK-Knöpfe, volle Leiste auf Startscreen und im Vokabelheft, Ein-/Ausklappen, Lautsprecher in jeder Zeile, Zurück-Wisch an allen Orten (und nicht im Spiel, nicht beim Scrollen, nicht zu weit vom Rand), Umstellung bestehender Stände. Tests 2–5 grün. Zusätzlich in Chromium im iPhone-Format (390×844) gemessen: keine Überlappung in 40 Vokabelheft-Zeilen, kein seitliches Scrollen, alle drei Regler bündig, Pfeil exakt mittig auf der Kachel; eine echte Touch-Wischgeste mit leichtem Drift nach unten führt zurück.

**Nicht auf einem echten iPhone getestet:** Ob der Wisch jetzt zuverlässig klappt, ob iOS die Lautstärke für das Vorlesen beachtet (Safari ignoriert sie teils, „0 = aus“ greift aber sicher), ob das iPhone eine deutsche Stimme mitbringt, wie das Blubbern in der neuen Lautstärke klingt.

## Version 152 – Sprachscreens aufgeräumt

**Was:** Der erste Screen („Sprache / Language“) ist nicht mehr zweisprachig. Englisch ist vorgewählt und der ganze Screen (Titel, Hinweis, Knopf, Dewis Spruch) ist englisch. Ein Tipp auf „Deutsch“ schaltet sofort alles auf Deutsch um, ein Tipp auf „English“ wieder zurück. Erst „Weiter“ / „Next“ übernimmt die Wahl. In beiden Sprachscreens (App-Sprache und Lernsprache) stehen die Flaggen-Emojis wie auf dem Startscreen statt der Kürzel-Kästchen. Der Satz „Weitere Sprachen lassen sich später ergänzen“ ist weg.

**Warum:** Der Erstkontakt sollte nicht zwei Sprachen gleichzeitig zeigen, und die Flaggen passen zum Startscreen.

**Technik:** `uiDraft` (Standard `'en'`) hält die Entwurfs-Sprache; `uiView()` setzt `state.ui` nur während des Zusammenbauens auf den Entwurf, `state.ui` bleibt bis „Weiter“ leer. `bindUi()` ersetzt `bindPick`/`previewUiMascot` für diesen Screen. Neue Konstante `FLAGS` (auch für den Startscreen), CSS `.langrow .flagbox`. Die Handy-Sprache wird für die Vorauswahl nicht mehr beachtet (bestehende Nutzer ohne `ui` bekommen sie in `migrate()` weiter). Neue Texte im `EN`-Wörterbuch.

**Tests:** test3 Abschnitt 0 neu: nur Englisch sichtbar, Englisch vorgewählt, Flaggen, Umschalten hin und zurück, „Weiter“ übernimmt. Alle vier Suiten grün. Die alte Prüfung „Handy-Sprache ist vorgeschlagen“ entfällt gewollt.

**Nur auf einem echten iPhone prüfbar:** Wie die Flaggen-Emojis in den Zeilen aussehen (Größe/Ausrichtung), Ton beim Antippen.

## Version 153 – Leistungsanzeige gegen das Heißwerden

**Was:** Im Testbereich der Einstellungen gibt es einen Schalter „Leistungsanzeige“. Er blendet oben links eine kleine Anzeige ein: Bilder pro Sekunde, das längste Bild in ms, wie viele Bilder zu lahm waren, wie viele Animationen laufen und die drei häufigsten (Name×Anzahl).

**Warum:** Vito meldet, dass das iPhone beim Spielen in Safari heiß wird und der Bildschirm dunkler schaltet, vor allem in Modulen/Runden. Statt zu raten, messen wir erst. Ursachen im Verdacht (nur Lesen im Code, nichts geändert): rund 48 Endlos-Animationen (viele verändern Schatten, Verläufe oder Filter und zwingen zum Neuzeichnen), `mix-blend-mode` in den Wochen-Stempeln, `backdrop-filter` hinter Fenstern, live berechnete Musik (Taktgeber alle 90 ms). Musik und Bildrate-Drosselung bleiben bewusst unberührt.

**Technik:** `perfSet(on)` startet eine `requestAnimationFrame`-Schleife und `document.getAnimations()`; `state.perf` merkt den Schalter (kein Migrationsbedarf, fehlt = aus). Anzeige `#perf`, `pointer-events:none`, über allem. Läuft nur, wenn eingeschaltet.

**Tests:** P1–P3 in test4 (aus, an + gemerkt, wieder aus). Alle vier Suiten grün.

**Nur auf einem echten iPhone prüfbar:** Alles. Vito spielt mit eingeschalteter Anzeige und meldet, in welchem Modul die Werte schlecht sind (Bilder pro Sekunde unter 50, viele Animationen, auffällige Namen).

## Version 154 – Swipe: Ergebnis an der Stelle der Karte, leichter für das Handy

**Was:** Im Swipe-Modul erscheint das Ergebnis (Richtig/Nicht ganz, Wortpaar, Beispielsatz, Weiter-Knopf) genau dort, wo die Karte war. Vorher wurde der Kartenbereich erst nach 300 ms zusammengeklappt und das Ergebnis rutschte nach oben. Die beiden Antwort-Knöpfe bleiben stehen und färben sich grün/rot. Der Weiter-Knopf ist unverändert ein Knopf (keine zusätzliche Tipp-Fläche).

**Warum:** Vito meldet, dass das iPhone beim Spielen heiß wird, vermutlich im Swipe-Modul, und dass die Bewegung nach oben samt Verzögerung vor „Weiter“ stört.

**Technik:** `.swstage` enthält jetzt Karte und `#exfb` (Klasse `swres`). Nach der Antwort bekommt die Bühne `answered`: die Karte wird per `position:absolute` aus dem Fluss genommen und fliegt weg, das Ergebnis steht sofort an ihrer Stelle. Die Zusammenklapp-Animation (`max-height`, löst bei jedem Bild neue Layoutberechnung aus) und `.collapsed` sind weg. Gegen die Hitze: `will-change:transform` auf der Karte (der große Schatten wird nur einmal gezeichnet und dann als Ebene bewegt), `translate3d` statt `translateX`, und die Ziehbewegung schreibt die Position höchstens einmal pro Bild per `requestAnimationFrame`. Das Aufleuchten der Knöpfe (`lean`) bleibt sofort.

**Tests:** test3 neue Prüfung „Ergebnis und Weiter stehen in der Karten-Stelle“. Alle vier Suiten grün.

**Nur auf einem echten iPhone prüfbar:** ob das Wischen weniger Wärme erzeugt (Leistungsanzeige beobachten: fps und „Anim“ im Swipe-Modul), wie sich der Wechsel von Karte zu Ergebnis anfühlt, ob das Ergebnis bei langen Wörtern sauber an der Kartenstelle sitzt.

## Version 155 – Neues Modul „Slots“ (goldener Automat mit Symbolen)

**Was:** Ein zusätzliches Modul neben dem alten Reels, das unverändert bleibt. Ein goldener Spielautomat (Kapsel, drei weiße Walzen, Hebel mit Goldkugel, rote Pfeile an der Gewinnlinie) dreht Symbole: Zahlen 0–10 und Früchte. Hebel antippen oder herunterziehen (oder auf den Automaten tippen), die Walzen stoppen nacheinander. Danach wird pro Walze gefragt „Wie heißt Symbol N?“ mit zwei Knöpfen in der Lernsprache. Richtige Wörter erscheinen auf der Walze. Ergebnis und „Weiter“ darunter.

**Warum:** Das alte Reels braucht einen Beispielsatz mit drei bekannten Wörtern und stößt oft auf Probleme. Mit Symbolen steht vorher fest, wo die Walzen landen („Zufall“ ist Show), und das Modul fragt nur bekannte Wörter ab. Bild-zu-Wort trainiert direktes Abrufen ohne Umweg über die Muttersprache.

**Regeln (mit Vito abgestimmt):**
- Kommt nur, wenn das aktuelle Wort ein Symbol hat; zählt für die Stufen wie jedes Modul. Solo-Kachel „Slots“ im Survival.
- 1 bekanntes Symbolwort: alle drei Walzen gleich (erzwungen). 2 bekannte: beide kommen vor. Ab 3: Zufall, das aktuelle Wort ist immer dabei.
- Drei gleiche Symbole: nur eine Frage („Alle drei: Wie heißt das?“). Echter Dreier ab 3 bekannten Symbolwörtern: Jackpot-Show (Glühen, Funken, Ton). Erzwungener Dreier: keine Show, kein Bonus.
- Falsche Option: ein bekanntes Wort, bevorzugt ein anderes Symbolwort.
- Fehler: Daily Round 1 frei, Survival keiner (`TRIES.slots=2`).
- Alles richtig: im Survival doppelte Punkte (`S.cur.ptsMul=2`, nicht beim erzwungenen Dreier). Grundwert wie Reels (`SURV_BASE.slots=97`).
- Nur Auswahl; Tippen auf hohen Stufen kann später dazukommen.

**Symbole:** selbst gezeichnete SVGs im Casino-Comic-Look mit dunkler Kontur und Glanzlichtern. Zahlen rot mit Goldrand und Glanz, Früchte (Apfel, Banane, Orange, Zitrone, Mango, Ananas, Wassermelone, Kokosnuss) mit Diva-Gesicht: halb geschlossene Augen mit Wimpern, Rouge, kleines Lächeln, Glitzerstern. Indonesisch: 18 Symbolwörter (0–10, sieben Früchte), Englisch/Deutsch: 15 (0–10, Apfel, Banane, Orange, Zitrone). Eine Kirsche gibt es in keinem Kurs.

**Technik:** `modules/slots.js` (`slotKey`, `slotsData`, `slFoil`, `showSlots`, Symbole `SL_ART`/`slNumArt`). Die englische Bedeutung entscheidet über das Symbol (im Englischkurs steht sie im Wort selbst). Das Drehen ist eine reine CSS-Übergangsanimation pro Walzenstreifen (`translate3d`, eigene Ebene, keine Bild-für-Bild-Schleife wie bei Reels), damit das Handy nicht heiß wird. Endlos-Animationen gibt es keine; das Jackpot-Glühen läuft zweimal. Testhaken: `window.__slReels` (feste Walzen), `S.cur.slPull()`; mit `__introMs=0` läuft alles ohne Wartezeit. Der Hilfe-Knopf sitzt links, weil rechts der Hebel steht. `rounds.js`: `TRIES`, `SURV_BASE`, Punkte mal `ptsMul`, Automat zählt nicht als freie Weiter-Fläche.

**Tests:** test4 SL1–SL17 (Symbolwörter, Verfügbarkeit, erzwungener Dreier, zwei/viele bekannte, falsche Option, Solo-Kachel, Hebel, Fragen, Gewinn mit doppelten Punkten, Dreier mit einer Frage, Fehler im Survival, englische Texte). Die automatischen Durchläufe in test2–5 ziehen bei Slots den Hebel. Alle vier Suiten grün. Layout in Chromium bei 375 und 430 px gemessen: Automat passt, kein seitliches Scrollen, Symbole stehen nach dem Stopp genau auf der Gewinnlinie, Fragen nach rund 2,4 s.

**Nur auf einem echten iPhone prüfbar:** wie die Symbole und der Goldglanz wirken, ob Hebel-Tipp und Herunterziehen gut gehen, Ton und Haptik beim Stoppen, ob das Drehen flüssig läuft und das Handy kühl bleibt (Leistungsanzeige).

## Version 158 – Slots zurück auf den Stand von Version 155

**Was:** Vito gefällt die Design-Anpassung aus den Versionen 156 (leuchtende Ringe, Wirbel mit Leuchtstreifen, Strom-Sounds `slcharge`/`slcrack`/`slslam`, kräftigere Haptik, Neon-Nacht-Look für Slots) und 157 (leuchtende Außenseiten) nicht. Beide wurden per `git revert` rückgängig gemacht (Historie bleibt erhalten). Code von `app.src.html`, `modules/slots.js` und den Tests ist wieder identisch mit Version 155: goldener Automat, Walzen stoppen nach 1,15 / 1,6 / 2,05 s, bisherige Hebel- und Stopp-Sounds.

**Hinweis für später:** Die Einträge zu 156 und 157 wurden beim Zurücksetzen aus dieser Datei mit entfernt; die Details stehen in den Commits `c9e5760` und `77c41c2`, falls Teile davon (z. B. nur der Sound) später doch gewünscht sind.

**Tests:** Alle vier Suiten grün.

## Version 159 – Survival-Screen öffnet ohne Stocken

**Was:** Beim Tippen auf Survival stockte die App. Ursache: Für jede Solo-Kachel wurde mit `soloWords()` für **jedes** gelernte Wort geprüft, ob das Modul es abfragen kann. Bei Bausteinen, Reels, Lückensatz und Auswahl heißt das jedes Mal den Beispielsatz durchrechnen. Gemessen in Chromium: 50 Wörter ca. 0,1 s, 300 Wörter ca. 0,55 s, alle 678 Wörter ca. 2,1 s (auf dem iPhone eher mehr).

**Lösung:** Die Kachel braucht nur „mindestens 3 passende Wörter?“. Neues `soloCount(pm,limit)` in `rounds.js` zählt nur bis zur Grenze und hört dann auf. `playmodes.js` nutzt es für die Kacheln. `soloWords()` bleibt unverändert für den Start einer Solo-Round. Optisch ändert sich nichts (gesperrte Kacheln zeigen weiter „(1/3)“ usw.).

**Ergebnis (Chromium):** Survival-Screen mit allen Wörtern in ca. 0,04 s statt 2,1 s.

**Bewusst nicht geändert (Vitos Entscheidung):** Die Dauer-Animationen auf dem Screen (fließender Regenbogen der Random-Kachel, wackelnder Würfel mit Schatten).

**Tests:** test4 PF1 (gleiches Ergebnis wie die volle Zählung, bis zur Grenze), PF2 (mit 2 Wörtern alles gesperrt). Alle vier Suiten grün.

**Nur auf einem echten iPhone prüfbar:** ob das Öffnen jetzt flüssig wirkt.

## Version 160 – Symbolwörter bekommen meistens Slots

**Was:** Slots kam in der Daily Round selten (nur bei Symbolwörtern, und dort zufällig unter 5–7 Modulen). Jetzt bekommen Wörter mit Symbol (Zahlen 0–10, Früchte) etwa 2 von 3 Mal Slots, sonst wie bisher ein zufälliges anderes Modul. Das gilt für die Daily Round und das Survival mit Random-Playmode. Ausnahmen: das Abschlusswort der Daily Round (bleibt bevorzugt Tippen/Bausteine), neue Wörter (Kennenlernen) und nie zweimal Slots hintereinander.

**Warum:** Vito möchte Slots öfter sehen, ohne dass Symbolwörter nie mehr getippt werden.

**Technik:** `rounds.js` `chooseModule`: `SLOTS_PREF=2/3`; steht `slots` im Pool (also `can(w)` und nicht das letzte Modul) und ist die Karte kein Abschlusswort, wird mit dieser Wahrscheinlichkeit Slots genommen. Tatsächlicher Anteil etwas höher (rund 70–75 %), weil Slots im Rest auch zufällig dran kommen kann.

**Tests:** test4 SLP1–SLP4 (Anteil bei 600 Ziehungen, Abschlusswort ohne Vorrang, nie zweimal hintereinander, Wörter ohne Symbol nie Slots). Alle vier Suiten grün.

## Version 161 – Neues Modul „Pads“ (Farben lernen auf Musik-Pads)

**Was:** Vitos Idee: Farben lernen auf einem Pad-Controller. Oben steht das gesuchte Farbwort (nur geschrieben, in der Lernsprache), darunter ein schwarzer Glanzrahmen mit farbigen, von innen leuchtenden Pads. Man tippt das Pad in der richtigen Farbe. Jedes Pad spielt einen weichen Synth-Ton aus der C-Dur-Pentatonik (jede Reihenfolge klingt harmonisch) und leuchtet beim Antippen auf. Falsches Pad: kurzes Wackeln mit rotem Rand.

**Regeln (mit Vito abgestimmt):**
- Kommt nur, wenn das aktuelle Wort eine Farbe ist; zählt für die Stufen. Solo-Kachel „Pads“ im Survival.
- Schwierigkeit nach Stufe des Wortes: Stufe 0–1: 2×2 Pads, eine Farbe; 2–3: 3×3, eine Farbe; 4: 3×3, zwei Farben hintereinander; 5: drei. Weitere Farben der Folge sind andere bekannte Farbwörter (sonst kürzere Folge); das aktuelle Wort ist immer dabei, nicht immer vorne.
- Übrige Pads: beliebige andere Farben des Kurses.
- Fehler: Daily Round 1 frei, Survival keiner (`TRIES.pads=2`). Survival-Grundwert 73 Punkte (wie Auswahl).

**Farbwörter:** Indonesisch 11 (merah, biru, hijau, kuning, hitam, putih, cokelat, abu-abu, oranye, ungu, merah muda). Englisch/Deutsch 10 (dort gibt es Orange nur als Frucht). Erkennung über die englische Bedeutung (`padKey`); „jeruk = orange“ (Frucht) zählt nicht, „oranye = orange (color)“ schon.

**Technik:** `modules/pads.js` (`padKey`, `padsData`, `padTone`, `showPads`). Pads sind `div` mit `role=button` (kein allgemeiner Klick-Ton), Eingabe per `pointerdown` (sofort, auch bei schnellen Folgen). Leuchten über `.pad::after` mit fest gezeichnetem Glanz, nur Deckkraft, nur beim Antippen; keine Dauer-Animation. In `app.src.html`: Der Tipp-irgendwo-weiter-Handler (Version 122) ignoriert jetzt Pads, sonst blätterte der Klick nach dem letzten richtigen Pad sofort weiter. `rounds.js`: `TRIES.pads`, `SURV_BASE.pads`. Testhaken: `window.__padSeq`, `S.cur.padHit(farbe)`.

**Tests:** test4 PD1–PD14 (Farbwörter, Orange-Frucht ausgeschlossen, 11 Farben, Raster und Folgenlänge je Stufe, kürzere Folge ohne bekannte Farben, Solo-Kachel, Ablauf richtig/falsch, Lösung wird gezeigt, englische Texte). Die automatischen Durchläufe in test2–5 lösen Pads selbst. Alle vier Suiten grün. Chromium 375/430 px: 2×2-Pads 145 px, 3×3-Pads 93 px, alles im Bild, kein seitliches Scrollen, drei Farbwörter passen in eine Zeile.

**Nur auf einem echten iPhone prüfbar:** Klang der Pad-Töne, wie das Leuchten wirkt, ob schnelles Tippen bei Folgen sauber erkannt wird.

## Version 162 – NEU-Marke bei den Solo-Modulen entfernt

**Was:** Die gelbe „NEU“-Pille auf den Solo-Kacheln (Swipe, Reels, Reihenfolge, Slots, Pads) ist weg. Neue Module bekommen sie auch künftig nicht mehr.

**Warum:** Vito wollte keine Marke mehr; sie klebte ohnehin dauerhaft an allen Modulen.

**Technik:** `isNew` aus allen `registerModule`-Aufrufen und aus der Doku in `modules/_registry.js` entfernt, Marken-Ausgabe in `playmodes.js` und CSS `.mnew` gelöscht. Das Wort „NEU“ im Vokabelheft-Filter (`Neu`) und „Noch neu“ im Fortschritt sind etwas anderes und bleiben.

**Tests:** alle vier Suiten grün, keine Anpassung nötig.

**Nur auf einem echten iPhone prüfbar:** nichts Besonderes, nur Blick auf die Solo-Kacheln ohne Pille.

## Version 163 – Neuer Gamemode „Rush“

**Was:** Neben Survival gibt es auf der Gamemodes-Seite eine blau-türkise Kachel „Rush“. Ziel: zehn Module aus bekannten Wörtern so schnell wie möglich. Die Auswahl ist wie im Survival (Random-Kachel oben, darunter die Solo-Module). Eine Stoppuhr läuft von der ersten Karte bis das zehnte Modul gewertet ist (auch über die Ergebnis-Screens). Pro Karte gibt es einen Versuch; ein verlorenes Modul kostet +5 Sekunden und es geht weiter. Am Ende zählt die Zeit hoch, dazu Bestzeit und Chips.

**Warum:** Vitos Idee eines Tempo-Modus mit eigener Bestzeit neben dem Punkte-Modus Survival.

**Regeln (mit Vito abgestimmt):** Wörter zufällig aus allen bekannten; gesperrt unter 5 bekannten Wörtern (wie Survival); bei weniger als 10 Wörtern kommen sie reihum nochmal. Chips nach Endzeit inkl. Strafe: ≤60 s = 60, ≤90 s = 45, ≤120 s = 30, ≤180 s = 15, langsamer = 5; neue Bestzeit +10; höchstens 150 Chips am Tag (eigener Zähler `state.chipRush`). Die Grenzen (`CHIPV.rushTiers`) sind Startwerte und werden nach Vitos erstem Test angepasst. Der Lernstand bleibt unberührt (keine Stufen, keine Fälligkeiten). **Hinweis:** Survival steigert dagegen Stufen (einmal pro Tag und Wort); „wie Survival“ in der Frage war insofern missverständlich, umgesetzt ist „Lernstand unberührt“.

**Technik:** `S.kind==='rush'`; `arcade()` fasst Survival und Rush zusammen (ein Versuch, Solo-Modulwahl). Zustand `S.t0/t1/pen/pa`; Anzeige `#rtime` per `setInterval` (100 ms, nur ein Textfeld), die Uhr pausiert im Hintergrund (`visibilitychange`). Bestzeit in `bestStore()['rush:<playmode>']` in Millisekunden (kleiner ist besser). Ein Rush wird nicht in `state.run` gespeichert (Verlassen = Abbruch). `openPlaymodes('rush')` nutzt dieselbe Auswahl wie Survival; `showRushEnd`, `chipRush`, `fmtTime`, `rushItems`.

**Tests:** test4 RU1–RU20 (Kachel, Auswahl, Start, Uhr, Strafe, Ende, Bestzeit, Lernstand unverändert, Chip-Stufen und Tageslimit, Sperre, wenige Wörter, Englisch). Alle vier Suiten grün. Chromium-Maße bei 375/430 px: Kachel gleich breit wie Survival, Uhr tickt, kein Überlauf.

**Nur auf einem echten iPhone prüfbar:** Wie sich die Uhr und das Antippen im Tempo anfühlen, Haptik/Sound beim Endscreen, ob die Chip-Stufen zu großzügig oder zu knapp sind.

## Version 164 – Rush: Stufen steigern, Pause, schnelleres Design

**Was:** (1) Rush steigert den Lernstand wie Survival: ein richtiges Modul gibt Stufe +1 (einmal pro Tag und Wort), ein verlorenes stuft nie zurück. Das ersetzt „Lernstand unberührt“ aus Version 163. (2) Ein Rush lässt sich pausieren: Verlassen (X oder App in den Hintergrund) speichert den Run samt bisheriger Spielzeit und Strafen. Auf der Gamemodes-Seite erscheint oben die grüne „Weiterspielen“-Kachel („Rush · Random · 0:42.3 · noch 6 Module“). Die Uhr läuft erst beim Weiterspielen weiter, die angefangene Karte beginnt von vorn. (3) Die Rush-Kachel liegt nur noch 8 px unter Survival (vorher etwa 40 px). (4) Neues Aussehen: Verlauf von Lila zu Weiß, schräge Speed-Lines (statisch, keine Animation wegen der Wärme), Stoppuhr mit Fahrtlinien in Lila.

**Technik:** `saveRun` speichert für Rush `el` (Spielzeit ohne Pausen) und `pen`; `resumeRun` setzt `t0=jetzt-el`. `closeSheet` sichert einen laufenden Rush; ist das zehnte Modul schon gewertet, zeigt es stattdessen das Ergebnis (nichts geht verloren). `visibilitychange` speichert beim Verstecken der App. `continueCard` zeigt Survival- und Rush-Runs. Der Abstand kommt aus einem überflüssigen Wrapper (`margin-top:12px`) plus `.card`-Rand plus Flex-Abstand; jetzt `margin-top:-6px` an der Kachel.

**Tests:** test4 RU11 angepasst (nur steigen, nie fallen), neu RU21–RU24 (Pause, Weiterspielen-Kachel, Fortsetzen mit gleicher Zeit/Strafe, Ergebnis beim Verlassen nach dem zehnten Modul). Alle vier Suiten grün; Chromium 375/430 px: Abstand 8 px, kein Überlauf.

**Nur auf einem echten iPhone prüfbar:** Wirkung des Lila-Weiß-Verlaufs mit Speed-Lines, Lesbarkeit der Schrift auf dem hellen Ende, Pause über den App-Wechsel.

## Version 165 – Rush-Kachel: bewegte Speed-Lines

**Was:** Die schrägen Linien auf der Rush-Kachel ziehen jetzt endlos nach links vorbei: eine Lage mit langen, langsamen Strichen (1,7 s pro Durchlauf) und eine mit kurzen, schnellen (0,95 s).

**Technik:** Die Linien sind Hintergründe von `::before`/`::after` der Kachel (doppelt so breit wie die Kachel, nahtlos kachelnd, `repeat-x`), animiert nur über `transform` (`@keyframes rushl`, GPU-Ebene, `will-change`). Gesperrte Kachel und „Bewegung reduzieren“: keine Animation. Die Animation läuft nur, solange die Gamemodes-Seite offen ist.

**Tests:** alle vier Suiten grün. Chromium: beide Animationen laufen, Transform ändert sich über die Zeit, kein Überlauf, Abstand 8 px.

**Nur auf einem echten iPhone prüfbar:** Tempo und Wirkung der Linien und ob das Gerät dabei warm wird (zwei kleine Transform-Animationen; die Leistungsanzeige im Testbereich zeigt „Anim“).

## Version 166 – Hintergrundverlauf für alle Screens, Stoppuhr in der Rush-Auswahl

**Was:** (1) Der Lila-Verlauf, den bisher nur die Survival- und Rush-Auswahl hatten (heller Schein oben, nach unten dunkler), liegt jetzt hinter allen Screens: Startseite, Vokabelheft, Einstellungen, Shop, Spiel-Screens und die Gamemodes. Im Neon-Theme gibt es dieselbe Idee in Türkis/Blau. (2) In der Kopfzeile der Rush-Auswahl steht oben rechts eine Stoppuhr, genau dort, wo im Survival die Herzen sind.

**Technik:** Neue Variable `--wash` (Theme-abhängig). Sheets: `.sheet{background:var(--wash),var(--bg)}` (der Verlauf bleibt beim Scrollen stehen, weil der Hintergrund am scrollenden Element hängt). Startseite: `body::before` als feststehende Ebene (`position:fixed`, `z-index:-1`), `body` selbst ist transparent über `html{background:var(--bg)}`. Der eigene Verlauf von `.sin.surv` entfällt. Alles statisch, keine Animation. Stoppuhr: `RUSH_WATCH` in `playmodes.js`, CSS `.rushwatch`.

**Tests:** alle vier Suiten grün. Chromium 390 px: Pixelproben zeigen auf Startseite und Rush-Screen oben einen hellen Violett-Schein (100,77,156), unten dunkel (31,17,51); Stoppuhr sitzt rechts am Rand (36 px), kein Überlauf.

**Nur auf einem echten iPhone prüfbar:** wie der Verlauf hinter den einzelnen Screens wirkt (besonders Vokabelheft, Shop, Spiel-Screens und im Neon-Theme) und ob Texte überall gut lesbar bleiben.

## Version 167 – Kein ungewolltes Zoomen in Safari

**Was:** Doppeltippen und Zwei-Finger-Zoomen vergrößern die App nicht mehr (Vitos Wahl: jedes Zoomen aus).

**Technik:** Drei Schichten, weil Safari nicht jede einzeln respektiert: (1) Viewport-Angabe in `build.py` mit `maximum-scale=1,user-scalable=no`; (2) CSS `html{touch-action:pan-x pan-y}` (erlaubt nur Scrollen, schaltet Doppeltipp-Zoom und Pinch aus; Kinder mit eigenem `touch-action` bleiben unberührt); (3) `gesturestart/gesturechange/gestureend` werden abgebrochen (Safari-Zwei-Finger-Geste). Ein Nebeneffekt: Safari zoomt beim Antippen eines Textfelds nicht mehr hinein.

**Tests:** alle vier Suiten grün (das Verhalten selbst ist nur auf dem iPhone prüfbar).

**Nur auf einem echten iPhone prüfbar:** Doppeltippen auf Knöpfe und leere Flächen, schnelles Tippen bei Pads/Slots/Tippen-Modul, Zwei-Finger-Zoom im Safari-Tab und in der Home-Bildschirm-Verknüpfung, Tippen in Textfelder (Name, Tippen-Modul). Neuere iOS-Versionen können das Sperren im normalen Safari-Tab teilweise ignorieren; die Gesten-Sperre fängt das ab.

## Version 168 – Farbwörter bekommen meistens Pads

**Was:** Wie bei Slots für Zahlen und Früchte bekommen Farbwörter (rot, blau, grün …) jetzt etwa 2 von 3 Mal das Modul Pads, vor allem in der Daily Round und im Rush/Survival mit Random. Das Abschlusswort der Daily Round bleibt schwer (Tippen oder Bausteine), und nie zweimal dasselbe Modul hintereinander.

**Technik:** `PADS_PREF=2/3` in `rounds.js`, in `chooseModule` direkt hinter der Slots-Regel. Wörter ohne Farbe sind nicht betroffen (`can`-Prüfung des Moduls).

**Tests:** test4 PP1–PP4 (Anteil 421/600, Abschlusswort, nie zweimal, Nicht-Farbwörter). Alle vier Suiten grün.

**Nur auf einem echten iPhone prüfbar:** ob 2 von 3 sich beim Spielen richtig anfühlt oder zu oft vorkommt.

## Version 169 – Synonyme, Umgangssprache und Abkürzungen (Pilot: Indonesisch, Wörter 1–105)

**Was:** Wörter akzeptieren jetzt weitere richtige Antworten, ohne dass sich die Anzeige ändert. Beispiel „terima kasih“: Übersetzung tippen geht mit „thank you“, „thanks“, „thx“, „cheers“ (Englisch) bzw. „danke“, „dankeschön“, „vielen Dank“ (Deutsch); das Kurswort tippen geht mit „makasih“, „terimakasih“, „trims“. Auch Abkürzungen („gpp“ für „tidak apa-apa“, „yg“ für „yang“), Chat-Formen („gue“, „lu“, „gimana“, „udah“) und Ziffern („5“ für „lima“) zählen. Pilot: 90 Wörter aus den ersten 105 (Begrüßung, Pronomen, Zahlen, Zeit), bei 53 davon auch Umgangssprache/Abkürzungen. Wörter ohne gängiges Synonym bleiben leer.

**Warum:** Vito möchte, dass Lernen mit Alltags- und Umgangssprache mehr Spaß macht; die App ist nicht auf perfekte Grammatik ausgelegt.

**Technik:** Neue Datei `syn.js` (eine Zeile je Wort: `Schlüssel | Englisch | Deutsch | Schreibweisen des Kurswortes`, Kommalisten), im Build nach der deutschen Wortliste eingebunden. Daraus entstehen `w.syn[Sprache]` (weitere Übersetzungen) und `w.alts` (weitere Schreibweisen des Kurswortes, bestehender Mechanismus). Neuer Helfer `glList(w)` = angezeigte Bedeutungen plus Synonyme. Er wird beim Tippen der Übersetzung (`isCorrect`, `ownAnswers`) und bei den falschen Auswahl-Antworten (Auswahl, Lückensatz, Swipe) verwendet, damit nie ein richtiges Synonym als falsche Antwort auftaucht. Nach dem Tippen steht unter „Auch richtig“ eine Auswahl (bis zu vier). Vokabelheft-Suche findet auch Synonyme. Leerzeichen/Bindestriche sind beim Kurswort egal (`normId`), deshalb brauchen „dimana“, „samasama“ keinen Eintrag. Pads/Slots lesen weiter nur die erste Bedeutung (`w.en`), Synonyme stören dort nicht.

**Tests:** test4 SY1–SY7 (Schlüssel gültig, Übersetzung/Kurswort/Abkürzung tippen, Auswahl enthält nie ein Synonym, Anzeige unverändert). Alle vier Suiten grün. Kollisionsprüfung: Synonyme, die zugleich die Hauptbedeutung eines anderen Wortes sind (z. B. „morning“ bei „selamat pagi“ und „pagi“), sind bewusst erlaubt, weil sie nur die akzeptierten Antworten erweitern.

**Nur auf einem echten iPhone prüfbar:** wie sich „Auch richtig“ und die erweiterten Antworten beim Tippen anfühlen, ob die Auswahl gängig genug ist.

## Version 170 – Eigene Synonyme direkt in der App

**Was:** Nach dem Tippen-Modul gibt es einen Knopf „＋ Synonym“. Er öffnet ein Eingabefeld (bei falscher Antwort mit der zuletzt getippten Antwort vorbelegt). Beim Tippen der Übersetzung (`id2gl`) wird eine weitere Übersetzung gespeichert, beim Tippen des Kurswortes (`gl2id`) eine weitere Schreibweise. In den Einstellungen zeigt die Kachel „Meine Ergänzungen“ alle eigenen Einträge, jeder lässt sich löschen, „Liste kopieren“ gibt sie im Format von `syn.js` aus (`Schlüssel | en | de | Schreibweisen`), damit sie später fest in die App übernommen werden können.

**Warum:** Vito bemerkt beim Spielen fehlende Synonyme/Umgangssprache und soll sie sofort selbst ergänzen können. Die App kann nicht selbst auf GitHub schreiben, daher Gerät + Liste zum Weitergeben.

**Technik:** `state.mysyn[w.k]={en,de,v}` (Migration in `migrate()`, in der Sicherung enthalten). `syn.js`: `mySynApply` (beim Start an die Wörter hängen), `mySynAdd` (prüft leer / zu lang / schon vorhanden / höchstens 8 pro Wort), `mySynRemove`, `mySynLines`. `modules/typing.js` merkt `c.lastVal`. `rounds.js`: `mySynUi`. Nach dem Speichern wird `ANS_CACHE` geleert; bereits verlorene Karten bleiben verloren, die Ergänzung gilt ab der nächsten Karte.

**Tests:** test4 SY8–SY18 (Logik und Bedienung), alle vier Suiten grün.

**Nur auf dem iPhone prüfbar:** Tastatur geht beim Antippen von „＋ Synonym“ auf und das Feld bleibt sichtbar; „Liste kopieren“ (Zwischenablage in Safari); Layout der Kachel.

## Version 171 – Erste eigene Ergänzungen fest übernommen

**Was:** Vitos erste kopierte Liste aus „Meine Ergänzungen“ ist jetzt fest in `syn.js`: Deutschkurs `hallo` (auch „hey“), `viel glück` (auch „viel erfolg“), `bis morgen` (auch „until tomorrow“).
**Warum:** Der Weg Gerät → Liste → App funktioniert; die eigenen Einträge bleiben zusätzlich im Gerät, doppelte werden dort einfach ignoriert.
**Technik:** Drei Zeilen in `SYN_RAW` (Schlüssel mit Kurspräfix `de:`). Test SY1 prüft jetzt alle Kurse, neu SY19.
**Tests:** alle vier Suiten grün. **Nur auf dem iPhone prüfbar:** nichts Neues.

## Version 172 und 173 – Hauptmenü fixiert, dann zurückgenommen

**Was:** Version 172 hatte das Hauptmenü fixiert (kein Scrollen, bei wenig Höhe per `zoom` verkleinert, `body{position:fixed}`). Auf Vitos iPhone war danach die Darstellung kaputt, deshalb nimmt Version 173 die Änderung komplett zurück (Git-Gegenbuchung `git revert`, Historie bleibt erhalten). Stand der App ist wieder wie in Version 171.
**Warum es schiefging (Vermutung, nicht geprüft):** Die Prüfung lief nur in Chromium am Computer. `position:fixed` auf dem `body` und CSS-`zoom` verhalten sich auf iOS-Safari und in der Home-Bildschirm-Verknüpfung anders (Adressleiste, Safe-Areas, Tab-Leiste).
**Lehre / nächster Versuch:** Wenn das Hauptmenü wieder fixiert werden soll, erst Vitos genaues Fehlerbild erfragen (was sieht er?) und vorsichtiger vorgehen, z. B. nur `overscroll-behavior:none` und `overflow:hidden` auf dem Hauptmenü ohne `position:fixed` und ohne `zoom`.
**Tests:** alle vier Suiten wie vor Version 172.

## Version 174 – Startkapitel und Kapitelwahl

**Was:** Neues erstes Kapitel „Start“ mit den wichtigsten Wörtern (Indonesisch 46, Englisch 46, Deutsch 45): Begrüßung, Ich/Du/Er/Wir, Fragewörter, Zahlen 0–5, vier Hauptfarben (rot, blau, grün, gelb), Grundverben, Wasser/Kaffee/Reis/Haus, „und“. Das nächste neue Wort kommt immer aus dem **aktiven Kapitel**. Ist das gewählte Kapitel durch (jedes Wort einmal begonnen), öffnet sich auf dem Hauptmenü eine Auswahl „Kapitel geschafft!“; im Vokabelheft steht an jedem Kapitel „Hier weitermachen“, das aktive trägt die Marke „Aktiv“. Wechseln geht jederzeit.
**Warum:** Farben kamen erst ab Wort 487, also nach über einem Jahr bei einem Wort pro Runde. Mit dem Startkapitel sind Pads, Slots und die Satzmodule früh frei, danach wählt Vito selbst, was ihn interessiert.
**Technik:** `start.js` (`START_IDS`, `applyStart`) nimmt die Wörter zur Laufzeit aus ihren alten Kapiteln und setzt sie als Kapitel 0 nach vorn; Daten und Schlüssel bleiben unverändert, der Spielstand hängt am Wort und bleibt gültig. `state.chap[Kurs]` = gewähltes Kapitel (`defaults`, `migrate`: bisheriges erstes Kapitel mit neuen Wörtern). `activeCat`, `needsPick`, `hasUnseen`, `plan()` nimmt `fresh` aus dem aktiven Kapitel (ist es leer, vorübergehend aus dem nächsten mit neuen Wörtern). `openChapterPicker`/`chooseChapter`/`chapBar`. Die Auswahl öffnet sich in Tests nur mit `window.__pickTest`.
**Abdeckung (alle Startwörter bekannt, Wörter je Modul):** Indonesisch Tippen/Swipe 46, Blocks 42, Reels 20, Lücke/Auswahl 12, Reihenfolge 7, Slots 6, Pads 4; Englisch Blocks 36, Reels 17, Reihenfolge 10, Slots 6, Pads 4, Lücke/Auswahl 4; Deutsch Blocks 37, Reels 20, Reihenfolge 14, Slots 6, Pads 4, Lücke/Auswahl 3. Jedes Solo-Modul hat damit mindestens SOLO_MIN (3) Wörter; Lücke/Auswahl im Deutschkurs liegt genau an der Grenze.
**Hinweis für bestehenden Spielstand:** Die Startwörter, die Vito noch nicht kennt (z. B. Farben, Verben), kommen jetzt zuerst als neue Wörter, danach öffnet sich die Auswahl.
**Tests:** CH1–CH11, alle vier Suiten grün.
**Nur auf dem iPhone prüfbar:** Aussehen der Kapitelwahl (Overlay) und der Zeile „Hier weitermachen“ im Vokabelheft; dass die Auswahl nicht mitten in der Runde stört.
**Nächste Version (vereinbart):** Einsteigerkurs beim Antippen gesperrter Pads/Slots.

## Version 175 – Einsteigerkurs für gesperrte Pads und Slots

**Was:** In der Solo-Auswahl (Survival und Rush) lässt sich eine gesperrte Pads- oder Slots-Kachel antippen. Sie zeigt „Antippen: Kurz-Einsteigerkurs“ und startet einen kurzen Kurs: bis zu 4 fehlende Wörter (Pads: die Farben, Slots: die Zahlen/Früchte, in Kursreihenfolge, also zuerst die Startkapitel-Wörter) werden zuerst kennengelernt (die normale Einführung), danach folgt je Wort ein Mini-Test mit Tippen oder Bausteinen. Alle Kurswörter gelten danach als begonnen: richtig = Stufe 1, falsch = Stufe 0 (wackelig, morgen fällig). Am Ende: „Einsteigerkurs geschafft!“, die gelernten Wörter, Knopf „Pads/Slots spielen“ (nur wenn der Modus selbst offen ist) und „Fertig“.
**Warum:** Vito wollte gesperrte Module nicht nur als Sperre sehen, sondern direkt freispielen können.
**Technik:** `rounds.js`: `courseWords(pm)`, `startCourse(pm,kind)`, `showCourseEnd()`, neue Rundenart `S.kind==='course'` (eigener Zweig in `settleCard`, `chooseModule`, `kicker`, `showEnd`; `saveRun` speichert sie nicht). Er geht nicht über `startRound`, darum bleiben `clearRun`, Tagesstand (`state.done`), Serie und Pokerhand unberührt, ein offener Run bleibt erhalten. `playmodes.js`: Kachel mit `data-course`. Der Kurs zählt nicht gegen das tägliche neue Wort (das kommt weiter aus dem aktiven Kapitel).
**Tests:** CO1–CO10 in test4; alle vier Suiten grün.
**Nur auf dem iPhone prüfbar:** Gefühl und Länge des Kurses (Einführung + Mini-Test), Ton, ob die antippbare, aber noch „gesperrte“ Kachel verständlich wirkt.

## Version 176 – Start zusätzlich zu den Themenkapiteln, Farben eigenes Kapitel

**Was:** (1) Die Startwörter stehen jetzt **zusätzlich** zu ihrem Themenkapitel in „Start“ (statt aus ihm herausgenommen zu sein). Zahlen 0–5 stehen also wieder im Kapitel Zahlen und in Start; es ist dasselbe Wort mit gemeinsamem Fortschritt. Wer nur die Daily Round spielt, lernt weiter zuerst Start. (2) „Kleidung & Farben“ ist aufgeteilt in **Farben** (Indonesisch 12, Englisch/Deutsch je 13 Wörter inkl. Gold/Silber) und **Kleidung**. (3) Neue Kapitelreihenfolge in Vokabelheft und Kapitelwahl: Start, Begrüßung & Höflichkeit, Pronomen & Fragewörter, Zahlen, Farben, Essen & Trinken, danach der Rest in alter Reihenfolge. „Essen & Trinken“ blieb bewusst ungeteilt (Vitos Entscheidung), rückt aber nach oben; Wasser, Kaffee und Reis stehen zusätzlich in Start.
**Technik:** `start.js`: `applyStart` teilt die Farben ab und sortiert die Kapitel, `markStart` setzt `w.st` (Platz in der Startliste) und `catCount[0]`, `inCat(w,c)`/`catWords(L,c)` (Kapitel 0 = Wörter mit `w.st`, sonst `w.cat`). Start hat selbst keine Wörter in `w.cat`. Das Kapitel wird jetzt mit **Namen** gemerkt (`state.chap[Kurs]`), `migrate()` wandelt die alten Nummern aus Version 174 um (`CAT_OLD174`). Vokabelheft: Startwörter erscheinen in der Gruppe Start (nur ohne Suche/Filter) und in ihrem Themenkapitel. Neuer Eintrag im Wörterbuch: Kleidung, Farben.
**Tests:** CH12–CH18 neu, CH1–CH11 angepasst; alle vier Suiten grün.
**Nur auf dem iPhone prüfbar:** wie das Vokabelheft mit doppelt gelisteten Startwörtern wirkt; dass Vitos gewähltes Kapitel nach dem Update stimmt (alte Nummer wird zum Namen).

## Version 177 – Einzelnes Wort im Vokabelheft freiwillig lernen

**Was:** Im Vokabelheft lässt sich ein noch nicht begonnenes Wort antippen; darunter erscheint „Jetzt lernen“. Dann folgen Kennenlernen und ein Mini-Test (Tippen oder Bausteine) nur mit diesem Wort. Danach ist das Wort immer Stufe 1, auch bei falscher Antwort im Mini-Test (Vitos Entscheidung). Nochmaliges Antippen der Zeile klappt den Knopf wieder zu; der Lautsprecher in der Zeile funktioniert wie vorher.
**Warum:** Wer ein Wort gezielt vorziehen will, soll nicht auf die Reihenfolge warten müssen.
**Technik:** Gleiche Rundenart `course` wie der Einsteigerkurs (Version 175), neu `startWordLearn(w)` und `showWordLearnEnd()` in `rounds.js` (`S.course.kind==='word'`). Nicht gespeichert, keine Serie, keine Hand, kein Tagesstand, ein offener Run bleibt unberührt. In `app.src.html`: `learnOpen`, Klick-Handler auf `#vlist`, Zeilen `.row.lrn` und `.learnrow`. Neue EN-Texte.
**Tests:** WL1–WL7 neu; alle vier Suiten grün.
**Nur auf dem iPhone prüfbar:** Tippgefühl der Zeile (Scrollen vs. Antippen), Ton und Haptik am Ende.

## Version 178 – Satz verbessern (Wortzuordnung direkt in der App)

**Was:** Nach der Antwort in **Bausteine** und **Reihenfolge** gibt es unter dem Ergebnis den Knopf „Satz verbessern“, sofern das Wort einen Beispielsatz hat. Er zeigt beide Sätze Wort für Wort. Man tippt ein Wort und dann das passende im anderen Satz; gleiche Farbe = gehört zusammen. „Keine Entsprechung“ löst ein Wort wieder. Speichern gilt ab der nächsten Karte. Auslöser war „She has two children.“: ohne geprüfte Zuordnung markiert die App nur die gelernte Vokabel („two“), „She“ blieb unmarkiert.
**Warum:** Viele Sätze haben keine geprüfte Zuordnung in `align.js`; Vito soll sie beim Spielen selbst nachziehen können (wie „＋ Synonym“).
**Technik:** `modules/_shared.js`: `alignFixBtn`/`alignFixBind` (Editor), `alignFor` nimmt zuerst `state.myalign[Wort:App-Sprache]` = `{a,b,t}` (gleiches Format wie `align.js`, `t` = Satztext), sonst `ALIGN`. Vorbelegung: bestehende Zuordnung, sonst die gelernte Vokabel als Paar 1. `migrate()` legt `state.myalign` an (Sicherung enthält es automatisch). Einstellungen → „Meine Ergänzungen“: Zuordnungen löschen und „Zuordnungen kopieren“ (`myAlignLines()` in `syn.js`, Zeilen im `align.js`-Format zum festen Übernehmen). Nur die Markierung, nicht der Satztext. Die Korrektur gilt je App-Sprache (Englisch/Deutsch getrennt).
**Tests:** AL1–AL6 neu; alle vier Suiten grün.
**Nur auf dem iPhone prüfbar:** Tippgröße und Umbruch der Wortkacheln bei langen Sätzen, Platz unter dem Ergebnis.

## Version 179 – Reels mit Emojis

**Was:** Das Modul Reels ist umgebaut (ersetzt die Satz-Version komplett). Oben im Automaten stehen **drei Emojis**, jeweils über einer Walze. Jede Walze dreht Wörter der Lernsprache; man stoppt sie, wenn das Wort zum Emoji auf der Linie steht. Bedienung wie bisher: Hebel, Tippen stoppt die linkeste offene Walze, ein Fehler ist frei (im Survival nicht), Jackpot nur als Show, Automat nach links wegwischen. Ergebnis zeigt „🍎 apel · 🐶 anjing · …“. Kein Beispielsatz mehr; die Zuordnungs-Logik der Satz-Walzen entfällt.
**Auswahl:** Das Kartenwort hat ein Emoji und mindestens zwei weitere gelernte Wörter mit anderem Emoji ergänzen es (sonst kommt Reels nicht, wie bei Pads/Slots). Ablenker auf den Walzen: bevorzugt andere gelernte Wörter, sonst beliebige Wörter der Lernsprache (kurz genug).
**Emoji-Liste:** neue Datei `emoji.js` (Zeilen `bedeutung = emoji`, Schlüssel = englische Bedeutung, im Englischkurs das Wort selbst), derzeit rund 250 Einträge für bildbare Wörter (Essen, Tiere, Dinge, Orte, Körperteile, Farben, Zahlen, einige Gefühle). Indonesisch 199, Englisch 201, Deutsch 199 Wörter haben ein Emoji. Wörter ohne Emoji (Verben, Abstraktes) bekommen Reels nicht; es springt ein anderes Modul ein. Neue Einträge nur dort ergänzen.
**Technik:** `modules/reels.js`: `emojiOf`, `reelsPlan`, schnelle Vorprüfung `reelsCan`; Walzen-Datenform (`words`, `right`, `st`) blieb gleich, daher laufen Spiellogik und Testhaken weiter. Emoji-Zeile `.cbody.emo` mit gleichem Raster wie die Walzen; bei „Bewegung reduzieren“ steht das Emoji vor jeder Auswahlzeile. Hilfe-Text, EN-Texte angepasst.
**Tests:** R1–R4 und K3 neu, Test-Hilfen `knownEm`/`knownReels` getrennt, test5 prüft Reels nicht mehr auf Satz-Markierung; alle vier Suiten grün.
**Nur auf dem iPhone prüfbar:** Aussehen und Größe der Emojis im Automaten (Apple-Emoji), ob die Emoji-Spalten sauber über den Walzen sitzen, Spielgefühl mit Wörtern statt Satzteilen. Die Emoji-Liste bitte beim Spielen auf Unstimmigkeiten prüfen.

## Version 180 – Reels entfernt

**Was:** Das Modul Reels ist komplett aus der App genommen (Vito gefiel die Emoji-Version aus Version 179 nicht). Es erscheint nicht mehr bei den Solo-Modulen, im Survival, Rush und in der Daily Round. Die Emoji-Liste (`emoji.js`) fällt mit weg, sie diente nur Reels.
**Technik:** `modules/reels.js` und `emoji.js` gelöscht (Include und Einträge in `TRIES`/`SURV_BASE` entfernt). Wiederherstellung jederzeit aus dem Speicherpunkt `Version 179 – Reels mit Emojis` (Satz-Version: Stand bis Version 178). Ein pausierter Survival-/Rush-Lauf, der auf „Reels solo“ stand, läuft nach dem Update als „Random“ weiter (`resumeRun`). Absichtlich geblieben, weil auch Slots sie nutzt: Dewis `reels_*`-Sprüche, der Automaten-Stil (CSS) und der Synthwave-/Arpeggio-Code in der Musik (springt nur auf dem alten Reels-Bildschirm an, also jetzt nie).
**Tests:** Reels-Blöcke aus test4 entfernt, Musik- und Hilfe-Tests ohne Reels, SL3 prüft jetzt, dass es Reels nicht mehr gibt; alle vier Suiten grün.
**Nur auf dem iPhone prüfbar:** Solo-Auswahl und Rush/Survival enthalten kein Reels mehr; ein pausierter Lauf, falls vorhanden, lässt sich weiterspielen.
