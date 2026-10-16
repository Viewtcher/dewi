/* Wort-zu-Wort-Zuordnung der Beispielsätze (erzeugt von data/align/emit.py).
   Gleiche Zahl = einander entsprechende Wörter, 0 = keine Entsprechung.
   Nur geprüfte Satzpaare stehen hier; alles andere wird in der App nicht markiert. */
const ALIGN_RAW=`
halo:en|2 1 1 3|2 1 1 1 3
halo:de|2 1 1 3|2 1 1 1 3
selamat sore:en|1 1 2|1 1 2
sampai jumpa:en|1 1 2|1 1 2
sampai jumpa:de|1 1 2|1 1 2
sampai besok:en|1 1 2 3|1 1 1 2 3
sampai besok:de|1 1 2 3|1 1 2 0 3
tolong:en|1 3 2|1 3 2
ya:en|1 2 3|1 2 3 0
ya:de|1 2 3|1 2 3
tidak:en|2 1 1|2 1 1
tidak:de|2 1 1|2 1
bukan:en|1 2 3|1 0 2 3
bukan:de|0 1 2|0 0 1 2
baik:en|2 3 1 1|2 0 3 1 1
nama:en|1 1 2|1 1 1 2
nama:de|1 1 2|1 1 1 2
selamat makan:en|1 1 2|1 1 1 2
selamat ulang tahun:en|1 1 1 2|1 1 2
semoga berhasil:en|1 1 2|1 1 2
semoga berhasil:de|1 1 2|1 1 2
saya:en|1 1 1|1 1 1
saya:de|1 1 1|1 1 1
aku:en|1 2 3|1 0 3 2
dia:en|1 2 3|1 0 3 2
dia:de|1 3 2|1 0 2 3
kami:en|1 2 3 4|1 2 3 4
kami:de|1 2 3 4|1 2 3 4
mereka:en|1 2 3|1 2 3
mereka:de|1 2 3|1 3 2
ini:en|1 2 3|1 0 3 2
ini:de|1 2 3|1 1 0 3 2
itu:en|1 2 3|1 0 0 3 2
itu:de|1 2 3|1 0 0 3 2
apa:en|1 1|1 1 1
apa:de|1 1|1 1 1
siapa:en|1 2|1 0 2
siapa:de|1 2|1 0 2
di mana:en|1 1 2 2|1 0 0 2
di mana:de|1 1 2 2|1 0 0 2
kapan:en|2 3 1|2 0 3 1 1
mengapa:en|1 2 3|1 0 2 3
mengapa:de|1 2 3|1 0 2 3
yang:en|2 3 0 1 4 5 6|0 2 3 4 1 1 4 6 5
satu:en|2 3 4 1|2 3 4 1 1
dua:de|1 2 3 4|1 2 3 4
empat:en|1 2 3|1 1 2 3
empat:de|1 2 3|1 1 2 3
enam:en|1 2 3|0 0 3 2 1
enam:de|1 2 3|0 0 1 3 2
tujuh:en|3 1 2 4|0 3 1 2 4
tujuh:de|4 1 2 3|0 4 1 2 3
lima puluh:de|2 1 1 3|0 2 0 1 3
seratus:en|2 1 3 2 4|2 2 1 1 3 4
seratus:de|1 2 3 0 4|4 1 2 3
seribu:en|2 3 1 4|3 2 0 1 1 4
pertama:en|1 2 3 4|1 0 4 3 2
pertama:de|0 1 3 2|0 0 2 3 1
terakhir:en|1 2 3|1 0 0 3 2
terakhir:de|0 1 2|0 0 0 2 1
hari ini:de|1 1 2 3|1 0 2 3
besok:en|1 2 3|1 2 3
besok:de|1 2 3|1 3 2
kemarin:en|1 2 3|1 2 0 3
kemarin:de|1 2 3|1 0 2 3
sekarang:en|1 2 3|1 2 3
sekarang:de|1 3 2|1 3 2
segera:en|1 2 3 4|1 2 4 3
dulu:de|1 2 5 3 4|1 0 2 3 4 5
minggu:de|1 3 4 2|1 0 4 2 3
bulan:en|2 3 4 1 1 5|2 3 4 1 5
bulan:de|5 2 3 1 1 4|5 2 3 1 4
waktu:en|1 2 3 4|1 2 2 3 4
waktu:de|1 2 3 4|1 3 2 4
selalu:en|1 2 3|1 2 3
selalu:de|1 2 3|1 3 2
sering:en|1 2 3 4|1 2 3 4
sering:de|1 2 4 3|1 4 2 3
kadang-kadang:de|1 2 3 4|1 3 2 0 4
jarang:en|1 2 3 4|1 2 3 4
jarang:de|1 2 4 3|1 4 2 3
akan:en|1 2 3 4|1 2 3 4
akan:de|1 4 2 3|1 4 3 2
masih:en|1 2 3|1 0 2 3
masih:de|1 2 3|1 3 2
lagi:en|1 3 2|1 3 0 2
keluarga:en|1 2 3|2 1 0 3
keluarga:de|1 2 3|2 1 0 3
ibu:en|1 4 2 3|1 4 2 0 3
ibu:de|1 2 3 4|1 2 3 0 4
ayah:en|1 4 2 3|1 4 2 0 3
ayah:de|1 4 2 3|1 4 2 3
orang tua:en|1 1 2 3 4 5|2 1 3 4 0 5
orang tua:de|1 1 2 3 4 5|2 1 3 4 0 5
anak:en|1 2 5 3 4|2 1 5 3 2 4
anak:de|1 2 5 3 4|2 1 5 3 4
saudara:en|1 2 3 4|1 2 3 4
saudara:de|1 2 3 4|1 2 3 4
suami:en|1 2 5 3 4|2 1 5 3 0 4
suami:de|1 2 5 3 4|2 1 5 3 0 4
istri:en|1 2 3 4|2 1 3 4
istri:de|1 2 3 4|2 1 4 3
paman:en|1 2 5 3 4|2 1 5 3 4
paman:de|1 2 5 3 4|2 1 5 3 4
bibi:en|1 3 2|1 3 2
sepupu:en|2 3 4 1 1|3 2 4 1
sepupu:de|2 3 4 1 1|3 2 4 1
orang:de|1 2 0 4 3|0 1 0 2 4 0 3
perempuan:en|1 2 3 4|2 1 3 4
anak perempuan:en|1 1 2 3|2 1 3
anak perempuan:de|1 1 2 3|2 1 3
bayi:en|1 2 3 4|2 1 3 4
koki:en|2 3 1 1|0 2 3 1 1
turis:en|1 2 3 4|2 1 3 2 4
turis:de|1 2 3 4|2 1 3 0 4
makan:en|2 3 1 4|2 3 1 1 4
makan:de|1 2 3 4|1 2 4 3
minum:en|2 3 1 4|2 3 1 1 4
minum:de|1 2 3 4|1 2 4 3
makanan:en|1 2 3|2 1 0 3
makanan:de|1 2 3|2 1 0 3
minuman:en|1 2 3|2 1 0 3
minuman:de|1 2 3|2 1 0 3
air:en|1 2 3 4|1 2 4 3
nasi:en|2 3 1 4 5|2 3 1 1 4 5
beras:en|2 5 1 3 4|2 5 1 1 3 0 4
nasi goreng:en|2 3 1 1|2 3 1 1
roti:en|1 2 3 4 5|1 2 3 4 5
roti:de|1 5 2 3 4|1 5 2 3 4
daging:en|1 2 3 4|1 2 2 3 4
udang:en|1 2 3|2 1 0 3
udang:de|1 2 3|2 1 0 3
telur:en|1 2 3 4|1 2 3 4
tempe:en|1 2 3 4|1 0 2 3 4
tempe:de|1 2 3 4|1 0 2 3 4
sate:en|1 2 3 4|1 2 4 3
sayur:de|4 1 2 3|4 1 3 2
apel:en|1 2 3|2 1 0 3
apel:de|1 2 3|2 1 0 3
pisang:en|2 1 3|2 1 3
pisang:de|2 1 3|2 1 3
jeruk:en|1 2 3 4|1 2 4 3
mangga:en|1 2 3 4|2 1 0 3 4
mangga:de|1 2 3 4|2 1 0 3 4
teh:en|1 2 3 4|1 2 4 3
teh:de|1 2 3 4|1 2 4 3
susu:en|1 3 2|0 1 3 2
susu:de|1 3 2|0 1 3 2
bir:en|1 4 2 3|1 4 0 3 2
bir:de|1 3 2 4|1 3 0 4 2
gula:en|1 2 3 4|2 1 3 4
gula:de|1 2 3 4|2 1 0 3 4
pedas:en|1 2 3 4|2 1 0 3 4
pedas:de|1 2 3 4|2 1 0 3 4
manis:en|1 2 3|2 1 0 3
manis:de|1 2 3|2 1 0 3
asin:en|1 2 3|2 1 0 3
asin:de|1 2 3|2 1 0 3
asam:en|1 2 3|2 1 0 3
asam:de|1 2 3|2 1 0 3
pahit:en|1 2 3|2 1 0 3
pahit:de|1 2 3|2 1 0 3
lapar:en|1 2 3|1 0 3 2
kenyang:de|1 2 3|1 0 2 3
warung:en|2 3 4 1|2 3 4 0 1 1
mangkuk:en|1 2 3 4 5|1 2 3 4 0 5
mangkuk:de|1 2 5 3 4|1 2 5 3 4
garpu:en|1 4 2 3|1 4 2 0 3
gelas:en|1 6 2 3 4 5|1 6 2 3 4 0 5
sup:en|1 2 3|2 1 0 3
sup:de|1 2 3|2 1 0 3
goreng:en|1 2 4 3|1 2 3 4
goreng:de|1 2 3 4|1 2 4 3
rebus:en|1 2 4 3|1 2 3 4
bakar:en|1 2 3 4|1 2 4 3
bakar:de|1 2 3 4|1 2 4 3
cabai:en|1 2 3|1 2 3
cabai:de|1 2 3|1 2 3
kentang:de|1 2 3|1 2 3
tomat:en|1 2 3|2 1 0 3
tomat:de|1 2 3|2 1 0 3
kelapa:en|1 2 3 4|1 2 4 3
permen:en|1 2 4 3|2 1 4 3
makanan ringan:en|2 3 1 1|2 3 0 1
bungkus:en|1 1 2 3|2 1 1 3
pergi:en|2 3 1 4 5|2 3 1 1 4 0 5
pergi:de|1 2 3 4 5|1 2 4 5 3
datang:en|1 2 3 4 5|2 1 3 4 5
datang:de|1 2 3 4 5|2 1 3 5 4
pulang:en|2 3 1 4|2 3 1 1 1 4
pulang:de|2 3 1 4|2 3 4 1 1 1
tidur:en|2 3 1|2 3 1 1
tidur:de|1 2 3|1 2 3
berdiri:en|1 5 2 3 4|1 5 2 3 0 0 4
berdiri:de|1 3 0 4 2|1 3 4 0 2
berjalan:en|1 2 3 4|1 2 3 4
lari:en|1 2 5 3 4|2 1 5 3 2 4
lari:de|1 2 5 3 4|2 1 5 3 4
jatuh:de|1 2 3|1 2 3
berkata:en|1 4 2 3|1 4 2 0 3
menjawab:en|1 4 2 3|1 4 3 2
melihat:en|1 2 3|1 2 0 3
melihat:de|1 3 2|1 3 0 2
mendengar:en|1 2 3|1 2 3
mendengar:de|1 3 2|1 3 2
membaca:en|2 3 1 4|2 3 1 1 4
membaca:de|1 2 3 4|1 3 2 4
menulis:en|1 3 2|1 3 0 2
menulis:de|1 3 2|1 3 0 2
mengajar:en|1 4 2 3|1 4 2 0 3
mengajar:de|1 4 2 3|1 4 2 0 3
bekerja:en|1 4 2 3|1 4 2 0 3
bekerja:de|1 4 2 3|1 4 2 3
membeli:en|2 3 1 4|2 3 1 1 4
membeli:de|1 2 3 4|1 2 4 3
menjual:en|1 3 2|1 3 2
menjual:de|1 3 2|1 3 2
membayar:en|2 3 1 4|2 3 1 1 4
membayar:de|1 2 3 4|1 2 4 3
mengambil:en|1 4 2 3|1 4 3 2
memberi:en|1 4 2 3|1 4 2 0 3
membawa:en|1 2 3|1 2 0 3
membuka:en|1 3 2|1 3 0 2
selesai:en|1 2 3|1 2 3
mencari:en|2 1 3|2 1 1 2 3
mencari:de|1 3 2|1 3 1 2
menemukan:en|1 2 3|1 2 0 3
menemukan:de|1 3 2|1 3 0 2
mengerti:en|1 1 2|1 1 2
mengerti:de|1 1 2|1 1 2
tahu:en|1 2 3|1 2 2 3
ingat:en|1 2 3 4|1 2 4 3
lupa:en|1 2 3 4|1 2 4 3
suka:en|1 1 1|1 1 1
suka:de|1 1 1|1 1 1
cinta:en|1 2 3 4|1 2 4 3
cinta:de|1 4 2 3|1 4 3 2
mau:en|2 3 1|2 3 1 1
mau:de|1 2 3|1 2 3
bisa:en|1 2 3|1 2 3
bisa:de|1 2 3|1 2 3
harus:en|1 2 3|1 2 3
harus:de|1 2 3|1 2 3
boleh:de|1 2 3 0 4|1 2 4 3
punya:en|2 3 4 1|2 3 4 1 1
punya:de|2 3 4 1|2 3 4 1 1
ada:en|1 2 3 4|1 1 2 3 0 4
ada:de|1 2 3 4|3 0 4 1 1 2
menjadi:en|2 4 1 3|2 4 1 1 0 3
menjadi:de|1 2 3 4|1 2 4 3
memakai:en|1 4 2 3|1 4 0 3 2
memakai:de|1 3 2 4|1 3 0 4 2
menggunakan:de|1 3 2|1 3 0 2
membuat:en|1 3 2|1 3 0 2
membuat:de|1 3 2|1 3 0 2
mandi:en|1 2 3 4|1 2 3 4
mandi:de|1 4 2 3|1 4 2 3
mencuci:en|1 2 3|1 2 0 3
mencuci:de|1 3 2|1 3 0 2
berhenti:en|1 3 0 2|0 1 3 2
tinggal:en|1 2 3 4|1 2 3 4
tinggal:de|1 4 2 3|1 4 2 3
mati:en|1 2 3|2 1 3
menikah:en|2 3 1|2 3 1 1
menikah:de|1 2 3|1 2 3
membantu:en|1 2 3|1 2 1 3
merasa:en|1 2 3|1 2 3
merasa:de|1 3 2|1 3 1 2
tertawa:en|1 2 3|2 1 3
tertawa:de|1 2 3|2 1 3
menangis:en|1 2 3|2 1 3
menangis:de|1 2 3|2 1 3
tersenyum:en|1 3 4 2|1 3 4 2
tersenyum:de|1 3 4 2|1 3 2 4
menelepon:en|1 2 3|1 2 3
mengirim:en|1 2 3|1 2 0 3
mengirim:de|1 3 2|1 3 0 2
menerima:en|1 2 3|1 2 0 3
menerima:de|1 3 2|1 3 0 2
mengunjungi:en|1 2 3|1 2 3
istirahat:en|2 3 1|2 3 1 1
menyanyi:en|2 3 1|2 3 1 1
menyanyi:de|1 2 3|1 3 2
berenang:en|1 2 3 4|1 2 3 0 4
berenang:de|1 4 2 3|1 4 2 3
menyetir:en|1 3 2|1 3 0 2
terbang:en|1 2 3|2 1 3
terbang:de|1 2 3|2 1 3
memilih:en|1 2 3|1 2 3
memilih:de|1 3 2|1 3 2
mencoba:en|2 3 1 4|2 3 1 1 4
mencoba:de|1 2 3 4|1 2 4 3
berharap:en|1 2 3 4|1 2 3 0 4
berharap:de|1 4 2 3|1 4 2 0 3
membersihkan:en|1 2 3|1 2 0 3
membersihkan:de|1 3 2|1 3 0 2
berubah:en|1 2|0 1 2
menyimpan:en|1 2 3|1 2 0 3
besar:en|1 2 3|2 1 0 3
besar:de|1 2 3|2 1 0 3
kecil:en|1 2 3|2 1 0 3
kecil:de|1 2 3|2 1 0 3
panjang:de|1 2 3|2 1 0 3
pendek:en|1 2 3|2 1 0 3
pendek:de|3 1 2|1 3 0 2
tinggi:en|1 2 3|2 1 0 3
tinggi:de|1 2 3|2 1 0 3
rendah:en|1 2 3|2 1 0 3
rendah:de|1 2 3|2 1 0 3
baru:en|1 2 3 4|1 2 0 4 3
baru:de|1 2 3 4|1 2 0 4 3
muda:en|1 2 3|1 0 2 3
muda:de|1 2 3|1 0 2 3
bagus:en|1 2 3|2 1 0 3
bagus:de|1 2 3|2 1 0 3
jelek:en|1 2 3|2 1 0 3
jelek:de|1 2 3|2 1 0 3
buruk:en|2 1 1 3|0 2 1 0 3
buruk:de|2 1 1 3|0 2 1 0 3
sulit:en|1 2 3|2 1 0 3
sulit:de|1 2 3|2 1 0 3
murah:en|1 2 3|2 1 0 3
murah:de|1 2 3|2 1 0 3
mahal:en|1 2 3|2 1 0 3
mahal:de|1 2 3|2 1 0 3
panas:en|1 2 3|2 1 0 3
panas:de|1 2 3|2 1 0 3
dingin:en|1 2 3|2 1 0 3
dingin:de|1 2 3|2 1 0 3
hangat:en|1 2 3|2 1 0 3
hangat:de|1 2 3|2 1 0 3
bersih:en|1 2 3|2 1 0 3
bersih:de|1 2 3|2 1 0 3
kotor:en|1 2 3|2 1 0 3
kotor:de|1 2 3|2 1 0 3
cepat:en|1 2 3|2 1 0 3
cepat:de|1 2 3|2 1 0 3
lambat:en|1 2 3|2 1 0 3
lambat:de|1 2 3|2 1 0 3
pelan-pelan:de|2 1 1|2 1 1
benar:en|1 2 3|2 1 0 3
benar:de|1 2 3|2 1 0 3
salah:en|1 2 3|2 1 0 3
salah:de|1 2 3|2 1 0 3
penuh:de|1 2 3|2 1 0 3
kosong:en|1 2 3|2 1 0 3
berat:en|1 2 3|2 1 0 3
berat:de|1 2 3|2 1 0 3
ringan:de|1 2 3|2 1 0 3
kaya:en|1 2 3|2 1 0 3
miskin:en|1 2 3|2 1 0 3
senang:en|2 3 1 1|2 0 3 1
senang:de|2 3 1 1|2 0 1 3
sedih:en|1 2 3|1 0 3 2
marah:en|1 2|1 0 2
marah:de|1 2|1 0 2
takut:en|1 2 3|1 0 2 0 3
lelah:en|2 3 1 1|2 0 3 1
lelah:de|2 3 1 1|2 0 1 3
sakit:en|1 2 3|2 1 1 0 3
sakit:de|1 2 3|2 1 1 0 3
sehat:en|1 2 3|2 1 0 3
sehat:de|1 2 3|2 1 0 3
cantik:en|1 2 3|2 1 0 3
pintar:en|1 2 3|2 1 0 3
bodoh:en|1 2 3|1 2 3
bodoh:de|1 3 2|1 3 1 2
lucu:en|1 2 3|2 1 0 3
lucu:de|1 2 3|2 1 0 3
penting:en|1 2 3|1 0 2 3
penting:de|0 1 2|0 0 1 2
sibuk:en|1 1 2 3|1 2 0 3
sibuk:de|1 1 2 3|1 0 2 3
bebas:en|1 2 3|1 2 0 3
bebas:de|1 2 3|1 0 2 3
dekat:en|1 2 3|2 1 0 3
dekat:de|1 2 3|2 1 0 3
jauh:en|1 2 3|2 1 0 3
jauh:de|1 2 3|2 1 0 3
terang:en|1 2 3|2 1 0 3
terang:de|1 2 3|2 1 0 3
kuat:en|1 2 3|1 0 2 3
kuat:de|1 2 3|1 0 2 3
lemah:en|1 2 3|2 1 0 3
lemah:de|1 2 3|2 1 0 3
aman:en|1 2 3|2 1 0 3
aman:de|1 2 3|2 1 0 3
berbahaya:de|1 2 3|2 1 0 3
ramai:en|1 2 3|2 1 0 3
sepi:en|1 2 3|2 1 0 3
sepi:de|1 2 3|2 1 0 3
sama:en|1 2 3 0 4|1 2 0 4 3
sama:de|1 2 3 4 5|1 2 4 5 3
berbeda:en|3 1 2|1 3 0 2
berbeda:de|3 1 2|1 3 0 2
lain:de|1 2 3 4|1 2 3 4
banyak:en|1 2 3 1 4|1 1 2 3 4
banyak:de|1 2 3 0 4|4 1 2 3
sedikit:en|2 3 1 4|2 3 1 1 4
sedikit:de|2 3 1 4|2 3 1 1 4
beberapa:en|1 2 3 4|1 2 3 4
beberapa:de|1 2 3 4|1 2 3 4
cukup:en|1 2 3|2 1 0 3
cukup:de|1 2 3|2 1 0 3
sangat:en|1 2 3 4|2 1 0 3 4
sangat:de|1 2 3 4|2 1 0 3 4
terlalu:en|1 2 3 4|2 1 0 3 4
terlalu:de|1 2 3 4|2 1 0 3 4
paling:en|1 0 2 3|1 0 0 2 3
juga:en|1 2 3|1 2 3 0
juga:de|1 2 3|1 3 2
hanya:en|1 2 3 4|1 2 3 4
hanya:de|1 2 3 4|1 3 2 4
rumah:en|1 2 3|2 1 0 3
rumah:de|1 2 3|2 1 0 3
kamar:en|1 2 3|2 1 0 3
kamar:de|1 2 3|2 1 0 3
dapur:en|1 2 3 4|1 2 3 0 4
dapur:de|1 2 3 4|1 2 3 0 4
kamar mandi:en|1 1 2 2|1 0 0 2
kamar mandi:de|1 1 2 2|1 0 0 2
kamar tidur:en|1 1 2 3|2 1 0 3
kamar tidur:de|1 1 2 3|2 1 0 3
ruang tamu:en|4 2 3 1 1|0 4 2 3 0 1 1
ruang tamu:de|4 2 3 1 1|0 4 2 3 1
pintu:en|1 3 2|1 3 0 2
jendela:en|1 2 3|2 1 0 3
kota:en|1 2 3 4|1 2 0 4 3
kota:de|1 2 3 4|1 2 0 4 3
desa:en|1 4 2 3|1 4 2 0 3
negara:en|1 2 3 4|1 2 0 4 3
jalan:en|1 2 3|2 1 0 3
jalan:de|1 2 3|2 1 0 3
pasar:de|1 4 2 3|1 4 2 3
toko:en|1 2 3|2 1 0 3
supermarket:en|1 2 3 4|1 2 3 0 4
bank:en|1 2 3 4|1 2 3 0 4
bank:de|1 4 2 3|1 4 2 3
rumah sakit:en|2 3 1 1|2 0 3 0 1
rumah sakit:de|2 3 1 1|2 0 3 1
sekolah:en|1 2 3 4|2 1 0 3 4
sekolah:de|1 2 3 4|2 1 0 3 0 4
universitas:en|1 2 3 4|2 1 1 0 3 0 4
universitas:de|1 2 3 4|2 1 1 0 3 0 4
kantor:en|1 2 3 4|1 2 3 0 4
kantor:de|1 2 3 4|1 2 3 4
bandara:en|1 2 3 4|1 2 3 0 4
pantai:en|1 4 2 3|1 4 2 0 3
pantai:de|1 4 2 3|1 4 2 3
gunung:en|1 2 3|2 1 0 3
gunung:de|1 2 3|2 1 0 3
laut:en|1 2 3|2 1 0 3
laut:de|1 2 3|2 1 0 3
sungai:en|1 2 3|2 1 0 3
sungai:de|1 2 3|2 1 0 3
danau:en|1 2 3 4|1 2 3 0 4
danau:de|1 2 3 4|1 2 3 4
hutan:en|4 1 2 3|4 1 2 0 3
masjid:en|1 2 3|2 1 0 3
masjid:de|1 2 3|2 1 0 3
toilet:en|1 1 2|1 0 0 2
toilet:de|1 1 2|1 0 0 2
depan:en|1 2 3 4|0 1 2 3 4
depan:de|1 2 0 3|0 1 2 3
belakang:en|1 2 3 4|0 1 2 3 0 4
belakang:de|1 2 0 3|0 1 2 3
atas:en|1 2 0 3 4|0 1 2 3 0 4
bawah:en|1 2 0 3 4|0 1 2 3 0 4
bawah:de|1 2 0 4 3|0 1 2 4 0 3
tengah:en|1 2 3 4 5|0 1 2 3 0 4 0 0 5
samping:en|1 2 0 3 4|0 1 2 3 0 4
samping:de|1 2 0 3 4|0 1 2 3 0 4
utara:en|1 2 3 4|1 2 3 0 4
selatan:en|1 2 3 4|1 2 3 0 4
situ:en|1 2 3 3|0 1 2 3
situ:de|1 2 0 3|0 1 2 3
sana:en|2 3 4 0 1|3 2 4 1 1
sana:de|2 3 4 0 1|3 2 4 1 1
mobil:en|1 2 3 4|1 2 0 4 3
mobil:de|1 2 3 4|1 2 0 4 3
motor:en|1 2 3|1 2 0 3
motor:de|1 2 3|1 2 3
bus:en|1 2 3 4 5|1 2 0 3 4 0 5
bus:de|1 2 3 4 5|1 2 0 3 4 5
kereta api:en|2 3 1 1 4 5|2 3 0 1 4 5
kereta api:de|2 3 1 1 4 5|2 3 0 1 4 5
pesawat:de|1 3 2|0 1 3 2
kapal:en|1 2 3|2 1 0 3
kapal:de|1 2 3|2 1 0 3
taksi:en|1 2 3 4 5|1 2 0 3 4 0 5
taksi:de|1 2 3 4 5|1 2 0 3 4 5
ojek:en|2 3 1 4 5|2 3 0 1 1 4 0 5
ojek:de|1 2 3 4 5|1 2 0 3 4 5
tiket:en|1 3 2 4|1 3 2 4
parkir:en|0 2 3 1 4|1 1 3 4 2
parkir:de|0 1 4 2 3|1 2 2 4 3
perjalanan:en|1 2 3|2 1 0 3
perjalanan:de|1 2 3|2 1 0 3
paspor:en|1 2 3|1 2 0 3
paspor:de|1 2 3|1 2 0 3
koper:en|1 2 3|2 1 0 3
koper:de|1 2 3|2 1 0 3
hotel:en|1 2 3|2 1 0 3
hotel:de|1 2 3|2 1 0 3
liburan:en|1 2 3 4|1 0 3 2 3 4
liburan:de|1 2 3 4|1 0 3 4 3 2
alamat:en|1 2 3|1 0 3 2
kepala:en|1 2 3|2 1 3
mata:en|3 1 2|1 3 0 2
mata:de|3 1 2|1 3 0 2
telinga:en|1 2 3|2 1 3
mulut:en|3 1 2|3 2 1
gigi:en|1 2 3|2 1 3
leher:en|1 2 3|2 1 3
bahu:en|1 2 3|2 1 3
lengan:en|1 2 3|2 1 0 3
lengan:de|1 2 3|2 1 0 3
tangan:en|2 3 1|2 1 3
kaki:en|1 2 3|2 1 3
lutut:en|1 2 3|2 1 3
perut:en|1 2 3|2 1 3
rambut:en|1 2 3|2 1 0 3
rambut:de|3 1 2|1 3 0 2
wajah:en|1 2 3|2 1 0 3
badan:en|1 2 3|2 1 0 3
badan:de|1 2 3|2 1 0 3
hati:de|1 2 3|1 0 0 3 2
darah:en|1 2 3 4|1 1 2 3 0 4
darah:de|1 2 3 4|3 0 4 1 2
demam:de|1 2 3|2 1 0 3
batuk:en|1 2|1 2
batuk:de|1 2|1 0 2
sakit kepala:de|2 1 1|2 0 1
pusing:en|1 2|1 0 2
pusing:de|1 2|1 0 2
luka:en|1 2 3 4 5|0 1 2 4 3 0 5
luka:de|1 2 3 5 4|0 1 2 5 3 0 4
apotek:en|1 2 3|2 1 0 3
baju:en|1 2 3|2 1 0 3
baju:de|1 2 3|2 1 0 3
pakaian:en|1 2 3|2 1 0 3
pakaian:de|1 2 3|2 1 0 3
celana:en|1 2 3|2 1 0 3
celana:de|1 2 3|2 1 0 3
rok:en|1 2 3|2 1 0 3
rok:de|1 2 3|2 1 0 3
jaket:en|1 2 3|2 1 0 3
jaket:de|1 2 3|2 1 0 3
sepatu:en|3 1 2|1 3 0 2
sepatu:de|3 1 2|1 3 0 2
tas:en|1 2 3|2 1 0 3
tas:de|1 2 3|2 1 0 3
jam tangan:en|1 1 2 3|2 1 0 3
jam tangan:de|1 1 2 3|2 1 0 3
cincin:en|1 2 3|2 1 0 3
payung:en|2 1 3|2 0 1 0 0 3
warna:en|1 2 3|2 1 0 3
merah:en|1 2 3|2 1 0 3
merah:de|1 2 3|2 1 0 3
biru:en|1 2 3|2 1 0 3
biru:de|1 2 3|2 1 0 3
hijau:en|1 2 3|2 1 0 3
hijau:de|1 2 3|2 1 0 3
kuning:en|1 2 3|2 1 0 3
kuning:de|1 2 3|2 1 0 3
hitam:en|1 2 3|2 1 0 3
hitam:de|1 2 3|2 1 0 3
cokelat:en|1 2 3|2 1 0 3
cokelat:de|1 2 3|2 1 0 3
abu-abu:de|1 2 3|2 1 0 3
ungu:en|1 2 3|2 1 0 3
ungu:de|1 2 3|2 1 0 3
merah muda:en|2 3 1 1|3 2 0 1
merah muda:de|2 3 1 1|3 2 0 1
cuaca:en|2 1 1 3|0 2 1 0 3
cuaca:de|2 1 1 3|0 2 0 1 3
hujan:en|1 1 2|1 0 0 2
bintang:en|1 2 3|2 1 0 3
langit:en|1 2 3|2 1 0 3
langit:de|1 2 3|2 1 0 3
awan:en|1 2 3|2 1 0 3
awan:de|1 2 3|2 1 0 3
pelangi:en|1 2 3 4|1 1 0 2 3 0 4
pelangi:de|1 2 3 4|3 4 1 0 2
banjir:en|1 2 3 4|1 1 0 2 3 0 4
banjir:de|1 2 3 4|3 0 4 1 1 0 2
gempa bumi:en|2 1 1 3|2 0 0 1 3
api:en|1 2 3|2 1 0 3
api:de|1 2 3|2 1 0 3
batu:en|1 2 3|2 1 0 3
batu:de|1 2 3|2 1 0 3
pasir:en|1 2 3 4|0 1 2 0 3 0 4
pasir:de|1 2 3 4|0 1 2 3 0 4
pohon:en|1 2 3|2 1 0 3
daun:en|1 2 3|2 1 0 3
daun:de|1 2 3|2 1 0 3
rumput:en|1 2 3|2 1 0 3
rumput:de|1 2 3|2 1 0 3
hewan:en|1 2 3|1 2 3
hewan:de|1 2 3|1 2 3
kucing:en|1 2 3|2 1 0 3
kucing:de|1 2 3|2 1 3
burung:en|1 2 3|2 1 3
burung:de|1 2 3|2 1 3
sapi:en|1 3 2|0 1 3 2
kuda:en|1 2 3|2 1 0 3
kuda:de|1 2 3|2 1 0 3
kambing:en|1 2 3|2 1 0 3
kambing:de|1 2 3|2 1 0 3
bebek:en|1 4 2 3|0 1 4 2 0 3
bebek:de|1 4 2 3|0 1 4 2 3
tikus:en|1 2 3 4|1 1 0 2 3 0 4
tikus:de|1 2 3 4|3 0 4 1 0 2
nyamuk:en|1 2 3 4|1 1 0 2 3 0 4
nyamuk:de|1 2 3 4|3 4 1 0 2
semut:en|1 4 2 3|1 1 4 2 0 3
semut:de|1 4 2 3|2 0 3 1 4
cicak:en|1 2 3 4|1 1 0 2 3 0 4
cicak:de|1 2 3 4|3 0 4 1 0 2
harimau:en|1 2 3|2 1 0 3
harimau:de|1 2 3|2 1 0 3
gajah:en|1 2 3|2 1 0 3
gajah:de|1 2 3|2 1 0 3
monyet:en|1 2 3|0 1 2 3
monyet:de|1 2 3|0 1 2 3
buaya:en|1 4 2 3|0 1 4 2 0 3
ular:en|1 2 3|2 1 0 3
ular:de|1 2 3|2 1 0 3
meja:en|1 2 3 4|0 1 2 3 0 4
tempat tidur:en|1 1 2 3|2 1 0 3
tempat tidur:de|1 1 2 3|2 1 0 3
cermin:en|1 2 3|2 1 0 3
cermin:de|1 2 3|2 1 0 3
lampu:en|1 2 3|2 1 0 3
lampu:de|1 2 3|2 1 0 3
televisi:en|1 2 3|2 1 0 3
televisi:de|1 2 3|2 1 0 3
kunci:en|1 1 2 3|1 0 3 2
kunci:de|1 1 2 3|1 0 3 2
lantai:en|1 2 3|2 1 0 3
dinding:en|1 2 3|2 1 0 3
dinding:de|1 2 3|2 1 0 3
atap:en|1 2 3 4|3 1 0 3 2 0 4
atap:de|1 4 2 3|2 1 0 4 0 3
kebun:en|1 2 3|2 1 0 3
kebun:de|1 2 3|2 1 0 3
sabun:en|1 2 3|1 2 3
sabun:de|1 3 2|1 3 2
sikat gigi:de|2 3 1 1|2 0 2 1 3
selimut:en|1 2 3|2 1 0 3
selimut:de|1 2 3|2 1 0 3
barang:en|1 2 3|2 1 0 3
barang:de|1 2 3|2 1 0 3
hadiah:en|1 2 3 4|1 0 0 2 3 4
hadiah:de|0 1 2 3|0 0 0 1 2 3
foto:en|1 3 2|1 3 0 2
musik:en|1 2 3|1 2 3
musik:de|1 2 3|1 2 3
film:en|1 2 3|2 1 0 3
film:de|1 2 3|2 1 0 3
uang:en|1 2 3 4|1 2 2 3 4
uang:de|1 2 3 4|1 3 2 4
harga:en|3 1 2|3 0 0 1 0 2
kartu:en|1 4 2 3|1 4 2 0 3
kembalian:de|1 2 3|1 0 3 2
diskon:en|1 3 2 2|1 1 0 3 2
diskon:de|2 3 1 1|1 2 2 3
menawar:en|2 3 1 4|2 3 1 1 0 4
belanja:en|1 4 2 3|1 4 2 0 3
gratis:en|2 3 1|3 2 0 1 1 1
gratis:de|1 2 3|2 1 0 3
tagihan:en|1 1|1 1 1
tagihan:de|1 1|1 1 1
pekerjaan:en|1 2 3|2 1 0 3
pekerjaan:de|1 2 3|2 1 0 3
gaji:en|1 2 3|2 1 0 3
rapat:en|2 3 4 1 1|2 3 0 4 1
rapat:de|2 0 3 1 1|2 0 1 0 3
kelas:en|1 2 3|2 1 0 3
kelas:de|1 2 3|2 1 0 3
ujian:en|2 1 3|2 1 1 0 3
ujian:de|1 2 3|1 2 0 3
pelajaran:en|1 2 3|2 1 0 3
kalimat:en|1 2 3|2 1 0 3
kalimat:de|1 2 3|2 1 0 3
pertanyaan:en|1 2 3 4|1 2 3 4
pertanyaan:de|1 2 4 3|1 2 4 3
jawaban:en|1 2 3|2 1 0 3
jawaban:de|1 2 3|2 1 0 3
masalah:en|2 1 3|1 1 2 3
masalah:de|2 1 3|1 1 2 3
ide:de|1 2 3|1 0 0 3 2
buku:en|1 3 2|1 3 0 2
kertas:en|1 2 3|2 1 0 3
kertas:de|1 2 3|2 1 0 3
kamus:en|1 3 2|1 3 0 2
komputer:en|1 2 3|2 1 0 3
komputer:de|1 2 3|2 1 0 3
internet:en|1 0 2 3|0 1 2 0 3
internet:de|1 0 2 3|0 1 0 2 3
atau:en|1 2 3|1 2 3
atau:de|1 2 3|1 2 3
tetapi:de|1 2 3 4 5|1 2 3 1 5 4
tapi:en|1 2 3|1 2 3
tapi:de|1 2 3|1 2 3
karena:en|2 1 3 4|2 1 1 3 2 0 4
dengan:en|1 2 3 4|1 2 3 0 4
dengan:de|1 4 2 3|1 4 2 0 3
tanpa:en|1 2 3|1 2 3
tanpa:de|1 2 3|1 2 3
untuk:en|1 2 3|1 0 2 3
untuk:de|0 1 2|0 0 1 2
ke:en|1 2 3 4|1 2 3 0 4
ke:de|1 4 2 3|1 4 2 3
di:en|1 2 3 4|1 2 3 4
di:de|1 4 2 3|1 4 2 3
dalam:en|1 2 3 4|0 1 2 3 0 4
dalam:de|1 2 3 4|0 1 2 3 0 4
antara:en|1 2 3 4 5 6|0 1 2 3 0 4 5 0 6
antara:de|1 2 3 4 5 6|0 1 2 3 0 4 5 0 6
sesudah:en|1 5 2 3 4|1 5 2 3 4
sesudah:de|1 2 3 5 4|1 0 2 5 3 4
sambil:en|1 3 2 4|1 3 2 4
tentang:en|1 2 3 4|2 1 0 3 4
seperti:en|1 2 3|1 0 2 1 3
seperti:de|1 2 3|1 0 2 1 3
kira-kira:de|1 2 3|1 2 3
mungkin:en|1 2 3|1 0 3 2
pasti:de|1 2 3|1 3 2
saja:en|2 3 1 1|2 0 3 0 1 1
ayo:de|1 2 3|1 2 3
hati-hati:de|1 2 3|1 2 0 3
awas:en|1 2 3|1 1 2 2 0 3
awas:de|1 0 2|1 0 2
en:hello:de|1 2 3 4 5|1 2 3 4 5
de:hallo:en|1 2 3 4 5|1 2 3 4 5
en:hi:de|1 2 3 4|1 2 3 0 4
de:hi:en|1 2 3 0 4|1 2 3 4
en:good morning:de|1 1 2|1 1 2
de:guten morgen:en|1 1 2|1 1 2
en:good afternoon:de|1 1 2 3|1 1 2 3
de:guten nachmittag:en|1 1 2 3|1 1 2 3
en:good night:de|1 1 3 2|1 1 3 2
de:gute nacht:en|1 1 3 2|1 1 3 2
en:goodbye:de|1 2 3|1 1 2 3
de:auf wiedersehen:en|1 1 2 3|1 2 3
en:see you tomorrow:de|1 1 1 2 3|1 1 2 0 3
de:bis morgen:en|1 1 2 0 3|1 1 1 2 3
en:please:de|1 1 2|1 1 2
de:bitte:en|1 1 2|1 1 2
en:thank you:de|1 1 2 2|1 2
de:danke:en|1 2|1 1 2 2
en:thanks:de|1 2 3 4|1 2 3 4
en:sorry:de|1 2 3 4|1 2 3 4 4
de:entschuldigung:en|1 2 3 4 4|1 2 3 4
en:excuse me:de|1 1 3 4 0 2|1 1 3 4 2 2
de:entschuldigen sie:en|1 1 3 4 2 2|1 1 3 4 0 2
en:no:de|2 1 1|2 1
de:nein:en|2 1|2 1 1
en:how are you:de|1 2 3 4|1 2 0 3 4
de:wie geht es dir:en|1 2 0 3 4|1 2 3 4
en:welcome:de|1 2 4 3|1 2 4 3
de:willkommen:en|1 2 4 3|1 2 4 3
en:enjoy your meal:de|1 1 1 2|1 1 2
de:guten appetit:en|1 1 2|1 1 1 2
en:happy birthday:de|1 1 2|1 1 1 1 2
de:alles gute zum geburtstag:en|1 1 1 1 2|1 1 2
en:good luck:de|1 1 2 3 4|1 1 2 3 4
de:viel glück:en|1 1 2 3 4|1 1 2 3 4
en:no problem:de|1 1 2 3 4 5|1 1 2 3 5 4
de:kein problem:en|1 1 2 3 5 4|1 1 2 3 4 5
en:i:de|1 2 3 4|1 2 3 4
de:ich:en|1 2 3 4|1 2 3 4
en:you:de|1 2 3 4|1 2 3 4
de:du:en|1 2 3 4|1 2 3 4
en:he:de|1 2 3 4 5|1 2 3 4 5
de:er:en|1 2 3 4 5|1 2 3 4 5
en:she:de|1 2 3 4|1 2 3 4
de:sie:en|1 2 3 4|1 2 3 4
en:it:de|1 2 3 4 5|1 2 3 4 5
de:es:en|1 2 3 4 5|1 2 3 4 5
en:we:de|1 2 3 4 5|1 2 3 4 5
de:wir:en|1 2 3 4 5|1 2 3 4 5
en:they:de|2 3 1 1|2 3 1 1
en:my:de|1 2 3 4|1 2 3 4
de:mein:en|1 2 3 4|1 2 3 4
en:your:de|1 2 3 4|1 2 3 4
de:dein:en|1 2 3 4|1 2 3 4
en:this:de|1 2 3 4|1 1 2 3 4
de:dies:en|1 1 2 3 4|1 2 3 4
en:that:de|1 2 3 5 4|1 1 2 3 5 4
de:das dort:en|1 1 2 3 5 4|1 2 3 5 4
en:what:de|1 2 3|1 2 3
de:was:en|1 2 3|1 2 3
en:who:de|1 2 3 4|1 2 3 4
de:wer:en|1 2 3 4|1 2 3 4
en:where:de|2 3 0 1|2 3 1 1
de:wo:en|2 3 1 1|2 3 0 1
en:when:de|1 0 2 3|1 3 2
de:wann:en|1 3 2|1 0 2 3
en:why:de|1 2 3 4|1 2 3 4
de:warum:en|1 2 3 4|1 2 3 4
en:how many:de|1 1 2 3 4|1 1 2 3 4
de:wie viele:en|1 1 2 3 4|1 1 2 3 4
en:which:de|1 1 0 2 3|1 3 2
de:welche:en|1 3 2|1 1 0 2 3
en:whose:de|1 2 3 4|1 2 3 4
de:wessen:en|1 2 3 4|1 2 3 4
en:zero:de|1 2 3 4|1 2 3 4
de:null:en|1 2 3 4|1 2 3 4
en:one:de|1 2 4 3|1 2 4 3
de:eins:en|1 2 4 3|1 2 4 3
en:two:de|1 2 3 4|1 2 3 4
de:zwei:en|1 2 3 4|1 2 3 4
en:three:de|1 2 3 4|1 2 3 4
de:drei:en|1 2 3 4|1 2 3 4
en:four:de|1 1 2 3|1 1 2 3
de:vier:en|1 1 2 3|1 1 2 3
en:five:de|1 2 3 4|1 2 3 4
de:fünf:en|1 2 3 4|1 2 3 4
en:six:de|1 2 3 5 4|1 2 3 5 4
de:sechs:en|1 2 3 5 4|1 2 3 5 4
en:seven:de|1 2 3 4 5|1 2 3 4 5
de:sieben:en|1 2 3 4 5|1 2 3 4 5
en:eight:de|0 1 4 2 3|1 1 4 2 3
de:acht:en|1 1 4 2 3|0 1 4 2 3
en:nine:de|1 2 3 4 5|1 2 4 5 3
de:neun:en|1 2 4 5 3|1 2 3 4 5
en:ten:de|1 2 3 4|1 2 3 4
de:zehn:en|1 2 3 4|1 2 3 4
en:eleven:de|0 1 2 3 4|1 1 2 3 4 2
de:elf:en|1 1 2 3 4 2|0 1 2 3 4
en:twelve:de|1 1 2 3|1 1 2 3
de:zwölf:en|1 1 2 3|1 1 2 3
en:twenty:de|1 2 3 5 4|1 2 3 5 4
de:zwanzig:en|1 2 3 5 4|1 2 3 5 4
en:thirty:de|0 1 2 3 4|1 1 2 3 4
de:dreißig:en|1 1 2 3 4|0 1 2 3 4
en:fifty:de|0 1 2 3 4|1 1 2 3 4
de:fünfzig:en|1 1 2 3 4|0 1 2 3 4
en:one hundred:de|2 3 1 1 4|2 3 1 4
de:einhundert:en|2 3 1 4|2 3 1 1 4
en:one thousand:de|0 1 3 2 2 4|1 1 3 2 4
de:eintausend:en|1 1 3 2 4|0 1 3 2 2 4
en:one million:de|0 2 3 1 1 4|2 2 3 1 1 4
de:eine million:en|2 2 3 1 1 4|0 2 3 1 1 4
en:first:de|1 2 3 4 5|1 2 3 4 5
de:erste:en|1 2 3 4 5|1 2 3 4 5
en:last:de|1 2 3 4 5|1 2 3 4 5
de:letzte:en|1 2 3 4 5|1 2 3 4 5
en:half:de|2 3 1 4 4 5|2 3 1 1 4 5
de:halb:en|2 3 1 1 4 5|2 3 1 4 4 5
en:day:de|1 2 3 4|1 2 3 4
de:tag:en|1 2 3 4|1 2 3 4
en:today:de|1 2 3 4 5|1 2 3 4 5
de:heute:en|1 2 3 4 5|1 2 3 4 5
en:tomorrow:de|1 2 3|1 2 3
de:morgen:en|1 2 3|1 2 3
en:yesterday:de|2 3 1 1 4|2 3 4 1 1
de:gestern:en|2 3 4 1 1|2 3 1 1 4
en:now:de|1 0 3 2|1 3 2
de:jetzt:en|1 3 2|1 0 3 2
en:soon:de|0 1 2 3|1 1 2 3
de:bald:en|1 1 2 3|0 1 2 3
en:night:de|0 1 2 3 4|1 1 2 3 4
de:nacht:en|1 1 2 3 4|0 1 2 3 4
en:month:de|1 2 3 4 5|1 2 3 4 5
de:monat:en|1 2 3 4 5|1 2 3 4 5
en:year:de|1 2 3 4 5|1 2 4 3 5
de:jahr:en|1 2 4 3 5|1 2 3 4 5
en:hour:de|1 2 5 3 4|1 2 5 3 4
de:stunde:en|1 2 5 3 4|1 2 5 3 4
en:minute:de|1 2 3 4|1 2 3 4
de:minute:en|1 2 3 4|1 2 3 4
en:second:de|1 2 3 4|1 4 2 3
de:sekunde:en|1 4 2 3|1 2 3 4
en:time:de|1 2 3 4 5|1 2 5 3 4
de:zeit:en|1 2 5 3 4|1 2 3 4 5
en:always:de|1 2 3 4|1 3 2 4
de:immer:en|1 3 2 4|1 2 3 4
en:often:de|1 2 3 4|1 3 2 4
de:oft:en|1 3 2 4|1 2 3 4
en:never:de|1 2 3 4|1 3 2 4
de:nie:en|1 3 2 4|1 2 3 4
en:already:de|1 2 3 4|4 3 1 2
de:schon:en|4 3 1 2|1 2 3 4
en:still:de|1 2 3 4 5|1 2 3 4 0 5
de:noch:en|1 2 3 4 0 5|1 2 3 4 5
en:early:de|1 2 3 4|1 2 4 3
de:früh:en|1 2 4 3|1 2 3 4
en:late:de|0 1 2 3|1 1 2 3
de:spät:en|1 1 2 3|0 1 2 3
en:monday:de|1 2 3 4 5 6|1 2 4 3 5 6
de:montag:en|1 2 4 3 5 6|1 2 3 4 5 6
en:thursday:de|1 2 3 4 5|1 2 3 4 5
de:donnerstag:en|1 2 3 4 5|1 2 3 4 5
en:friday:de|1 2 3 4 5|1 2 4 3 5
de:freitag:en|1 2 4 3 5|1 2 3 4 5
en:saturday:de|1 2 3 4 5|1 2 4 3 5
de:samstag:en|1 2 4 3 5|1 2 3 4 5
en:sunday:de|1 2 3 5 4|1 2 3 5 4
de:sonntag:en|1 2 3 5 4|1 2 3 5 4
en:january:de|1 2 3 4|0 1 2 3 4
de:januar:en|0 1 2 3 4|1 2 3 4
en:february:de|1 2 3 4 5|0 1 2 3 4 5
de:februar:en|0 1 2 3 4 5|1 2 3 4 5
en:march:de|2 3 0 1 4 5|2 3 4 1 1 5
de:märz:en|2 3 4 1 1 5|2 3 0 1 4 5
en:april:de|0 1 2 3 4|1 1 2 3 4
de:april:en|1 1 2 3 4|0 1 2 3 4
en:may:de|1 2 3 4 5|1 2 3 4 5
de:mai:en|1 2 3 4 5|1 2 3 4 5
en:july:de|1 2 3 4|0 1 2 4 3
de:juli:en|0 1 2 4 3|1 2 3 4
en:october:de|1 2 3 5 4|0 1 2 3 5 4
de:oktober:en|0 1 2 3 5 4|1 2 3 5 4
en:november:de|1 2 3 4 5|0 1 2 3 4 5
de:november:en|0 1 2 3 4 5|1 2 3 4 5
en:family:de|1 4 2 3|1 4 2 3
de:familie:en|1 4 2 3|1 4 2 3
en:mother:de|1 2 4 3|1 2 4 3
de:mutter:en|1 2 4 3|1 2 4 3
en:father:de|1 2 6 3 4 5|1 2 6 3 4 5
de:vater:en|1 2 6 3 4 5|1 2 6 3 4 5
en:parents:de|1 2 3 4 5|1 2 3 4 5
de:eltern:en|1 2 3 4 5|1 2 3 4 5
en:child:de|0 1 3 2|1 1 3 2
de:kind:en|1 1 3 2|0 1 3 2
en:son:de|1 2 3 4 6 5|1 2 3 4 6 5
de:sohn:en|1 2 3 4 6 5|1 2 3 4 6 5
en:daughter:de|1 2 3 4|1 2 3 4
de:tochter:en|1 2 3 4|1 2 3 4
en:sister:de|1 2 3 0 4|1 2 3 4
de:schwester:en|1 2 3 4|1 2 3 0 4
en:grandfather:de|1 2 6 3 4 5|1 2 6 3 4 5
de:großvater:en|1 2 6 3 4 5|1 2 6 3 4 5
en:uncle:de|1 2 3 4 5 6|1 2 3 4 5 6
de:onkel:en|1 2 3 4 5 6|1 2 3 4 5 6
en:aunt:de|1 2 3 4 5|1 2 3 4 5
de:tante:en|1 2 3 4 5|1 2 3 4 5
en:cousin:de|1 2 5 3 4|1 2 5 3 4
de:cousin:en|1 2 5 3 4|1 2 5 3 4
en:husband:de|1 2 3 0 4|1 2 3 4
de:ehemann:en|1 2 3 4|1 2 3 0 4
en:wife:de|2 3 4 1 1|2 3 4 1 1
de:ehefrau:en|2 3 4 1 1|2 3 4 1 1
en:baby:de|0 1 3 2|1 1 3 2
de:baby:en|1 1 3 2|0 1 3 2
en:boy:de|0 1 3 2|1 1 3 2
de:junge:en|1 1 3 2|0 1 3 2
en:girl:de|0 1 4 2 3|1 1 4 2 3
de:mädchen:en|1 1 4 2 3|0 1 4 2 3
en:woman:de|0 1 3 2|1 1 3 2
de:frau:en|1 1 3 2|0 1 3 2
en:people:de|1 2 3 4|1 2 3 4
de:leute:en|1 2 3 4|1 2 3 4
en:person:de|1 2 3 5 4|1 2 3 5 4
de:person:en|1 2 3 5 4|1 2 3 5 4
en:neighbor:de|1 2 3 4 5|1 2 3 4 5
de:nachbar:en|1 2 3 4 5|1 2 3 4 5
en:guest:de|1 2 3 4 5|1 2 5 3 4
de:gast:en|1 2 5 3 4|1 2 3 4 5
en:teacher:de|0 1 2 3|1 1 2 3
de:lehrer:en|1 1 2 3|0 1 2 3
en:student:de|0 1 4 2 3|1 1 4 2 3
de:student:en|1 1 4 2 3|0 1 4 2 3
en:doctor:de|2 1 4 2 3|1 1 4 2 3
de:arzt:en|1 1 4 2 3|2 1 4 2 3
en:nurse:de|0 1 3 2 2|1 1 3 2
de:krankenpfleger:en|1 1 3 2|0 1 3 2 2
en:police officer:de|0 1 1 3 2|1 1 3 2
de:polizist:en|1 1 3 2|0 1 1 3 2
en:driver:de|0 1 3 2|1 1 3 2
de:fahrer:en|1 1 3 2|0 1 3 2
en:cook:de|0 1 2 3|1 1 2 3
de:koch:en|1 1 2 3|0 1 2 3
en:waiter:de|0 1 3 0 2|1 1 3 2 2
de:kellner:en|1 1 3 2 2|0 1 3 0 2
en:boss:de|1 2 3 4 5|1 2 3 4 5
de:chef:en|1 2 3 4 5|1 2 3 4 5
en:eat:de|1 2 3 4 5|1 2 4 5 3
de:essen:en|1 2 4 5 3|1 2 3 4 5
en:drink:de|1 2 3 4 5|1 2 4 5 3
de:trinken:en|1 2 4 5 3|1 2 3 4 5
en:food:de|0 1 2 3 4|1 1 2 3 4
en:water:de|1 2 3 4 0 5|1 2 3 4 5
de:wasser:en|1 2 3 4 5|1 2 3 4 0 5
en:tea:de|1 2 4 3|1 2 4 3
de:tee:en|1 2 4 3|1 2 4 3
en:milk:de|0 1 3 2|1 1 3 2
de:milch:en|1 1 3 2|0 1 3 2
en:beer:de|1 4 2 5 3|1 4 2 5 3
de:bier:en|1 4 2 5 3|1 4 2 5 3
en:wine:de|1 2 4 3|1 2 4 3
de:wein:en|1 2 4 3|1 2 4 3
en:rice:de|1 2 3 4 5|1 2 3 4 5
de:reis:en|1 2 3 4 5|1 2 3 4 5
en:egg:de|1 2 3 4 5 6|1 2 3 4 5 6
de:ei:en|1 2 3 4 5 6|1 2 3 4 5 6
en:meat:de|1 0 2 3 4|1 3 2 4
de:fleisch:en|1 3 2 4|1 0 2 3 4
en:chicken:de|1 2 3 4|1 2 4 4 3
de:hähnchen:en|1 2 4 4 3|1 2 3 4
en:beef:de|0 1 2 3 4|1 1 2 3 4
de:rindfleisch:en|1 1 2 3 4|0 1 2 3 4
en:pork:de|1 2 3 4|1 3 2 4
de:schweinefleisch:en|1 3 2 4|1 2 3 4
en:fish:de|1 2 3 4 5|1 2 4 5 3
de:fisch:en|1 2 4 5 3|1 2 3 4 5
en:soup:de|0 1 2 3|1 1 2 3
de:suppe:en|1 1 2 3|0 1 2 3
en:salad:de|1 2 3 4 5 6|1 2 5 6 3 4
de:salat:en|1 2 5 6 3 4|1 2 3 4 5 6
en:vegetable:de|1 2 3 4|1 2 3 4
de:gemüse:en|1 2 3 4|1 2 3 4
en:fruit:de|1 2 3 4 5|1 2 3 4 5
de:obst:en|1 2 3 4 5|1 2 3 4 5
en:apple:de|1 2 3 4 5 6|1 2 5 6 3 4
de:apfel:en|1 2 5 6 3 4|1 2 3 4 5 6
en:banana:de|0 1 2 3|1 1 2 3
de:banane:en|1 1 2 3|0 1 2 3
en:orange:de|1 2 3 4|1 2 3 4
de:orange:en|1 2 3 4|1 2 3 4
en:potato:de|1 6 2 3 4 5|1 6 2 3 4 5
de:kartoffel:en|1 6 2 3 4 5|1 6 2 3 4 5
en:tomato:de|0 1 2 3|1 1 2 3
de:tomate:en|1 1 2 3|0 1 2 3
en:onion:de|2 3 0 1|2 3 1 1
de:zwiebel:en|2 3 1 1|2 3 0 1
en:carrot:de|0 1 4 2 3|1 1 4 2 3
de:karotte:en|1 1 4 2 3|0 1 4 2 3
en:cheese:de|1 2 3 4 5 6|1 2 3 4 5 6
de:käse:en|1 2 3 4 5 6|1 2 3 4 5 6
en:sugar:de|1 2 3 4 5 6|1 2 3 4 5 6
de:zucker:en|1 2 3 4 5 6|1 2 3 4 5 6
en:noodles:de|1 2 3 4 5|1 2 3 4 5
de:nudeln:en|1 2 3 4 5|1 2 3 4 5
en:pasta:de|1 2 3 4|1 2 4 4 3
de:pasta:en|1 2 4 4 3|1 2 3 4
en:sandwich:de|1 2 3 4 5 6|1 2 3 4 5 6
de:sandwich:en|1 2 3 4 5 6|1 2 3 4 5 6
en:chocolate:de|0 1 2 3|1 1 2 3
de:schokolade:en|1 1 2 3|0 1 2 3
en:ice cream:de|2 3 4 1 1|2 3 4 1
de:eis:en|2 3 4 1|2 3 4 1 1
en:breakfast:de|1 2 3 4 5|1 2 4 5 3
de:frühstück:en|1 2 4 5 3|1 2 3 4 5
en:dinner:de|1 2 3|1 1 2 3
de:abendessen:en|1 1 2 3|1 2 3
en:snack:de|1 2 3 4 5 6|1 2 5 6 3 4
de:snack:en|1 2 5 6 3 4|1 2 3 4 5 6
en:meal:de|1 2 3 4 5|1 2 3 4 5
de:mahlzeit:en|1 2 3 4 5|1 2 3 4 5
en:menu:de|2 3 4 0 1 5|2 3 5 1 1 4
de:speisekarte:en|2 3 5 1 1 4|2 3 4 0 1 5
en:bill:de|1 1 1|1 1 1
de:rechnung:en|1 1 1|1 1 1
en:table:de|1 2 3 4 5 6|1 2 3 4 5 6
de:tisch:en|1 2 3 4 5 6|1 2 3 4 5 6
en:glass:de|1 2 3 5 4|1 2 3 5 4
de:glas:en|1 2 3 5 4|1 2 3 5 4
en:cup:de|1 5 2 3 4|1 5 2 3 4
de:tasse:en|1 5 2 3 4|1 5 2 3 4
en:bottle:de|1 2 3 4 0 5|1 2 3 4 5
de:flasche:en|1 2 3 4 5|1 2 3 4 0 5
en:spoon:de|1 2 3 4 5 6|1 2 3 4 5 6
de:löffel:en|1 2 3 4 5 6|1 2 3 4 5 6
en:hungry:de|1 2 3 4|1 2 3 4
de:hungrig:en|1 2 3 4|1 2 3 4
en:delicious:de|0 1 2 3|1 1 2 3
de:lecker:en|1 1 2 3|0 1 2 3
en:sweet:de|0 1 2 3 4|1 1 2 3 4
de:süß:en|1 1 2 3 4|0 1 2 3 4
en:spicy:de|1 2 3 4 5|1 2 3 4 5
de:scharf:en|1 2 3 4 5|1 2 3 4 5
en:sour:de|0 1 2 3|1 1 2 3
de:sauer:en|1 1 2 3|0 1 2 3
en:bitter:de|0 1 2 3|1 1 2 3
de:bitter:en|1 1 2 3|0 1 2 3
en:go:de|1 2 3 4 5 6|1 2 5 0 6 3 4
de:gehen:en|1 2 5 0 6 3 4|1 2 3 4 5 6
en:come:de|1 2 3|1 2 3
de:kommen:en|1 2 3|1 2 3
en:return:de|1 2 3 4 5 6|1 2 5 6 5 4 3
de:zurückkehren:en|1 2 5 6 5 4 3|1 2 3 4 5 6
en:leave:de|0 1 2 3 4 5|1 1 2 4 5 3
de:verlassen:en|1 1 2 4 5 3|0 1 2 3 4 5
en:stay:de|2 4 1 1 3|2 4 3 1 1
de:bleiben:en|2 4 3 1 1|2 4 1 1 3
en:run:de|0 1 2 3 4 5|1 1 2 4 5 3
de:rennen:en|1 1 2 4 5 3|0 1 2 3 4 5
en:stand:de|1 2 3 4 5|1 2 3 4 5
de:stehen:en|1 2 3 4 5|1 2 3 4 5
en:sleep:de|1 2 3 4|1 2 3 4
de:schlafen:en|1 2 3 4|1 2 3 4
en:see:de|1 2 3 4|1 2 3 4
de:sehen:en|1 2 3 4|1 2 3 4
en:say:de|1 0 2 3|1 3 2
de:sagen:en|1 3 2|1 0 2 3
en:tell:de|1 5 2 3 4|1 5 2 3 4
de:erzählen:en|1 5 2 3 4|1 5 2 3 4
en:ask:de|1 2 3 4|1 2 3 4
de:fragen:en|1 2 3 4|1 2 3 4
en:talk:de|2 3 4 0 1|2 3 4 1 1
de:reden:en|2 3 4 1 1|2 3 4 0 1
en:read:de|1 2 3 4 5 6|1 2 5 6 3 4
de:lesen:en|1 2 5 6 3 4|1 2 3 4 5 6
en:write:de|1 4 2 3|1 4 2 3
de:schreiben:en|1 4 2 3|1 4 2 3
en:learn:de|1 2 3 4 5|1 2 4 5 3
de:lernen:en|1 2 4 5 3|1 2 3 4 5
en:study:de|1 5 2 3 4|1 5 2 3 4
de:studieren:en|1 5 2 3 4|1 5 2 3 4
en:teach:de|1 2 3|1 2 3
de:unterrichten:en|1 2 3|1 2 3
en:understand:de|1 1 0 2|1 1 2 2
de:verstehen:en|1 1 2 2|1 1 0 2
en:know:de|1 2 4 3|1 2 4 3
de:wissen:en|1 2 4 3|1 2 4 3
en:think:de|1 2 3 4 5|1 2 3 4 5
de:denken:en|1 2 3 4 5|1 2 3 4 5
en:want:de|1 2 3 4 0 5|1 2 3 4 5
de:wollen:en|1 2 3 4 5|1 2 3 4 0 5
en:need:de|1 2 3 4|1 2 3 4
de:brauchen:en|1 2 3 4|1 2 3 4
en:love:de|1 4 2 3|1 4 2 3
de:lieben:en|1 4 2 3|1 4 2 3
en:hate:de|1 2 3|1 2 3
de:hassen:en|1 2 3|1 2 3
en:have:de|1 2 3 4 5|1 2 3 4 5
de:haben:en|1 2 3 4 5|1 2 3 4 5
en:give:de|2 3 4 0 1|2 3 4 1 1
de:geben:en|2 3 4 1 1|2 3 4 0 1
en:take:de|1 2 3 4|1 2 3 4
de:nehmen:en|1 2 3 4|1 2 3 4
en:bring:de|1 2 3|1 2 3 2
de:bringen:en|1 2 3 2|1 2 3
en:put:de|2 3 4 1 5 4 6|2 3 1 1 5 4 6
de:legen:en|2 3 1 1 5 4 6|2 3 4 1 5 4 6
en:get:de|1 2 3 4 5|1 2 5 3 4
de:bekommen:en|1 2 5 3 4|1 2 3 4 5
en:buy:de|1 2 3 4 5|1 2 4 5 3
de:kaufen:en|1 2 4 5 3|1 2 3 4 5
en:make:de|2 3 1|2 3 1 1
de:machen:en|2 3 1 1|2 3 1
en:do:de|1 3 2 3|1 3 2
de:tun:en|1 3 2|1 3 2 3
en:work:de|1 2 3 4 5|1 2 3 4 5
de:arbeiten:en|1 2 3 4 5|1 2 3 4 5
en:play:de|1 2 3 4|1 2 3 4
de:spielen:en|1 2 3 4|1 2 3 4
en:wash:de|1 2 3 4|1 2 3 4
de:waschen:en|1 2 3 4|1 2 3 4
en:clean:de|2 3 0 1|2 3 1 1
de:putzen:en|2 3 1 1|2 3 0 1
en:open:de|2 3 0 1|2 3 1 1
de:öffnen:en|2 3 1 1|2 3 0 1
en:close:de|2 3 0 1|2 3 1 1
de:schließen:en|2 3 1 1|2 3 0 1
en:finish:de|1 5 2 3 4|1 5 0 2 3 4
de:beenden:en|1 5 0 2 3 4|1 5 2 3 4
en:help:de|1 2 3 4|1 2 4 3
de:helfen:en|1 2 4 3|1 2 3 4
en:try:de|1 2 3|1 2 0 3 3
de:versuchen:en|1 2 0 3 3|1 2 3
en:find:de|1 2 3 4|1 2 3 4
de:finden:en|1 2 3 4|1 2 3 4
en:lose:de|1 2 3 5 4|1 2 4 3 5
de:verlieren:en|1 2 4 3 5|1 2 3 5 4
en:meet:de|1 2 3 6 4 5|1 2 3 6 4 5
de:treffen:en|1 2 3 6 4 5|1 2 3 6 4 5
en:live:de|1 2 3 4|1 2 3 4
de:wohnen:en|1 2 3 4|1 2 3 4
en:sing:de|1 2 3 4 5|1 2 4 5 3
de:singen:en|1 2 4 5 3|1 2 3 4 5
en:swim:de|1 4 2 0 3|1 4 2 3
de:schwimmen:en|1 4 2 3|1 4 2 0 3
en:visit:de|1 2 3 4|1 2 3 4
de:besuchen:en|1 2 3 4|1 2 3 4
en:receive:de|1 5 2 3 4|1 5 4 2 3
de:erhalten:en|1 5 4 2 3|1 5 2 3 4
en:choose:de|1 4 2 5 3|1 4 2 5 3
de:wählen:en|1 4 2 5 3|1 4 2 5 3
en:change:de|1 4 2 3|1 4 2 3
de:ändern:en|1 4 2 3|1 4 2 3
en:carry:de|1 4 2 5 3|1 4 2 5 3
de:tragen:en|1 4 2 5 3|1 4 2 5 3
en:cut:de|2 3 0 1|2 3 1 1
de:schneiden:en|2 3 1 1|2 3 0 1
en:build:de|1 2 3 4 5|1 2 3 4 5
de:bauen:en|1 2 3 4 5|1 2 3 4 5
en:good:de|1 2 3 4 5|1 2 3 4 5
en:bad:de|0 1 2 3 4|1 1 2 4 3
de:schlecht:en|1 1 2 4 3|0 1 2 3 4
en:big:de|1 2 3 4 5|1 2 3 4 5
de:groß:en|1 2 3 4 5|1 2 3 4 5
en:small:de|1 2 3 4 5|1 2 3 4 5
de:klein:en|1 2 3 4 5|1 2 3 4 5
en:short:de|1 2 3 4|1 2 3 4
de:kurz:en|1 2 3 4|1 2 3 4
en:tall:de|1 2 3 4|1 2 3 4
de:hochgewachsen:en|1 2 3 4|1 2 3 4
en:high:de|0 1 2 3|1 1 2 3
de:hoch:en|1 1 2 3|0 1 2 3
en:low:de|0 1 2 3|1 1 2 3
de:niedrig:en|1 1 2 3|0 1 2 3
en:new:de|1 2 3 4 5|1 2 3 4 5
de:neu:en|1 2 3 4 5|1 2 3 4 5
en:old:de|1 2 3 4 5|1 2 3 4 5
de:alt:en|1 2 3 4 5|1 2 3 4 5
en:young:de|1 2 3 4 5|1 2 3 4 5
de:jung:en|1 2 3 4 5|1 2 3 4 5
en:hot:de|0 1 2 3|1 1 2 3
de:heiß:en|1 1 2 3|0 1 2 3
en:cold:de|0 1 2 3|1 1 2 3
de:kalt:en|1 1 2 3|0 1 2 3
en:warm:de|0 1 2 3|1 1 2 3
de:warm:en|1 1 2 3|0 1 2 3
en:cool:de|0 1 2 3|1 1 2 3
de:kühl:en|1 1 2 3|0 1 2 3
en:fast:de|0 1 2 3|1 1 2 3
de:schnell:en|1 1 2 3|0 1 2 3
en:slow:de|0 1 2 3|1 1 2 3
de:langsam:en|1 1 2 3|0 1 2 3
en:easy:de|1 2 3 4|1 2 3 4
de:leicht:en|1 2 3 4|1 2 3 4
en:difficult:de|0 1 2 3|1 1 2 3
de:schwierig:en|1 1 2 3|0 1 2 3
en:heavy:de|0 1 2 3|1 1 2 3
de:schwer:en|1 1 2 3|0 1 2 3
en:light:de|0 1 2 3|1 1 2 3
en:cheap:de|1 2 3 4|1 2 3 4
de:billig:en|1 2 3 4|1 2 3 4
en:expensive:de|0 1 2 3|1 1 2 3
de:teuer:en|1 1 2 3|0 1 2 3
en:beautiful:de|0 1 2 3|1 1 2 3
de:schön:en|1 1 2 3|0 1 2 3
en:pretty:de|1 2 3 5 4|1 2 3 5 4
de:hübsch:en|1 2 3 5 4|1 2 3 5 4
en:ugly:de|0 1 2 3|1 1 2 3
de:hässlich:en|1 1 2 3|0 1 2 3
en:tidy:de|0 1 2 3|1 1 2 3
de:ordentlich:en|1 1 2 3|0 1 2 3
en:dirty:de|1 4 2 3|1 4 2 3
de:schmutzig:en|1 4 2 3|1 4 2 3
en:happy:de|1 2 3 4|1 2 4 3
de:glücklich:en|1 2 4 3|1 2 3 4
en:sad:de|0 1 2 3|1 1 2 3
de:traurig:en|1 1 2 3|0 1 2 3
en:tired:de|1 2 3 4|1 2 3 4
de:müde:en|1 2 3 4|1 2 3 4
en:angry:de|1 2 3|1 2 3
de:wütend:en|1 2 3|1 2 3
en:afraid:de|1 2 3|1 2 3
de:ängstlich:en|1 2 3|1 2 3
en:busy:de|1 2 3 4|1 2 4 3
de:beschäftigt:en|1 2 4 3|1 2 3 4
en:free:de|0 1 2 3 4 5|1 1 2 4 5 3
de:frei:en|1 1 2 4 5 3|0 1 2 3 4 5
en:ready:de|1 2 3|1 1 2 3
de:bereit:en|1 1 2 3|1 2 3
en:sick:de|1 2 3 4|1 2 3 4
de:krank:en|1 2 3 4|1 2 3 4
en:healthy:de|1 2 3|1 2 3
de:gesund:en|1 2 3|1 2 3
en:strong:de|1 2 3 4|1 2 3 4
de:stark:en|1 2 3 4|1 2 3 4
en:weak:de|0 1 2 3|1 1 2 3
de:schwach:en|1 1 2 3|0 1 2 3
en:rich:de|1 2 3 5 4|1 2 3 5 4
de:reich:en|1 2 3 5 4|1 2 3 5 4
en:poor:de|1 2 3|1 2 3
de:arm:en|1 2 3|1 2 3
en:full:de|0 1 2 3|1 1 2 3
de:voll:en|1 1 2 3|0 1 2 3
en:empty:de|0 1 2 3|1 1 2 3
de:leer:en|1 1 2 3|0 1 2 3
en:closed:de|0 1 2 3|1 1 2 3
de:geschlossen:en|1 1 2 3|0 1 2 3
en:correct:de|1 2 3 4|1 2 3 4
de:richtig:en|1 2 3 4|1 2 3 4
en:wrong:de|1 2 3 4|1 2 3 4
de:falsch:en|1 2 3 4|1 2 3 4
en:same:de|1 2 3 5 4|1 2 3 5 4
de:gleich:en|1 2 3 5 4|1 2 3 5 4
en:important:de|1 2 3|1 2 3
de:wichtig:en|1 2 3|1 2 3
en:interesting:de|1 2 3 4|1 2 3 4
de:interessant:en|1 2 3 4|1 2 3 4
en:quiet:de|0 1 2 3|1 1 2 3
de:ruhig:en|1 1 2 3|0 1 2 3
en:loud:de|1 2 3 4|1 2 3 4
de:laut:en|1 2 3 4|1 2 3 4
en:dark:de|0 1 2 3|1 1 2 3
de:dunkel:en|1 1 2 3|0 1 2 3
en:bright:de|0 1 2 3|1 1 2 3
de:hell:en|1 1 2 3|0 1 2 3
en:wet:de|1 2 0 3|1 2 0 3
de:nass:en|1 2 0 3|1 2 0 3
en:dry:de|0 1 2 3|1 1 2 3
de:trocken:en|1 1 2 3|0 1 2 3
en:many:de|1 2 3 4|1 2 3 4
de:viele:en|1 2 3 4|1 2 3 4
en:much:de|1 0 2 3 4 5|1 3 2 4 5
de:viel:en|1 3 2 4 5|1 0 2 3 4 5
en:few:de|1 2 3 4|1 2 3 4
de:wenige:en|1 2 3 4|1 2 3 4
en:some:de|1 2 3 4|1 2 3 4
de:einige:en|1 2 3 4|1 2 3 4
en:all:de|1 0 2 3 4|1 2 3 4
de:alle:en|1 2 3 4|1 0 2 3 4
en:more:de|1 2 3 4|1 2 3 4
de:mehr:en|1 2 3 4|1 2 3 4
en:less:de|1 2 3 4|1 2 3 4
de:weniger:en|1 2 3 4|1 2 3 4
en:enough:de|1 2 3 4|1 2 3 4
de:genug:en|1 2 3 4|1 2 3 4
en:only:de|1 2 3 5 4|1 2 3 5 4
de:nur:en|1 2 3 5 4|1 2 3 5 4
en:house:de|1 2 3 4 5|1 2 3 4 5
de:haus:en|1 2 3 4 5|1 2 3 4 5
en:home:de|2 3 1 1|2 3 1 1
de:zuhause:en|2 3 1 1|2 3 1 1
en:room:de|1 2 3 4|1 2 3 4
de:zimmer:en|1 2 3 4|1 2 3 4
en:kitchen:de|1 2 3 4 5|1 2 3 4 5
de:küche:en|1 2 3 4 5|1 2 3 4 5
en:bathroom:de|0 1 2 3|1 1 2 3
de:badezimmer:en|1 1 2 3|0 1 2 3
en:bedroom:de|0 1 2 3|1 1 2 3
de:schlafzimmer:en|1 1 2 3|0 1 2 3
en:garden:de|0 1 2 3|1 1 2 3
de:garten:en|1 1 2 3|0 1 2 3
en:street:de|0 1 2 3|1 1 2 3
de:straße:en|1 1 2 3|0 1 2 3
en:city:de|1 2 3 4 6 5|1 2 3 4 6 5
de:stadt:en|1 2 3 4 6 5|1 2 3 4 6 5
en:town:de|0 1 2 3|1 1 2 3
de:kleinstadt:en|1 1 2 3|0 1 2 3
en:village:de|1 2 6 3 4 5|1 2 6 3 4 5
de:dorf:en|1 2 6 3 4 5|1 2 6 3 4 5
en:university:de|1 5 2 3 4|1 5 2 3 4
de:universität:en|1 5 2 3 4|1 5 2 3 4
en:hospital:de|0 1 2 3|1 1 2 3
de:krankenhaus:en|1 1 2 3|0 1 2 3
en:shop:de|0 1 4 2 3|1 1 4 2 3
de:laden:en|1 1 4 2 3|0 1 4 2 3
en:supermarket:de|0 1 2 3|1 1 2 3
de:supermarkt:en|1 1 2 3|0 1 2 3
en:bank:de|0 1 2 3|1 1 2 3
de:bank:en|1 1 2 3|0 1 2 3
en:post office:de|0 1 1 4 2 3|1 1 4 2 3
de:post:en|1 1 4 2 3|0 1 1 4 2 3
en:church:de|0 1 2 3 4|1 1 2 3 4
de:kirche:en|1 1 2 3 4|0 1 2 3 4
en:museum:de|0 1 2 3|1 1 2 3
de:museum:en|1 1 2 3|0 1 2 3
en:library:de|1 2 3 4 5|1 2 3 4 5
de:bibliothek:en|1 2 3 4 5|1 2 3 4 5
en:park:de|1 2 3 4 1 5|1 2 3 4 5
de:park:en|1 2 3 4 5|1 2 3 4 1 5
en:hotel:de|0 1 2 3|1 1 2 3
de:hotel:en|1 1 2 3|0 1 2 3
en:office:de|1 2 3 4 5|1 2 3 4 5
de:büro:en|1 2 3 4 5|1 2 3 4 5
en:factory:de|1 5 2 3 4|1 5 2 3 4
de:fabrik:en|1 5 2 3 4|1 5 2 3 4
en:farm:de|1 2 3 4 5|1 2 3 4 5
de:bauernhof:en|1 2 3 4 5|1 2 3 4 5
en:bridge:de|0 1 2 3|1 1 2 3
de:brücke:en|1 1 2 3|0 1 2 3
en:place:de|1 2 3 5 4|1 2 3 5 4
de:ort:en|1 2 3 5 4|1 2 3 5 4
en:here:de|2 3 1|2 1 3
de:hier:en|2 1 3|2 3 1
en:near:de|0 1 2 3|1 1 2 3
de:nah:en|1 1 2 3|0 1 2 3
en:far:de|0 1 2 3|1 1 2 3
de:weit:en|1 1 2 3|0 1 2 3
en:behind:de|2 1 3 4 2 5|1 1 3 4 2 5
de:hinter:en|1 1 3 4 2 5|2 1 3 4 2 5
en:next to:de|3 1 4 2 2 3 5|1 1 4 2 3 5
de:neben:en|1 1 4 2 3 5|3 1 4 2 2 3 5
en:between:de|2 1 3 4 5 6 7 2 8|1 1 3 4 2 6 7 5 8
de:zwischen:en|1 1 3 4 2 6 7 5 8|2 1 3 4 5 6 7 2 8
en:inside:de|0 1 2 3|1 1 2 3
de:drinnen:en|1 1 2 3|0 1 2 3
en:outside:de|1 2 3 4|1 2 3 4
de:draußen:en|1 2 3 4|1 2 3 4
en:north:de|0 1 2 3 0 4|1 1 2 3 4
de:norden:en|1 1 2 3 4|0 1 2 3 0 4
en:south:de|1 2 3 4 5|1 2 4 5 4 0 3
de:süden:en|1 2 4 5 4 0 3|1 2 3 4 5
en:car:de|1 2 3 5 4|1 2 3 5 4
de:auto:en|1 2 3 5 4|1 2 3 5 4
en:bus:de|1 2 3 4 5 6|1 2 3 4 5 6
de:bus:en|1 2 3 4 5 6|1 2 3 4 5 6
en:train:de|0 1 2 3|1 1 2 3
de:zug:en|1 1 2 3|0 1 2 3
en:motorcycle:de|1 2 3 4|1 2 3 4
de:motorrad:en|1 2 3 4|1 2 3 4
en:ship:de|0 1 2 3 4|1 1 2 3 4
de:schiff:en|1 1 2 3 4|0 1 2 3 4
en:station:de|0 1 2 3|1 1 2 3
de:bahnhof:en|1 1 2 3|0 1 2 3
en:airport:de|0 1 2 3 4 5|1 1 2 3 4 5
de:flughafen:en|1 1 2 3 4 5|0 1 2 3 4 5
en:ticket:de|1 2 3 4|1 2 3 4
de:fahrkarte:en|1 2 3 4|1 2 3 4
en:passport:de|1 2 3 4|1 2 3 4
de:reisepass:en|1 2 3 4|1 2 3 4
en:luggage:de|1 2 3 4|1 2 3 4
de:gepäck:en|1 2 3 4|1 2 3 4
en:map:de|1 2 3 4 5 5 6|1 2 3 4 5 6
de:karte:en|1 2 3 4 5 6|1 2 3 4 5 5 6
en:journey:de|0 1 3 2 4|1 1 3 2 4
de:fahrt:en|1 1 3 2 4|0 1 3 2 4
en:body:de|0 1 3 2|1 1 3 2
de:körper:en|1 1 3 2|0 1 3 2
en:head:de|1 2 3|1 2 3 3
de:kopf:en|1 2 3 3|1 2 3
en:hair:de|1 2 3 4|1 2 3 4
de:haare:en|1 2 3 4|1 2 3 4
en:face:de|1 2 3|1 2 3
de:gesicht:en|1 2 3|1 2 3
en:eye:de|1 2 3 5 4|1 2 3 5 4
de:auge:en|1 2 3 5 4|1 2 3 5 4
en:ear:de|1 2 3|1 2 3 3
de:ohr:en|1 2 3 3|1 2 3
en:nose:de|0 1 2 3 4 5|1 1 2 3 4 5
de:nase:en|1 1 2 3 4 5|0 1 2 3 4 5
en:mouth:de|3 1 2|3 1 2
de:mund:en|3 1 2|3 1 2
en:neck:de|1 2 3|1 2 3 3
de:hals:en|1 2 3 3|1 2 3
en:shoulder:de|1 2 3|1 2 3 3
de:schulter:en|1 2 3 3|1 2 3
en:hand:de|1 2 3 4|1 2 3 4
de:hand:en|1 2 3 4|1 2 3 4
en:back:de|1 2 3|1 2 3 3
de:rücken:en|1 2 3 3|1 2 3
en:stomach:de|1 2 3|1 2 3 3
de:bauch:en|1 2 3 3|1 2 3
en:leg:de|1 2 3|1 2 3 3
de:bein:en|1 2 3 3|1 2 3
en:knee:de|1 2 3|1 2 3 3
de:knie:en|1 2 3 3|1 2 3
en:foot:de|1 2 3 4|1 2 3 4
de:fuß:en|1 2 3 4|1 2 3 4
en:heart:de|1 2 3 4|1 2 3 4
de:herz:en|1 2 3 4|1 2 3 4
en:blood:de|1 2 3 4 5 6|1 2 3 4 5 6
de:blut:en|1 2 3 4 5 6|1 2 3 4 5 6
en:fever:de|0 1 2 0 3|1 1 2 3
de:fieber:en|1 1 2 3|0 1 2 0 3
en:flu:de|2 3 0 1|2 3 1 1
de:grippe:en|2 3 1 1|2 3 0 1
en:headache:de|1 2 0 3|1 2 3
de:kopfschmerzen:en|1 2 3|1 2 0 3
en:bone:de|0 1 2 3 4|1 1 2 3 4
de:knochen:en|1 1 2 3 4|0 1 2 3 4
en:health:de|1 2 3|1 2 3
de:gesundheit:en|1 2 3|1 2 3
en:hurt:de|1 2 3|1 2 3
de:wehtun:en|1 2 3|1 2 3
en:clothes:de|1 2 3 4|1 2 3 4
de:kleidung:en|1 2 3 4|1 2 3 4
en:shirt:de|1 4 2 5 3|1 4 2 5 3
de:hemd:en|1 4 2 5 3|1 4 2 5 3
en:dress:de|1 2 3 4 5|1 2 3 4 5
de:kleid:en|1 2 3 4 5|1 2 3 4 5
en:skirt:de|1 4 2 5 3|1 4 2 5 3
de:rock:en|1 4 2 5 3|1 4 2 5 3
en:trousers:de|1 2 3 4|1 2 0 3 4
de:hose:en|1 2 0 3 4|1 2 3 4
en:jacket:de|1 2 3|1 2 3
de:jacke:en|1 2 3|1 2 3
en:coat:de|1 2 3 4 5 6|1 2 3 4 5 6
de:mantel:en|1 2 3 4 5 6|1 2 3 4 5 6
en:sweater:de|1 2 3 5 4|1 2 3 5 4
de:pullover:en|1 2 3 5 4|1 2 3 5 4
en:shoe:de|1 2 3 4|1 0 3 4 2
de:schuh:en|1 0 3 4 2|1 2 3 4
en:sock:de|1 2 3 4|1 2 3 4
de:socke:en|1 2 3 4|1 2 3 4
en:hat:de|1 4 2 5 3|1 4 2 5 3
de:hut:en|1 4 2 5 3|1 4 2 5 3
en:bag:de|1 2 3 4|1 2 3 4
de:tasche:en|1 2 3 4|1 2 3 4
en:glasses:de|1 2 3 4|1 2 3 4
de:brille:en|1 2 3 4|1 2 3 4
en:ring:de|1 4 2 5 3|1 4 2 5 3
de:ring:en|1 4 2 5 3|1 4 2 5 3
en:red:de|0 1 2 3|1 1 2 3
de:rot:en|1 1 2 3|0 1 2 3
en:blue:de|0 1 2 3|1 1 2 3
de:blau:en|1 1 2 3|0 1 2 3
en:green:de|0 1 2 3|1 1 2 3
de:grün:en|1 1 2 3|0 1 2 3
en:yellow:de|0 1 2 3|1 1 2 3
de:gelb:en|1 1 2 3|0 1 2 3
en:black:de|1 2 3 5 4|1 2 3 5 4
de:schwarz:en|1 2 3 5 4|1 2 3 5 4
en:white:de|0 1 2 3|1 1 2 3
de:weiß:en|1 1 2 3|0 1 2 3
en:brown:de|0 1 2 3|1 1 2 3
de:braun:en|1 1 2 3|0 1 2 3
en:gray:de|0 1 2 3 4|1 1 2 4 3
de:grau:en|1 1 2 4 3|0 1 2 3 4
en:pink:de|1 2 3 4 5|1 2 3 4 5
de:rosa:en|1 2 3 4 5|1 2 3 4 5
en:purple:de|1 5 2 3 4|1 5 2 3 4
de:lila:en|1 5 2 3 4|1 5 2 3 4
en:sun:de|0 1 2 3|1 1 2 3
de:sonne:en|1 1 2 3|0 1 2 3
en:star:de|1 2 3 4|1 2 3 4
de:stern:en|1 2 3 4|1 2 3 4
en:sky:de|0 1 2 3|1 1 2 3
de:himmel:en|1 1 2 3|0 1 2 3
en:snow:de|0 1 2 3|1 1 2 3
de:schnee:en|1 1 2 3|0 1 2 3
en:wind:de|0 1 2 3|1 1 2 3
de:wind:en|1 1 2 3|0 1 2 3
en:weather:de|0 1 2 3 4|1 1 2 4 3
de:wetter:en|1 1 2 4 3|0 1 2 3 4
en:fire:de|0 1 2 3|1 1 2 3
de:feuer:en|1 1 2 3|0 1 2 3
en:river:de|0 1 2 3|1 1 2 3
de:fluss:en|1 1 2 3|0 1 2 3
en:lake:de|1 2 3 0 4|1 2 3 4
de:see:en|1 2 3 4|1 2 3 0 4
en:mountain:de|0 1 2 3|1 1 2 3
de:berg:en|1 1 2 3|0 1 2 3
en:tree:de|0 1 2 3|1 1 2 3
de:baum:en|1 1 2 3|0 1 2 3
en:flower:de|1 4 2 3|1 4 2 3
de:blume:en|1 4 2 3|1 4 2 3
en:grass:de|0 1 2 3|1 1 2 3
de:gras:en|1 1 2 3|0 1 2 3
en:leaf:de|0 1 2 3|1 1 2 3
de:blatt:en|1 1 2 3|0 1 2 3
en:stone:de|0 1 2 3|1 1 2 3
de:stein:en|1 1 2 3|0 1 2 3
en:sand:de|0 1 2 3|1 1 2 3
de:sand:en|1 1 2 3|0 1 2 3
en:animal:de|1 2 0 3 4|1 2 4 3
de:tier:en|1 2 4 3|1 2 0 3 4
en:dog:de|1 2 3 4|1 2 3 4
de:hund:en|1 2 3 4|1 2 3 4
en:cat:de|2 1 5 3 2 4|1 1 5 3 2 4
de:katze:en|1 1 5 3 2 4|2 1 5 3 2 4
en:bird:de|1 2 6 3 4 5|1 2 6 3 4 5
de:vogel:en|1 2 6 3 4 5|1 2 6 3 4 5
en:horse:de|0 1 3 2|1 1 3 2
de:pferd:en|1 1 3 2|0 1 3 2
en:cow:de|0 1 3 2|1 1 3 2
de:kuh:en|1 1 3 2|0 1 3 2
en:pig:de|2 1 3 4 2 5|1 1 3 4 2 5
de:schwein:en|1 1 3 4 2 5|2 1 3 4 2 5
en:sheep:de|0 1 3 2|1 1 3 2
de:schaf:en|1 1 3 2|0 1 3 2
en:mouse:de|0 1 4 2 3|1 1 4 2 3
de:maus:en|1 1 4 2 3|0 1 4 2 3
en:rabbit:de|0 1 4 2 3|1 1 4 2 3
de:kaninchen:en|1 1 4 2 3|0 1 4 2 3
en:elephant:de|0 1 2 3 4|1 1 2 3 4
de:elefant:en|1 1 2 3 4|0 1 2 3 4
en:monkey:de|0 1 2 3|1 1 2 3
de:affe:en|1 1 2 3|0 1 2 3
en:door:de|2 3 0 1|2 3 1 1
de:tür:en|2 3 1 1|2 3 0 1
en:window:de|3 0 1 2|3 2 1 1
de:fenster:en|3 2 1 1|3 0 1 2
en:wall:de|0 1 2 3|1 1 2 3
de:wand:en|1 1 2 3|0 1 2 3
en:floor:de|0 1 2 3|1 1 2 3
de:boden:en|1 1 2 3|0 1 2 3
en:roof:de|0 1 2 3|1 1 2 3
de:dach:en|1 1 2 3|0 1 2 3
en:chair:de|1 2 3 4|1 2 3 4
de:stuhl:en|1 2 3 4|1 2 3 4
en:sofa:de|2 1 5 3 2 4|1 1 5 3 2 4
de:sofa:en|1 1 5 3 2 4|2 1 5 3 2 4
en:lamp:de|2 3 0 1|2 1 1 3
de:lampe:en|2 1 1 3|2 3 0 1
en:key:de|1 2 3 4|1 0 3 4 2
de:schlüssel:en|1 0 3 4 2|1 2 3 4
en:phone:de|1 2 3 4|1 2 3 4
de:handy:en|1 2 3 4|1 2 3 4
en:computer:de|1 6 2 3 4 5|1 6 4 0 5 2 3
de:computer:en|1 6 4 0 5 2 3|1 6 2 3 4 5
en:book:de|1 2 3 4 5|1 2 3 4 5
de:buch:en|1 2 3 4 5|1 2 3 4 5
en:newspaper:de|2 3 0 1|2 3 1 1
de:zeitung:en|2 3 1 1|2 3 0 1
en:letter:de|1 4 2 3|1 4 2 3
de:brief:en|1 4 2 3|1 4 2 3
en:picture:de|0 1 2 3|1 1 2 3
de:bild:en|1 1 2 3|0 1 2 3
en:towel:de|1 2 3 5 4|1 2 3 5 4
de:handtuch:en|1 2 3 5 4|1 2 3 5 4
en:soap:de|4 1 2 3|4 1 2 3
de:seife:en|4 1 2 3|4 1 2 3
en:toilet:de|2 3 0 1|2 3 1 1
de:toilette:en|2 3 1 1|2 3 0 1
en:box:de|0 1 2 3|1 1 2 3
de:kiste:en|1 1 2 3|0 1 2 3
en:thing:de|1 2 3 4|1 2 3 4
de:ding:en|1 2 3 4|1 2 3 4
en:money:de|1 2 3|1 2 3
de:geld:en|1 2 3|1 2 3
en:price:de|2 3 0 1|2 3 1 1
de:preis:en|2 3 1 1|2 3 0 1
en:card:de|1 2 3 4 5|1 2 4 5 3
en:coin:de|1 2 3 4|1 2 3 4
de:münze:en|1 2 3 4|1 2 3 4
en:euro:de|1 2 3 4|1 2 3 4
de:euro:en|1 2 3 4|1 2 3 4
en:discount:de|1 2 3 4|1 2 3 4
de:rabatt:en|1 2 3 4|1 2 3 4
en:shopping:de|1 2 3 4 5|1 2 4 5 3
de:einkaufen:en|1 2 4 5 3|1 2 3 4 5
en:customer:de|0 1 0 2|1 1 2
de:kunde:en|1 1 2|0 1 0 2
en:gift:de|1 2 3 4 5 6 7|1 2 3 4 5 6 7
de:geschenk:en|1 2 3 4 5 6 7|1 2 3 4 5 6 7
en:wallet:de|1 2 3 4|1 0 3 4 2
de:geldbeutel:en|1 0 3 4 2|1 2 3 4
en:job:de|1 2 3 4 5|1 2 3 4 5
de:arbeitsstelle:en|1 2 3 4 5|1 2 3 4 5
en:colleague:de|1 2 4 3|1 2 4 3
de:kollege:en|1 2 4 3|1 2 4 3
en:company:de|1 6 2 3 4 5|1 6 2 3 4 5
de:firma:en|1 6 2 3 4 5|1 6 2 3 4 5
en:salary:de|0 1 2 3|1 1 2 3
de:gehalt:en|1 1 2 3|0 1 2 3
en:class:de|0 1 2 3|1 1 2 3
de:klasse:en|1 1 2 3|0 1 2 3
en:lesson:de|0 1 2 3|1 1 2 3
de:unterrichtsstunde:en|1 1 2 3|0 1 2 3
en:homework:de|1 2 3 4|1 2 3 4
de:hausaufgabe:en|1 2 3 4|1 2 3 4
en:exam:de|1 2 3 4 5|1 2 5 3 4
de:prüfung:en|1 2 5 3 4|1 2 3 4 5
en:question:de|1 2 3 4|1 2 3 4
de:frage:en|1 2 3 4|1 2 3 4
en:word:de|1 2 3 4 5|1 2 3 4 5
de:wort:en|1 2 3 4 5|1 2 3 4 5
en:sentence:de|3 1 2|3 1 2
de:satz:en|3 1 2|3 1 2
en:language:de|1 2 3 5 4|1 2 3 5 4
de:sprache:en|1 2 3 5 4|1 2 3 5 4
en:pen:de|1 2 3 4|1 2 3 4
de:stift:en|1 2 3 4|1 2 3 4
en:notebook:de|1 5 2 3 4|1 5 2 3 4
de:heft:en|1 5 2 3 4|1 5 2 3 4
en:email:de|1 4 2 3|1 4 2 3
de:e-mail:en|1 4 2 3|1 4 2 3
en:project:de|0 1 2 3|1 1 2 3
de:projekt:en|1 1 2 3|0 1 2 3
en:task:de|1 2 3 4|1 2 3 4
de:aufgabe:en|1 2 3 4|1 2 3 4
en:problem:de|1 2 3 4|1 2 3 4
de:problem:en|1 2 3 4|1 2 3 4
en:idea:de|1 2 3 4 5|1 2 3 4 5
de:idee:en|1 2 3 4 5|1 2 3 4 5
en:and:de|1 2 3|1 2 3
de:und:en|1 2 3|1 2 3
en:or:de|1 2 3|1 2 3
de:oder:en|1 2 3|1 2 3
en:but:de|1 1 1 2 3|1 1 1 2 3
de:aber:en|1 1 1 2 3|1 1 1 2 3
en:because:de|1 7 2 3 4 5 6|1 7 0 2 3 4 6 5
de:weil:en|1 7 0 2 3 4 6 5|1 7 2 3 4 5 6
en:if:de|1 2 3 4 6 5|1 2 1 3 4 5 6
de:wenn:en|1 2 1 3 4 5 6|1 2 3 4 6 5
en:so:de|2 3 4 5 6 1 1|2 3 4 5 3 6 1 1
de:also:en|2 3 4 5 3 6 1 1|2 3 4 5 6 1 1
en:with:de|1 2 3 4 5|1 2 3 4 5
de:mit:en|1 2 3 4 5|1 2 3 4 5
en:without:de|1 2 3 4 5|1 2 3 4 5
de:ohne:en|1 2 3 4 5|1 2 3 4 5
en:for:de|1 2 3 4 5|1 2 3 4 5
de:für:en|1 2 3 4 5|1 2 3 4 5
en:to:de|1 2 3 4|1 2 3 4
de:zu:en|1 2 3 4|1 2 3 4
en:at:de|1 2 3 0 4|1 2 3 4
de:an:en|1 2 3 4|1 2 3 0 4
en:in:de|2 1 3 4 2 5|1 1 3 4 2 5
de:in:en|1 1 3 4 2 5|2 1 3 4 2 5
en:under:de|2 1 3 4 2 5|1 1 3 4 2 5
de:unter:en|1 1 3 4 2 5|2 1 3 4 2 5
en:about:de|2 3 4 0 1|2 3 4 1 1
de:über:en|2 3 4 1 1|2 3 4 0 1
en:after:de|1 2 3 4|1 2 3 0 4
de:nach:en|1 2 3 0 4|1 2 3 4
en:before:de|1 2 3 6 4 5|1 2 3 6 4 0 5
en:then:de|4 1 2 3|4 1 2 3
de:dann:en|4 1 2 3|4 1 2 3
en:again:de|1 4 2 3|4 2 1 3 3
de:wieder:en|4 2 1 3 3|1 4 2 3
en:also:de|1 2 3 4|1 3 2 4
de:auch:en|1 3 2 4|1 2 3 4
en:very:de|0 1 2 3 4|1 1 2 3 4
de:sehr:en|1 1 2 3 4|0 1 2 3 4
en:too:de|0 1 2 3 4|1 1 2 3 4
en:just:de|1 2 3 4 5|1 2 3 4 5
de:gerade:en|1 2 3 4 5|1 2 3 4 5
en:not:de|1 2 3 4|1 2 3 4
de:nicht:en|1 2 3 4|1 2 3 4
en:i do not know:de|1 0 2 3|1 3 2
de:ich weiß nicht:en|1 3 2|1 0 2 3
en:i understand:de|1 1|1 1
de:ich verstehe:en|1 1|1 1
en:i do not understand:de|1 0 2 3|1 3 2
de:ich verstehe nicht:en|1 3 2|1 0 2 3
en:say it again:de|1 4 2 3|1 4 2 3 3
de:sag es noch einmal:en|1 4 2 3 3|1 4 2 3
en:speak slowly:de|2 1 1|2 1 1
de:sprich langsam:en|2 1 1|2 1 1
en:where is the toilet:de|2 3 0 1|2 3 1 1
de:wo ist die toilette:en|2 3 1 1|2 3 0 1
en:my name is:de|1 1 1 2|1 1 2
de:ich heiße:en|1 1 2|1 1 1 2
en:i am hungry:de|1 1 1|1 1 1
de:ich habe hunger:en|1 1 1|1 1 1
en:i am thirsty:de|1 1 1|1 1 1
de:ich habe durst:en|1 1 1|1 1 1
en:i am tired:de|1 1 1|1 1 1
de:ich bin müde:en|1 1 1|1 1 1
en:i need help:de|1 1 1|1 1 1
de:ich brauche hilfe:en|1 1 1|1 1 1
en:can you help me:de|1 2 3 4|1 2 4 3
de:kannst du mir helfen:en|1 2 4 3|1 2 3 4
en:i would like:de|1 1 1 2 3|1 1 2 3
de:ich möchte:en|1 1 2 3|1 1 1 2 3
en:the bill please:de|1 1 1|1 1 1
de:die rechnung bitte:en|1 1 1|1 1 1
en:no worries:de|1 1|1 1
de:keine sorge:en|1 1|1 1
en:i love you:de|1 1 1|1 1 1
de:ich liebe dich:en|1 1 1|1 1 1
en:how is the weather:de|2 3 0 1 4|2 3 1 1 4
de:wie ist das wetter:en|2 3 1 1 4|2 3 0 1 4
en:welcome home:de|1 1|1 1 1
de:willkommen zu hause:en|1 1 1|1 1
en:cheers:de|1 2 3|1 2 3
de:prost:en|1 2 3|1 2 3
en:bless you:de|1 1|1
`;
