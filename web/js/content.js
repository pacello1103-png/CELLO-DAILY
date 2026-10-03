/* ============================================================
   CANTABILE · content
   Piece data + exercise library for "Le Cygne" (Saint-Saëns)
   Every text is {en, de, pt}.
   Exercises are original, written on principles found in
   Feuillard, Starker, Ševčík/Feuillard op. 2, Cossmann, Flesch/Boettcher,
   Hirzel, Dotzauer and CelloMind (impulse practice).
   ============================================================ */

const PIECE = {
  id: 'swan',
  title: { en: 'The Swan', de: 'Der Schwan', pt: 'O Cisne' },
  original: 'Le Cygne',
  composer: 'Camille Saint-Saëns',
  from: { en: 'from The Carnival of the Animals (1886)', de: 'aus Der Karneval der Tiere (1886)', pt: 'de O Carnaval dos Animais (1886)' },
  key: { en: 'G major', de: 'G-Dur', pt: 'Sol maior' },
  time: '6/4',
  tempoMark: 'Adagio',
  tempo: 54,          // quarter-note beats per minute, performance target
  bars: 28,
  edition: { en: 'Notes from the Durand & Schœnewerk edition (Paris, public domain).', de: 'Noten nach der Ausgabe Durand & Schœnewerk (Paris, gemeinfrei).', pt: 'Notas segundo a edição Durand & Schœnewerk (Paris, domínio público).' },
  abc:
`X:1
M:6/4
L:1/8
K:G clef=tenor
z12|!p!(G2 F2 B,2) (E2 D2 G,2)|A,4- A,B, C4 z2|E,4 F,G, A,B,CDEF|B6- B z z2 z2|
(G2 F2 B,2) (E2 D2 G,2)|^A,4- A,B, ^C6|F,3 ^G,^A,B, ^CDEF^G^A|d6- d z z2 z2|
(d2 B2 G2) (E2 F2 G2)|D4- DE F4 z2|(c2 A2 =F2) (D2 E2 F2)|C4- CD E4 z2|
!crescendo(!(E2 A,2 B,2) C4 DE!crescendo)!|!diminuendo(!(F6 E4)!diminuendo)! z2|!crescendo(!(E2 A,2 B,2) ^C4 DE!crescendo)!|!diminuendo(!(=F6 ^F6)!diminuendo)!|
!p!(G2 F2 B,2) (E2 D2 G,2)|A,4- A,B, C4 z2|E,4 F,G, A,B,CDEF|!crescendo(!B12!crescendo)!|
(B2 A2 E2) (G2 F2 C2)|!diminuendo(!(E2 D2 G,2) (A,2 B,2 G,2)!diminuendo)!|!marcato!B,6 "_dim."(C2 D2 B,2)|"^rit."E6 "^Lento"(E2 F2 D2)|
"^a tempo"!pp!G12-|G6- G z z2 z2|!fermata!z12|]`,
  // Harmony of the piano part, one chord per half bar (3 beats).
  // [bass-line eighths x6], [right-hand sixteenth figure x4]  (MIDI numbers)
  chords: null, // filled below
  sections: [
    { id: 'A',  bars: [1, 5],  name: { en: 'A · the swan appears', de: 'A · der Schwan erscheint', pt: 'A · o cisne aparece' } },
    { id: 'A2', bars: [6, 9],  name: { en: "A' · the climb to B minor", de: "A' · Aufstieg nach h-Moll", pt: "A' · subida para si menor" } },
    { id: 'B',  bars: [10, 17], name: { en: 'B · the light changes', de: 'B · das Licht wechselt', pt: 'B · a luz muda' } },
    { id: 'A3', bars: [18, 21], name: { en: "A'' · return and high point", de: "A'' · Rückkehr und Höhepunkt", pt: "A'' · regresso e ponto alto" } },
    { id: 'C',  bars: [22, 28], name: { en: 'Coda · letting go', de: 'Coda · loslassen', pt: 'Coda · deixar ir' } }
  ]
};

/* Harmony map, read from the piano part of the Durand edition.
   Chord names per half bar; voicings defined in VOICINGS. */
const HARMONY = [
  /* 1*/['G', 'G'], /* 2*/['G', 'G'], /* 3*/['F#m7b5', 'F#m7b5'], /* 4*/['Am7', 'D7'],
  /* 5*/['G', 'G'], /* 6*/['G', 'G'], /* 7*/['F#7', 'F#7'], /* 8*/['Bm', 'F#7'],
  /* 9*/['Bm', 'Bm'], /*10*/['G/B', 'C#dim7'], /*11*/['Am7', 'D7'], /*12*/['F/A', 'Bdim7'],
  /*13*/['C7/G', 'C'], /*14*/['Fmaj7', 'Am/E'], /*15*/['D7', 'Am/E'], /*16*/['Dm/F', 'A7/E'],
  /*17*/['Dm', 'D7'], /*18*/['G', 'G'], /*19*/['F#m7b5', 'F#m7b5'], /*20*/['Am7', 'D7'],
  /*21*/['G', 'E7'], /*22*/['Am', 'D7'], /*23*/['G/B', 'C'], /*24*/['G', 'G'],
  /*25*/['Em', 'D7'], /*26*/['Ghi', 'Ghi'], /*27*/['Ghi', 'Ghi'], /*28*/['end', 'rest']
];
const VOICINGS = {
  'G':      { lh: [43, 50, 55, 50, 47, 50], rh: [59, 62, 71, 67] },
  'Ghi':    { lh: [55, 62, 67, 62, 59, 62], rh: [71, 74, 83, 79] },
  'F#m7b5': { lh: [42, 52, 57, 52, 48, 52], rh: [60, 64, 72, 69] },
  'Am7':    { lh: [40, 52, 57, 52, 45, 52], rh: [60, 64, 72, 69] },
  'Am':     { lh: [45, 52, 57, 52, 48, 52], rh: [60, 64, 72, 69] },
  'D7':     { lh: [38, 45, 50, 45, 42, 45], rh: [60, 66, 72, 69] },
  'F#7':    { lh: [42, 52, 58, 52, 46, 52], rh: [61, 64, 70, 66] },
  'Bm':     { lh: [47, 54, 59, 54, 50, 54], rh: [59, 62, 71, 66] },
  'G/B':    { lh: [47, 50, 55, 50, 47, 50], rh: [62, 67, 71, 67] },
  'C#dim7': { lh: [46, 52, 58, 52, 49, 52], rh: [61, 64, 70, 67] },
  'F/A':    { lh: [45, 53, 57, 53, 45, 53], rh: [60, 65, 72, 69] },
  'Bdim7':  { lh: [44, 53, 56, 53, 47, 53], rh: [59, 62, 71, 65] },
  'C7/G':   { lh: [43, 48, 55, 48, 43, 48], rh: [58, 64, 72, 67] },
  'C':      { lh: [36, 43, 48, 43, 36, 43], rh: [60, 64, 72, 67] },
  'Fmaj7':  { lh: [41, 45, 53, 45, 41, 45], rh: [57, 60, 69, 64] },
  'Am/E':   { lh: [40, 45, 52, 45, 40, 45], rh: [57, 60, 69, 64] },
  'Dm/F':   { lh: [41, 45, 50, 45, 41, 45], rh: [57, 62, 69, 65] },
  'A7/E':   { lh: [40, 45, 49, 45, 40, 45], rh: [57, 61, 67, 64] },
  'Dm':     { lh: [38, 45, 50, 45, 38, 45], rh: [57, 62, 69, 65] },
  'E7':     { lh: [40, 47, 56, 47, 40, 47], rh: [56, 62, 71, 68] },
  'Em':     { lh: [40, 47, 52, 47, 40, 47], rh: [59, 64, 71, 67] },
  'end':    { lh: [43], rh: [59, 62, 67] },
  'rest':   { lh: [], rh: [] }
};

/* Difficult spots of the piece */
const SPOTS = [
  { id: 'open', bars: [2, 6, 18], color: 1,
    name: { en: 'Opening slurs', de: 'Eröffnungsbögen', pt: 'Ligaduras iniciais' },
    what: { en: 'Three beats in one bow, crossing a fifth from the A to the D string. Even bow, no bump at the crossing.', de: 'Drei Schläge auf einen Bogen mit Quintwechsel von A- zur D-Saite. Gleichmäßiger Bogen, kein Knick beim Saitenwechsel.', pt: 'Três tempos num só arco, com passagem de quinta da corda Lá para a Ré. Arco igual, sem solavanco na mudança.' } },
  { id: 'cadence', bars: [3, 11, 13, 19], color: 2,
    name: { en: 'Phrase endings', de: 'Phrasenenden', pt: 'Finais de frase' },
    what: { en: 'A tied note, two eighths, a half note. Easy to rush the eighths and to bump the last note.', de: 'Haltebogen, zwei Achtel, eine Halbe. Leicht eilt man bei den Achteln und betont die letzte Note.', pt: 'Nota ligada, duas colcheias, uma mínima. É fácil apressar as colcheias e acentuar a última nota.' } },
  { id: 'run', bars: [4, 20], color: 3,
    name: { en: 'The rising run', de: 'Der aufsteigende Lauf', pt: 'A escala ascendente' },
    what: { en: 'Eight eighths from E to F♯ with shifts and a string crossing, arriving on the high B.', de: 'Acht Achtel von E bis Fis mit Lagenwechseln und Saitenwechsel, Ankunft auf dem hohen H.', pt: 'Oito colcheias de Mi a Fá♯ com mudanças de posição e de corda, chegando ao Si agudo.' } },
  { id: 'long', bars: [5, 9, 21, 26, 27], color: 4,
    name: { en: 'Long high notes', de: 'Lange hohe Töne', pt: 'Notas longas agudas' },
    what: { en: 'Notes of 3 to 9½ beats. They must stay alive: bow plan, vibrato, and in bar 21 a crescendo.', de: 'Töne von 3 bis 9½ Schlägen. Sie müssen leben: Bogeneinteilung, Vibrato, in Takt 21 ein Crescendo.', pt: 'Notas de 3 a 9½ tempos. Têm de viver: plano de arco, vibrato e, no c. 21, um crescendo.' } },
  { id: 'climb', bars: [7, 8], color: 5,
    name: { en: 'The chromatic climb', de: 'Der chromatische Aufstieg', pt: 'A subida cromática' },
    what: { en: 'Sharps everywhere: A♯, C♯, G♯. Bar 8 is the B melodic minor scale from F♯, then a leap from A♯ to D.', de: 'Überall Kreuze: Ais, Cis, Gis. Takt 8 ist melodisch h-Moll ab Fis, dann ein Sprung von Ais nach D.', pt: 'Sustenidos por todo o lado: Lá♯, Dó♯, Sol♯. O c. 8 é si menor melódica a partir de Fá♯, depois um salto de Lá♯ a Ré.' } },
  { id: 'arch', bars: [10, 12], color: 6,
    name: { en: 'Falling arpeggios', de: 'Fallende Dreiklänge', pt: 'Arpejos descendentes' },
    what: { en: 'D–B–G and C–A–F♮ high on the A string: shifts downward inside a slur, then the colour of F natural.', de: 'D–H–G und C–A–F hoch auf der A-Saite: Lagenwechsel abwärts im Bogen, dann die Farbe von F.', pt: 'Ré–Si–Sol e Dó–Lá–Fá♮ no agudo da corda Lá: mudanças descendentes na ligadura e a cor do Fá natural.' } },
  { id: 'color', bars: [14, 15, 16, 17], color: 7,
    name: { en: 'Hairpins and the half step', de: 'Gabeln und der Halbton', pt: 'Reguladores e o meio-tom' },
    what: { en: 'Two growing waves (bars 14–17). Bar 17: F♮ becomes F♯ on the same finger, from shadow to light.', de: 'Zwei wachsende Wellen (T. 14–17). Takt 17: F wird Fis auf demselben Finger, vom Schatten ins Licht.', pt: 'Duas ondas a crescer (c. 14–17). C. 17: Fá♮ passa a Fá♯ no mesmo dedo, da sombra para a luz.' } },
  { id: 'coda', bars: [22, 23, 24, 25], color: 8,
    name: { en: 'Coda: sighs and slowing', de: 'Coda: Seufzer und Verlangsamung', pt: 'Coda: suspiros e ralentar' },
    what: { en: 'Falling three-note sighs with diminuendo, an accent, rit., Lento, then the last pianissimo G.', de: 'Fallende Dreitonseufzer im Diminuendo, ein Akzent, rit., Lento, dann das letzte Pianissimo-G.', pt: 'Suspiros descendentes de três notas em diminuendo, um acento, rit., Lento e o último Sol pianíssimo.' } }
];

