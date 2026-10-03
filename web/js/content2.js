/* ============================================================
   CANTABILE · content, part 2
   Checklists for every exercise, music lines (a, b, c…), new
   shifting / bow-control / creative exercises and original études.
   ============================================================ */
const L3 = (en, de, pt) => ({ en, de, pt });
const ABC = (body, o = {}) => `X:1\nM:${o.m || '4/4'}\nL:${o.l || '1/4'}\nK:${o.k || 'G'} clef=${o.clef || 'tenor'}\n${body}`;

PHASES.studies = L3('Studies', 'Etüden', 'Estudos');

/* ---------- short checklists (shown on every page) ---------- */
const CHECKS = {
  'w-tune': [L3('Each string green', 'Jede Saite grün', 'Cada corda verde'), L3('D–A fifth sounds still', 'Quinte D–A klingt ruhig', 'Quinta Ré–Lá soa parada')],
  'w-airbow': [L3('Shoulders loose', 'Schultern locker', 'Ombros soltos'), L3('Fingers bend at the frog, stretch at the tip', 'Finger am Frosch gebeugt, an der Spitze gestreckt', 'Dedos dobrados no talão, esticados na ponta'), L3('Bow stays parallel', 'Bogen bleibt parallel', 'Arco fica paralelo')],
  'w-open': [L3('Same volume from start to end', 'Gleiche Lautstärke von Anfang bis Ende', 'Mesmo volume do início ao fim'), L3('Bow parallel to the bridge', 'Bogen parallel zum Steg', 'Arco paralelo ao cavalete'), L3('Slower round, same sound', 'Langsamer, gleicher Klang', 'Mais lento, mesmo som')],
  'w-messa': [L3('Peak exactly on beat 5', 'Höhepunkt genau auf Schlag 5', 'Auge exatamente no tempo 5'), L3('No bump at the peak', 'Kein Knick am Höhepunkt', 'Sem solavanco no auge'), L3('pp still has a core', 'pp hat noch einen Kern', 'O pp ainda tem núcleo')],
  'w-cross': [L3('Crossing early and round', 'Saitenwechsel früh und rund', 'Mudança de corda cedo e redonda'), L3('Same bow speed on both strings', 'Gleiche Bogengeschwindigkeit auf beiden Saiten', 'Mesma velocidade nas duas cordas')],
  'w-fingers': [L3('Fingers drop from the knuckle', 'Finger fallen aus dem Grundgelenk', 'Dedos caem da articulação'), L3('Thumb soft', 'Daumen weich', 'Polegar macio'), L3('1st finger stays down', '1. Finger bleibt liegen', '1.º dedo fica pousado')],
  'w-vibrato': [L3('Motion from the forearm', 'Bewegung aus dem Unterarm', 'Movimento do antebraço'), L3('Pitch goes below, never above', 'Tonhöhe geht nach unten, nie darüber', 'A altura vai abaixo, nunca acima'), L3('Even at every speed', 'Gleichmäßig in jedem Tempo', 'Regular em cada velocidade')],
  'w-shift': [L3('Arm, hand and thumb travel together', 'Arm, Hand und Daumen reisen zusammen', 'Braço, mão e polegar viajam juntos'), L3('Arrival green the first time', 'Ankunft beim ersten Mal grün', 'Chegada verde à primeira')],
  'sc-g': [L3('F♯ leans towards G', 'Fis strebt zum G', 'Fá♯ inclina-se para Sol'), L3('Three even notes per bow', 'Drei gleichmäßige Töne pro Bogen', 'Três notas iguais por arco'), L3('Cresc. up, dim. down', 'Cresc. aufwärts, dim. abwärts', 'Cresc. a subir, dim. a descer')],
  'sc-garp': [L3('Top notes green', 'Spitzentöne grün', 'Notas de cima verdes'), L3('Hand frame stays the same', 'Handrahmen bleibt gleich', 'Moldura da mão igual')],
  'sc-bmm': [L3('G♯ and A♯ high going up', 'Gis und Ais hoch aufwärts', 'Sol♯ e Lá♯ altos a subir'), L3('G and A natural coming down', 'G und A abwärts', 'Sol e Lá naturais a descer'), L3('You hear the colour change', 'Du hörst den Farbwechsel', 'Ouves a mudança de cor')],
  'sc-chrom': [L3('Fingers touch on half steps', 'Finger berühren sich bei Halbtönen', 'Dedos tocam-se nos meios-tons'), L3('Hand stays closed', 'Hand bleibt geschlossen', 'Mão fica fechada')],
  'sp-open-fifth': [L3('Fifth sounds still', 'Quinte klingt ruhig', 'Quinta soa parada'), L3('Finger in place before the crossing', 'Finger liegt vor dem Wechsel', 'Dedo no sítio antes da mudança')],
  'sp-open-bow': [L3('3rd note as alive as the 1st', '3. Ton so lebendig wie der 1.', '3.ª nota tão viva como a 1.ª'), L3('No bump at the bow change', 'Kein Knick beim Bogenwechsel', 'Sem solavanco na mudança de arco')],
  'sp-cad-rhythm': [L3('Eighths not rushed', 'Achtel nicht eilen', 'Colcheias sem pressa'), L3('Half note softer', 'Halbe leiser', 'Mínima mais suave'), L3('All endings the same shape', 'Alle Schlüsse gleich geformt', 'Todos os finais com a mesma forma')],
  'sp-cad-release': [L3('Bow slows gradually', 'Bogen wird allmählich langsamer', 'Arco abranda aos poucos'), L3('Vibrato to the end', 'Vibrato bis zum Ende', 'Vibrato até ao fim'), L3('Breathe in the rest', 'In der Pause atmen', 'Respira na pausa')],
  'sp-run-guide': [L3('Slide heard, then lighter', 'Gleiten hörbar, dann leichter', 'Deslize audível, depois mais leve'), L3('Arm leaves early', 'Arm geht früh los', 'Braço parte cedo'), L3('B is green', 'H ist grün', 'Si fica verde')],
  'sp-run-rhythms': [L3('Long notes: stop and prepare', 'Lange Töne: anhalten, vorbereiten', 'Notas longas: parar e preparar'), L3('Short notes: quick and light', 'Kurze Töne: schnell und leicht', 'Notas curtas: rápidas e leves'), L3('Even eighths above piece tempo', 'Gleiche Achtel über Stücktempo', 'Colcheias iguais acima do andamento')],
  'sp-run-impulse': [L3('Each group = one gesture', 'Jede Gruppe = eine Geste', 'Cada grupo = um gesto'), L3('Release in every stop', 'In jedem Halt lösen', 'Soltar em cada paragem'), L3('Stops shorter until one line', 'Halte kürzer bis zur Linie', 'Paragens mais curtas até ser linha')],
  'sp-long-bow': [L3('Bow lasts to the end', 'Bogen reicht bis zum Ende', 'O arco chega ao fim'), L3('pp has a core', 'pp hat einen Kern', 'O pp tem núcleo'), L3('Bar 21 grows to the end', 'Takt 21 wächst bis zum Ende', 'C. 21 cresce até ao fim')],
  'sp-long-vib': [L3('Vibrato from the first moment', 'Vibrato vom ersten Moment', 'Vibrato desde o primeiro instante'), L3('Green while vibrating', 'Grün beim Vibrieren', 'Verde a vibrar'), L3('A colour word for each note', 'Ein Farbwort pro Ton', 'Uma palavra-cor por nota')],
  'sp-climb-7': [L3('A♯ rings with the drone', 'Ais klingt mit dem Bordun', 'Lá♯ ressoa com o bordão'), L3('A♯ leads to B', 'Ais führt zum H', 'Lá♯ conduz ao Si')],
  'sp-climb-8': [L3('Groups secure with stops', 'Gruppen sicher mit Halt', 'Grupos seguros com paragens'), L3('Dotted rhythms both ways', 'Punktiert in beide Richtungen', 'Pontuado nos dois sentidos'), L3('Arrive on D without hurry', 'Ohne Eile auf D ankommen', 'Chegar ao Ré sem pressa')],
  'sp-climb-leap': [L3('Sing the D first', 'Zuerst das D singen', 'Cantar o Ré primeiro'), L3('Soft landing, then vibrato', 'Weich landen, dann Vibrato', 'Aterrar suave, depois vibrato')],
  'sp-arch-shape': [L3('Each note green alone', 'Jeder Ton einzeln grün', 'Cada nota verde sozinha'), L3('Arm releases going down', 'Arm löst abwärts', 'Braço solta a descer'), L3('Answer grows to its 3rd note', 'Antwort wächst zum 3. Ton', 'Resposta cresce até à 3.ª nota')],
  'sp-arch-color': [L3('Bar 10 bright', 'Takt 10 hell', 'C. 10 claro'), L3('Bar 12 darker', 'Takt 12 dunkler', 'C. 12 mais escuro'), L3('Your image written down', 'Dein Bild aufgeschrieben', 'A tua imagem escrita')],
  'sp-color-hairpin': [L3('Bow saved for the peak', 'Bogen für den Höhepunkt gespart', 'Arco poupado para o auge'), L3('Peak on beat 1', 'Höhepunkt auf Schlag 1', 'Auge no tempo 1'), L3('Wave 2 bigger', 'Welle 2 größer', 'Onda 2 maior')],
  'sp-color-17': [L3('Feel minor → major', 'Moll → Dur spüren', 'Sentir menor → maior'), L3('Same finger, clean slide', 'Gleicher Finger, sauberes Gleiten', 'Mesmo dedo, deslize limpo'), L3('Both notes green', 'Beide Töne grün', 'As duas notas verdes')],
  'sp-coda-sighs': [L3('Lean, then release', 'Anlehnen, dann lösen', 'Apoiar, depois soltar'), L3('Less bow each group', 'Weniger Bogen pro Gruppe', 'Menos arco em cada grupo')],
  'sp-coda-time': [L3('Accent = weight, not a bang', 'Akzent = Gewicht, kein Schlag', 'Acento = peso, não golpe'), L3('rit. like breathing', 'rit. wie Atmen', 'rit. como respirar'), L3('Last G alive to the end', 'Letztes G lebt bis zum Ende', 'Último Sol vivo até ao fim')],
  'mu-sing': [L3('Sang without breaks', 'Ohne Unterbrechung gesungen', 'Cantei sem quebras'), L3('Breath in the rests', 'Atem in den Pausen', 'Respiração nas pausas'), L3('Same breath in the bow', 'Gleicher Atem im Bogen', 'A mesma respiração no arco')],
  'mu-dancer': [L3('No corners at bow changes', 'Keine Ecken beim Bogenwechsel', 'Sem cantos nas mudanças'), L3('Arm round and slow', 'Arm rund und langsam', 'Braço redondo e lento')],
  'mu-characters': [L3('Three clearly different swans', 'Drei deutlich verschiedene Schwäne', 'Três cisnes bem diferentes'), L3('Your swan chosen', 'Deinen Schwan gewählt', 'O teu cisne escolhido')],
  'mu-improv': [L3('Every phrase ends long', 'Jede Phrase endet lang', 'Cada frase acaba longa'), L3('Used a swan gesture', 'Eine Schwanen-Geste benutzt', 'Usei um gesto do cisne'), L3('Answered yourself', 'Dir selbst geantwortet', 'Respondi a mim próprio')],
  'mu-run': [L3('Didn\'t stop for mistakes', 'Bei Fehlern nicht angehalten', 'Não parei nos erros'), L3('The line kept going', 'Die Linie lief weiter', 'A linha continuou')],
  'mu-reflect': [L3('One good thing written', 'Eine gute Sache notiert', 'Uma coisa boa escrita'), L3('One goal for tomorrow', 'Ein Ziel für morgen', 'Um objetivo para amanhã')]
};

