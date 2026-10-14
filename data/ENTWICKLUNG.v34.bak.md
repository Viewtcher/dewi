# kata.vito – Entwicklerdokumentation

Vokabeltrainer für Indonesisch (Bahasa Indonesia → Englisch), gebaut als einzelne HTML-Datei für das iPhone (Home-Bildschirm-Verknüpfung über Safari). Dieses Dokument hält Aufbau, Regeln und alle Änderungen fest. **Bei jeder Änderung wird der Abschnitt „Änderungsprotokoll“ ergänzt.**

---

## 1. Überblick

| Punkt | Wert |
|---|---|
| Name | kata.vito („kata“ = Wort) |
| Art | Web-App, eine Datei, kein Framework, kein Server |
| Speicher | `localStorage`, Schlüssel `kata.v1` (Datenversion 2, siehe 4.) |
| Zielgerät | iPhone 15 Pro, Safari → „Zum Home-Bildschirm“ |
| Sprache der Oberfläche | Deutsch |
| Lernsprache | Indonesisch → Englisch (weitere Sprachen später über `LANGS`) |
| Wortschatz | 678 Einträge in 20 Kategorien, 652 mit Beispielsatz |
| Design | dunkel, Indigo-Grundton, bunte Akzente (Gelb, Orange, Pink, Violett, Blau, Cyan, Grün) |
| Hosting (geplant) | GitHub Pages: `index.html` + `icon.png` |

Warum Web-App statt Xcode: Das MacBook Pro 2015 läuft nur bis macOS 12, dafür gibt es kein aktuelles Xcode. Eine Web-App braucht keins.

## 2. Dateien

```
kata/
├── app.src.html          Gerüst: Stile, Markup, Wortschatz, Beispielsätze, Zustand, Startseite, Vokabelheft, Einstellungen, Dewi, Stempel, Sound.
│                         Bindet die Dateien unten über Zeilen wie /*@include modules/swipe.js*/ ein.
├── rounds.js             ROUNDS: startRound, Wort-Reihe (showItem, nextStep), Kennzeile, finish, levelUp, showEnd
├── playmodes.js          PLAYMODES: Random/Solo, planCards (Kartenreihe pro Wort), Playmode-Wahl für Freeplay
├── modules/
│   ├── _registry.js      Modul-Register (registerModule, MOD, resolveModule) mit Erklärung der Begriffe
│   ├── _shared.js        Gemeinsame Helfer: Hervorhebung, Wortkacheln, Distraktoren, editDist, Leben-Anzeige
│   ├── intro.js          Modul Kennenlernen (nur für neue Wörter, keine Wertung)
│   ├── blocks.js         Modul Bausteine
│   ├── typing.js         Modul Tippen (inkl. Tippfehler-Toleranz)
│   ├── swipe.js          Modul Swipe
│   ├── gap.js            Modul Lückensatz
│   └── choice.js         Modul Auswahl
├── build.py              Setzt die Includes ein und baut index.html und icon.png
├── index.html            Fertige Datei zum Hosten (Ergebnis von build.py)
├── icon.png              512×512, Home-Bildschirm-Symbol (vier bunte Blütenblätter)
├── ENTWICKLUNG.md        dieses Dokument
├── concept/              Konzeptbilder (Dewi, Stempel, Playmode-Wahl …)
└── data/                 Patch-Skripte der einzelnen Versionen und Sicherungen app.src.vNN.bak.html
```

**Wichtig:** Maßgeblich ist `app.src.html`. Die Dateien in `data/` sind Arbeitskopien. Wer Sätze ändert, ändert sie direkt in `app.src.html` (Block `SENT_RAW`).

### Bauen

```
python3 build.py        # erzeugt index.html + icon.png
```