const PHASES = {
  warmup: { en: 'Warm-up', de: 'Einspielen', pt: 'Aquecimento' },
  scales: { en: 'Scales & keys', de: 'Tonleitern & Tonarten', pt: 'Escalas & tonalidades' },
  spots:  { en: 'Difficult spots', de: 'Schwierige Stellen', pt: 'Passagens difíceis' },
  music:  { en: 'Music & creativity', de: 'Musik & Kreativität', pt: 'Música & criatividade' }
};

const TAGS = {
  bow: { en: 'Bow', de: 'Bogen', pt: 'Arco' },
  left: { en: 'Left hand', de: 'Linke Hand', pt: 'Mão esquerda' },
  tone: { en: 'Sound', de: 'Klang', pt: 'Som' },
  intonation: { en: 'Intonation', de: 'Intonation', pt: 'Afinação' },
  shift: { en: 'Shifting', de: 'Lagenwechsel', pt: 'Mudança de posição' },
  vibrato: { en: 'Vibrato', de: 'Vibrato', pt: 'Vibrato' },
  rhythm: { en: 'Rhythm', de: 'Rhythmus', pt: 'Ritmo' },
  musical: { en: 'Musicality', de: 'Musikalität', pt: 'Musicalidade' },
  creative: { en: 'Creativity', de: 'Kreativität', pt: 'Criatividade' }
};

/* ------------------------------------------------------------------
   EXERCISES
   phase, min (minutes), tags, spot?, prio (0-3), always? (for builder)
   tools: metro {bpm,target,step,beats,sub,dir}, drone {notes},
          tuner {targets}, timer {sec}, play {from,to,guide,water,loop},
          fing (fingering field), note (reflection field)
   ------------------------------------------------------------------ */
