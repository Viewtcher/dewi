# dewi. einrichten: GitHub Pages, iPhone und (optional) VS Code

Das Projekt liegt im Repository `Viewtcher/dewi`. Du kannst im Claude-Chat im Browser weiterarbeiten **und/oder** lokal in VS Code. Für den Browser brauchst du nur die Schritte 5 (Pages) und 6 (iPhone). Die übrigen Schritte sind für die Arbeit am PC.

Am Ende hast du:
- den Projektordner auf deinem PC, geöffnet in VS Code,
- Claude Code in VS Code, angemeldet mit deinem Claude-Abo,
- eine App-Adresse `https://<dein-github-name>.github.io/dewi/`, die sich bei jedem Push von selbst aktualisiert, aber nur, wenn alle Tests grün sind,
- deinen Spielstand in der neuen App.

Rechne für alles mit etwa 30 Minuten, nur Pages und iPhone etwa 10. Die Schritte bauen aufeinander auf, also bitte der Reihe nach.

---

## Schritt 1: Node.js installieren

**Warum:** Die Tests laufen mit Node.js. Git, Python und VS Code hast du schon.

1. Öffne die **PowerShell** (Startmenü → „PowerShell“ tippen).
2. Gib ein:
   ```
   winget install OpenJS.NodeJS.LTS
   ```
   Klappt `winget` nicht: auf https://nodejs.org die **LTS**-Version herunterladen und installieren.
3. **PowerShell schließen und neu öffnen**, sonst kennt sie Node noch nicht.
4. Prüfen, ob alles da ist:
   ```
   git --version
   python --version
   node --version
   ```
   Alle drei sollten eine Versionsnummer zeigen.
   - Öffnet `python` den Microsoft Store statt eine Nummer zu zeigen, nimm stattdessen `py --version`. Dann schreibst du in dieser Anleitung überall `py` statt `python`.

## Schritt 2: Git einmalig einrichten

**Warum:** Jeder Speicherpunkt (Commit) trägt einen Namen und eine E-Mail. Weil das Repository öffentlich ist, nimmst du **nicht** deine echte E-Mail, sondern die anonyme von GitHub.

1. Auf github.com: oben rechts dein Bild → **Settings** → **Emails**.
2. Haken bei **„Keep my email addresses private“** setzen. Darunter steht deine anonyme Adresse, etwa `12345678+deinname@users.noreply.github.com`. Kopieren.
3. In der PowerShell (Anführungszeichen mitschreiben):
   ```
   git config --global user.name "Vito"
   git config --global user.email "HIER-DIE-NOREPLY-ADRESSE"
   git config --global init.defaultBranch main
   ```
   Die letzte Zeile sorgt dafür, dass der Hauptzweig `main` heißt. Darauf hört die automatische Veröffentlichung.

## Schritt 3: Projekt von GitHub holen (klonen)

**Warum:** Das Projekt liegt schon auf GitHub. Du holst dir eine Kopie, die mit GitHub verbunden bleibt.

1. Lege einen Ordner an, der **nicht** von OneDrive synchronisiert wird, zum Beispiel `C:\Projekte`.
   **Warum:** OneDrive und Git kommen sich gern in die Quere (gesperrte Dateien, doppelte Kopien). Desktop und Dokumente sind unter Windows oft OneDrive-Ordner.
2. In VS Code: links **Quellcodeverwaltung** → **„Repository klonen“** → **„Von GitHub klonen“** → bei GitHub anmelden → `Viewtcher/dewi` wählen → Zielordner `C:\Projekte`.
3. VS Code fragt „Geklontes Repository öffnen?“ → **Öffnen**. Bei „Vertrauen Sie den Autoren?“ → **Ja**.

## Schritt 4: In VS Code öffnen und einmal lokal testen

1. Terminal öffnen: **Terminal → Neues Terminal** (oder `Strg+ö`).
2. Nacheinander eingeben:
   ```
   python build.py
   npm ci --prefix tests
   npm test --prefix tests
   ```
   - `build.py` meldet „gebaut 555 KB“.
   - `npm ci` installiert das Test-Werkzeug (einmalig, ca. 30 Sekunden).
   - `npm test` dauert ein paar Minuten. Am Ende stehen zweimal **„ALLES OK“** und zweimal **„Alle Tests bestanden“**. Meldungen wie „Not implemented: HTMLCanvasElement“ sind harmlos.

**Warum testen wir schon hier:** So weißt du, dass der Ordner auf deinem PC vollständig ist, bevor irgendetwas online geht.

## Schritt 5: GitHub Pages einschalten

1. Auf github.com dein Repository `dewi` öffnen.
2. **Settings** → links **Pages**.
3. Bei **Source** (Quelle) **„GitHub Actions“** wählen. Fertig, kein Speichern-Knopf nötig.
4. Oben im Repository auf den Reiter **Actions** gehen.
   - Der erste Lauf vom Hochladen ist wahrscheinlich **rot**. Das ist normal, weil Pages da noch aus war.
   - Links **„Bauen, testen, veröffentlichen“** anklicken → rechts **„Run workflow“** → **„Run workflow“**.