`build.py` ersetzt zuerst die Include-Zeilen (`/*@include datei*/`) durch den Dateiinhalt und zerlegt dann `app.src.html` (Titel, Schrift-Link, `<style>`, Markup/Skript) und setzt ein vollständiges HTML-Dokument zusammen: `viewport-fit=cover`, `theme-color #0d1325`, `apple-mobile-web-app-*`-Meta-Tags (Titel „kata.vito“), `apple-touch-icon`.

## 2a. Begriffe (feste Wörter für Gespräch, Doku und Code)

| Ebene | Begriff | Bedeutung | Beispiele / Code |
|---|---|---|---|
| Aufgabe | **Modul** | Eine Übungsart, die ein Wort abfragt | Bausteine (`blocks`), Tippen (`typing`), Swipe (`swipe`), Lückensatz (`gap`), Auswahl (`choice`); dazu das Kennenlernen (`intro`) ohne Wertung |
| Aufgabe | **Karte** | Ein Wort in einem Modul, die kleinste Einheit | „eine Swipe-Karte“ |
| Ablauf | **Playmode** | Welche Module eine Round einsetzt | **Random** (gemischt, nach Stufe) und **Solo** (ein einziges Modul für alle Wörter, z. B. „Solo Swipe“) |
| Runde | **Round** | Eine komplette Abfrage vom Start bis zum Ergebnis | siehe unten |
| Runde | **Daily Round** | Die Pflicht des Tages (Button „Daily Round starten“), immer Playmode Random | `startRound('daily')` |
| Runde | **Freeplay** | Freiwillige Round aus der **Wiederholungsliste** (`freeplay_review`) oder **Fehlerliste** (`freeplay_list`); Playmode wählbar | `openPlaymodes(kind)` |
| Topf | **Listen** | Wiederholungsliste, Fehlerliste und „neu“: die Töpfe, aus denen eine Round Wörter zieht | `plan()` |

Weitere feste Wörter: **Stufe** (0 bis 5) des Wortes, **Kennzeile** (die farbige Zeile oben im Modul, z. B. „WIEDERHOLUNG · STUFE 1 · MODUL SWIPE · INS DEUTSCHE · SOLO“), **Kennenlernen** (Phase für neue Wörter, kein Modul mit Wertung).

Früher gebrauchte, jetzt nicht mehr verwendete Wörter: „Satz-Übung“ (war die Gruppe aus Auswahl, Lückensatz, Bausteine und Swipe), „Abfrage/Sitzung“ (jetzt Round) und „freiwillig üben“ (jetzt Freeplay).

### So sagt man Änderungen
- „Im Modul Swipe soll der falsche Vorschlag schwerer sein“
- „Beim Playmode Solo soll am Ende …“
- „In der Daily Round soll das Modul Lückensatz häufiger kommen“ (betrifft `pickSentenceModule` in `playmodes.js`)
- „Freeplay soll auch Fehlerliste und Wiederholungsliste mischen“

### Ein neues Modul anlegen
1. Datei `modules/<id>.js` mit der Anzeige-Funktion (`showXyz`, liest die laufende Karte aus `S.cur`, ruft am Ende `nextStep` bzw. `finish`) und am Ende `registerModule({id, name, desc, tone, icon, solo, can, fallback, show})`. Details im Kopf von `modules/_registry.js`.
2. Eine Zeile `/*@include modules/<id>.js*/` in `app.src.html` bei den anderen Modulen.
3. Eigene Texte in `EN` ergänzen. Erscheint automatisch als Kachel im Playmode Solo.
4. Soll es auch im Playmode Random vorkommen, in `pickSentenceModule` / `planCards` (`playmodes.js`) eintragen.