const EXERCISES = [

/* ======================= WARM-UP ======================= */
{ id: 'w-tune', phase: 'warmup', min: 2, prio: 3, always: true, tags: ['intonation'],
  source: '',
  title: { en: 'Tune with the green light', de: 'Stimmen mit grünem Licht', pt: 'Afinar com a luz verde' },
  why: { en: 'Clean open strings are the reference for every note of the piece and for every fifth you play across strings.', de: 'Reine leere Saiten sind die Referenz für jeden Ton im Stück und für jede Quinte über zwei Saiten.', pt: 'Cordas soltas afinadas são a referência para cada nota da peça e para cada quinta entre duas cordas.' },
  steps: [
    { en: 'Start with A. Play a long, light bow and turn the peg or fine tuner until the ring fills green.', de: 'Beginne mit A. Lange, leichte Bogenstriche, drehe Wirbel oder Feinstimmer, bis sich der Ring grün füllt.', pt: 'Começa pelo Lá. Arco longo e leve; roda a cravelha ou o afinador fino até o anel ficar verde.' },
    { en: 'Then D, G and C. Hold each string steady for the full green time.', de: 'Dann D, G und C. Halte jede Saite ruhig, bis die grüne Zeit voll ist.', pt: 'Depois Ré, Sol e Dó. Mantém cada corda estável durante todo o tempo verde.' },
    { en: 'Check by ear: play D and A together. A pure fifth sounds still, with no beating.', de: 'Kontrolle mit dem Ohr: D und A zusammen. Eine reine Quinte klingt ruhig, ohne Schwebung.', pt: 'Confirma de ouvido: Ré e Lá juntas. Uma quinta pura soa parada, sem batimentos.' }
  ],
  tools: { tuner: { targets: ['A3', 'D3', 'G2', 'C2'] } } },

{ id: 'w-airbow', phase: 'warmup', min: 3, prio: 3, always: true, tags: ['bow'],
  source: '',
  title: { en: 'Air bow: the right arm without the cello', de: 'Luftbogen: der rechte Arm ohne Cello', pt: 'Arco no ar: o braço direito sem violoncelo' },
  why: { en: 'The Swan is one long line. A loose, balanced bow hand makes invisible bow changes possible.', de: 'Der Schwan ist eine einzige lange Linie. Eine lockere, ausbalancierte Bogenhand macht unhörbare Bogenwechsel möglich.', pt: 'O Cisne é uma só linha longa. Uma mão de arco solta e equilibrada torna possíveis mudanças de arco invisíveis.' },
  steps: [
    { en: 'Shoulders: roll back three times, then let both arms hang heavy for a breath.', de: 'Schultern dreimal nach hinten kreisen, dann beide Arme einen Atemzug lang schwer hängen lassen.', pt: 'Ombros: roda três vezes para trás e deixa os braços pesados durante uma respiração.' },
    { en: 'Rocket: bow vertical, tip up. Move it slowly up and down with the whole arm. The hold stays soft.', de: 'Rakete: Bogen senkrecht, Spitze oben. Langsam mit dem ganzen Arm auf und ab. Die Haltung bleibt weich.', pt: 'Foguete: arco vertical, ponta para cima. Sobe e desce devagar com o braço todo. A pega fica macia.' },
    { en: 'Finger crawl: walk the fingers up the stick to the middle and back down to the frog.', de: 'Fingerkrabbeln: mit den Fingern die Stange bis zur Mitte hinauf und zurück zum Frosch wandern.', pt: 'Aranha: os dedos caminham pela vara até ao meio e voltam ao talão.' },
    { en: 'Air strokes: bow horizontal, play slow whole bows in the air, 4 beats down, 4 up. Fingers bend at the frog and stretch at the tip, like a brush.', de: 'Luftstriche: Bogen waagrecht, langsame ganze Bögen in der Luft, 4 Schläge ab, 4 auf. Finger am Frosch gebeugt, an der Spitze gestreckt, wie ein Pinsel.', pt: 'Arcos no ar: arco horizontal, arcos inteiros lentos, 4 tempos para baixo, 4 para cima. Dedos dobrados no talão e esticados na ponta, como um pincel.' },
    { en: 'Pinky push-ups at the frog: lift the tip slightly with a light little finger, then release.', de: 'Kleinfinger-Liegestütze am Frosch: die Spitze mit leichtem kleinen Finger anheben, dann lösen.', pt: 'Flexões do mindinho no talão: levanta ligeiramente a ponta com o mindinho leve e solta.' }
  ],
  tools: { metro: { bpm: 60, target: 60, step: 0, beats: 4, sub: 1 } } },

{ id: 'w-open', phase: 'warmup', min: 3, prio: 3, tags: ['bow', 'tone'],
  source: 'Hirzel, Ševčík op. 2',
  title: { en: 'Open strings: one long, even sound', de: 'Leere Saiten: ein langer, gleichmäßiger Ton', pt: 'Cordas soltas: um som longo e igual' },
  why: { en: 'The Swan needs long bows with the same sound at the frog, the middle and the tip. This exercise gets slower, not faster.', de: 'Der Schwan braucht lange Bögen mit gleichem Klang am Frosch, in der Mitte und an der Spitze. Diese Übung wird langsamer, nicht schneller.', pt: 'O Cisne precisa de arcos longos com o mesmo som no talão, no meio e na ponta. Este exercício fica mais lento, não mais rápido.' },
  steps: [
    { en: 'Whole bows on each string, 4 beats down and 4 up. Divide the bow into 4 equal parts, one per beat.', de: 'Ganze Bögen auf jeder Saite, 4 Schläge ab, 4 auf. Teile den Bogen in 4 gleiche Teile, einen pro Schlag.', pt: 'Arcos inteiros em cada corda, 4 tempos para baixo e 4 para cima. Divide o arco em 4 partes iguais, uma por tempo.' },
    { en: 'Stay on one sounding point, halfway between bridge and fingerboard. Keep the bow parallel to the bridge.', de: 'Bleibe an einer Kontaktstelle, zwischen Steg und Griffbrett. Der Bogen bleibt parallel zum Steg.', pt: 'Fica num só ponto de contacto, entre o cavalete e a escala. O arco fica paralelo ao cavalete.' },
    { en: 'Towards the tip, let the forearm roll in a little so weight goes into the index finger (pronation).', de: 'Zur Spitze hin rollt der Unterarm leicht nach innen, so geht Gewicht in den Zeigefinger (Pronation).', pt: 'Em direção à ponta, o antebraço roda ligeiramente para dentro e o peso passa para o indicador (pronação).' },
    { en: 'Each round, make the metronome slower. Can you keep the same sound with less bow speed?', de: 'Stelle das Metronom jede Runde langsamer. Bleibt der Klang gleich bei weniger Bogengeschwindigkeit?', pt: 'Em cada volta, abranda o metrónomo. Consegues manter o som com menos velocidade de arco?' }
  ],
  check: { en: 'Same volume at the start, middle and end of every bow.', de: 'Gleiche Lautstärke am Anfang, in der Mitte und am Ende jedes Bogens.', pt: 'O mesmo volume no início, no meio e no fim de cada arco.' },
  abc: `X:1\nM:4/4\nL:1/4\nK:C clef=bass\n!downbow!A,4|!upbow!A,4|!downbow!D,4|!upbow!D,4|!downbow!G,,4|!upbow!G,,4|!downbow!C,,4|!upbow!C,,4|]`,
  tools: { metro: { bpm: 60, target: 46, step: 4, beats: 4, sub: 1, dir: 'down' } } },

{ id: 'w-messa', phase: 'warmup', min: 3, prio: 2, tags: ['bow', 'tone'],
  source: 'Messa di voce',
  title: { en: 'Messa di voce: crescendo and diminuendo', de: 'Messa di voce: Crescendo und Diminuendo', pt: 'Messa di voce: crescendo e diminuendo' },
  why: { en: 'Bars 14–17 and the long B in bar 21 grow and fade on one bow. You control volume with three tools: bow speed, weight and sounding point.', de: 'Takt 14–17 und das lange H in Takt 21 wachsen und vergehen auf einem Bogen. Lautstärke steuerst du mit drei Mitteln: Bogengeschwindigkeit, Gewicht und Kontaktstelle.', pt: 'Os c. 14–17 e o Si longo do c. 21 crescem e diminuem num só arco. Controlas o volume com três meios: velocidade, peso e ponto de contacto.' },
  steps: [
    { en: 'One down bow over 8 beats on the D string: pp → f → pp. Peak on beat 5.', de: 'Ein Abstrich über 8 Schläge auf der D-Saite: pp → f → pp. Höhepunkt auf Schlag 5.', pt: 'Um arco para baixo em 8 tempos na corda Ré: pp → f → pp. Auge no tempo 5.' },
    { en: 'For the crescendo, add speed and weight and move slowly towards the bridge. Reverse everything for the diminuendo.', de: 'Fürs Crescendo: mehr Tempo und Gewicht, langsam Richtung Steg. Fürs Diminuendo alles umkehren.', pt: 'No crescendo, mais velocidade e peso, aproximando-te do cavalete. No diminuendo, inverte tudo.' },
    { en: 'Then the same on the up bow, and on the A string.', de: 'Dann dasselbe im Aufstrich und auf der A-Saite.', pt: 'Depois o mesmo no arco para cima e na corda Lá.' },
    { en: 'Last: crescendo only, over 6 beats, like the B in bar 21. Save bow at the beginning.', de: 'Zum Schluss nur Crescendo über 6 Schläge, wie das H in Takt 21. Spare Bogen am Anfang.', pt: 'Por fim, só crescendo em 6 tempos, como o Si do c. 21. Poupa arco no início.' }
  ],
  abc: `X:1\nM:4/4\nL:1/4\nK:C clef=bass\n!pp!!crescendo(!D,4|D,!crescendo)!!f!!diminuendo(!D,3|D,4!diminuendo)!!pp!|]`,
  tools: { metro: { bpm: 60, target: 52, step: 4, beats: 4, sub: 1, dir: 'down' } } },

{ id: 'w-cross', phase: 'warmup', min: 3, prio: 2, tags: ['bow'], spot: 'open',
  source: 'Ševčík op. 2',
  title: { en: 'Fifths across the strings', de: 'Quinten über die Saiten', pt: 'Quintas entre cordas' },
  why: { en: 'The opening slur goes A string, A string, D string. Practising the crossing on open strings frees your ears for the bow.', de: 'Der erste Bogen geht A-Saite, A-Saite, D-Saite. Auf leeren Saiten geübt, hast du die Ohren frei für den Bogen.', pt: 'A primeira ligadura vai corda Lá, Lá, Ré. Treinar a passagem em cordas soltas deixa o ouvido livre para o arco.' },
  steps: [
    { en: 'Play the pattern in slurs of three, one third of the bow per beat.', de: 'Spiele das Muster in Dreierbindungen, ein Drittel Bogen pro Schlag.', pt: 'Toca o padrão em ligaduras de três, um terço de arco por tempo.' },
    { en: 'Change strings with the arm level, early and round, as if rolling over the double stop A–D.', de: 'Saitenwechsel mit der Armebene, früh und rund, als ob du über den Doppelgriff A–D rollst.', pt: 'Muda de corda com o nível do braço, cedo e de forma redonda, como se rolasses sobre a dupla corda Lá–Ré.' },
    { en: 'Keep the bow speed exactly the same on both strings. The D string needs a little more weight.', de: 'Bogengeschwindigkeit auf beiden Saiten genau gleich. Die D-Saite braucht etwas mehr Gewicht.', pt: 'Mantém exatamente a mesma velocidade nas duas cordas. A corda Ré precisa de um pouco mais de peso.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=bass\n(A,2 A,2 D,2) (A,2 A,2 D,2)|(A,2 D,2 D,2) (A,2 D,2 D,2)|(A,2 A,2 D,2) (A,2 A,2 D,2)|[D,A,]12|]`,
  tools: { metro: { bpm: 54, target: 66, step: 4, beats: 6, sub: 1 } } },

{ id: 'w-fingers', phase: 'warmup', min: 3, prio: 2, tags: ['left'],
  source: 'Cossmann, Starker',
  title: { en: 'Finger hammers in 4th position', de: 'Fingerhämmerchen in der 4. Lage', pt: 'Martelos de dedos na 4.ª posição' },
  why: { en: 'Most of The Swan lives in 4th position on the A and D strings. Light, quick fingers give clear notes without squeezing.', de: 'Der größte Teil des Schwans liegt in der 4. Lage auf A- und D-Saite. Leichte, schnelle Finger geben klare Töne ohne Drücken.', pt: 'Grande parte do Cisne está na 4.ª posição nas cordas Lá e Ré. Dedos leves e rápidos dão notas claras sem apertar.' },
  steps: [
    { en: '4th position on the A string: 1st finger on E. Keep it down the whole time.', de: '4. Lage auf der A-Saite: 1. Finger auf E. Er bleibt die ganze Zeit liegen.', pt: '4.ª posição na corda Lá: 1.º dedo no Mi. Mantém-no sempre pousado.' },
    { en: 'Drop and lift the 3rd and 4th fingers from the base knuckle. Fall like a small hammer, release at once.', de: '3. und 4. Finger aus dem Grundgelenk fallen lassen und heben. Fallen wie ein Hämmerchen, sofort lösen.', pt: 'Deixa cair e levanta o 3.º e o 4.º dedos a partir da articulação da base. Cai como um martelo pequeno e solta logo.' },
    { en: 'Thumb soft behind the 2nd finger. No squeezing.', de: 'Daumen weich hinter dem 2. Finger. Nicht drücken.', pt: 'Polegar macio atrás do 2.º dedo. Sem apertar.' },
    { en: 'Same on the D string (1st finger on A). Then faster: eighths, then sixteenths.', de: 'Dasselbe auf der D-Saite (1. Finger auf A). Dann schneller: Achtel, dann Sechzehntel.', pt: 'O mesmo na corda Ré (1.º dedo no Lá). Depois mais rápido: colcheias e semicolcheias.' }
  ],
  abc: `X:1\nM:4/4\nL:1/8\nK:G clef=tenor\n!1!E!3!F E!4!G E!3!F E!4!G|E!3!F E!4!G E F G F|!1!A,!3!B, A,!4!C A,B, A,C|A,B, CB, A,4|]`,
  tools: { metro: { bpm: 60, target: 84, step: 6, beats: 4, sub: 2 } } },

{ id: 'w-vibrato', phase: 'warmup', min: 4, prio: 3, tags: ['left', 'vibrato', 'tone'],
  source: 'Hirzel, vol. III',
  title: { en: 'Vibrato in rhythm', de: 'Vibrato im Rhythmus', pt: 'Vibrato em ritmo' },
  why: { en: 'Every long note in The Swan needs a vibrato that starts at once and lasts to the end. Counting the motion makes it even and controllable.', de: 'Jeder lange Ton im Schwan braucht ein Vibrato, das sofort beginnt und bis zum Ende trägt. Gezählte Bewegung macht es gleichmäßig und steuerbar.', pt: 'Cada nota longa do Cisne precisa de um vibrato que começa logo e dura até ao fim. Contar o movimento torna-o regular e controlável.' },
  steps: [
    { en: '4th position, 2nd finger. Shoulder relaxed, elbow hanging. The fingertip sits flat but firm and carries the weight of the arm.', de: '4. Lage, 2. Finger. Schulter entspannt, Ellbogen hängt. Die Fingerkuppe sitzt flach, aber bestimmt und trägt das Armgewicht.', pt: '4.ª posição, 2.º dedo. Ombro relaxado, cotovelo pendente. A ponta do dedo assenta plana mas firme e leva o peso do braço.' },
    { en: 'Without bow: rock the forearm so the fingertip rolls a little below the note and back. The finger joint stays springy.', de: 'Ohne Bogen: den Unterarm schwingen, die Kuppe rollt etwas unter den Ton und zurück. Das Fingergelenk bleibt federnd.', pt: 'Sem arco: balança o antebraço para que a ponta role um pouco abaixo da nota e volte. A articulação fica elástica.' },
    { en: 'With the metronome: 2 motions per beat, then 3, then 4. Then let it go free, no longer counted.', de: 'Mit Metronom: 2 Bewegungen pro Schlag, dann 3, dann 4. Dann frei schwingen lassen, nicht mehr gezählt.', pt: 'Com metrónomo: 2 movimentos por tempo, depois 3, depois 4. Depois deixa-o livre, sem contar.' },
    { en: 'Repeat with fingers 1, 3 and 4. The other fingers stay close, the hand moves as one.', de: 'Wiederhole mit den Fingern 1, 3 und 4. Die anderen Finger bleiben nah, die Hand schwingt als Ganzes.', pt: 'Repete com os dedos 1, 3 e 4. Os outros dedos ficam perto, a mão move-se como um todo.' },
    { en: 'With the bow: long notes, vibrato from the first moment to the last.', de: 'Mit Bogen: lange Töne, Vibrato vom ersten bis zum letzten Moment.', pt: 'Com arco: notas longas, vibrato do primeiro ao último instante.' }
  ],
  check: { en: 'The pitch goes below the note and back, never above.', de: 'Die Tonhöhe geht unter den Ton und zurück, nie darüber.', pt: 'A altura vai abaixo da nota e volta, nunca acima.' },
  tools: { metro: { bpm: 60, target: 72, step: 4, beats: 4, sub: 2 } } },

{ id: 'w-shift', phase: 'warmup', min: 3, prio: 2, tags: ['left', 'shift'],
  source: 'Hirzel vol. II, Starker',
  title: { en: 'Sirens and guide notes', de: 'Sirenen und Leittöne', pt: 'Sirenes e notas-guia' },
  why: { en: 'The Swan moves between 1st, 4th and higher positions. A relaxed arm and a known distance make shifts calm.', de: 'Der Schwan wechselt zwischen 1., 4. und höheren Lagen. Ein lockerer Arm und eine bekannte Distanz machen Wechsel ruhig.', pt: 'O Cisne move-se entre a 1.ª, a 4.ª e posições mais altas. Braço solto e distância conhecida tornam as mudanças calmas.' },
  steps: [
    { en: 'Siren: slide the 1st finger lightly up and down the A string. Arm, hand and thumb travel together.', de: 'Sirene: den 1. Finger leicht auf der A-Saite auf und ab gleiten. Arm, Hand und Daumen reisen zusammen.', pt: 'Sirene: desliza o 1.º dedo levemente pela corda Lá acima e abaixo. Braço, mão e polegar viajam juntos.' },
    { en: 'Shift 1st finger B → E (1st to 4th position). Let the slide be heard softly, then play the arrival note.', de: 'Lagenwechsel 1. Finger H → E (1. in 4. Lage). Das Gleiten leise hörbar lassen, dann die Zielnote spielen.', pt: 'Muda o 1.º dedo de Si → Mi (1.ª para 4.ª posição). Deixa ouvir o deslize suavemente e toca a nota de chegada.' },
    { en: 'Lighten the finger during the slide. The bow slows down a little, then continues.', de: 'Den Finger beim Gleiten erleichtern. Der Bogen wird kurz etwas langsamer, dann geht er weiter.', pt: 'Alivia o dedo durante o deslize. O arco abranda um pouco e depois continua.' },
    { en: 'Use the tuner: each arrival must turn green on the first try.', de: 'Nutze das Stimmgerät: Jede Ankunft soll beim ersten Versuch grün werden.', pt: 'Usa o afinador: cada chegada deve ficar verde à primeira.' }
  ],
  abc: `X:1\nM:4/4\nL:1/4\nK:G clef=tenor\n!1!B,2 (!1!B,!1!E)|!1!E2 (!1!E!1!B,)|!3!^C2 (!3!^C!3!F)|!3!F2 (!3!F!3!^C)|]`,
  tools: { tuner: { targets: ['B3', 'E4', 'B3', 'E4'] } } },

/* ======================= SCALES ======================= */
{ id: 'sc-g', phase: 'scales', min: 4, prio: 3, always: true, tags: ['intonation', 'bow', 'tone'],
  source: 'Feuillard, Flesch/Boettcher',
  title: { en: 'G major with the swan\'s breath', de: 'G-Dur mit dem Atem des Schwans', pt: 'Sol maior com a respiração do cisne' },
  why: { en: 'G major is the home key. Played in slurs of three, the scale trains the exact bow division of the opening.', de: 'G-Dur ist die Grundtonart. In Dreierbindungen gespielt, übt die Tonleiter genau die Bogeneinteilung des Anfangs.', pt: 'Sol maior é a tonalidade principal. Em ligaduras de três, a escala treina a divisão de arco exata do início.' },
  steps: [
    { en: 'Turn on the drone (G and D). Play slowly and listen to B and F♯: F♯ leans close to G.', de: 'Bordun an (G und D). Langsam spielen und auf H und Fis hören: Fis strebt nah zum G.', pt: 'Liga o bordão (Sol e Ré). Toca devagar e ouve o Si e o Fá♯: o Fá♯ inclina-se para o Sol.' },
    { en: 'Three notes per bow, equal thirds of the bow, like the opening slurs.', de: 'Drei Töne pro Bogen, gleiche Drittel, wie die Eröffnungsbögen.', pt: 'Três notas por arco, terços iguais, como as ligaduras do início.' },
    { en: 'Last time: crescendo going up, diminuendo coming down. This is the shape of a phrase.', de: 'Letztes Mal: Crescendo aufwärts, Diminuendo abwärts. Das ist die Form einer Phrase.', pt: 'Última vez: crescendo a subir, diminuendo a descer. É a forma de uma frase.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=bass\n(G,,2A,,2B,,2) (C,2D,2E,2)|(F,2G,2A,2) (B,2[K:clef=tenor]C2D2)|(E2F2G2) (F2E2D2)|(C2B,2A,2) (G,2F,2E,2)|[K:clef=bass](D,2C,2B,,2) A,,2 G,,4|]`,
  tools: { metro: { bpm: 60, target: 76, step: 4, beats: 6, sub: 1 }, drone: { notes: ['G2', 'D3'] } } },

{ id: 'sc-garp', phase: 'scales', min: 3, prio: 2, tags: ['intonation', 'shift'], spot: 'arch',
  source: 'Feuillard, Ševčík',
  title: { en: 'G major arpeggio up to the high D', de: 'G-Dur-Dreiklang bis zum hohen D', pt: 'Arpejo de Sol maior até ao Ré agudo' },
  why: { en: 'B4 and D5 are the peaks of bars 5, 9 and 10. Knowing them as chord notes makes them easy to find.', de: 'H4 und D5 sind die Gipfel der Takte 5, 9 und 10. Als Akkordtöne findest du sie leichter.', pt: 'Si4 e Ré5 são os picos dos c. 5, 9 e 10. Conhecê-los como notas do acorde torna-os fáceis de encontrar.' },
  steps: [
    { en: 'Slurs of three, very slow, with the G drone.', de: 'Dreierbindungen, sehr langsam, mit G-Bordun.', pt: 'Ligaduras de três, muito devagar, com bordão de Sol.' },
    { en: 'Stop on each top note. Check it with the tuner, then add vibrato.', de: 'Halte auf jeder Spitzennote. Prüfe sie mit dem Stimmgerät, dann Vibrato dazu.', pt: 'Para em cada nota de cima. Verifica com o afinador e acrescenta vibrato.' },
    { en: 'Feel the hand frame: the shape of the chord stays the same, only the arm travels.', de: 'Spüre den Handrahmen: Die Akkordform bleibt, nur der Arm reist.', pt: 'Sente a moldura da mão: a forma do acorde mantém-se, só o braço viaja.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n(G,2B,2D2) (G2B2d2)|(B2G2D2) B,2 G,4|]`,
  tools: { metro: { bpm: 54, target: 72, step: 4, beats: 6, sub: 1 }, drone: { notes: ['G2', 'D3'] }, tuner: { targets: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'] } } },

{ id: 'sc-bmm', phase: 'scales', min: 4, prio: 2, tags: ['intonation', 'left'], spot: 'climb',
  source: 'Feuillard, Flesch/Boettcher',
  title: { en: 'B melodic minor: the scale hidden in bar 8', de: 'h-Moll melodisch: die Tonleiter in Takt 8', pt: 'Si menor melódica: a escala escondida no c. 8' },
  why: { en: 'The climb in bar 8 is B melodic minor starting on F♯. Learn the scale and the passage is already in your fingers.', de: 'Der Aufstieg in Takt 8 ist melodisch h-Moll ab Fis. Lerne die Tonleiter, und die Stelle liegt schon in den Fingern.', pt: 'A subida do c. 8 é si menor melódica a começar em Fá♯. Aprende a escala e a passagem já está nos dedos.' },
  steps: [
    { en: 'Drone on B. Going up: G♯ and A♯ are bright and high, close to the next note.', de: 'Bordun auf H. Aufwärts: Gis und Ais hell und hoch, nah am nächsten Ton.', pt: 'Bordão em Si. A subir: Sol♯ e Lá♯ brilhantes e altos, perto da nota seguinte.' },
    { en: 'Coming down: G and A natural. Feel the colour change from light to dark.', de: 'Abwärts: G und A. Spüre den Farbwechsel von hell zu dunkel.', pt: 'A descer: Sol e Lá naturais. Sente a mudança de cor, do claro para o escuro.' },
    { en: 'Then play only the bar-8 fragment, from F♯ up to A♯ and the D above.', de: 'Dann nur das Fragment aus Takt 8, von Fis bis Ais und zum D darüber.', pt: 'Depois toca só o fragmento do c. 8, de Fá♯ até Lá♯ e o Ré acima.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:Bm clef=bass\nB,,2C,2D,2 E,2F,2^G,2|^A,2B,2[K:Bm clef=tenor]C2 D2E2F2|^G2^A2B2 =A2=G2F2|E2D2C2 B,2=A,2=G,2|[K:Bm clef=bass]F,2E,2D,2 C,2 B,,4|]`,
  tools: { metro: { bpm: 54, target: 72, step: 4, beats: 6, sub: 1 }, drone: { notes: ['B2', 'F#3'] }, tuner: { targets: ['F#3', 'G#3', 'A#3', 'B3', 'C#4', 'D4', 'E4', 'F#4', 'G#4', 'A#4', 'D5'] } } },

{ id: 'sc-chrom', phase: 'scales', min: 3, prio: 1, tags: ['intonation', 'left'], spot: 'climb',
  source: 'Feuillard no. 14',
  title: { en: 'Half steps: small and exact', de: 'Halbtöne: klein und genau', pt: 'Meios-tons: pequenos e exatos' },
  why: { en: 'Bars 7, 8 and 17 live on half steps. On the cello they are smaller than the hand expects, especially high up.', de: 'Takte 7, 8 und 17 leben von Halbtönen. Auf dem Cello sind sie kleiner, als die Hand erwartet, besonders in der Höhe.', pt: 'Os c. 7, 8 e 17 vivem de meios-tons. No violoncelo são mais pequenos do que a mão espera, sobretudo no agudo.' },
  steps: [
    { en: 'Chromatic scale A to A on the A string, one note per beat.', de: 'Chromatische Tonleiter A bis A auf der A-Saite, ein Ton pro Schlag.', pt: 'Escala cromática de Lá a Lá na corda Lá, uma nota por tempo.' },
    { en: 'Fingers touch each other on half steps. Do not let the hand open.', de: 'Bei Halbtönen berühren sich die Finger. Die Hand nicht öffnen.', pt: 'Nos meios-tons, os dedos tocam-se. Não deixes a mão abrir.' },
    { en: 'Then the intonation trainer: the half-step pairs of the piece, each held green.', de: 'Dann der Intonationstrainer: die Halbtonpaare des Stücks, jedes grün gehalten.', pt: 'Depois o treinador de afinação: os pares de meio-tom da peça, cada um mantido verde.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:C clef=tenor\nA,2^A,2B,2 C2^C2D2|^D2E2F2 ^F2G2^G2|A12|]`,
  tools: { metro: { bpm: 60, target: 80, step: 4, beats: 6, sub: 1 }, tuner: { targets: ['A#3', 'B3', 'C#4', 'F4', 'F#4', 'G#4', 'A#4'] } } },

/* ======================= SPOTS ======================= */
/* --- open --- */
{ id: 'sp-open-fifth', phase: 'spots', spot: 'open', min: 4, prio: 3, tags: ['intonation', 'left'],
  source: 'Starker',
  title: { en: 'One finger across the fifth', de: 'Ein Finger über die Quinte', pt: 'Um dedo sobre a quinta' },
  why: { en: 'In bar 2, F♯ → B and D → G cross a fifth. If the finger lies across both strings, the crossing is in tune and silent.', de: 'In Takt 2 gehen Fis → H und D → G über eine Quinte. Liegt der Finger über beiden Saiten, ist der Wechsel sauber und lautlos.', pt: 'No c. 2, Fá♯ → Si e Ré → Sol atravessam uma quinta. Se o dedo estiver sobre as duas cordas, a passagem fica afinada e silenciosa.' },
  steps: [
    { en: 'Play F♯ and B together as a double stop. A pure fifth sounds still. Adjust the angle of the finger, not the hand.', de: 'Fis und H als Doppelgriff. Eine reine Quinte klingt ruhig. Korrigiere den Winkel des Fingers, nicht die Hand.', pt: 'Toca Fá♯ e Si juntos em dupla corda. A quinta pura soa parada. Ajusta o ângulo do dedo, não a mão.' },
    { en: 'Same for D and G.', de: 'Dasselbe für D und G.', pt: 'O mesmo para Ré e Sol.' },
    { en: 'Now play bar 2 as written. The finger is already there before you cross.', de: 'Jetzt Takt 2 wie notiert. Der Finger liegt schon, bevor du wechselst.', pt: 'Agora toca o c. 2 como está escrito. O dedo já está no sítio antes de mudares de corda.' },
    { en: 'Intonation trainer: hold each note green.', de: 'Intonationstrainer: jeden Ton grün halten.', pt: 'Treinador de afinação: mantém cada nota verde.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n[B,F]6 [G,D]6|!p!(G2 F2 B,2) (E2 D2 G,2)|]`,
  tools: { tuner: { targets: ['G4', 'F#4', 'B3', 'E4', 'D4', 'G3'] }, drone: { notes: ['G2'] }, fing: true } },

{ id: 'sp-open-bow', phase: 'spots', spot: 'open', min: 3, prio: 3, tags: ['bow'],
  source: 'Hirzel, vol. I',
  title: { en: 'Three beats, one breath', de: 'Drei Schläge, ein Atem', pt: 'Três tempos, uma respiração' },
  why: { en: 'Each slur lasts three slow beats. The third note must sound as alive as the first, and the change between slurs should be invisible.', de: 'Jeder Bogen dauert drei langsame Schläge. Der dritte Ton muss so lebendig sein wie der erste, der Wechsel zwischen den Bögen unsichtbar.', pt: 'Cada ligadura dura três tempos lentos. A terceira nota tem de soar tão viva como a primeira, e a mudança entre ligaduras deve ser invisível.' },
  steps: [
    { en: 'Open strings first, same strings as bar 2: A A D | A A D. One third of the bow per beat.', de: 'Zuerst leere Saiten, wie in Takt 2: A A D | A A D. Ein Drittel Bogen pro Schlag.', pt: 'Primeiro cordas soltas, como no c. 2: Lá Lá Ré | Lá Lá Ré. Um terço de arco por tempo.' },
    { en: 'Mark the thirds of your bow with small stickers if it helps.', de: 'Markiere die Drittel des Bogens mit kleinen Aufklebern, wenn es hilft.', pt: 'Marca os terços do arco com pequenos autocolantes, se ajudar.' },
    { en: 'Add the left hand. Bow change: slow down very slightly, fingers soft like a brush.', de: 'Linke Hand dazu. Bogenwechsel: minimal verlangsamen, Finger weich wie ein Pinsel.', pt: 'Junta a mão esquerda. Mudança de arco: abranda muito ligeiramente, dedos macios como um pincel.' },
    { en: 'Ask yourself: can a listener hear where the bow changes? The goal is no.', de: 'Frag dich: Hört man, wo der Bogen wechselt? Ziel: nein.', pt: 'Pergunta-te: ouve-se onde o arco muda? O objetivo é não.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n(A,2 A,2 D,2) (A,2 A,2 D,2)|!p!(G2 F2 B,2) (E2 D2 G,2)|]`,
  tools: { metro: { bpm: 48, target: 58, step: 2, beats: 6, sub: 1 } } },

/* --- cadence --- */
{ id: 'sp-cad-rhythm', phase: 'spots', spot: 'cadence', min: 3, prio: 2, tags: ['rhythm', 'bow'],
  source: '',
  title: { en: 'The tied note and the two eighths', de: 'Die Haltenote und die zwei Achtel', pt: 'A nota ligada e as duas colcheias' },
  why: { en: 'Bars 3, 11, 13 and 19 have the same rhythm. The eighths come on beat 3 and are easy to rush.', de: 'Takte 3, 11, 13 und 19 haben denselben Rhythmus. Die Achtel kommen auf Schlag 3 und eilen leicht.', pt: 'Os c. 3, 11, 13 e 19 têm o mesmo ritmo. As colcheias caem no tempo 3 e é fácil apressá-las.' },
  steps: [
    { en: 'Metronome with eighth clicks. Count aloud: "1 and 2 and 3 and…".', de: 'Metronom mit Achtelklicks. Laut zählen: „1 und 2 und 3 und…".', pt: 'Metrónomo com cliques de colcheia. Conta em voz alta: "1 e 2 e 3 e…".' },
    { en: 'Play the rhythm on an open string, then with the notes.', de: 'Den Rhythmus auf einer leeren Saite spielen, dann mit den Tönen.', pt: 'Toca o ritmo numa corda solta e depois com as notas.' },
    { en: 'The two eighths are light and unhurried. Save bow for the half note.', de: 'Die zwei Achtel leicht und ohne Eile. Spare Bogen für die Halbe.', pt: 'As duas colcheias leves e sem pressa. Poupa arco para a mínima.' },
    { en: 'Play all four endings: A–B–C, D–E–F♯, C–D–E, A–B–C. Same shape, other pitches.', de: 'Spiele alle vier Schlüsse: A–H–C, D–E–Fis, C–D–E, A–H–C. Gleiche Form, andere Töne.', pt: 'Toca os quatro finais: Lá–Si–Dó, Ré–Mi–Fá♯, Dó–Ré–Mi, Lá–Si–Dó. Mesma forma, outras notas.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n"^3"A,4- A,B, C4 z2|"^11"D4- DE F4 z2|"^13"C4- CD E4 z2|]`,
  tools: { metro: { bpm: 54, target: 54, step: 0, beats: 6, sub: 2 } } },

{ id: 'sp-cad-release', phase: 'spots', spot: 'cadence', min: 2, prio: 1, tags: ['bow', 'musical'],
  source: '',
  title: { en: 'End a phrase like breathing out', de: 'Eine Phrase enden wie Ausatmen', pt: 'Terminar a frase como quem expira' },
  why: { en: 'The half note at the end of each phrase is not a goal to hit. It is where the sound settles.', de: 'Die Halbe am Phrasenende ist kein Ziel zum Treffen. Dort setzt sich der Klang.', pt: 'A mínima no fim de cada frase não é um alvo a acertar. É onde o som assenta.' },
  steps: [
    { en: 'Play bar 2–3. On the last half note, slow the bow gradually and keep the vibrato going.', de: 'Spiele Takt 2–3. Auf der letzten Halben den Bogen allmählich verlangsamen, Vibrato weiterführen.', pt: 'Toca os c. 2–3. Na última mínima, abranda o arco aos poucos e mantém o vibrato.' },
    { en: 'At the end, leave the bow on the string for one beat, then lift and circle back.', de: 'Am Ende den Bogen einen Schlag lang auf der Saite lassen, dann abheben und zurückkreisen.', pt: 'No fim, deixa o arco na corda durante um tempo, depois levanta e volta em círculo.' },
    { en: 'Breathe in during the rest, ready for the next phrase.', de: 'In der Pause einatmen, bereit für die nächste Phrase.', pt: 'Inspira durante a pausa, pronto para a frase seguinte.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n!p!(G2 F2 B,2) (E2 D2 G,2)|A,4- A,B, !diminuendo(!C4!diminuendo)! z2|]`,
  tools: { play: { from: 1, to: 3, guide: true, water: true } } },

/* --- run --- */
{ id: 'sp-run-guide', phase: 'spots', spot: 'run', min: 4, prio: 3, tags: ['shift', 'left', 'intonation'],
  source: 'Starker',
  title: { en: 'The run in slow motion', de: 'Der Lauf in Zeitlupe', pt: 'A escala em câmara lenta' },
  why: { en: 'The run in bars 4 and 20 has shifts inside fast eighths. Slow motion shows where the arm must already be moving.', de: 'Der Lauf in Takt 4 und 20 hat Lagenwechsel in schnellen Achteln. Zeitlupe zeigt, wo der Arm schon unterwegs sein muss.', pt: 'A escala dos c. 4 e 20 tem mudanças de posição em colcheias rápidas. Em câmara lenta vês onde o braço já tem de estar em movimento.' },
  steps: [
    { en: 'Write your fingering below. Mark every shift.', de: 'Schreibe deinen Fingersatz unten auf. Markiere jeden Lagenwechsel.', pt: 'Escreve a tua dedilhação em baixo. Marca cada mudança de posição.' },
    { en: 'Play the run in quarter notes. Slide audibly on the old finger to the new position (guide note), then play the new note.', de: 'Spiele den Lauf in Vierteln. Gleite hörbar auf dem alten Finger in die neue Lage (Leitton), dann den neuen Ton.', pt: 'Toca a escala em semínimas. Desliza audivelmente no dedo antigo até à nova posição (nota-guia) e toca a nova nota.' },
    { en: 'Anticipated shift: the time for the shift comes from the end of the note before. The arm leaves a little early.', de: 'Vorweggenommener Wechsel: Die Zeit kommt vom Ende des Tons davor. Der Arm geht etwas früher los.', pt: 'Mudança antecipada: o tempo vem do fim da nota anterior. O braço parte um pouco mais cedo.' },
    { en: 'Make the slide lighter each round until it disappears, but keep the arm timing.', de: 'Mache das Gleiten jede Runde leichter, bis es verschwindet, aber behalte das Timing des Arms.', pt: 'Torna o deslize mais leve a cada volta até desaparecer, mas mantém o tempo do braço.' },
    { en: 'The arrival on B must be green on the tuner.', de: 'Die Ankunft auf H muss im Stimmgerät grün sein.', pt: 'A chegada ao Si tem de ficar verde no afinador.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\nE,4 F,G, A,B,CDEF|B6- B z z2 z2|]`,
  tools: { metro: { bpm: 40, target: 54, step: 2, beats: 6, sub: 2 }, tuner: { targets: ['F#4', 'B4'] }, fing: true } },

{ id: 'sp-run-rhythms', phase: 'spots', spot: 'run', min: 4, prio: 2, tags: ['rhythm', 'left', 'shift'],
  source: 'Ševčík op. 2, Feuillard',
  title: { en: 'The run in rhythms', de: 'Der Lauf in Rhythmen', pt: 'A escala em ritmos' },
  why: { en: 'Rhythm variations make every note once long and once short. Afterwards the even eighths feel easy and secure.', de: 'Rhythmusvarianten machen jeden Ton einmal lang und einmal kurz. Danach fühlen sich gleichmäßige Achtel leicht und sicher an.', pt: 'As variações rítmicas tornam cada nota uma vez longa e outra curta. Depois as colcheias iguais parecem fáceis e seguras.' },
  steps: [
    { en: 'Long–short (dotted): stop on every long note and prepare the next finger.', de: 'Lang–kurz (punktiert): auf jedem langen Ton anhalten und den nächsten Finger vorbereiten.', pt: 'Longa–curta (pontuado): para em cada nota longa e prepara o dedo seguinte.' },
    { en: 'Short–long: the short note is quick and light, the hand arrives early.', de: 'Kurz–lang: Der kurze Ton schnell und leicht, die Hand kommt früh an.', pt: 'Curta–longa: a nota curta é rápida e leve, a mão chega cedo.' },
    { en: 'Then even eighths again. Raise the tempo step by step, past the piece tempo.', de: 'Dann wieder gleichmäßige Achtel. Tempo schrittweise steigern, über das Stücktempo hinaus.', pt: 'Depois colcheias iguais outra vez. Sobe o andamento passo a passo, acima do andamento da peça.' }
  ],
  abc: `X:1\nM:6/4\nL:1/16\nK:G clef=tenor\nE,8 F,3G, A,3B, C3D E3F|E,8 F,G,3 A,B,3 CD3 EF3|B12- B4 z8|]`,
  tools: { metro: { bpm: 46, target: 66, step: 4, beats: 6, sub: 2 } } },

{ id: 'sp-run-impulse', phase: 'spots', spot: 'run', min: 3, prio: 2, tags: ['left', 'shift'],
  source: 'CelloMind (H. J. Jensen)',
  title: { en: 'Impulse groups', de: 'Impulsgruppen', pt: 'Grupos de impulso' },
  why: { en: 'Grouping the notes by hand position turns nine notes into three movements. The mind can hold three things easily.', de: 'Gruppiert nach Handlage werden aus neun Tönen drei Bewegungen. Drei Dinge kann der Kopf leicht halten.', pt: 'Agrupar as notas por posição da mão transforma nove notas em três movimentos. A cabeça guarda três coisas com facilidade.' },
  steps: [
    { en: 'Find the groups of your fingering, for example E–F♯–G | A–B–C | D–E–F♯.', de: 'Finde die Gruppen deines Fingersatzes, zum Beispiel E–Fis–G | A–H–C | D–E–Fis.', pt: 'Encontra os grupos da tua dedilhação, por exemplo Mi–Fá♯–Sol | Lá–Si–Dó | Ré–Mi–Fá♯.' },
    { en: 'Play each group fast as one gesture, small accent on the first note. Stop and release both arms.', de: 'Jede Gruppe schnell als eine Geste, kleiner Akzent auf dem ersten Ton. Anhalten, beide Arme lösen.', pt: 'Toca cada grupo rápido como um só gesto, pequeno acento na primeira nota. Para e solta os dois braços.' },
    { en: 'In the stop, shift silently to the next position and get ready.', de: 'Im Halt lautlos in die nächste Lage wechseln und bereit machen.', pt: 'Na paragem, muda em silêncio para a posição seguinte e prepara-te.' },
    { en: 'Shorten the stops until the run is one line.', de: 'Halte kürzer werden lassen, bis der Lauf eine Linie ist.', pt: 'Encurta as paragens até a escala ser uma só linha.' }
  ],
  abc: `X:1\nM:none\nL:1/16\nK:G clef=tenor\n!accent!E,F,G, z4 !accent!A,B,C z4 !accent!DEF z4 B8|]`,
  tools: { fing: true } },

/* --- long notes --- */
{ id: 'sp-long-bow', phase: 'spots', spot: 'long', min: 4, prio: 3, tags: ['bow', 'tone'],
  source: '',
  title: { en: 'Keep long notes alive', de: 'Lange Töne lebendig halten', pt: 'Manter vivas as notas longas' },
  why: { en: 'The B in bar 21 lasts 6 beats with a crescendo. The last G lasts 9½ beats in pianissimo: about 11 seconds at the piece tempo.', de: 'Das H in Takt 21 dauert 6 Schläge mit Crescendo. Das letzte G dauert 9½ Schläge im Pianissimo: etwa 11 Sekunden im Stücktempo.', pt: 'O Si do c. 21 dura 6 tempos com crescendo. O último Sol dura 9½ tempos em pianíssimo: cerca de 11 segundos no andamento da peça.' },
  steps: [
    { en: 'Open A string, pianissimo, one bow for the full timer. Sounding point near the fingerboard, little weight, very slow and steady.', de: 'Leere A-Saite, pianissimo, ein Bogen für die ganze Timerzeit. Kontaktstelle nahe am Griffbrett, wenig Gewicht, sehr langsam und gleichmäßig.', pt: 'Corda Lá solta, pianíssimo, um arco durante todo o temporizador. Ponto de contacto perto da escala, pouco peso, muito lento e estável.' },
    { en: 'Now the same on the G of bar 26 with a slow, narrow vibrato.', de: 'Jetzt dasselbe auf dem G aus Takt 26 mit langsamem, engem Vibrato.', pt: 'Agora o mesmo no Sol do c. 26, com vibrato lento e estreito.' },
    { en: 'Bar 21: start p with slow bow. Grow with speed, weight and sounding point. The vibrato grows too.', de: 'Takt 21: p mit langsamem Bogen beginnen. Wachsen mit Tempo, Gewicht und Kontaktstelle. Das Vibrato wächst mit.', pt: 'C. 21: começa p com arco lento. Cresce com velocidade, peso e ponto de contacto. O vibrato cresce também.' },
    { en: 'Plan where in the bow each long note starts. Write it on your part.', de: 'Plane, wo im Bogen jeder lange Ton beginnt. Schreib es in deine Stimme.', pt: 'Planeia em que parte do arco começa cada nota longa. Escreve-o na tua parte.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n"^21"!crescendo(!B12!crescendo)!|"^26"!pp!G12-|G6- G z z2 z2|]`,
  tools: { timer: { sec: 12 }, tuner: { targets: ['B4', 'G4'] } } },

{ id: 'sp-long-vib', phase: 'spots', spot: 'long', min: 3, prio: 2, tags: ['vibrato', 'tone', 'musical'],
  source: 'Hirzel, vol. III',
  title: { en: 'Vibrato colours on the high notes', de: 'Vibratofarben auf den hohen Tönen', pt: 'Cores de vibrato nas notas agudas' },
  why: { en: 'The long notes are the swan\'s voice. A vibrato that you can choose — narrow or wide, slow or fast — gives each one a colour.', de: 'Die langen Töne sind die Stimme des Schwans. Ein wählbares Vibrato – eng oder weit, langsam oder schnell – gibt jedem eine Farbe.', pt: 'As notas longas são a voz do cisne. Um vibrato que escolhes — estreito ou largo, lento ou rápido — dá a cada uma a sua cor.' },
  steps: [
    { en: 'On B (bar 5): 2 beats without vibrato, 2 narrow and slow, 2 wider.', de: 'Auf H (Takt 5): 2 Schläge ohne Vibrato, 2 eng und langsam, 2 weiter.', pt: 'No Si (c. 5): 2 tempos sem vibrato, 2 estreito e lento, 2 mais largo.' },
    { en: 'On D (bar 9): start the vibrato in the very first moment of the note.', de: 'Auf D (Takt 9): Vibrato schon im allerersten Moment des Tons.', pt: 'No Ré (c. 9): começa o vibrato no primeiro instante da nota.' },
    { en: 'The tuner reads the centre of your vibrato. Keep it green while you vibrate.', de: 'Das Stimmgerät liest die Mitte deines Vibratos. Halte es grün, während du vibrierst.', pt: 'O afinador lê o centro do teu vibrato. Mantém-no verde enquanto vibras.' },
    { en: 'Choose a colour for each long note and write a word for it: "silver", "warm", "far away"…', de: 'Wähle für jeden langen Ton eine Farbe und schreib ein Wort dazu: „silbern", „warm", „fern"…', pt: 'Escolhe uma cor para cada nota longa e escreve uma palavra: "prateado", "quente", "distante"…' }
  ],
  tools: { tuner: { targets: ['B4', 'D5', 'B4', 'G4'] }, metro: { bpm: 60, target: 60, step: 0, beats: 6, sub: 1 }, fing: true } },

/* --- climb --- */
{ id: 'sp-climb-7', phase: 'spots', spot: 'climb', min: 3, prio: 2, tags: ['intonation', 'musical'],
  source: '',
  title: { en: 'Bar 7: A♯ – B – C♯', de: 'Takt 7: Ais – H – Cis', pt: 'C. 7: Lá♯ – Si – Dó♯' },
  why: { en: 'The harmony turns to F♯ major. A♯ is its third: tuned slightly low it rings with the piano; tuned high it leads to B. You choose.', de: 'Die Harmonie wendet sich nach Fis-Dur. Ais ist ihre Terz: etwas tief klingt sie mit dem Klavier, hoch führt sie zum H. Du entscheidest.', pt: 'A harmonia vira para Fá♯ maior. Lá♯ é a terceira: um pouco baixa soa com o piano; alta conduz ao Si. Tu escolhes.' },
  steps: [
    { en: 'Drone on F♯. Play A♯ long: find the place where it rings and sounds calm.', de: 'Bordun auf Fis. Ais lang spielen: finde die Stelle, wo es klingt und ruhig wird.', pt: 'Bordão em Fá♯. Toca Lá♯ longo: encontra o ponto onde ressoa e acalma.' },
    { en: 'Now play A♯ → B a few times. Raise the A♯ a little so it pulls to B. Hear the difference.', de: 'Jetzt mehrmals Ais → H. Hebe das Ais etwas an, damit es zum H zieht. Höre den Unterschied.', pt: 'Agora toca várias vezes Lá♯ → Si. Sobe um pouco o Lá♯ para que puxe para o Si. Ouve a diferença.' },
    { en: 'Play bar 7 with the intonation trainer.', de: 'Takt 7 mit dem Intonationstrainer spielen.', pt: 'Toca o c. 7 com o treinador de afinação.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n^A,4- A,B, ^C6|]`,
  tools: { drone: { notes: ['F#2', 'C#3'] }, tuner: { targets: ['A#3', 'B3', 'C#4'] } } },

{ id: 'sp-climb-8', phase: 'spots', spot: 'climb', min: 4, prio: 3, tags: ['left', 'shift', 'rhythm'],
  source: 'Feuillard / CelloMind',
  title: { en: 'Bar 8: the climb in groups', de: 'Takt 8: der Aufstieg in Gruppen', pt: 'C. 8: a subida em grupos' },
  why: { en: 'Nine eighths with five sharps and several shifts. Grouping and rhythms make it secure before it becomes fast.', de: 'Neun Achtel mit fünf Kreuzen und mehreren Lagenwechseln. Gruppen und Rhythmen machen es sicher, bevor es schnell wird.', pt: 'Nove colcheias com cinco sustenidos e várias mudanças. Grupos e ritmos dão segurança antes da velocidade.' },
  steps: [
    { en: 'Play the B melodic minor scale first (Scales).', de: 'Zuerst die melodische h-Moll-Tonleiter (Tonleitern).', pt: 'Primeiro a escala de si menor melódica (Escalas).' },
    { en: 'Bar 8 in groups by position, with a stop after each group. Write your fingering below.', de: 'Takt 8 in Gruppen nach Lagen, mit Halt nach jeder Gruppe. Fingersatz unten notieren.', pt: 'C. 8 em grupos por posição, com paragem depois de cada grupo. Escreve a dedilhação em baixo.' },
    { en: 'Dotted rhythms, both ways.', de: 'Punktierte Rhythmen, in beide Richtungen.', pt: 'Ritmos pontuados, nos dois sentidos.' },
    { en: 'Even eighths, raising the tempo each round. Arrive on D without hurrying.', de: 'Gleichmäßige Achtel, Tempo jede Runde steigern. Auf D ankommen, ohne zu eilen.', pt: 'Colcheias iguais, a subir o andamento em cada volta. Chega ao Ré sem pressa.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\nF,3 ^G,^A,B, ^CDEF^G^A|d6- d z z2 z2|]`,
  tools: { metro: { bpm: 40, target: 56, step: 4, beats: 6, sub: 2 }, fing: true } },

{ id: 'sp-climb-leap', phase: 'spots', spot: 'climb', min: 3, prio: 2, tags: ['shift', 'intonation'],
  source: 'Hirzel, vol. III',
  title: { en: 'The leap A♯ → D', de: 'Der Sprung Ais → D', pt: 'O salto Lá♯ → Ré' },
  why: { en: 'From the top of the climb the line jumps a diminished fourth to the long D. Hear the D before you play it.', de: 'Vom Gipfel des Aufstiegs springt die Linie eine verminderte Quarte zum langen D. Höre das D, bevor du es spielst.', pt: 'Do topo da subida, a linha salta uma quarta diminuta até ao Ré longo. Ouve o Ré antes de o tocar.' },
  steps: [
    { en: 'Press "Play target" and sing the D.', de: 'Drücke „Zielton" und singe das D.', pt: 'Carrega em "Ouvir alvo" e canta o Ré.' },
    { en: 'Slide slowly from A♯ to D and listen to the whole distance.', de: 'Langsam von Ais nach D gleiten und die ganze Distanz hören.', pt: 'Desliza devagar de Lá♯ a Ré e ouve toda a distância.' },
    { en: 'Then a quick, light shift. Land softly, then vibrato.', de: 'Dann ein schneller, leichter Wechsel. Weich landen, dann Vibrato.', pt: 'Depois uma mudança rápida e leve. Aterra suavemente e só depois vibrato.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\nEF^G^A d4- d6|]`,
  tools: { tuner: { targets: ['A#4', 'D5', 'A#4', 'D5'] } } },

/* --- arch --- */
{ id: 'sp-arch-shape', phase: 'spots', spot: 'arch', min: 4, prio: 2, tags: ['shift', 'left', 'intonation'],
  source: 'Starker',
  title: { en: 'Falling arpeggios: D–B–G and C–A–F', de: 'Fallende Dreiklänge: D–H–G und C–A–F', pt: 'Arpejos descendentes: Ré–Si–Sol e Dó–Lá–Fá' },
  why: { en: 'Bars 10 and 12 fall through a chord inside one slur, high on the A string. The shifts go down while the sound must stay connected.', de: 'Takte 10 und 12 fallen in einem Bogen durch einen Akkord, hoch auf der A-Saite. Die Wechsel gehen abwärts, der Klang muss verbunden bleiben.', pt: 'Os c. 10 e 12 descem por um acorde numa só ligadura, no agudo da corda Lá. As mudanças descem e o som tem de ficar ligado.' },
  steps: [
    { en: 'Find each note alone first, with the tuner.', de: 'Finde zuerst jeden Ton einzeln, mit dem Stimmgerät.', pt: 'Encontra primeiro cada nota sozinha, com o afinador.' },
    { en: 'Slur them slowly. During the downward shift the arm releases, the finger stays light on the string.', de: 'Langsam binden. Beim Abwärtswechsel löst sich der Arm, der Finger bleibt leicht auf der Saite.', pt: 'Liga-as devagar. Na mudança descendente o braço solta-se e o dedo fica leve na corda.' },
    { en: 'The answer (E–F♯–G, D–E–F) grows towards its third note.', de: 'Die Antwort (E–Fis–G, D–E–F) wächst zum dritten Ton hin.', pt: 'A resposta (Mi–Fá♯–Sol, Ré–Mi–Fá) cresce em direção à terceira nota.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n"^10"(d2 B2 G2) (E2 F2 G2)|"^12"(c2 A2 =F2) (D2 E2 F2)|]`,
  tools: { tuner: { targets: ['D5', 'B4', 'G4', 'C5', 'A4', 'F4'] }, metro: { bpm: 44, target: 54, step: 2, beats: 6, sub: 1 }, fing: true } },

{ id: 'sp-arch-color', phase: 'spots', spot: 'arch', min: 3, prio: 1, tags: ['musical', 'tone', 'creative'],
  source: '',
  title: { en: 'F natural: a cloud passes', de: 'F statt Fis: eine Wolke zieht vorbei', pt: 'Fá natural: passa uma nuvem' },
  why: { en: 'Bar 12 repeats bar 10 one step lower, and F♯ becomes F natural. The light changes. Your sound can show it.', de: 'Takt 12 wiederholt Takt 10 einen Ton tiefer, und aus Fis wird F. Das Licht ändert sich. Dein Klang kann es zeigen.', pt: 'O c. 12 repete o c. 10 um tom abaixo, e o Fá♯ passa a Fá natural. A luz muda. O teu som pode mostrá-lo.' },
  steps: [
    { en: 'Play bar 10 with the G drone: bright, open.', de: 'Takt 10 mit G-Bordun: hell, offen.', pt: 'Toca o c. 10 com bordão de Sol: claro, aberto.' },
    { en: 'Switch the drone to F. Play bar 12: slower bow, more weight, a darker vibrato.', de: 'Bordun auf F wechseln. Takt 12: langsamerer Bogen, mehr Gewicht, dunkleres Vibrato.', pt: 'Muda o bordão para Fá. C. 12: arco mais lento, mais peso, vibrato mais escuro.' },
    { en: 'Invent your own image for the change and write it down.', de: 'Erfinde dein eigenes Bild für den Wechsel und schreib es auf.', pt: 'Inventa a tua imagem para esta mudança e escreve-a.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n(d2 B2 G2) (E2 F2 G2)|(c2 A2 =F2) (D2 E2 F2)|]`,
  tools: { drone: { notes: ['G2', 'D3'], alt: ['F2', 'C3'] }, fing: true } },

/* --- color --- */
{ id: 'sp-color-hairpin', phase: 'spots', spot: 'color', min: 3, prio: 2, tags: ['bow', 'musical'],
  source: 'Messa di voce',
  title: { en: 'Hairpins you can hear', de: 'Gabeln, die man hört', pt: 'Reguladores que se ouvem' },
  why: { en: 'Bars 14–15 and 16–17 are two waves, the second bigger. They prepare the return of the theme.', de: 'Takte 14–15 und 16–17 sind zwei Wellen, die zweite größer. Sie bereiten die Rückkehr des Themas vor.', pt: 'Os c. 14–15 e 16–17 são duas ondas, a segunda maior. Preparam o regresso do tema.' },
  steps: [
    { en: 'Plan the bow: start the crescendo with little bow, so there is bow left for the peak.', de: 'Plane den Bogen: Crescendo mit wenig Bogen beginnen, damit für den Höhepunkt Bogen bleibt.', pt: 'Planeia o arco: começa o crescendo com pouco arco para sobrar arco para o auge.' },
    { en: 'Peak on beat 1 of bar 15 and bar 17. Then let it fall back.', de: 'Höhepunkt auf Schlag 1 von Takt 15 und 17. Dann zurückfallen lassen.', pt: 'Auge no tempo 1 do c. 15 e do c. 17. Depois deixa cair.' },
    { en: 'Wave 1: p → mf. Wave 2: p → f. Make the difference clear.', de: 'Welle 1: p → mf. Welle 2: p → f. Den Unterschied deutlich machen.', pt: 'Onda 1: p → mf. Onda 2: p → f. Torna a diferença clara.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n!crescendo(!(E2 A,2 B,2) C4 DE!crescendo)!|!diminuendo(!(F6 E4)!diminuendo)! z2|!crescendo(!(E2 A,2 B,2) ^C4 DE!crescendo)!|!diminuendo(!(=F6 ^F6)!diminuendo)!|]`,
  tools: { play: { from: 14, to: 18, guide: true, water: true }, metro: { bpm: 54, target: 54, step: 0, beats: 6, sub: 1 } } },

{ id: 'sp-color-17', phase: 'spots', spot: 'color', min: 3, prio: 3, tags: ['intonation', 'musical', 'left'],
  source: 'Hirzel, vol. III',
  title: { en: 'Bar 17: from shadow to light', de: 'Takt 17: vom Schatten ins Licht', pt: 'C. 17: da sombra para a luz' },
  why: { en: 'Over a D in the bass, F natural is the minor third and F♯ the major third. One half step turns minor into major, just before the theme returns.', de: 'Über D im Bass ist F die kleine und Fis die große Terz. Ein Halbton macht aus Moll Dur, kurz bevor das Thema zurückkehrt.', pt: 'Sobre Ré no baixo, Fá natural é a terceira menor e Fá♯ a maior. Um meio-tom transforma menor em maior, logo antes do regresso do tema.' },
  steps: [
    { en: 'Drone on D. Play F, then F♯, long. Feel minor, then major.', de: 'Bordun auf D. Spiele F, dann Fis, lang. Spüre Moll, dann Dur.', pt: 'Bordão em Ré. Toca Fá e depois Fá♯, longos. Sente menor e depois maior.' },
    { en: 'Slide the same finger slowly, then quickly and cleanly in the slur.', de: 'Denselben Finger langsam gleiten lassen, dann schnell und sauber im Bogen.', pt: 'Desliza o mesmo dedo devagar e depois rápido e limpo na ligadura.' },
    { en: 'Intonation trainer: F → F♯, each held green.', de: 'Intonationstrainer: F → Fis, jeweils grün gehalten.', pt: 'Treinador de afinação: Fá → Fá♯, cada um mantido verde.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n!diminuendo(!(=F6 ^F6)!diminuendo)!|]`,
  tools: { drone: { notes: ['D3', 'A3'] }, tuner: { targets: ['F4', 'F#4', 'F4', 'F#4'] } } },

/* --- coda --- */
{ id: 'sp-coda-sighs', phase: 'spots', spot: 'coda', min: 3, prio: 2, tags: ['bow', 'musical'],
  source: '',
  title: { en: 'Falling sighs', de: 'Fallende Seufzer', pt: 'Suspiros descendentes' },
  why: { en: 'Bars 22–23 are four sighs, each a little softer. Weight goes into the first note of each slur and leaves through the next two.', de: 'Takte 22–23 sind vier Seufzer, jeder etwas leiser. Gewicht in den ersten Ton jedes Bogens, dann löst es sich über die nächsten zwei.', pt: 'Os c. 22–23 são quatro suspiros, cada um um pouco mais suave. O peso vai para a primeira nota de cada ligadura e sai pelas duas seguintes.' },
  steps: [
    { en: 'Play each slur alone: lean, then release.', de: 'Jeden Bogen einzeln: anlehnen, dann lösen.', pt: 'Toca cada ligadura sozinha: apoia e depois solta.' },
    { en: 'Use a little less bow for each group. That is your diminuendo.', de: 'Für jede Gruppe etwas weniger Bogen. Das ist dein Diminuendo.', pt: 'Usa um pouco menos de arco em cada grupo. É esse o teu diminuendo.' },
    { en: 'String crossings in bar 23 stay round and quiet.', de: 'Die Saitenwechsel in Takt 23 bleiben rund und leise.', pt: 'As mudanças de corda do c. 23 ficam redondas e silenciosas.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n(B2 A2 E2) (G2 F2 C2)|!diminuendo(!(E2 D2 G,2) (A,2 B,2 G,2)!diminuendo)!|]`,
  tools: { play: { from: 21, to: 24, guide: true, water: true }, tuner: { targets: ['B4', 'A4', 'E4', 'G4', 'F#4', 'C4'] } } },

{ id: 'sp-coda-time', phase: 'spots', spot: 'coda', min: 3, prio: 2, tags: ['musical', 'bow'],
  source: '',
  title: { en: 'Rit., Lento, a tempo', de: 'Rit., Lento, a tempo', pt: 'Rit., Lento, a tempo' },
  why: { en: 'In bars 24–26 you lead the time. The accent on B is weight and warmth, not a bang. The slowing must feel like breathing.', de: 'In Takt 24–26 führst du die Zeit. Der Akzent auf H ist Gewicht und Wärme, kein Schlag. Das Verlangsamen soll sich wie Atmen anfühlen.', pt: 'Nos c. 24–26 és tu quem conduz o tempo. O acento no Si é peso e calor, não um golpe. O ralentar deve parecer uma respiração.' },
  steps: [
    { en: 'Bar 24: sink into the B with the arm, then diminuendo.', de: 'Takt 24: mit dem Arm ins H sinken, dann Diminuendo.', pt: 'C. 24: afunda no Si com o braço e depois diminuendo.' },
    { en: 'Bar 25: no metronome. Breathe the rit. and the Lento, as if conducting.', de: 'Takt 25: ohne Metronom. Atme das rit. und das Lento, als ob du dirigierst.', pt: 'C. 25: sem metrónomo. Respira o rit. e o Lento, como se dirigisses.' },
    { en: 'Bar 26: a tempo, pianissimo, a long G. Use the timer and the tuner together.', de: 'Takt 26: a tempo, pianissimo, ein langes G. Timer und Stimmgerät zusammen benutzen.', pt: 'C. 26: a tempo, pianíssimo, um Sol longo. Usa o temporizador e o afinador em conjunto.' }
  ],
  abc: `X:1\nM:6/4\nL:1/8\nK:G clef=tenor\n!marcato!B,6 "_dim."(C2 D2 B,2)|"^rit."E6 "^Lento"(E2 F2 D2)|"^a tempo"!pp!G12-|G6- G z z2 z2|]`,
  tools: { play: { from: 23, to: 28, guide: true, water: true }, timer: { sec: 11 }, tuner: { targets: ['G4'] } } },

/* ======================= MUSIC & CREATIVITY ======================= */
{ id: 'mu-sing', phase: 'music', min: 3, prio: 2, tags: ['musical'],
  source: '',
  title: { en: 'Sing it, breathe it', de: 'Singen und atmen', pt: 'Cantar e respirar' },
  why: { en: 'If you can sing a phrase without breaks, you can play it without breaks. The voice finds the natural shape of the line.', de: 'Wenn du eine Phrase ohne Unterbrechung singen kannst, kannst du sie so spielen. Die Stimme findet die natürliche Form der Linie.', pt: 'Se consegues cantar uma frase sem quebras, consegues tocá-la sem quebras. A voz encontra a forma natural da linha.' },
  steps: [
    { en: 'Start the play-along. Sing or hum bars 2–5 with the piano.', de: 'Starte die Begleitung. Singe oder summe Takt 2–5 mit dem Klavier.', pt: 'Liga o acompanhamento. Canta ou trauteia os c. 2–5 com o piano.' },
    { en: 'Breathe where the swan lifts its head: in the rests.', de: 'Atme, wo der Schwan den Kopf hebt: in den Pausen.', pt: 'Respira onde o cisne levanta a cabeça: nas pausas.' },
    { en: 'Now play it. Keep the same breathing in the bow arm.', de: 'Jetzt spielen. Behalte dasselbe Atmen im Bogenarm.', pt: 'Agora toca. Mantém a mesma respiração no braço do arco.' }
  ],
  tools: { play: { from: 1, to: 5, guide: true, water: true } } },

{ id: 'mu-dancer', phase: 'music', min: 3, prio: 1, tags: ['bow', 'musical', 'creative'],
  source: 'Fokine / Pavlova, 1905',
  title: { en: 'Bow arm like a dancer', de: 'Bogenarm wie eine Tänzerin', pt: 'Braço do arco como uma bailarina' },
  why: { en: 'In 1905 Anna Pavlova danced this music as "The Dying Swan". Her arms move without corners. Your bow arm can do the same.', de: '1905 tanzte Anna Pavlova diese Musik als „Der sterbende Schwan". Ihre Arme bewegen sich ohne Ecken. Dein Bogenarm kann das auch.', pt: 'Em 1905, Anna Pavlova dançou esta música como "A Morte do Cisne". Os braços dela movem-se sem cantos. O teu braço do arco pode fazer o mesmo.' },
  steps: [
    { en: 'Watch a short film of the dance (link below), and look only at the arms.', de: 'Schau einen kurzen Film des Tanzes (Link unten) und achte nur auf die Arme.', pt: 'Vê um pequeno vídeo da dança (ligação em baixo) e observa só os braços.' },
    { en: 'Start the play-along. Bow in the air with the melody, slow and round, no corners at the changes.', de: 'Starte die Begleitung. Streiche in der Luft mit der Melodie, langsam und rund, ohne Ecken an den Wechseln.', pt: 'Liga o acompanhamento. Faz o arco no ar com a melodia, lento e redondo, sem cantos nas mudanças.' },
    { en: 'Then play the same bars on the cello with that memory in your arm.', de: 'Dann dieselben Takte auf dem Cello, mit dieser Erinnerung im Arm.', pt: 'Depois toca os mesmos compassos no violoncelo com essa memória no braço.' }
  ],
  link: { url: 'https://www.youtube.com/results?search_query=Pavlova+The+Dying+Swan', label: { en: 'Search: Pavlova, The Dying Swan', de: 'Suche: Pavlova, Der sterbende Schwan', pt: 'Pesquisar: Pavlova, A Morte do Cisne' } },
  tools: { play: { from: 1, to: 9, guide: true, water: true } } },

{ id: 'mu-characters', phase: 'music', min: 4, prio: 2, tags: ['musical', 'creative', 'tone'],
  source: '',
  title: { en: 'Three swans', de: 'Drei Schwäne', pt: 'Três cisnes' },
  why: { en: 'The same notes can tell very different stories. Choosing a character makes your decisions about bow, vibrato and time clear.', de: 'Dieselben Töne können ganz verschiedene Geschichten erzählen. Ein Charakter macht deine Entscheidungen über Bogen, Vibrato und Zeit klar.', pt: 'As mesmas notas podem contar histórias muito diferentes. Escolher uma personagem torna claras as decisões de arco, vibrato e tempo.' },
  steps: [
    { en: 'Play bars 2–9 as a young swan at sunrise: light bow, little vibrato, moving forward.', de: 'Spiele Takt 2–9 als junger Schwan bei Sonnenaufgang: leichter Bogen, wenig Vibrato, vorwärts.', pt: 'Toca os c. 2–9 como um cisne jovem ao nascer do sol: arco leve, pouco vibrato, a avançar.' },
    { en: 'Then as the dying swan: pianissimo, slow vibrato, time stretched.', de: 'Dann als sterbender Schwan: Pianissimo, langsames Vibrato, gedehnte Zeit.', pt: 'Depois como o cisne moribundo: pianíssimo, vibrato lento, tempo esticado.' },
    { en: 'Then as a proud swan: full sound, wide vibrato, noble.', de: 'Dann als stolzer Schwan: voller Klang, weites Vibrato, edel.', pt: 'Depois como um cisne orgulhoso: som cheio, vibrato largo, nobre.' },
    { en: 'Which one is yours? Write it down, with one word for each section.', de: 'Welcher ist deiner? Schreib es auf, mit einem Wort für jeden Teil.', pt: 'Qual é o teu? Escreve-o, com uma palavra para cada secção.' }
  ],
  tools: { play: { from: 1, to: 9, guide: false, water: true }, fing: true } },

{ id: 'mu-improv', phase: 'music', min: 4, prio: 2, tags: ['creative', 'musical', 'bow'],
  source: '',
  title: { en: 'Improvise on the water', de: 'Improvisieren auf dem Wasser', pt: 'Improvisar sobre a água' },
  why: { en: 'Inventing your own swan phrases over the piano teaches you the harmony from inside, and makes the written melody feel like your own words.', de: 'Eigene Schwanphrasen über dem Klavier lehren dich die Harmonie von innen, und die notierte Melodie klingt danach wie deine eigenen Worte.', pt: 'Inventar frases de cisne sobre o piano ensina a harmonia por dentro e faz a melodia escrita parecer palavras tuas.' },
  steps: [
    { en: 'Start the water (piano only, looping bars 2–5).', de: 'Starte das Wasser (nur Klavier, Takt 2–5 in Schleife).', pt: 'Liga a água (só piano, c. 2–5 em ciclo).' },
    { en: 'Round 1: use only G, A, B, D, E. Slow notes, slurs of three, every phrase ends on a long note.', de: 'Runde 1: nur G, A, H, D, E. Langsame Töne, Dreierbindungen, jede Phrase endet auf einem langen Ton.', pt: 'Volta 1: só Sol, Lá, Si, Ré, Mi. Notas lentas, ligaduras de três, cada frase acaba numa nota longa.' },
    { en: 'Round 2: borrow the swan\'s gestures: a falling third, a rising run, a long high note.', de: 'Runde 2: leihe dir die Gesten des Schwans: eine fallende Terz, einen aufsteigenden Lauf, einen langen hohen Ton.', pt: 'Volta 2: usa os gestos do cisne: uma terceira descendente, uma escala ascendente, uma nota longa aguda.' },
    { en: 'Round 3: answer yourself. Phrase, rest, answer.', de: 'Runde 3: antworte dir selbst. Phrase, Pause, Antwort.', pt: 'Volta 3: responde a ti próprio. Frase, pausa, resposta.' }
  ],
  tools: { play: { from: 2, to: 5, guide: false, water: true, loop: true } } },

{ id: 'mu-run', phase: 'music', min: 5, prio: 3, always: true, tags: ['musical'],
  source: '',
  title: { en: 'Play-through with the piano', de: 'Durchspielen mit Klavier', pt: 'Tocar do início ao fim com piano' },
  why: { en: 'Put everything back together. Choose a tempo you can play beautifully, not the fastest one.', de: 'Alles wieder zusammensetzen. Wähle ein Tempo, in dem du schön spielen kannst, nicht das schnellste.', pt: 'Junta tudo de novo. Escolhe um andamento em que toques bonito, não o mais rápido.' },
  steps: [
    { en: 'First time with the cello guide on, if you are still learning the notes.', de: 'Beim ersten Mal mit Cello-Führung, wenn du die Töne noch lernst.', pt: 'Da primeira vez, com o guia de violoncelo, se ainda estás a aprender as notas.' },
    { en: 'Then guide off: the piano and you.', de: 'Dann ohne Führung: das Klavier und du.', pt: 'Depois sem guia: o piano e tu.' },
    { en: 'Do not stop for mistakes. Notice them and keep the line going.', de: 'Bei Fehlern nicht anhalten. Bemerke sie und halte die Linie.', pt: 'Não pares nos erros. Repara neles e mantém a linha.' }
  ],
  tools: { play: { from: 1, to: 28, guide: true, water: true } } },

{ id: 'mu-reflect', phase: 'music', min: 1, prio: 3, always: true, last: true, tags: ['musical'],
  source: '',
  title: { en: 'What glided today?', de: 'Was ist heute geglitten?', pt: 'O que deslizou hoje?' },
  why: { en: 'One minute of reflection makes tomorrow\'s practice start in the right place.', de: 'Eine Minute Nachdenken lässt das Üben morgen an der richtigen Stelle beginnen.', pt: 'Um minuto de reflexão faz o estudo de amanhã começar no sítio certo.' },
  steps: [
    { en: 'Write one thing that sounded like the swan today.', de: 'Schreib eine Sache auf, die heute wie der Schwan klang.', pt: 'Escreve uma coisa que hoje soou como o cisne.' },
    { en: 'Write one goal for tomorrow.', de: 'Schreib ein Ziel für morgen auf.', pt: 'Escreve um objetivo para amanhã.' }
  ],
  tools: { note: true } }
];