/* ---------- vibrato & cadences get notation too ---------- */
const EXTRA_MUSIC = {
  'w-vibrato': [
    { label: L3('pulses on one note', 'Pulse auf einem Ton', 'pulsações numa nota'), abc: ABC('"^2 per beat"!2!=F4|"^3 per beat"=F4|"^4 per beat"=F4|"^free"=F4|]') },
    { label: L3('vibrato through the bow change', 'Vibrato durch den Bogenwechsel', 'vibrato através da mudança de arco'), abc: ABC('!downbow!=F4|!upbow!=F4|!downbow!G4|!upbow!A4|]') }
  ]
};

/* ---------- new exercises ---------- */
const NEW_EXERCISES = [
/* ----- shifting ----- */
{ id: 'sh-guide', phase: 'spots', spot: 'run', min: 4, prio: 3, tags: ['shift', 'left', 'intonation'], source: 'Starker, Hirzel vol. II',
  title: L3('Guide notes', 'Leittöne', 'Notas-guia'),
  why: L3('The small note is the finger you slide on. Hearing it teaches the arm the distance; later the slide disappears.', 'Die kleine Note ist der Finger, auf dem du gleitest. Sie lehrt den Arm die Distanz; später verschwindet das Gleiten.', 'A nota pequena é o dedo em que deslizas. Ouvi-la ensina a distância ao braço; depois o deslize desaparece.'),
  steps: [L3('a: same finger up and down, slide audible.', 'a: gleicher Finger auf und ab, Gleiten hörbar.', 'a: mesmo dedo a subir e descer, deslize audível.'), L3('b: the run of bar 4 in quarters with guide notes.', 'b: der Lauf aus Takt 4 in Vierteln mit Leittönen.', 'b: a escala do c. 4 em semínimas com notas-guia.'), L3('c: bar 4 as written. Keep the arm timing, lose the slide.', 'c: Takt 4 wie notiert. Timing behalten, Gleiten weglassen.', 'c: c. 4 como escrito. Mantém o tempo do braço, perde o deslize.')],
  checks: [L3('Small note heard, softly', 'Kleine Note leise hörbar', 'Nota pequena ouvida, suave'), L3('Arm moves before the new note', 'Arm bewegt sich vor dem neuen Ton', 'O braço move-se antes da nova nota'), L3('Arrival green', 'Ankunft grün', 'Chegada verde')],
  music: [
    { label: L3('same finger', 'gleicher Finger', 'mesmo dedo'), abc: ABC('"^1st finger"!1!B,2 {/B,}E2|E2 {/E}B,2|"^3rd finger"!3!^C2 {/^C}F2|F2 {/F}^C2|]') },
    { label: L3('the run in steps · your fingering', 'der Lauf in Schritten · dein Fingersatz', 'a escala por passos · a tua dedilhação'), abc: ABC('E, F, G, {/G,}A,|B, C {/C}D E|F {/F}B3|]') },
    { label: L3('bar 4, as written', 'Takt 4, wie notiert', 'c. 4, como escrito'), abc: ABC('E,4 F,G, A,B,CDEF|B6- B z z2 z2|]', { m: '6/4', l: '1/8' }) }
  ],
  tools: { metro: { bpm: 48, target: 54, step: 2, beats: 4, sub: 1 }, tuner: { targets: ['E4', 'F#4', 'B4'] }, fing: true } },

{ id: 'sh-ladder', phase: 'warmup', min: 3, prio: 2, tags: ['shift', 'left'], source: 'Starker, Feuillard',
  title: L3('Shifting ladder', 'Lagenwechsel-Leiter', 'Escada de mudanças'),
  why: L3('One finger travels bigger and bigger distances from the same starting note. The return to the start keeps the hand honest.', 'Ein Finger reist immer größere Distanzen vom gleichen Startton. Die Rückkehr zum Start hält die Hand ehrlich.', 'Um dedo viaja distâncias cada vez maiores a partir da mesma nota. O regresso ao início mantém a mão honesta.'),
  steps: [L3('1st finger only. Guide note audible, then lighter.', 'Nur 1. Finger. Leitton hörbar, dann leichter.', 'Só o 1.º dedo. Nota-guia audível, depois mais leve.'), L3('Return to the start note each time and check it.', 'Jedes Mal zum Startton zurück und prüfen.', 'Volta sempre à nota inicial e verifica-a.')],
  checks: [L3('Start note always the same', 'Startton immer gleich', 'Nota inicial sempre igual'), L3('Bigger shift, same calm arm', 'Größerer Wechsel, gleich ruhiger Arm', 'Mudança maior, braço igualmente calmo')],
  music: [
    { label: L3('A string', 'A-Saite', 'corda Lá'), abc: ABC('!1!B,2 {/B,}C2|B,2 {/B,}D2|B,2 {/B,}E2|B,2 {/B,}F2|B,2 {/B,}G2|B,4|]') },
    { label: L3('D string', 'D-Saite', 'corda Ré'), abc: ABC('!1!E,2 {/E,}F,2|E,2 {/E,}G,2|E,2 {/E,}A,2|E,2 {/E,}B,2|E,2 {/E,}C2|E,4|]') }
  ],
  tools: { tuner: { targets: ['B3', 'E4', 'B3', 'G4', 'B3'] } } },

{ id: 'sh-harmonic', phase: 'spots', spot: 'long', min: 3, prio: 2, tags: ['shift', 'intonation'], source: 'Hirzel vol. III',
  title: L3('The harmonic landmark', 'Der Flageolett-Wegweiser', 'O harmónico como marco'),
  why: L3('The high B of bars 5 and 21 sits one step above the A harmonic in the middle of the string. Find the landmark, then step past it.', 'Das hohe H in Takt 5 und 21 liegt einen Ton über dem A-Flageolett in der Saitenmitte. Finde den Wegweiser, dann geh einen Schritt weiter.', 'O Si agudo dos c. 5 e 21 fica um tom acima do harmónico Lá no meio da corda. Encontra o marco e dá um passo além.'),
  steps: [L3('a: open A, then the harmonic A above. Touch lightly.', 'a: leeres A, dann das Flageolett-A darüber. Leicht berühren.', 'a: Lá solto, depois o harmónico Lá. Toca levemente.'), L3('b: from the harmonic, one step to B. Press now.', 'b: vom Flageolett einen Schritt zum H. Jetzt drücken.', 'b: do harmónico, um passo até Si. Agora pressiona.'), L3('c: F♯ to B with a guide note.', 'c: Fis zu H mit Leitton.', 'c: Fá♯ a Si com nota-guia.')],
  checks: [L3('Harmonic rings clear', 'Flageolett klingt klar', 'Harmónico soa claro'), L3('B green from the harmonic', 'H grün vom Flageolett aus', 'Si verde a partir do harmónico'), L3('B green from F♯', 'H grün von Fis aus', 'Si verde a partir de Fá♯')],
  music: [
    { label: L3('the landmark', 'der Wegweiser', 'o marco'), abc: ABC('"^open"A,2 "^harmonic"!open!A2|A,2 !open!A2|]') },
    { label: L3('one step past it', 'einen Schritt weiter', 'um passo além'), abc: ABC('!open!A2 B2|!open!A2 B2|B4|]') },
    { label: L3('bars 4 → 5', 'Takt 4 → 5', 'c. 4 → 5'), abc: ABC('E2 F2|F2 {/F}B2-|B4|]') }
  ],
  tools: { tuner: { targets: ['A4', 'B4', 'F#4', 'B4'] } } },

/* ----- bow control ----- */
{ id: 'bc-lanes', phase: 'warmup', min: 3, prio: 2, tags: ['bow', 'tone'], source: 'Ševčík op. 2, Hirzel',
  title: L3('Sounding-point lanes', 'Kontaktstellen-Spuren', 'Pistas do ponto de contacto'),
  why: L3('Near the fingerboard the sound is soft and veiled, near the bridge it is strong and bright. The Swan moves between these lanes.', 'Nahe am Griffbrett klingt es weich und verschleiert, am Steg stark und hell. Der Schwan wechselt zwischen diesen Spuren.', 'Perto da escala o som é suave e velado; perto do cavalete é forte e brilhante. O Cisne move-se entre estas pistas.'),
  steps: [L3('a: one lane per bow. Change weight and speed to fit each lane.', 'a: eine Spur pro Bogen. Gewicht und Tempo passend ändern.', 'a: uma pista por arco. Ajusta peso e velocidade a cada pista.'), L3('b: travel from tasto to ponticello inside one bow.', 'b: in einem Bogen von tasto zu ponticello wandern.', 'b: viaja de tasto a ponticello num só arco.')],
  checks: [L3('Bow stays in its lane', 'Bogen bleibt in seiner Spur', 'O arco fica na sua pista'), L3('Tasto: soft, not thin', 'Tasto: weich, nicht dünn', 'Tasto: suave, não fino'), L3('Ponticello: strong, not scratchy', 'Ponticello: stark, nicht kratzig', 'Ponticello: forte, sem arranhar')],
  music: [
    { label: L3('one lane per bow', 'eine Spur pro Bogen', 'uma pista por arco'), abc: ABC('"^tasto"!p!D,4|"^ordinario"!mf!D,4|"^ponticello"!f!D,4|"^ordinario"!mf!D,4|"^tasto"!p!D,4|]', { k: 'C', clef: 'bass' }) },
    { label: L3('travel inside one bow', 'Wandern in einem Bogen', 'viajar num só arco'), abc: ABC('"^tasto → pont."!p!!crescendo(!A,4-|A,4-|A,4!crescendo)!!f!|"^pont. → tasto"!diminuendo(!A,4-|A,4-|A,4!diminuendo)!!p!|]', { k: 'C', clef: 'bass' }) }
  ],
  tools: { metro: { bpm: 60, target: 50, step: 4, beats: 4, sub: 1, dir: 'down' } } },

{ id: 'bc-speed', phase: 'warmup', min: 3, prio: 2, tags: ['bow', 'tone'], source: 'Hirzel vol. I, Ševčík op. 2',
  title: L3('Same sound, different speeds', 'Gleicher Klang, andere Geschwindigkeit', 'O mesmo som, outras velocidades'),
  why: L3('A whole bow in one beat and a whole bow in eight beats should both sound like you. You balance speed with weight and sounding point.', 'Ein ganzer Bogen in einem Schlag und in acht Schlägen sollen beide nach dir klingen. Du gleichst Tempo mit Gewicht und Kontaktstelle aus.', 'Um arco inteiro num tempo e em oito tempos devem soar ambos a ti. Equilibras velocidade com peso e ponto de contacto.'),
  steps: [L3('a: whole bows, faster and faster. Fast bow: lighter and nearer the fingerboard.', 'a: ganze Bögen, immer schneller. Schneller Bogen: leichter, näher am Griffbrett.', 'a: arcos inteiros, cada vez mais rápidos. Arco rápido: mais leve e perto da escala.'), L3('b: one bow for eight beats. Slow bow: more weight, nearer the bridge.', 'b: ein Bogen für acht Schläge. Langsamer Bogen: mehr Gewicht, näher am Steg.', 'b: um arco para oito tempos. Arco lento: mais peso, perto do cavalete.')],
  checks: [L3('Same volume at every speed', 'Gleiche Lautstärke bei jedem Tempo', 'Mesmo volume a cada velocidade'), L3('Fast bow does not whistle', 'Schneller Bogen pfeift nicht', 'Arco rápido não assobia'), L3('Slow bow does not crack', 'Langsamer Bogen knackt nicht', 'Arco lento não estala')],
  music: [
    { label: L3('whole bows, faster', 'ganze Bögen, schneller', 'arcos inteiros, mais rápido'), abc: ABC('"^whole bow"!downbow!G,,4|!upbow!G,,2 !downbow!G,,2|!upbow!G,,!downbow!G,,!upbow!G,,!downbow!G,,|]', { k: 'C', clef: 'bass' }) },
    { label: L3('one bow, eight beats', 'ein Bogen, acht Schläge', 'um arco, oito tempos'), abc: ABC('"^one bow"!downbow!G,,4-|G,,4|!upbow!D,4-|D,4|]', { k: 'C', clef: 'bass' }) }
  ],
  tools: { metro: { bpm: 60, target: 60, step: 0, beats: 4, sub: 1 } } },

{ id: 'bc-plan', phase: 'spots', spot: 'cadence', min: 3, prio: 2, tags: ['bow', 'rhythm'], source: 'Hirzel vol. I (bow division)',
  title: L3('The Swan on one string', 'Der Schwan auf einer Saite', 'O Cisne numa só corda'),
  why: L3('Play the rhythm and bowing of bars 2–5 on the open D string. Without the left hand you hear exactly where bow runs out.', 'Spiele Rhythmus und Bogen von Takt 2–5 auf der leeren D-Saite. Ohne linke Hand hörst du genau, wo der Bogen ausgeht.', 'Toca o ritmo e o arco dos c. 2–5 na corda Ré solta. Sem a mão esquerda ouves exatamente onde falta arco.'),
  steps: [L3('Follow the pencil notes: one bow, save bow, little weight.', 'Folge den Bleistiftnotizen: ein Bogen, Bogen sparen, wenig Gewicht.', 'Segue as notas a lápis: um arco, poupar arco, pouco peso.'), L3('Then play bars 2–5 with the notes and the same bow plan.', 'Dann Takt 2–5 mit den Tönen und demselben Bogenplan.', 'Depois toca os c. 2–5 com as notas e o mesmo plano de arco.')],
  checks: [L3('Enough bow for the long B', 'Genug Bogen für das lange H', 'Arco suficiente para o Si longo'), L3('Eighths light, not rushed', 'Achtel leicht, nicht eilig', 'Colcheias leves, sem pressa')],
  music: [
    { label: L3('bars 2–3', 'Takt 2–3', 'c. 2–3'), abc: ABC('"^one bow"(D,2 D,2 D,2) "^one bow"(D,2 D,2 D,2)|"^save bow!"D,4- D,D, D,4 z2|]', { m: '6/4', l: '1/8', clef: 'bass' }) },
    { label: L3('bars 4–5', 'Takt 4–5', 'c. 4–5'), abc: ABC('"^little bow each"D,4 D,D, D,D,D,D,D,D,|"^plenty left?"D,6- D, z z2 z2|]', { m: '6/4', l: '1/8', clef: 'bass' }) }
  ],
  tools: { metro: { bpm: 50, target: 54, step: 2, beats: 6, sub: 1 } } },

{ id: 'bc-change', phase: 'warmup', min: 3, prio: 2, tags: ['bow', 'tone'], source: 'Hirzel vol. I',
  title: L3('Invisible bow changes', 'Unhörbare Bogenwechsel', 'Mudanças de arco invisíveis'),
  why: L3('In the Swan nobody should hear where the bow turns. The fingers soften the change like a brush; the arm keeps moving.', 'Im Schwan soll niemand hören, wo der Bogen wendet. Die Finger federn den Wechsel wie ein Pinsel ab; der Arm bleibt in Bewegung.', 'No Cisne ninguém deve ouvir onde o arco muda. Os dedos amortecem a mudança como um pincel; o braço continua em movimento.'),
  steps: [L3('a: at the frog fingers bend into the change, at the tip they stretch.', 'a: am Frosch beugen sich die Finger in den Wechsel, an der Spitze strecken sie sich.', 'a: no talão os dedos dobram na mudança, na ponta esticam.'), L3('b: change bow and string at the same time.', 'b: Bogen und Saite gleichzeitig wechseln.', 'b: muda arco e corda ao mesmo tempo.')],
  checks: [L3('No accent at the change', 'Kein Akzent beim Wechsel', 'Sem acento na mudança'), L3('Arm never stops', 'Arm hält nie an', 'O braço nunca para')],
  music: [
    { label: L3('frog and tip', 'Frosch und Spitze', 'talão e ponta'), abc: ABC('"^frog"!downbow!D,4|"^tip"!upbow!D,4|"^frog"!downbow!D,4|"^tip"!upbow!D,4|]', { k: 'C', clef: 'bass' }) },
    { label: L3('change bow and string together', 'Bogen und Saite zusammen', 'arco e corda juntos'), abc: ABC('!downbow!D,4|!upbow!A,4|!downbow!D,4|!upbow!A,4|[D,A,]4|]', { k: 'C', clef: 'bass' }) }
  ],
  tools: { metro: { bpm: 56, target: 48, step: 4, beats: 4, sub: 1, dir: 'down' } } },

/* ----- études (original) ----- */
{ id: 'et-lake', phase: 'studies', min: 4, prio: 2, tags: ['bow', 'musical', 'tone'], source: 'Cantabile',
  title: L3('Study: the still lake', 'Etüde: der stille See', 'Estudo: o lago parado'),
  why: L3('An eight-bar study in the Swan\'s language: slurs of three, long notes, a climb to D. Bow distribution and legato in a real melody.', 'Eine achttaktige Etüde in der Sprache des Schwans: Dreierbindungen, lange Töne, ein Aufstieg zum D. Bogeneinteilung und Legato in einer echten Melodie.', 'Um estudo de oito compassos na linguagem do Cisne: ligaduras de três, notas longas, subida ao Ré. Divisão de arco e legato numa melodia verdadeira.'),
  steps: [L3('Read it once slowly without stopping.', 'Einmal langsam ohne Anhalten lesen.', 'Lê uma vez devagar sem parar.'), L3('Then with the drone, shaping each phrase.', 'Dann mit Bordun, jede Phrase formen.', 'Depois com o bordão, a moldar cada frase.')],
  checks: [L3('Three even notes per bow', 'Drei gleiche Töne pro Bogen', 'Três notas iguais por arco'), L3('Long notes alive', 'Lange Töne lebendig', 'Notas longas vivas'), L3('Crescendo to bar 6', 'Crescendo bis Takt 6', 'Crescendo até ao c. 6')],
  music: [{ label: L3('Andante · legato', 'Andante · legato', 'Andante · legato'), abc: ABC('!p!(G,2 B,2 D2) (G2 F2 E2)|D6 (C2 B,2 A,2)|(B,2 D2 G2) (B2 A2 G2)|F6- F2 z4|!crescendo(!(E2 G2 c2) (B2 A2 G2)|(F2 A2 d2)!crescendo)! (c2 B2 A2)|!diminuendo(!G4 (A2 B2) (c2 A2)|G12!diminuendo)!|]', { m: '6/4', l: '1/8' }) }],
  tools: { metro: { bpm: 50, target: 60, step: 4, beats: 6, sub: 1 }, drone: { notes: ['G2', 'D3'] } } },

{ id: 'et-fourths', phase: 'studies', spot: 'run', min: 4, prio: 2, tags: ['shift', 'intonation'], source: 'Cantabile (after Starker)',
  title: L3('Study: fourths up, steps home', 'Etüde: Quarten hinauf, Schritte heim', 'Estudo: quartas acima, passos para casa'),
  why: L3('Each line shifts up a fourth with a guide note, then walks home in steps. The last fourth is F♯ → B, the arrival of bar 5.', 'Jede Zeile wechselt eine Quarte hinauf mit Leitton und geht dann schrittweise heim. Die letzte Quarte ist Fis → H, die Ankunft aus Takt 5.', 'Cada linha sobe uma quarta com nota-guia e volta a casa por passos. A última quarta é Fá♯ → Si, a chegada do c. 5.'),
  steps: [L3('Slide audibly first, then lighter each time.', 'Zuerst hörbar gleiten, dann jedes Mal leichter.', 'Primeiro desliza audivelmente, depois cada vez mais leve.'), L3('Use your own fingering; write it in.', 'Eigenen Fingersatz verwenden und eintragen.', 'Usa a tua dedilhação e escreve-a.')],
  checks: [L3('Every arrival in tune', 'Jede Ankunft sauber', 'Cada chegada afinada'), L3('Steps home without rushing', 'Schritte heim ohne Eile', 'Passos para casa sem pressa')],
  music: [{ label: L3('Moderato', 'Moderato', 'Moderato'), abc: ABC('B,2 {/B,}E2|(E D C B,)|C2 {/C}F2|(F E D C)|D2 {/D}G2|(G F E D)|E2 {/E}A2|(A G F E)|F2 {/F}B2-|B4|]') }],
  tools: { metro: { bpm: 52, target: 72, step: 4, beats: 4, sub: 1 }, tuner: { targets: ['E4', 'F#4', 'G4', 'A4', 'B4'] }, fing: true } },

{ id: 'et-climb', phase: 'studies', spot: 'climb', min: 4, prio: 2, tags: ['left', 'intonation', 'shift'], source: 'Cantabile (after Feuillard)',
  title: L3('Study: the B minor climb', 'Etüde: der h-Moll-Aufstieg', 'Estudo: a subida em si menor'),
  why: L3('The notes of bar 8 as a short study: up in melodic minor, the leap A♯ → D, down through the B minor chord and the natural minor.', 'Die Töne aus Takt 8 als kurze Etüde: aufwärts melodisch Moll, der Sprung Ais → D, abwärts durch den h-Moll-Akkord und natürlich Moll.', 'As notas do c. 8 como pequeno estudo: a subir em menor melódica, o salto Lá♯ → Ré, a descer pelo acorde de si menor e menor natural.'),
  steps: [L3('Slowly with the B drone.', 'Langsam mit H-Bordun.', 'Devagar com bordão de Si.'), L3('Then raise the tempo each round.', 'Dann jede Runde schneller.', 'Depois mais rápido a cada volta.')],
  checks: [L3('G♯ and A♯ high', 'Gis und Ais hoch', 'Sol♯ e Lá♯ altos'), L3('D green after the leap', 'D grün nach dem Sprung', 'Ré verde depois do salto'), L3('A and G natural low', 'A und G tief', 'Lá e Sol naturais baixos')],
  music: [{ label: L3('Con moto', 'Con moto', 'Con moto'), abc: ABC('"^melodic minor"F,2^G,2 ^A,2B,2|C2D2 E2F2|^G2^A2 d4|(d2B2) (F2D2)|"^natural minor"(=A2=G2) (F2E2)|(D2C2) (B,2^A,2)|B,4 F4|B,8|]', { k: 'Bm', l: '1/8' }) }],
  tools: { metro: { bpm: 48, target: 66, step: 4, beats: 4, sub: 2 }, drone: { notes: ['B2', 'F#3'] }, tuner: { targets: ['G#4', 'A#4', 'D5'] } } },

/* ----- creative ----- */
{ id: 'cr-echo', phase: 'music', min: 3, prio: 2, tags: ['creative', 'musical'], source: '',
  title: L3('Swan and echo', 'Schwan und Echo', 'Cisne e eco'),
  why: L3('You answer each swan motif with your own. Change one thing: direction, rhythm or register. This is how composers vary a theme.', 'Du beantwortest jedes Schwanenmotiv mit deinem eigenen. Ändere eine Sache: Richtung, Rhythmus oder Lage. So variieren Komponisten ein Thema.', 'Respondes a cada motivo do cisne com o teu. Muda uma coisa: direção, ritmo ou registo. É assim que os compositores variam um tema.'),
  steps: [L3('Play the swan motif, then fill the empty bar with your answer.', 'Spiele das Schwanenmotiv, dann fülle den leeren Takt mit deiner Antwort.', 'Toca o motivo do cisne e enche o compasso vazio com a tua resposta.'), L3('Try it over the piano loop.', 'Probiere es über der Klavierschleife.', 'Experimenta sobre o ciclo de piano.')],
  checks: [L3('Answer changes one thing', 'Antwort ändert eine Sache', 'A resposta muda uma coisa'), L3('Answer ends on a long note', 'Antwort endet lang', 'A resposta acaba longa'), L3('One answer you liked written down', 'Eine gute Antwort notiert', 'Uma resposta de que gostaste escrita')],
  music: [{ label: L3('motif · your answer', 'Motiv · deine Antwort', 'motivo · a tua resposta'), abc: ABC('"^swan"(G2 F2 B,2) z6|"^your answer"z12|"^swan"(d2 B2 G2) z6|"^your answer"z12|"^swan"(B2 A2 E2) z6|"^your answer"z12|]', { m: '6/4', l: '1/8' }), perLine: 2 }],
  tools: { play: { from: 2, to: 3, guide: false, water: true, loop: true }, fing: true } },

{ id: 'cr-variation', phase: 'music', min: 3, prio: 2, tags: ['creative', 'rhythm', 'bow'], source: '',
  title: L3('Bar 2, four ways', 'Takt 2, vier Arten', 'C. 2, de quatro maneiras'),
  why: L3('Varying a bar makes you choose bow, rhythm and character on purpose. When you go back to the original, it sounds like a decision.', 'Einen Takt zu variieren zwingt dich, Bogen, Rhythmus und Charakter bewusst zu wählen. Danach klingt das Original wie eine Entscheidung.', 'Variar um compasso obriga-te a escolher arco, ritmo e carácter. Depois, o original soa a uma decisão.'),
  steps: [L3('Play a, b and c. Then invent d and write it in your notes.', 'Spiele a, b und c. Erfinde dann d und schreib es in deine Notizen.', 'Toca a, b e c. Depois inventa d e escreve-o nas notas.'), L3('Finish with a again.', 'Zum Schluss wieder a.', 'Termina com a outra vez.')],
  checks: [L3('Each version clearly different', 'Jede Version deutlich anders', 'Cada versão bem diferente'), L3('Your own version d', 'Deine eigene Version d', 'A tua versão d'), L3('Original sounds chosen', 'Original klingt gewählt', 'O original soa escolhido')],
  music: [
    { label: L3('original', 'Original', 'original'), abc: ABC('(G2 F2 B,2) (E2 D2 G,2)|]', { m: '6/4', l: '1/8' }) },
    { label: L3('dotted', 'punktiert', 'pontuado'), abc: ABC('(G3 F B,2) (E3 D G,2)|]', { m: '6/4', l: '1/8' }) },
    { label: L3('upside down', 'umgekehrt', 'ao contrário'), abc: ABC('(B,2 F2 G2) (G,2 D2 E2)|]', { m: '6/4', l: '1/8' }) },
    { label: L3('yours', 'deine', 'a tua'), abc: ABC('"^your version"z12|]', { m: '6/4', l: '1/8' }) }
  ],
  tools: { metro: { bpm: 54, target: 54, step: 0, beats: 6, sub: 1 }, fing: true } },

{ id: 'cr-compose', phase: 'music', min: 4, prio: 1, tags: ['creative', 'musical'], source: '',
  title: L3('Compose a swan phrase', 'Komponiere eine Schwanenphrase', 'Compõe uma frase de cisne'),
  why: L3('Four bars of your own, with three rules from the Swan. Writing music is the fastest way to understand how this one is built.', 'Vier eigene Takte mit drei Regeln aus dem Schwan. Selbst schreiben ist der schnellste Weg zu verstehen, wie dieses Stück gebaut ist.', 'Quatro compassos teus com três regras do Cisne. Escrever música é a forma mais rápida de perceber como esta é construída.'),
  steps: [L3('Improvise until you like it, then write the note names in your notes.', 'Improvisiere, bis es dir gefällt, dann schreib die Tonnamen in deine Notizen.', 'Improvisa até gostares e escreve os nomes das notas nas notas.'), L3('Play it to someone.', 'Spiel es jemandem vor.', 'Toca-a para alguém.')],
  checks: [L3('Starts on G', 'Beginnt auf G', 'Começa em Sol'), L3('One slur of three, one long note', 'Eine Dreierbindung, ein langer Ton', 'Uma ligadura de três, uma nota longa'), L3('Ends on G or D', 'Endet auf G oder D', 'Acaba em Sol ou Ré')],
  music: [{ label: L3('your four bars', 'deine vier Takte', 'os teus quatro compassos'), abc: ABC('"^start on G"z12|z12|z12|"^end on G or D"z12|]', { m: '6/4', l: '1/8' }), perLine: 2 }],
  tools: { play: { from: 2, to: 5, guide: false, water: true, loop: true }, fing: true } }
];

