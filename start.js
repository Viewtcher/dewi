/* Version 174: Startkapitel. Die wichtigsten Wörter stehen als erstes Kapitel „Start" vorn (Begrüßung, Pronomen, Fragewörter,
   Zahlen 0–5, vier Hauptfarben, Grundverben). Die Wörter werden zur Laufzeit aus ihren bisherigen Kapiteln herausgenommen
   (verschoben, nicht kopiert), Schlüssel und Spielstand bleiben gleich. Reihenfolge in der Liste = Reihenfolge im Kapitel. */
const START_IDS={
  id: ["halo", "selamat pagi", "selamat malam", "sampai jumpa", "terima kasih", "sama-sama", "tolong", "maaf", "ya", "tidak", "apa kabar", "baik", "nama", "saya", "kamu", "dia", "kita", "apa", "siapa", "di mana", "berapa", "ini", "itu", "nol", "satu", "dua", "tiga", "empat", "lima", "merah", "biru", "hijau", "kuning", "mau", "punya", "ada", "makan", "minum", "pergi", "suka", "air", "kopi", "nasi", "rumah", "dan", "bisa"],
  en: ["hello", "good morning", "good evening", "goodbye", "thank you", "you are welcome", "please", "sorry", "yes", "no", "how are you", "fine", "my name is", "I", "you", "he", "she", "we", "what", "who", "where", "how many", "this", "that", "zero", "one", "two", "three", "four", "five", "red", "blue", "green", "yellow", "want", "have", "go", "eat", "drink", "like", "water", "coffee", "rice", "house", "and", "know"],
  de: ["hallo", "guten Morgen", "guten Abend", "auf Wiedersehen", "danke", "gern geschehen", "bitte", "entschuldigung", "ja", "nein", "wie geht es dir", "gut", "ich", "du", "er", "wir", "was", "wer", "wo", "wie viele", "dies", "das dort", "null", "eins", "zwei", "drei", "vier", "fünf", "rot", "blau", "grün", "gelb", "wollen", "haben", "gehen", "essen", "trinken", "mögen", "Wasser", "Kaffee", "Reis", "Haus", "und", "verstehen", "wissen"]
};
function applyStart(L){
  const ids=START_IDS[L.id];if(!ids)return;
  const NL=String.fromCharCode(10);
  const want=new Map(ids.map((x,i)=>[x.toLowerCase(),i]));
  const found=new Array(ids.length).fill(null);
  L.cats=L.cats.map(c=>[c[0],c[1].split(NL).filter(line=>{
    const i=line.indexOf(' = ');if(i<1)return true;
    const k=line.slice(0,i).trim().toLowerCase();
    if(want.has(k)&&!found[want.get(k)]){found[want.get(k)]=line;return false;}
    return true;
  }).join(NL)]);
  L.cats.unshift(['Start',NL+found.filter(Boolean).join(NL)+NL]);
}