### Datenblätter der Module
| Modul | Datei | Braucht | Ersatz | Wertung |
|---|---|---|---|---|
| Kennenlernen | `intro.js` | nichts | nur bei neuen Wörtern | keine |
| Bausteine | `blocks.js` | Beispielsatz mit mindestens 2 Wörtern oder Alltagssatz | Swipe | ein Versuch, falsche Reihenfolge = falsch |
| Tippen | `typing.js` | nichts | – | 3 Versuche, Tippfehler-Toleranz je Stufe |
| Swipe | `swipe.js` | nichts | – | ein Versuch, falscher Vorschlag = falsch |
| Lückensatz | `gap.js` | Beispielsatz mit Lücke | Auswahl, dann Swipe | 3 Leben |
| Auswahl | `choice.js` | Beispielsatz | Swipe | 3 Leben |

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
  newPerDay: 1..5,
  dayOffset: 0,               // nur für „Einen Tag vorspulen“ (Testbereich)
  progress: { id: { [key]: { l: 0..5, d: 'YYYY-MM-DD' } } },
  list:     { id: { [key]: { n: Fehlerzähler, s: 'YYYY-MM-DD' (seit) } } },
  daily:    { date, newCount, extra, lt: [keys] },  // lt = heute geübte Fehlerlisten-Wörter
  done:     { 'YYYY-MM-DD': true }                  // Tage mit erfüllter Tagesaufgabe (Serie)
}
```

- `l` = Stufe. 0 bedeutet „auf der Fehlerliste“, 1–5 sind die Lernstufen.
- `d` = nächster Fälligkeitstag. Wörter auf der Fehlerliste haben `d = '9999-12-31'` (`FAR`), sind also nie automatisch fällig.
- Datumsstrings sind lokale Daten (kein UTC), `today()` berücksichtigt `dayOffset`.
- Sicherung (Einstellungen → „Sicherung erstellen“): JSON `{app:'kata', v:1, exported, data:{lang,newPerDay,progress,list,daily,done}}`. Das `v:1` ist das Format der Hülle und bleibt gleich.

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

## 6. Lernlogik (Stand Version 5)

### 6.1 Schritte pro Wort

| Art | Schritte |
|---|---|
| Neues Wort | 1 Kennenlernen → 2 Satz-Übung → 3 Tippen |
| Wiederholung Stufe 1–2 | Satz-Übung → Tippen |
| Wiederholung Stufe 3–5 | nur Tippen |
| Fehlerliste (Kurzer Durchlauf) | Satz-Übung → Tippen (keine Kennenlernkarte) |

- **Kennenlernen:** Wort, Bedeutung, Kategorie, Beispielsatz mit hervorgehobenem Wort und englischer Übersetzung.
- **Satz-Übung** (zufällig eine der beiden, 1 Versuch):
  - *Auswahl:* englischer Satz, in dem das englische Wort durch das indonesische ersetzt ist; vier Antworten (richtige Bedeutung + 3 Ablenker, bevorzugt aus derselben Kategorie, nie mit gleicher normalisierter Bedeutung).
  - *Bausteine:* Satz aus Kacheln zusammensetzen, Richtung zufällig (Indonesisch → Englisch oder umgekehrt), dazu 2 überzählige Kacheln aus anderen Sätzen. Satzzeichen werden entfernt, der Satzanfang klein gesetzt (außer „I“ und Eigennamen), verglichen wird ohne Groß-/Kleinschreibung. Für Alltagssätze ist der Eintrag selbst die Vorlage. Hat ein Eintrag weniger als 2 Wörter auf einer Seite, entfällt Bausteine.
- **Tippen:** wie bisher, Richtung zufällig, bis zu 3 Versuche, ab Versuch 2 ein Tipp (erste zwei Buchstaben).

### 6.2 Bewertung („Jede Phase zählt“)

Ein Wort gilt nur als richtig, wenn **Satz-Übung und Tippen** richtig waren (Tippen: Versuch 1, 2 oder 3 zählt). Die Phasen laufen immer bis zum Ende durch, auch nach einem Fehler; erst danach wird gewertet (`record(w, ok, type)` am Ende von `finish`).

- **Richtig:** Stufe +1 (max. 5), nächster Termin nach `INTERVALS = [1, 3, 7, 14, 30]` Tagen. Wörter von der Fehlerliste gehen auf Stufe 1 (morgen).
- **Falsch:** Wort geht auf die Fehlerliste (`n` +1), Stufe 0, `d = FAR`. Es kommt **nicht** automatisch morgen wieder (Änderung gegenüber Version 4).

### 6.3 Fehlerliste

- Dynamische Liste pro Sprache mit Fehlerzähler `n` und Datum `s`.
- **Pflicht pro Tag:** genau ein Wort – das mit den meisten Fehlern, bei Gleichstand das am längsten wartende (`s` aufsteigend, dann alphabetisch). Wörter, die **heute** auf die Liste gekommen sind, sind nicht pflichtig (sie dürfen freiwillig geübt werden).
- Wird das Pflichtwort geübt (egal ob richtig oder falsch), ist die Pflicht für heute erledigt (`daily.lt`).
- Verlässt die Liste nach **1× richtig**; bleibt bei Fehler mit `n` +1.
- **Freiwillig weiter üben:** Knopf auf dem Startbildschirm, sobald die Pflicht erledigt ist; bis zu 5 weitere Wörter in derselben Reihenfolge, Wörter, die heute schon geübt wurden, ausgenommen.
- Anzeige: Karte „Fehlerliste“ auf dem Startbildschirm (Anzahl, bis zu 8 Wörter mit Fehlerzahl), Filter „Fehlerliste“ und Marke „Fehlerliste ×n“ im Vokabelheft, Legende „Fehlerliste“ im Fortschritt.

### 6.4 Tagesplan und Serie

`plan()` liefert `{due, fresh, mand, vol}`:

- `due`: alle fälligen Wiederholungen (kein Tageslimit), die nicht auf der Fehlerliste stehen
- `fresh`: neue Wörter = `newPerDay + extra − newCount` (Reihenfolge wie im Wortschatz)
- `mand`: Pflichtwort der Fehlerliste (oder `null`)
- `vol`: Fehlerlisten-Wörter, die heute noch nicht geübt wurden

Sitzungsreihenfolge: Wiederholungen → neue Wörter → Pflichtwort. Die Serie zählt, wenn nach einer Sitzung `due`, `fresh` und `mand` leer sind (`state.done[heute] = true`). Eine freiwillige Sitzung allein erfüllt den Tag nicht, solange noch etwas offen ist.

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

Ablauftest mit jsdom (npm-Paket `jsdom`), Datei `jt/test.js` im Arbeitsordner der Sitzung. Er lädt `index.html`, spielt Sitzungen über die Oberfläche durch und prüft 50+ Punkte, u. a.: drei Phasen eines neuen Wortes, Fehler in der Satz-Übung → Fehlerliste, Pflichtwort mit den meisten Fehlern, Wort verlässt Liste nach 1× richtig, freiwilliges Üben, Stufe 3 nur Tippen, Migration alter Daten, Alltagssätze nur Bausteine, beide Übungsarten und beide Bausteine-Richtungen, Sicherung, Serie (5 Tage), Zurücksetzen.

Zusätzlich: `node --check` auf das extrahierte Skript und Sichtprüfung per Screenshot (Chromium/Playwright).

Ausführen: `cd jt && node test.js` (nach `python3 build.py`).

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

1. Neues öffentliches Repository anlegen (z. B. `kata`).
2. `index.html` und `icon.png` hochladen (Add file → Upload files).
3. Settings → Pages → Branch `main`, Ordner `/ (root)` → Save.
4. Adresse `https://<benutzer>.github.io/kata/` in Safari öffnen → Teilen → „Zum Home-Bildschirm“.

Hinweise: Safari-Tab und Home-Bildschirm-App haben **getrennten** Speicher. Deshalb zuerst die App vom Home-Bildschirm aus benutzen und Sicherungen regelmäßig anlegen. Für die tägliche Erinnerung: Kurzbefehle → Automation → Tageszeit → „URL öffnen“ (Verhalten je nach iOS-Version nach dem Hosten prüfen). Die Schrift kommt von Google Fonts; ohne Netz greifen Systemschriften.

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
