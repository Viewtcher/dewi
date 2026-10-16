/* ===== Modul-Register =====
   Begriffe (siehe ENTWICKLUNG.md, „Begriffe“):
   - MODUL      eine Übungsart, die EIN Wort abfragt: Bausteine, Tippen, Swipe, Lückensatz, Auswahl
                (plus das Kennenlernen als reines Vorstell-Modul ohne Wertung).
   - KARTE      ein Wort in einem Modul.
   - PLAYMODE   legt fest, welche Module eine Round einsetzt: Random (gemischt, nach Stufe) oder Solo (ein Modul).
   - ROUND      eine komplette Abfrage vom Start bis zum Ergebnis: Daily Round (Pflicht des Tages)
                oder Survival (freiwillig, alle begonnenen Wörter, 3 Leben).

   Jedes Modul liegt in einer eigenen Datei unter modules/ und meldet sich mit registerModule an:
     id        kurze Kennung (blocks, typing, swipe, gap, choice, intro)
     name()    Anzeigename
     desc()    Kurzbeschreibung für die Kachel
     tone      Farbklasse der Kachel (t1 … t5)
     icon      SVG der Kachel
     solo      true = im Playmode Solo wählbar
     isNew     true = bekommt die „NEU“-Marke
     can(w)    kann das Modul dieses Wort abfragen? (z. B. braucht Lückensatz einen Beispielsatz)
     fallback  Modul-Kennung, falls can(w) false ist
     show(w)   zeigt die Karte (liest die laufende Round aus S.cur) */
const MODULES=[],MOD={};
function registerModule(m){MODULES.push(m);MOD[m.id]=m;}
function resolveModule(id,w){let m=MOD[id],g=0;while(m&&m.can&&!m.can(w)&&m.fallback&&g++<5)m=MOD[m.fallback];return m?m.id:id;}
