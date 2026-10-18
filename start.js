/* Version 174/176: Startkapitel. Die wichtigsten Wörter stehen als erstes Kapitel „Start" vorn (Begrüßung, Pronomen, Fragewörter,
   Zahlen 0–5, vier Hauptfarben, Grundverben). Seit Version 176 bleiben die Wörter in ihren Themenkapiteln und stehen zusätzlich in Start (w.st = Platz in der Liste, gemeinsamer
   Fortschritt). Reihenfolge in der Liste = Reihenfolge im Kapitel Start. */
const START_IDS={
  id: ["halo", "selamat pagi", "selamat malam", "sampai jumpa", "terima kasih", "sama-sama", "tolong", "maaf", "ya", "tidak", "apa kabar", "baik", "nama", "saya", "kamu", "dia", "kita", "apa", "siapa", "di mana", "berapa", "ini", "itu", "nol", "satu", "dua", "tiga", "empat", "lima", "merah", "biru", "hijau", "kuning", "mau", "punya", "ada", "makan", "minum", "pergi", "suka", "air", "kopi", "nasi", "rumah", "dan", "bisa"],
  en: ["hello", "good morning", "good evening", "goodbye", "thank you", "you are welcome", "please", "sorry", "yes", "no", "how are you", "fine", "my name is", "I", "you", "he", "she", "we", "what", "who", "where", "how many", "this", "that", "zero", "one", "two", "three", "four", "five", "red", "blue", "green", "yellow", "want", "have", "go", "eat", "drink", "like", "water", "coffee", "rice", "house", "and", "know"],
  de: ["hallo", "guten Morgen", "guten Abend", "auf Wiedersehen", "danke", "gern geschehen", "bitte", "entschuldigung", "ja", "nein", "wie geht es dir", "gut", "ich", "du", "er", "wir", "was", "wer", "wo", "wie viele", "dies", "das dort", "null", "eins", "zwei", "drei", "vier", "fünf", "rot", "blau", "grün", "gelb", "wollen", "haben", "gehen", "essen", "trinken", "mögen", "Wasser", "Kaffee", "Reis", "Haus", "und", "verstehen", "wissen"]
};
/* Farbwörter, die aus „Kleidung & Farben“ in ein eigenes Kapitel „Farben“ wandern */
const COLOR_IDS={
  id: ["warna","merah","biru","hijau","kuning","hitam","putih","cokelat","abu-abu","oranye","ungu","merah muda"],
  en: ["color","red","blue","green","yellow","black","white","brown","gray","pink","purple","gold","silver"],
  de: ["Farbe","rot","blau","grün","gelb","schwarz","weiß","braun","grau","rosa","lila","Gold","Silber"]
};
/* Reihenfolge der Kapitel: Start, dann die kleinen Grundthemen, danach der Rest in der alten Reihenfolge */
const CAT_FIRST=['Begrüßung & Höflichkeit','Pronomen & Fragewörter','Zahlen','Farben','Essen & Trinken'];
/* So hießen die Kapitel in Version 174 (Spielstand speicherte den Index); für die Umstellung auf Namen */
const CAT_OLD174=['Start','Begrüßung & Höflichkeit','Pronomen & Fragewörter','Zahlen','Zeit & Wochentage','Monate','Familie & Menschen','Essen & Trinken','Verben','Adjektive & Mengenwörter','Orte & Gebäude','Richtungen','Reisen & Verkehr','Körper & Gesundheit','Kleidung','Natur, Wetter & Tiere','Haus & Alltag','Geld & Einkaufen','Arbeit & Schule','Kleine Wörter','Sätze für den Alltag'];
function applyStart(L){
  const NL=String.fromCharCode(10);
  const ci=L.cats.findIndex(c=>c[0]==='Kleidung & Farben');
  if(ci>=0&&COLOR_IDS[L.id]){
    const col=new Set(COLOR_IDS[L.id].map(x=>x.toLowerCase())),keep=[],cl=[];
    L.cats[ci][1].split(NL).forEach(line=>{
      const i=line.indexOf(' = ');
      if(i<1){return;}
      (col.has(line.slice(0,i).trim().toLowerCase())?cl:keep).push(line);
    });
    L.cats.splice(ci,1,['Kleidung',NL+keep.join(NL)+NL],['Farben',NL+cl.join(NL)+NL]);
  }
  const head=CAT_FIRST.map(n=>L.cats.find(c=>c[0]===n)).filter(Boolean);
  const rest=L.cats.filter(c=>CAT_FIRST.indexOf(c[0])<0);
  L.cats=[['Start','']].concat(head,rest);
}
/* nach dem Aufbau der Wortliste: Startwörter markieren, Kapitel 0 hat keine eigenen Wörter */
function markStart(L){
  const ids=START_IDS[L.id]||[],pos=new Map(ids.map((x,i)=>[x.toLowerCase(),i+1]));
  let n=0;
  L.words.forEach(w=>{const p=pos.get(w.id.toLowerCase());if(p&&!w.st){w.st=p;n++;}});
  L.catCount[0]=n;
}
/* Kapitel: 0 = Start (Wörter mit w.st), sonst w.cat */
const inCat=(w,c)=>c===0?!!w.st:w.cat===c;
function catWords(L,c){return c===0?L.words.filter(w=>w.st).sort((a,b)=>a.st-b.st):L.words.filter(w=>w.cat===c);}
