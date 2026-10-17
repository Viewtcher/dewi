/* ===== Synonyme, Umgangssprache, Abkürzungen (Version 169) =====
   Zusätzlich akzeptierte Antworten, die NICHT angezeigt werden (angezeigt wird weiter nur „Bedeutung / Bedeutung“ aus den Wortlisten).
   Eine Zeile je Wort:   Schlüssel | Englisch | Deutsch | Schreibweisen des Kurswortes
   - Schlüssel = Wortschlüssel (Indonesisch: das Wort klein geschrieben; Englisch-Kurs „en:wort“; Deutsch-Kurs „de:wort“).
   - Spalte 2 = weitere richtige Übersetzungen bei App-Sprache Englisch, Spalte 3 bei App-Sprache Deutsch (je durch Komma getrennt).
     Sie zählen beim Tippen der Übersetzung, kommen nie als falsche Auswahl-Antwort vor und stehen nach dem Tippen unter „Auch richtig“.
   - Spalte 4 = andere Schreibweisen, Umgangssprache und Abkürzungen des Kurswortes (zählen beim Tippen des Kurswortes). Leerzeichen und
     Bindestriche spielen keine Rolle („di mana“ = „dimana“). Leer lassen, wenn es nichts Gängiges gibt.
   Nicht aufnehmen: Wörter, bei denen die Übersetzung exakt bleiben muss (Farben, Zahlen-Symbole stehen für Slots/Pads über die erste Bedeutung). */