/* ---------- merge ---------- */
EXERCISES.forEach(e => {
  if (CHECKS[e.id]) e.checks = CHECKS[e.id];
  if (!e.music && e.abc) e.music = [{ abc: e.abc }];
  if (EXTRA_MUSIC[e.id]) e.music = (e.music || []).concat(EXTRA_MUSIC[e.id]);
});
// keep the library in a sensible order: insert new ones after their siblings
NEW_EXERCISES.forEach(n => {
  const after = { 'sh-ladder': 'w-shift', 'bc-lanes': 'w-open', 'bc-speed': 'bc-lanes', 'bc-change': 'bc-speed', 'sh-guide': 'sp-run-guide', 'sh-harmonic': 'sp-long-vib', 'bc-plan': 'sp-cad-release' }[n.id];
  const i = after ? EXERCISES.findIndex(e => e.id === after) : -1;
  if (i >= 0) EXERCISES.splice(i + 1, 0, n); else {
    const j = EXERCISES.findIndex(e => e.id === 'mu-run');
    if (n.phase === 'studies') { const k = EXERCISES.findIndex(e => e.phase === 'music'); EXERCISES.splice(k, 0, n); }
    else EXERCISES.splice(j, 0, n);
  }
});
// the spot "run" also points to the shifting study, "cadence" to the bow plan