5. Warten (ca. 3–5 Minuten), bis der Lauf einen **grünen Haken** hat. Im Lauf siehst du beim Schritt „Veröffentlichen“ die Adresse:
   `https://<dein-github-name>.github.io/dewi/`

**Warum dieser Umweg über Actions:** Bei jedem Push baut GitHub die App neu und führt alle Tests aus. Nur wenn alles grün ist, geht die neue Version live. Sonst bleibt die alte online, und du bekommst eine Mail.

## Schritt 6: Spielstand auf das iPhone übertragen

Der Spielstand liegt nur im Browser und hängt an der Adresse. Die neue Adresse startet deshalb leer. So nimmst du ihn mit:

1. Deine **bisherige** dewi.-App vom Home-Bildschirm öffnen → **Einstellungen** → **Sicherung erstellen** → **Kopieren**. Den Text in eine Notiz einfügen.
2. In Safari die neue Adresse `https://<dein-github-name>.github.io/dewi/` öffnen → **Teilen** → **„Zum Home-Bildschirm“**.
3. Die **neue App vom Home-Bildschirm** öffnen (nicht im Safari-Tab, die beiden haben getrennten Speicher!).
4. **Einstellungen** → Text bei **„Sicherung hier einfügen“** einfügen → **Sicherung einspielen** → nochmal tippen zum Bestätigen.
5. Prüfen: Serie und Wörter da? Dann das alte Symbol vom Home-Bildschirm löschen.
   **Nicht** in der Sicherung (so entschieden): Diamanten (starten bei 0), freigeschaltete Figuren und Musik-Einstellungen. Musik stellst du bei Bedarf neu ein.
6. Hast du eine Kurzbefehl-Automation für die tägliche Erinnerung, dort die Adresse auf die neue ändern.

## Schritt 7: Claude Code in VS Code einrichten

1. In VS Code `Strg+Umschalt+X` (Erweiterungen) → nach **„Claude Code“** suchen → die von **Anthropic** → **Installieren**.
2. Rechts oben im Editor (eine Datei muss offen sein) oder links in der Leiste erscheint das **Funken-Symbol** von Claude. Klicken.
3. **Sign in** → im Browser mit deinem Claude-Konto anmelden. Das Abo deckt die Nutzung ab, du brauchst keinen API-Schlüssel.
4. Erster Auftrag zum Ausprobieren:
   > Lies CLAUDE.md und ENTWICKLUNG.md und sag mir in ein paar Sätzen, was als Nächstes offen ist.

**Was Claude Code hier darf** (steht in `.claude/settings.json`, ist schon eingerichtet):
- bauen, testen, Commits machen: ohne Nachfrage,
- **pushen, also veröffentlichen: fragt immer**, auch im Auto-Modus.

Unten im Eingabefeld siehst du den **Modus**. „Auto“ heißt: Claude entscheidet die meisten Schritte selbst, eine Prüfung im Hintergrund stoppt riskante Aktionen. Wer am Anfang jeden Schritt sehen will, stellt auf **„Manual“**.

Die Agenten **Nova** und **Marlin** sind im Projekt dabei. Du rufst sie wie gewohnt beim Namen auf, z. B. „Nova, wie findest du …“.

## So sieht der Alltag aus

1. Du beschreibst Claude in VS Code, was du willst.
2. Claude stellt dir seine Fragen, du entscheidest.
3. Claude ändert die Quellen, baut, testet, schreibt den Eintrag in `ENTWICKLUNG.md` und macht einen Commit.
4. Claude fragt: „Soll ich pushen?“ Du sagst Ja.
5. Nach 3–5 Minuten ist die neue Version auf dem iPhone. Die App einmal schließen und neu öffnen, notfalls zweimal (Safari speichert kurz zwischen).

## Wenn etwas hakt

| Problem | Lösung |
|---|---|
| `npm` meldet „Die Datei npm.ps1 kann nicht geladen werden“ | In der PowerShell einmal `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` eingeben, mit `J` bestätigen, Terminal neu öffnen. |
| `python` öffnet den Microsoft Store | `py` statt `python` verwenden. Oder unter Einstellungen → Apps → Erweiterte App-Einstellungen → App-Ausführungsaliase die beiden Python-Einträge ausschalten. |
| Actions-Lauf ist rot | Im Lauf auf den roten Schritt klicken. Steht dort ein Test-Fehler, Claude in VS Code den Text geben: „Der Actions-Lauf ist rot, hier die Meldung: …“. |
| Adresse zeigt 404 | Nach dem ersten grünen Lauf bis zu 10 Minuten warten. Prüfen, ob unter Settings → Pages „GitHub Actions“ gewählt ist. |
| iPhone zeigt die alte Version | App ganz schließen (vom unteren Rand wischen) und neu öffnen. |