const SYN_RAW=`
halo | hi, hey | hi, hey | hai, hei
selamat pagi | morning, good morn | morgen, moin | pagi
selamat siang | afternoon, good midday | tag, tach, mittag | siang
selamat sore | afternoon | schönen nachmittag | sore
selamat malam | evening, night | abend, nacht, gute nacht | malam
sampai jumpa | see you later, see ya, bye | bis später, tschüss, bis dann, man sieht sich | sampai ketemu, sampai jumpa lagi, dadah
selamat tinggal | bye, bye bye, farewell | tschüss, ciao, tschau, bye | dadah
sampai besok | until tomorrow, see ya tomorrow | bis dann morgen, bis morgen dann | sampai ketemu besok
terima kasih | thanks, thx, thank you very much, many thanks, cheers | danke schön, dankeschön, vielen dank, danke dir, danke sehr, thx, merci | makasih, makasi, terimakasih, trims, thanks
sama-sama | no problem, np, anytime, my pleasure | bitte, bitte sehr, gern, gerne, kein ding, nichts zu danken | samasama
tolong | pls, plz, help me | | tlg, tolongin
silakan | go ahead, be my guest, please do | bitte schön, nur zu, gern | silahkan
maaf | my bad, pardon, apologies, forgive me | sorry, pardon, verzeih, verzeihung, entschuldige | sori, maafkan
permisi | pardon me, pardon, excuse me please | pardon, entschuldigen sie, entschuldige | misi
ya | yeah, yep, yup | jo, jep, jap, jawohl | iya, yoi, yup, yoa
tidak | nope, nah, not at all | nö, nee, keineswegs | nggak, gak, enggak, ga, tak, tdk
bukan | isn't, am not, are not | | bkn
apa kabar | how are you doing, hows it going, whats up, how do you do | wie gehts, wie geht's, was geht, na wie gehts, alles klar | kabar, apa kabarnya, gimana kabar
baik | well, okay, ok, alright | okay, ok, prima, super | oke, ok, okay
senang bertemu | pleased to meet you, nice to meet ya, good to meet you, glad to meet you | schön dich kennenzulernen, nett dich kennenzulernen, angenehm, freut mich dich kennenzulernen | senang berkenalan, senang berjumpa
selamat makan | bon appetit, enjoy, dig in, enjoy your food | guten hunger, mahlzeit, lass es dir schmecken, bon appetit | makan
selamat ulang tahun | happy bday, happy b-day, happy birth day | herzlichen glückwunsch, glückwunsch zum geburtstag, happy birthday, alles gute | met ulang tahun, selamat ultah, met ultah
semoga berhasil | best of luck, all the best, best wishes, fingers crossed | viel glück, alles gute, toi toi toi, drück dir die daumen | semoga sukses, sukses ya
tidak apa-apa | no worries, its okay, its fine, never mind, np, dont worry | kein ding, macht nichts, nicht schlimm, alles gut, schon gut | gapapa, gpp, ga apa apa, nggak apa apa, gak apa apa, enggak apa apa, tak apa
aku | me | | gue, gua, gw, ak
kamu | u | | lu, lo, kau, engkau, km
dia | him, her | ihn, ihm, ihr | ia
mereka | them | die, ihnen | mrk
ini | this one, these | dieses, diese | ni
itu | that one, those | das da, jenes, dieses dort | tuh, tu
apa | whats | | apaan, apakah
kenapa | how come, why on earth, whats wrong | weshalb, weswegen, warum denn | knp
bagaimana | hows, in what way | wie denn, auf welche weise | gimana, gmn, bgmn, bagimana
berapa | how much, what number | wie viel, wieviel, wie hoch | brp
yang mana | which one, which ones | welcher, welches, welche davon | yg mana
yang | which, the one that, the one who | welche, welcher, der, die, das | yg
nol | 0, nought, zilch | 0 | 
satu | 1 | 1 | 
dua | 2 | 2 | 
tiga | 3 | 3 | 
empat | 4 | 4 | 
lima | 5 | 5 | 
enam | 6 | 6 | 
tujuh | 7 | 7 | 
delapan | 8 | 8 | 
sembilan | 9 | 9 | 
sepuluh | 10 | 10 | 
sebelas | 11 | 11 | 
dua belas | 12 | 12 | 
dua puluh | 20 | 20 | 
tiga puluh | 30 | 30 | 
lima puluh | 50 | 50 | 
seratus | a hundred, hundred, 100 | einhundert, 100 | 
seribu | a thousand, thousand, 1000 | eintausend, 1000 | 
sejuta | a million, million, 1000000 | 1 million, million, 1000000 | 
setengah | a half, one half | halbe, ein halbes, hälfte, die hälfte | separuh, 1/2
terakhir | final, the last one | letzter, letztes, final, zuletzt | akhir
besok | tmrw, tmr | | bsk
kemarin | yday | | kmrn, kemaren
sekarang | right now, at the moment, currently, nowadays | gerade, im moment, momentan, aktuell, nun | skrg, sekrg, skg
nanti | afterwards, later on, in a bit | nachher, gleich, bis später, dann | ntr
segera | right away, shortly, immediately, asap | gleich, sofort, demnächst, in kürze | sgr
tadi | a moment ago, earlier, a while ago, recently | eben, gerade eben, vorhin, vorher, vor kurzem | 
dulu | back then, formerly, once, previously, long ago | damals, einst, vorher, ehemals, vor langer zeit | dlu
tahun | yr, years | jahre | thn
jam | hr, hours, oclock, clock, watch | uhr, stunden, uhrzeit | 
menit | min, mins, minutes | min, minuten | mnt
detik | sec, secs, seconds | sek, sekunden | dtk
pagi | early morning, am | früh, frühmorgens, vormittag | 
siang | midday, daytime, afternoon | mittags, tagsüber, mittagszeit | 
sore | early evening, afternoon | spätnachmittag, früher abend, nachmittag | 
malam | evening, tonight, at night | abend, nachts, heute nacht, am abend | mlm
libur | holiday, off, break, time off | frei, ferien, feiertag | 
senin | mon | mo | 
selasa | tue, tues | di | 
rabu | wed | mi | 
kamis | thu, thur, thurs | do | 
jumat | fri | fr | jum'at, jumaat
sabtu | sat | sa | 
hari minggu | sun | so | minggu, ahad
selalu | all the time, constantly, every time | stets, ständig, jederzeit, dauernd, die ganze zeit | slalu
sering | frequently, a lot, many times | häufig, öfters, des öfteren, regelmäßig | srg
kadang-kadang | at times, occasionally, from time to time, once in a while | ab und zu, hin und wieder, gelegentlich, zeitweise | kadang, terkadang, kdg
jarang | seldom, hardly ever, not often | kaum, nicht oft, eher selten | jrg
tidak pernah | never ever, not ever | niemals, noch nie, nie im leben | gak pernah, nggak pernah, ga pernah, enggak pernah, tak pernah, tdk pernah
sudah | done, finished | bereits, fertig, erledigt, längst | udah, dah, udh, sdh, telah
belum | haven't yet, not yet done | noch nich, bisher nicht, bislang nicht | blm, belom
akan | going to, gonna, shall, will be | wird, werde, wirst | bakal, bkl
masih | even now, continuing to | immer noch, noch immer, weiterhin, nach wie vor | msh, masi
lagi | once more, one more time, another time | nochmal, noch einmal, erneut, wieder mal | lg
`;
const SYN={};
const synList=s=>s?s.split(',').map(x=>x.trim()).filter(Boolean):[];
SYN_RAW.split('\n').forEach(l=>{
  const q=l.split(' | ');if(q.length<3)return;
  SYN[q[0].trim().toLowerCase()]={en:synList(q[1]),de:synList(q[2]),v:synList(q[3])};
});
/* an die Wörter hängen: w.syn[Sprache] = weitere Übersetzungen, w.alts = weitere Schreibweisen des Kurswortes */
Object.values(LANGS).forEach(L=>L.words.forEach(w=>{
  const s=SYN[w.k];if(!s)return;
  w.syn={en:s.en,de:s.de};
  if(s.v.length)w.alts=(w.alts||[]).concat(s.v);
}));
