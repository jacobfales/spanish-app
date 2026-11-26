'use strict';
const $ = id => document.getElementById(id);
// En iPhone/iPad, un enlace https://claude.ai/... abre Safari, no la app. claude:// abre la app de Claude
// y la deja donde la dejaste (la plática de hoy). En la Mac se abre un chat nuevo en la web.
// Ninguna app de Claude deja que un enlace prenda el modo de voz: hay que tocar el botón de voz.
const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const CHAT = IOS ? 'claude://' : 'https://claude.ai/new';
function openChat(){ if(IOS) location.href = CHAT; else window.open(CHAT,'_blank','noopener'); }
document.querySelectorAll('a.chat').forEach(a=>{ a.href = CHAT; if(IOS){ a.removeAttribute('target'); a.onclick = e => { e.preventDefault(); openChat(); }; } });
// Reglas que valen para toda la práctica. Escritas en partes con título para que la IA las siga bien.
const TONE = {
 quiet: "TONO: Solo escucha en silencio.",
 friend: "TONO: Eres mi cuate mexicano de mi edad, NO mi maestro. Habla relajado y con la jerga que usa la gente en México (güey, la neta, qué onda, no manches, chido, qué padre, órale, ¿a poco?, está cañón, ahorita). Nada de lenguaje de libro.",
 formal: "TONO: En este tema NADA de jerga. Habla formal y profesional, como en una corte o un despacho de abogados: «usted», frases completas y vocabulario legal correcto."
};
const WAIT = "RITMO: Habla despacio y con frases cortas (2 o 3 como máximo). Yo hablo la mayor parte. Si me quedo callado, espera: no me interrumpas ni termines mis frases. Contesta solo cuando yo termine.";
const FIX = [
 "MIENTRAS HABLAMOS — NO ME CORRIJAS:",
 "- Nunca me corrijas durante la práctica: no digas «se dice así», no repitas mi frase bien dicha, no expliques gramática.",
 "- Sigue la plática como si me hubieras entendido perfecto. Si de verdad no me entiendes, solo pregunta «¿cómo?», como un amigo.",
 "- EN SECRETO, apunta cada error mío (gramática, palabra equivocada, palabra en inglés, frase que suena a gringo) y cada palabra que no supe o te pregunté. Junta todo en UNA lista para toda la práctica de hoy. No me digas nada de esa lista hasta el final.",
 "",
 "AL FINAL (después del último paso, o si yo digo «ya terminamos»):",
 "1) Primero pregúntame: «¿Qué errores crees que cometiste hoy?» y espera. Déjame decir todos los que me acuerde, sin ayudarme.",
 "2) Luego dame la lista completa, con este formato:",
 "   ✅ LOS QUE ENCONTRASTE: cada error que yo dije, con la forma correcta.",
 "   ❌ LOS QUE SE TE PASARON: Dije: … → Mejor: … (regla corta)",
 "   📝 PALABRAS NUEVAS: palabra = meaning",
 "   ⚖️ EN LA PARTE LEGAL: nombres, números o fechas que me salté o cambié.",
 "3) Después guarda todo en mi Anki tú solo, sin preguntarme, con la herramienta anki_add_cards: cada error → mazo Spanish::Claude Corrections (front = lo que dije; back = cómo se dice bien + la regla corta); cada palabra nueva → mazo Spanish::Vocabulario (front = español; back = inglés).",
 "4) Termina con una sola línea: «Guardado en Anki: X tarjetas» o «No se pudo guardar en Anki». Nunca digas que se guardó si falló."
].join('\n');
const prompts = {
 'Tema corto: yo hablo':"Yo hablo solo, unos 2 minutos sin parar, sobre el tema (si dice un formato, como 📖 Cuéntame o 🤔 ¿Y si…?, lo sigo). Tú escuchas sin interrumpir y sin preguntas. Si me trabo, espera. Cuando termine, dime solo una frase corta de cuate sobre lo que dije.",
 'Según el formato':"Plática de cuates sobre el tema. Sigue el FORMATO que dice el tema (lo que va antes de «·»):\n- 📖 CUÉNTAME: yo cuento la historia. Tú solo me animas a seguir: «¿y luego?», «¿y cómo te sentiste?», «¿qué pasó después?». Una pregunta a la vez.\n- 🤔 ¿Y SI…?: yo contesto. Luego tú me das otro «¿y si…?» que lo complique o lo haga más chistoso, para que use si + subjuntivo y el condicional (si pudiera…, haría…).\n- 🤝 PÓNGANSE DE ACUERDO: tú me das la situación y 4 opciones. Yo quito una, escojo otra y te convenzo. Tú propones otra, con buena onda, y al final nos ponemos de acuerdo. Es plática de amigos, NO un debate.\n- 📰 RESÚMELO: yo resumo. Tú me pides detalles: quién, qué pasó, qué me gustó y por qué.\n- 🧑‍🏫 EXPLÍCAMELO: yo te enseño como si tuvieras 12 años. Tú haces preguntas de alumno curioso.\n- 🕵️ ADIVINA QUÉ ES: yo pienso en algo de ese tipo y lo describo sin decir el nombre. Tú haces preguntas y tratas de adivinar. Cuando adivines, jugamos otra vez.\n- 🎭 ESCENA CON SORPRESA: haz el papel como alguien de verdad. A la mitad mete UN problema que yo no espero.\n- 🔁 4-3-2: cuento lo mismo 3 veces: unos 4 minutos, luego 3, luego 2. No me interrumpas. Entre cada vuelta di solo «Otra vez, ahora más corto». Al final dime en una frase qué salió mejor la última vez.\nTodo en español, nada de inglés. Reacciona corto, con jerga. Nunca hagas varias preguntas seguidas. Si se acaba el tema, sigue con otro del mismo formato.",
 'Plática natural':"Plática normal entre cuates sobre el tema. Todo en español: nada de inglés, nada de traducir. En cada respuesta: 1) reacciona corto, con jerga (¿neta?, no manches, ¿y luego?), 2) a veces cuenta algo tuyo parecido, 3) termina con UNA pregunta sobre lo que yo dije, para que siga contando. Nunca hagas varias preguntas seguidas. Si se acaba el tema, brinca a otro tema de la vida diaria, como pasa en una plática de verdad.",
 'Traducción legal':"Práctica de intérprete de corte (interpretación consecutiva). Haz la escena con todos los papeles: el juez, los abogados y el policía hablan en inglés formal; el cliente, el acusado o el testigo habla en español formal, de usted. Dime UN turno a la vez y di quién habla («JUEZ:», «ABOGADO:», «TESTIGO:»). Empieza con turnos cortos (10 palabras) y sube poco a poco hasta 40 palabras, siempre con nombres, fechas, horas, direcciones y cantidades, porque ahí es donde más fallan los intérpretes. Yo interpreto al otro idioma en primera persona («yo vi el carro», nunca «dice que vio el carro»), sin agregar ni quitar nada. No me digas si estuvo bien: solo sigue con el siguiente turno. Aquí sí usas inglés, solo en los turnos que hay que interpretar.",
 'Inglés → Español':"Dime frases en inglés, de las que dice la gente en la vida diaria. Yo las digo en español y tú sigues con la siguiente. Sube la dificultad poco a poco.",
 'Español → Inglés':"Dime frases en español rápido y natural, como habla la gente en la calle. Yo las digo en inglés. Así entreno el oído.",
 'Intérprete legal':"Tú eres un abogado (en inglés) y también un cliente hispano (en español). Hablen de un poder notarial, una directiva médica o un formulario HIPAA. Yo interpreto los dos lados.",
 'Hazlo natural':"Dime una frase en español que suena a gringo, traducida palabra por palabra. Yo la digo como un nativo y tú sigues con otra. Incluye falsos amigos (embarazada, actual, realizar).",
 'Profesor':"Eres un profesor universitario escéptico. Después de que hable, hazme preguntas difíciles, una a la vez, y pregúntame por qué.",
 'Amigo':"Eres mi compa latino de mi edad. Platica como en la vida real: cuéntame cosas tuyas también, échale humor y usa expresiones comunes. Respuestas cortas para que yo hable más.",
 'Cliente':"Eres un señor hispano de 65 años que viene a mi oficina para hacer un fideicomiso. Habla como cliente de verdad: con dudas, historias de tu familia y preguntas sobre testamentos, poderes y qué pasa cuando uno muere.",
 'Entrevista':"Eres entrevistador para un trabajo en una firma de abogados. Hazme preguntas de entrevista reales, una a la vez.",
 'Periodista':"Eres un periodista que me entrevista sobre mi vida, mi misión y mis metas. Pide detalles y ejemplos.",
 'Subjuntivo':"Platícame de cosas que me obliguen a usar el subjuntivo (ojalá, es importante que, si hubiera…). Una pregunta a la vez.",
 'Futuro':"Pregúntame por mis planes y el futuro, para que use el futuro y el condicional. Una pregunta a la vez.",
 'Sin vergüenza':"Me da mucha vergüenza hablar español. Hazme preguntas fáciles sobre mi vida (mi carrera, mis notas, mi familia) y sube poco a poco. Si no me entiendes, solo pregúntame qué quise decir. Si me trabo, dime \"sigue, vas bien\" y espera. Celebra cuando hable más de 30 segundos sin parar. Al final, dime 2 cosas que hice bien.",
 'Escena real':"Hagamos una escena de la vida real: tú eres el doctor, el mecánico o el empleado del banco (tú eliges). Yo soy el cliente con un problema. Actúa como alguien de verdad, no como maestro.",
 "¿Qué pasaría si…?":"Hazme preguntas de \"¿qué harías si…?\" y \"¿qué pasaría si…?\", una a la vez, para que use el condicional (haría, iría) y el subjuntivo (si tuviera, si pudiera). Cuando conteste, sígueme con otro \"¿y si…?\" que lo complique más o lo haga más chistoso. Platica como amigo, no como examen.",
 "Conocer a alguien":"Hagamos que nos acabamos de conocer (en una fiesta, en la iglesia, en el trabajo o en un vuelo; tú eliges). Platica natural, como la gente de verdad: saludos, de dónde eres, a qué te dedicas, familia, gustos. Cuéntame cosas tuyas también y hazme preguntas de seguimiento. Al final despídanse como se hace de verdad.",
 "Plática de cena":"Estamos cenando juntos (con amigos o con la familia de mi esposa; tú eliges quién eres). Platica como en una cena real: la comida, cómo nos fue en el día, chismes ligeros, planes, historias chistosas. Cambia de tema de forma natural, como pasa en la mesa. Respuestas cortas para que yo hable más."
};
const legalTopics = ["Lectura de cargos: el juez le explica al acusado de qué lo acusan.", "Audiencia de fianza: el juez decide si el acusado sale y con qué condiciones.", "Derechos del acusado: guardar silencio y tener un abogado.", "El acusado pide un abogado de oficio porque no puede pagar uno.", "Acuerdo de culpabilidad: el juez se asegura de que el acusado entiende lo que firma.", "Sentencia: el juez da la pena y las reglas de libertad condicional.", "Violación de libertad condicional: el oficial explica qué hizo mal el acusado.", "Testigo de un accidente de carro: el abogado le pregunta qué vio.", "Contrainterrogatorio: el abogado defensor ataca la historia del testigo.", "Un testigo nervioso que no entiende la pregunta.", "Víctima de un robo en una tienda cuenta lo que pasó.", "Un policía explica cómo hizo el arresto.", "Manejar bajo la influencia (DUI): la prueba de alcohol en la carretera.", "Corte de tránsito: multa por manejar sin licencia.", "Un médico explica las heridas de la víctima.", "Instrucciones del juez al jurado.", "Orden de protección por violencia doméstica.", "Custodia de los hijos en un divorcio.", "Manutención de los hijos: cuánto paga cada papá.", "Desalojo: el dueño y el inquilino discuten la renta.", "Reclamos menores: un mecánico no arregló el carro.", "Un trabajador dice que su patrón no le pagó las horas extra.", "Accidente en el trabajo: el trabajador se cayó de una escalera.", "Un cliente de 65 años quiere hacer su testamento.", "Explicar un fideicomiso en vida a una familia.", "Poder notarial: la hija va a manejar el dinero de su mamá enferma.", "Sucesión (probate): la familia reparte la herencia del abuelo.", "Directiva médica: qué pasa si el cliente no puede decidir en el hospital.", "Tutela: los papás nombran a quién cuida a sus hijos si les pasa algo.", "Firma de documentos con un notario.", "Un cliente firmó un contrato de carro sin leerlo y ahora no puede pagar.", "Demanda por negligencia: un perro mordió a un niño.", "Una caída en el piso mojado de un supermercado.", "Robo de identidad: alguien abrió tarjetas de crédito a nombre del cliente.", "Audiencia de inmigración: el juez pregunta por qué la persona pide asilo.", "Entrevista de visa U para una víctima de un crimen.", "Un menor de edad en corte juvenil con su mamá.", "Deposición: el abogado toma la declaración jurada de un testigo.", "Lectura de una orden de cateo (registro) de la policía.", "Un reporte de policía de un choque en la intersección.", "El juez explica qué es una apelación y el plazo para apelar.", "Mediación: dos vecinos pelean por una cerca.", "Bancarrota: el abogado explica qué deudas se pueden borrar.", "Un cliente pregunta si necesita una LLC para su negocio de jardinería.", "Un inquilino dice que el dueño no arregla la calefacción."];
// Temas por FORMATO (investigación 11/25/26: ACTFL, DELE C1, italki, Nation 4-3-2). Sin debates (Jacob 11/20).
const F = {
 cuenta:['Una vez que te dio un ataque de risa en el peor momento.','Una vez que te perdiste en tu misión.','La vez que levantaste un peso que creías imposible.','Una vez que se te descompuso el carro.','Una vez que alguien te sorprendió con su bondad.','Una vez que cocinaste algo que salió fatal.','Una vez que tuviste que hablar en público sin prepararte.','La vez que ganaste algo.','Una vez que un plan salió completamente al revés.','Una vez que te equivocaste de persona o de lugar.','Una vez que sentiste que Dios te ayudó en algo pequeño.','Una Navidad que fue diferente a las demás.','Una decisión difícil que tuviste que tomar.','Una vez que ayudaste a un desconocido.','Una vez que te dio miedo hablar español y lo hiciste de todos modos.','Algo chistoso que te pasó con tu esposa.','Una vez que te metiste en problemas de niño.','Algo de historia que aprendiste y te voló la cabeza.','Un LEGO o un proyecto que te costó mucho terminar.','La primera vez que fuiste a un lugar que te encantó.','Una vez que se te olvidó algo muy importante.','El jefe o compañero más raro que has tenido.','Una vez que te quedaste sin dinero en el peor momento.','Una película que te cambió la forma de pensar.','Tu primer día en la misión, hora por hora.'],
 testigo:['La coronación de Napoleón en Notre Dame.','La batalla de Waterloo.','La llegada de los pioneros al valle del Lago Salado.','La caída del Muro de Berlín.','El estreno de Star Wars en 1977.','La Primera Visión, contada por un vecino de la familia Smith.'],
 ysi:['¿Qué habría pasado si Napoleón hubiera ganado en Waterloo?','Si pudieras cenar con cualquier persona de la historia, ¿a quién invitarías y qué le preguntarías?','¿Qué harías si mañana te ganaras cien mil dólares?','Si fueras el juez en el juicio de Anakin Skywalker, ¿qué sentencia le darías?','Si no hubieras servido una misión, ¿cómo sería tu vida hoy?','¿Qué harías si mañana te despertaras como juez de la Corte Suprema?','Si pudieras vivir en cualquier ciudad de Latinoamérica, ¿cuál sería y cómo sería tu día?','¿Qué harías con un día entero sin celular?','Si pudieras aprender cualquier habilidad en una noche, ¿cuál sería?','¿Qué pasaría si todos en Utah hablaran español?','Si pudieras volver a cualquier día de tu vida, ¿cuál sería?','¿Qué harías si te ofrecieran trabajo de abogado en México?','Si pudieras diseñar tu propio set de LEGO, ¿cómo sería?','Si pudieras darle un consejo a tu yo de 15 años, ¿qué le dirías?','¿Qué harías si toda tu familia viniera a vivir contigo un mes?','Si fueras alcalde de Provo por una semana, ¿qué cambiarías primero?','Si pudieras platicar con un profeta del Libro de Mormón, ¿con quién y de qué hablarían?','¿Qué harías si te quedaras atorado en un elevador con alguien famoso?'],
 acuerdo:['Una cita con tu esposa con solo 20 dólares.','El barrio tiene dinero para un solo proyecto: gimnasio, biblioteca, parque o centro para jóvenes.','Un viaje de 4 días: Ciudad de México, Madrid, Buenos Aires o Nueva York.','Qué cenar el domingo con toda la familia.','Tu bufete quiere más clientes hispanos: radio, redes sociales, anuncios o eventos.','Un regalo de Navidad para tu papá con 50 dólares.','Una actividad para los jóvenes del barrio.','Qué hacer con un bono de mil dólares: ahorrar, invertir, viajar o pagar deudas.','Qué película ver esta noche.','Cómo repartir las tareas de la casa.'],
 resume:['El último libro o audiolibro que escuchaste.','Un discurso de la Conferencia General que te marcó.','Tu película favorita de Star Wars, sin saltarte nada importante.','Un caso famoso de la Corte Suprema.','Tu última clase en BYU.','La vida de Napoleón en 5 minutos.','Una noticia que leíste esta semana.','Un capítulo del Libro de Mormón.','Un pódcast o video que viste hace poco.'],
 explica:['Cómo hacer bien una sentadilla.','Qué es un fondo indexado.','Qué es un fideicomiso.','Cómo se prepara uno para el LSAT.','Cómo usar una tarjeta de crédito sin endeudarte.','Cómo se hace tu comida favorita.','Qué hace un abogado en un día normal.','Cómo funciona tu programa de pesas (Texas Method).','Cómo funciona un juicio con jurado.','Cómo ahorrar para comprar una casa.','Cómo se elige al presidente de Estados Unidos.','Qué fue la Revolución francesa.'],
 adivina:['Un objeto de tu cuarto.','Un personaje de Star Wars.','Una comida mexicana.','Un personaje famoso de la historia.'],
 escena:['Llamas al banco porque te cobraron dos veces.','Devuelves algo roto a la tienda y no tienes el recibo.','Eres abogado y le explicas a tu cliente que perdió su caso.','Entrevista de trabajo en un bufete de Madrid.','Pides comida en un puesto de tacos en México.','Rentas un carro en el aeropuerto de Guadalajara.','Vas al doctor porque te lastimaste en el gimnasio.','Un amigo te pregunta con respeto por tu fe.','Llegas a cenar con la familia latina de un amigo.','Hablas con el dueño de tu apartamento porque no hay agua caliente.','Tu hermano menor no sabe si irse de misión.','Llamas a la aerolínea porque perdieron tu maleta.']
};
const topics = [].concat(
 F.cuenta.map(t=>'📖 Cuéntame · '+t),
 F.testigo.map(t=>'📖 Cuéntame como si hubieras estado ahí · '+t),
 F.ysi.map(t=>'🤔 ¿Y si…? · '+t),
 F.acuerdo.map(t=>'🤝 Pónganse de acuerdo · '+t),
 F.resume.map(t=>'📰 Resúmelo · '+t),
 F.explica.map(t=>'🧑‍🏫 Explícamelo como si tuviera 12 años · '+t),
 F.adivina.map(t=>'🕵️ Adivina qué es · Describe sin decir el nombre: '+t.toLowerCase()),
 F.escena.map(t=>'🎭 Escena con sorpresa · '+t),
 F.cuenta.concat(F.explica).map(t=>'🔁 4-3-2 · '+t)
);
const everyday = topics;
const short = topics.filter(t=>/^(📖|🤔|🧑‍🏫|📰)/.test(t));
const lists = {everyday, short, legal:legalTopics};
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* La sesión sigue aunque el almacenamiento esté bloqueado. */ } }
const blocks = [
 {name:'Oración',seconds:60,tone:'quiet',instruction:'Ora en voz alta en español. La IA solo escucha.',fixed:'Voy a orar en voz alta en español. Escucha en silencio hasta que diga «amén». Después de «amén» no digas nada.'},
 {name:'Calentamiento',seconds:120,tone:'friend',instruction:'Un tema natural. Habla tú 2 minutos sin parar. La IA no te interrumpe.',prompt:'Tema corto: yo hablo',list:'short',menu:['Tema corto: yo hablo','Según el formato','Plática natural','Sin vergüenza']},
 {name:'Tema 1 · Plática',seconds:780,tone:'friend',instruction:'Un formato distinto cada día (historia, ¿y si…?, escena…). La IA sigue el formato. Todo en español.',prompt:'Según el formato',list:'everyday',menu:['Según el formato','Plática natural','Amigo','Plática de cena','Conocer a alguien','Escena real',"¿Qué pasaría si…?",'Sin vergüenza','Subjuntivo','Futuro']},
 {name:'Tema 2 · Traducción legal',seconds:720,tone:'formal',instruction:'Formal, como en la corte. Interpreta en primera persona: «yo», no «él dice».',prompt:'Traducción legal',list:'legal',menu:['Traducción legal','Intérprete legal','Cliente','Inglés → Español','Español → Inglés']},
 {name:'Tema final',seconds:120,tone:'friend',instruction:'Otro tema natural. Tú hablas 2 minutos. Luego dices tus errores y la IA te da la lista.',prompt:'Tema corto: yo hablo',list:'short',last:true,menu:['Tema corto: yo hablo','Según el formato','Plática natural','Sin vergüenza']}
];
const RECENT_KEY='spanish-recent-topics';
function pickTopic(list, current){ const fresh=list===everyday||list===short; const recent=fresh?read(RECENT_KEY,[]):[]; let pool=list.filter(t=>t!==current&&!recent.includes(t)); if(!pool.length) pool=list.filter(t=>t!==current); const t=pool[Math.floor(Math.random()*pool.length)]; if(fresh) save(RECENT_KEY,[t].concat(recent.filter(x=>x!==t)).slice(0,80)); return t; }
blocks.forEach(b=>{if(b.list)b.topic=b.list!=='legal'?null:lists[b.list][Math.floor(Math.random()*lists[b.list].length)];});
const TODAY=new Date().toDateString();
const choices = read('spanish-choices-v4', []);
const sameDay = read('spanish-choices-day','')===TODAY;
blocks.forEach((block, i) => {
 if (block.list && choices[i]) { if(lists[block.list].includes(choices[i].topic) && (block.list==='legal'||sameDay)) block.topic=choices[i].topic; if(block.menu.includes(choices[i].prompt)) block.prompt=choices[i].prompt; }
});
blocks.forEach(b=>{if(b.list&&!b.topic)b.topic=pickTopic(lists[b.list],null);});
function stepText(b){ return b.fixed || `${prompts[b.prompt]}\n${b.list==='legal'?'LA ESCENA':'EL TEMA'}: ${b.topic}`; }
function fullPrompt(b) {
 const end = b.last ? 'Este es el ÚLTIMO paso. Cuando yo termine, haz lo de «AL FINAL».' : 'Todavía NO hagas lo de «AL FINAL». Sigue apuntando mis errores en secreto: habrá más pasos en este mismo chat.';
 return [`ESTE PASO: ${b.name.toUpperCase()}\n${stepText(b)}`, TONE[b.tone], WAIT, end, FIX].join('\n\n'); }
// Todo en un solo mensaje: Claude guía los 5 pasos en modo de voz, sin volver a la app.
function sessionPrompt(){
 const steps=blocks.map((b,i)=>`PASO ${i+1} · ${b.name.toUpperCase()} · ${Math.round(b.seconds/60)} min\n${TONE[b.tone]}\n${stepText(b)}`).join('\n\n');
 return ['Hoy hago mi práctica de español de 30 minutos, toda en modo de voz. Tú me guías por los 5 pasos, en orden. Yo no voy a escribir ni pegar nada más.',
  'LOS 5 PASOS (cada paso tiene su propio TONO; síguelo solo en ese paso)',
  steps,
  'CÓMO PASAR DE UN PASO A OTRO: Al empezar cada paso, di en una frase corta qué paso es y el tema. Cuando se acabe su tiempo, espera a que termine mi frase, di «Siguiente paso» y empieza el siguiente. Si no puedes ver la hora, cuenta mis turnos: cada turno mío con tu respuesta es más o menos 1 minuto. Si digo «siguiente», pasa al siguiente paso.',
  WAIT,
  FIX,
  'EMPIEZA AHORA: di solo «Paso 1, la oración. Cuando quieras.» y espera.'].join('\n\n');
}
if($('all-voice')){$('all-voice').onclick=()=>{const b=$('all-voice');copyText(sessionPrompt(),{closest:()=>({}),focus(){},select(){}},$('all-status'),b);openChat();};}
function storeChoices(){save('spanish-choices-v4',blocks.map(b=>({topic:b.topic,prompt:b.prompt})));save('spanish-choices-day',TODAY);}
async function copyText(text, area, status, button) {
 let copied=false;
 try { if(navigator.clipboard?.writeText) {await navigator.clipboard.writeText(text);copied=true;} } catch { /* Se intenta el método de Safari. */ }
 if(!copied) {
  const input=document.createElement('textarea');input.value=text;input.setAttribute('readonly','');input.style.cssText='position:fixed;top:0;left:0;opacity:0;font-size:16px';document.body.append(input);
  input.focus();input.select();input.setSelectionRange(0,text.length);
  try {copied=document.execCommand('copy');} catch {copied=false;}
  input.remove();button.focus({preventScroll:true});
 }
 if(copied){const label=button.dataset.label||(button.dataset.label=button.textContent);status.textContent='¡Copiado!';button.textContent='¡Copiado!';setTimeout(()=>{button.textContent=label;status.textContent='';},2200);}
 else {area.closest('details').open=true;area.focus();area.select();status.textContent='Mantén pulsado el texto y elige Copiar.';}
}
if($('blocks'))blocks.forEach((b,i)=>{
 const card=document.createElement('article');card.className='panel block';card.id=`block-${i}`;
 card.innerHTML=`<div class="block-heading"><h3>${b.name}</h3><span class="duration">${format(b.seconds)}</span></div><p class="muted">${b.instruction}</p>`;
 if(b.topic){
  const topic=document.createElement('p');topic.className='topic';topic.textContent=b.topic;card.append(topic);
  const list=lists[b.list];
  if(b.pick){const pl=document.createElement('label');pl.htmlFor=`topic-${i}`;pl.textContent='Escoge tu tema';const ps=document.createElement('select');ps.id=pl.htmlFor;list.forEach(t=>{const o=document.createElement('option');o.value=o.textContent=t;ps.append(o);});ps.value=b.topic;ps.onchange=()=>{b.topic=ps.value;topic.textContent=b.topic;update();storeChoices();};card.append(pl,ps);}
  else{const change=document.createElement('button');change.className='secondary topic-change';change.textContent='Otro tema';change.onclick=()=>{b.topic=pickTopic(list,b.topic);topic.textContent=b.topic;update();storeChoices();};card.append(change);}
  const label=document.createElement('label');label.htmlFor=`prompt-${i}`;label.textContent='Cómo practicar';card.append(label);
  const select=document.createElement('select');select.id=label.htmlFor;
  b.menu.forEach(name=>{const option=document.createElement('option');option.value=option.textContent=name;select.append(option);});select.value=b.prompt;
  select.onchange=()=>{b.prompt=select.value;update();storeChoices();};card.append(select);
 }
 const copy=document.createElement('button');copy.className='copy';copy.textContent='Copiar';copy.setAttribute('aria-label',`Copiar texto de ${b.name}`);
 const status=document.createElement('p');status.className='copy-status';status.setAttribute('role','status');
 const go=document.createElement('button');go.className='copy go';go.textContent='Copiar y abrir chat';go.setAttribute('aria-label',`Copiar texto de ${b.name} y abrir el chat`);
 const details=document.createElement('details');details.className='prompt-view';details.open=true;
 const summary=document.createElement('summary');summary.textContent='Ver texto';
 const area=document.createElement('textarea');area.readOnly=true;area.setAttribute('aria-label',`Texto de ${b.name}`);
 details.append(summary,area);card.append(copy,go,status,details);$('blocks').append(card);
 function update(){area.value=fullPrompt(b);status.textContent='';}update();
 copy.onclick=()=>copyText(fullPrompt(b),area,status,copy);
 go.onclick=()=>{copyText(fullPrompt(b),area,status,go);openChat();};
});
function format(s){s=Math.max(0,Math.ceil(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
let audio;
function unlockAudio(){try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{/* El temporizador funciona sin sonido. */}}
function signal(){try{navigator.vibrate?.([160,80,160]);}catch{}try{if(!audio||audio.state!=='running')return;[0,.32].forEach(delay=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+delay;o.frequency.value=740;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.2,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.32);});}catch{}}
// Sincroniza el temporizador entre el teléfono y la Mac (ntfy.sh, gratis, sin cuenta).
const SYNC='https://ntfy.sh/jf-espanol-7455b5f7188f309eda8f';
const DEVICE=Math.random().toString(36).slice(2);
const timers={};
function pushSync(key,state){try{fetch(SYNC,{method:'POST',body:JSON.stringify({key,state,from:DEVICE})}).catch(()=>{});}catch{}}
function applySync(text){try{const m=JSON.parse(text);if(m&&m.from!==DEVICE&&timers[m.key])timers[m.key].apply(m.state);}catch{}}
async function pullSync(){try{const r=await fetch(SYNC+'/json?poll=1&since=12h',{cache:'no-store'});if(!r.ok)return;(await r.text()).split('\n').forEach(line=>{try{const e=JSON.parse(line);if(e.event==='message')applySync(e.message);}catch{}});}catch{}}
function listenSync(){try{const es=new EventSource(SYNC+'/sse');es.onmessage=e=>{try{const d=JSON.parse(e.data);if(d.event==='message')applySync(d.message);}catch{}};}catch{}}
// Un inicio absoluto por bloque evita perder tiempo al dormir o recargar.
function makeTimer(key,durations,onPaint){
 const initial=()=>({index:0,left:durations[0],startedAt:null});
 let state=read(key,initial());
 if(!state||!Number.isInteger(state.index)||state.index<0||state.index>durations.length||!Number.isFinite(state.left)||state.left<0||state.left>(durations[state.index]??0)||(state.startedAt!==null&&(!Number.isFinite(state.startedAt)||state.startedAt<=0)))state=initial();
 function valid(st){return st&&Number.isInteger(st.index)&&st.index>=0&&st.index<=durations.length&&Number.isFinite(st.left)&&st.left>=0&&st.left<=(durations[st.index]??0)&&(st.startedAt===null||(Number.isFinite(st.startedAt)&&st.startedAt>0));}
 function persist(share){if(share){state.at=Date.now();pushSync(key,state);}save(key,state);}
 function remaining(){return state.startedAt===null?state.left:state.left-(Date.now()-state.startedAt)/1000;}
 function tick(){let changed=false;
  while(state.startedAt!==null&&remaining()<=0&&state.index<durations.length){const boundary=state.startedAt+state.left*1000;state.index++;state.left=durations[state.index]||0;state.startedAt=state.index<durations.length?boundary:null;changed=true;}
  if(changed){persist();signal();}paint();
 }
 function paint(){onPaint({...state,remaining:Math.max(0,remaining()),finished:state.index===durations.length});}
 const api={tick,apply(remote){if(!valid(remote)||(remote.at||0)<=(state.at||0))return;state={index:remote.index,left:remote.left,startedAt:remote.startedAt,at:remote.at};save(key,state);tick();},toggle(){unlockAudio();tick();if(state.startedAt!==null){state.left=Math.max(0,remaining());state.startedAt=null;}else{if(state.index===durations.length)state=initial();state.startedAt=Date.now();}persist(true);paint();},skip(){unlockAudio();tick();if(state.index>=durations.length)return;const running=state.startedAt!==null;state.index++;state.left=durations[state.index]||0;state.startedAt=running&&state.index<durations.length?Date.now():null;persist(true);signal();paint();},reset(){state=initial();persist(true);paint();}};
 timers[key]=api;return api;
}
const timer=$('clock')&&makeTimer('spanish-timer-v3',blocks.map(b=>b.seconds),s=>{
 $('clock').textContent=format(s.remaining);$('current').textContent=s.finished?'¡Terminaste!':blocks[s.index].name;$('step-badge').textContent=s.finished?'30 MIN EN TOTAL':`PASO ${s.index+1} DE ${blocks.length} · ${Math.round(blocks[s.index].seconds/60)} MIN`;
 $('next-action').textContent=s.finished?'Buen trabajo. Vuelve mañana.':blocks[s.index].instruction;
 $('start').textContent=s.startedAt!==null?'Pausar':s.finished?'Empezar de nuevo':s.remaining<blocks[s.index].seconds?'Continuar':'Empezar';
 $('skip').disabled=s.finished;
 $('progress').value=blocks.slice(0,s.index).reduce((sum,b)=>sum+b.seconds,0)+(s.finished?0:blocks[s.index].seconds-s.remaining);
 $('timer-status').textContent=s.finished?'Sesión completa.':s.startedAt!==null?'En marcha · un paso a la vez.':'Copia el texto de '+blocks[s.index].name+' y empieza.';
 blocks.forEach((b,i)=>{const card=$(`block-${i}`);card.classList.toggle('active',i===s.index);card.classList.toggle('done',i<s.index);if(i===s.index)card.setAttribute('aria-current','step');else card.removeAttribute('aria-current');});
});
if(timer){$('start').onclick=()=>timer.toggle();$('skip').onclick=()=>timer.skip();$('reset').onclick=()=>timer.reset();}
const drill=$('drill-clock')&&makeTimer('spanish-drill-v1',[240,180,120],s=>{$('drill-clock').textContent=format(s.remaining);$('drill-round').textContent=s.finished?'¡Listo! ¿Fue más fácil la última vuelta?':`Vuelta ${s.index+1} de 3 · la misma historia`;$('drill-start').textContent=s.startedAt!==null?'Pausar':s.finished?'Otra vez':s.remaining<[240,180,120][s.index]?'Continuar':'Empezar';});
if(drill){$('drill-start').onclick=()=>drill.toggle();$('drill-reset').onclick=()=>drill.reset();}
timer&&timer.tick();drill&&drill.tick();setInterval(()=>{timer&&timer.tick();drill&&drill.tick();},250);document.addEventListener('visibilitychange',()=>{timer&&timer.tick();drill&&drill.tick();if(!document.hidden)pullSync();});
pullSync();listenSync();window.addEventListener('focus',pullSync);
let vocabulary=[],filter='';
const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
if($('filters'))['Vocabulario','Legal','Correcciones'].forEach(group=>{const b=document.createElement('button');b.textContent=group;b.setAttribute('aria-pressed','false');b.onclick=()=>{filter=filter===group?'':group;[...$('filters').children].forEach(c=>c.setAttribute('aria-pressed',String(c.textContent===filter)));renderVocab();};$('filters').append(b);});
function renderVocab(){
 const term=normalize($('search').value.trim());
 const rows=vocabulary.filter(v=>(!filter||v.grupo===filter)&&normalize(v.es+' '+v.en).includes(term));
 $('vocab-groups').replaceChildren();
 rows.forEach(v=>{const fix=v.grupo==='Correcciones';const row=document.createElement('div');row.className='vrow'+(fix?' fix':'');
  const es=document.createElement('span');es.className='es';es.textContent=fix?'Dije: '+v.es:v.es;
  const en=document.createElement('span');en.textContent=fix?'Mejor: '+v.en:v.en;row.append(es,en);$('vocab-groups').append(row);});
 $('count').hidden=false;$('count').textContent=rows.length?`${rows.length} ${rows.length===1?'palabra':'palabras'}`:'No hay coincidencias.';
}
async function loadVocab(){try{const response=await fetch('vocab.json',{cache:'no-cache'});if(!response.ok)throw Error();const data=await response.json();if(!Array.isArray(data)||!data.every(v=>typeof v.es==='string'&&typeof v.en==='string'&&['Vocabulario','Legal','Correcciones'].includes(v.grupo)))throw Error();vocabulary=data;save('spanish-vocab',data);$('retry-vocab').hidden=true;renderVocab();}catch{vocabulary=read('spanish-vocab',[]);if(vocabulary.length)renderVocab();else {$('count').hidden=false;$('count').textContent='No se pudo cargar el vocabulario. Abre la app desde un servidor local o vuelve a intentarlo con conexión.';}$('retry-vocab').hidden=false;}}
if($('search')){$('search').oninput=renderVocab;$('retry-vocab').onclick=loadVocab;loadVocab();}
const connectorGroups=[
 ['Preposiciones','Relacionan una palabra con otra. Úsalas para decir lugar, tiempo, causa o destino.',[
 ['a','Dirección, hora o persona que recibe una acción.','Voy a la iglesia a las nueve.'],['con','Compañía o instrumento.','Hablo con mi abogado.'],['en','Lugar o momento.','El contrato está en la mesa.'],['de','Origen, posesión o tema.','Hablamos de la fe.'],['para','Meta, destino o para quién.','Este poder es para mi madre.'],['por','Causa, medio, a cambio o por dónde. Para = meta; por = causa o camino.','Te lo envío por correo por tu seguridad.'],['sin','Algo que falta.','No firmes sin leer.'],['sobre','Tema o posición encima.','La lección es sobre la oración.'],['entre','En medio de dos o más.','Es un acuerdo entre dos personas.'],['hasta','Límite de tiempo o lugar.','Trabajo hasta las cinco.'],['desde','Punto de inicio.','Vivo aquí desde enero.'],['hacia','Dirección aproximada.','Camino hacia el templo.'],['contra','Oposición o contacto.','Votaron contra la propuesta.']]],
 ['Relativos','Unen frases sobre personas o cosas para no repetir sus nombres. Úsalos para añadir información.',[
 ['que','Para personas o cosas.','El libro que leo es interesante.'],['quien','Solo una persona; después de una preposición o entre comas.','La abogada con quien hablé me ayudó.'],['quienes','Solo dos o más personas; después de preposición o entre comas.','Los misioneros, quienes llegaron ayer, nos visitan.'],['el que / la que / los que / las que','Señalan una persona o cosa; concuerdan en género y número.','La que firma es mi madre.'],['lo que','Una idea o algo sin nombre concreto.','No entiendo lo que dice el contrato.'],['cuyo / cuya / cuyos / cuyas','Posesión: concuerda con la cosa poseída, no con su dueño.','El cliente cuya casa vendimos está contento.'],['donde','Un lugar.','Esta es la capilla donde me bauticé.']]],
 ['Conjunciones','Unen palabras o ideas. Úsalas para sumar, elegir, explicar o mostrar un contraste.',[
 ['y / e','Suma ideas. Usa e antes del sonido i (i-/hi-); no ante el sonido de hielo.','Estudiamos español e historia.'],['o / u','Da opciones. Usa u antes del sonido o (o-/ho-).','¿Mañana u hoy?'],['pero','Contraste entre dos ideas.','Es difícil, pero puedo hacerlo.'],['sino','Corrige una idea después de un no.','No es un testamento, sino un poder.'],['porque','Explica una causa.','Oro porque necesito ayuda.'],['aunque','Algo no impide la otra acción.','Voy aunque llueva.'],['entonces','Resultado o siguiente momento.','Terminó la reunión; entonces salimos.'],['así que','Resultado de lo que acabas de decir.','Ya leí el contrato, así que puedo firmar.'],['mientras','Dos acciones al mismo tiempo.','Escucho mientras camino.'],['cuando','El momento de una acción.','Te llamo cuando llegue.'],['si','Una condición; sin tilde.','Si tienes dudas, pregunta.']]]
];
if($('conectores'))connectorGroups.forEach(([name,concept,words])=>{const section=document.createElement('section');section.className='connector-group';const heading=document.createElement('h4');heading.textContent=name;const intro=document.createElement('p');intro.textContent=concept;section.append(heading,intro);words.forEach(([word,meaning,example])=>{const item=document.createElement('div');item.className='connector';const strong=document.createElement('strong');strong.textContent=word;const p=document.createElement('p');p.textContent=meaning;const ex=document.createElement('p');ex.className='example';ex.textContent=example;item.append(strong,p,ex);section.append(item);});$('conectores').append(section);});
const questions=[
 ['Voy ___ la iglesia.',['a','de','sin'],'a','A indica el destino.'],
 ['Este regalo es ___ mi madre.',['por','para','contra'],'para','Para indica para quién es algo.'],
 ['Envié el contrato ___ correo.',['para','entre','por'],'por','Por indica el medio que usas.'],
 ['No firmes ___ leer el poder.',['sin','hacia','desde'],'sin','Sin indica algo que falta hacer.'],
 ['Vivo en Utah ___ enero.',['hasta','desde','sobre'],'desde','Desde marca el punto de inicio.'],
 ['La escritura ___ leí habla de la fe.',['que','quien','cuyo'],'que','Que une la frase con una cosa: la escritura.'],
 ['La abogada con ___ hablé me ayudó.',['donde','quien','lo que'],'quien','Quien se usa para una persona después de una preposición.'],
 ['Los misioneros, ___ llegaron ayer, nos visitan.',['quien','quienes','cuya'],'quienes','Quienes se refiere a varias personas entre comas.'],
 ['El cliente ___ casa vendimos está contento.',['cuyo','que','cuya'],'cuya','Cuya concuerda con casa, femenino singular.'],
 ['No entiendo ___ dice el contrato.',['lo que','quienes','donde'],'lo que','Lo que se refiere a una idea sin nombre concreto.'],
 ['Esta es la capilla ___ me bauticé.',['quien','donde','cuyos'],'donde','Donde se refiere a un lugar.'],
 ['Estudio español ___ historia.',['y','e','u'],'e','Y cambia a e antes del sonido i de historia.'],
 ['¿Quieres venir mañana ___ hoy?',['o','e','u'],'u','O cambia a u antes del sonido o de hoy.'],
 ['No es un testamento, ___ un poder.',['pero','sino','porque'],'sino','Sino corrige una idea después de no.'],
 ['Oro ___ necesito ayuda.',['aunque','porque','mientras'],'porque','Porque explica la causa de la oración.']
];
function shuffle(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function renderQuiz(){let score=0,answered=0;$('score').textContent='0 de 15 · 0 respuestas';$('quiz').replaceChildren();shuffle(questions).forEach(([text,options,answer,why])=>{const item=document.createElement('article');item.className='question';const sentence=document.createElement('p');sentence.textContent=text;const answers=document.createElement('div');answers.className='answers';const feedback=document.createElement('p');feedback.className='feedback';feedback.setAttribute('role','status');shuffle(options).forEach(option=>{const b=document.createElement('button');b.textContent=option;b.setAttribute('aria-label',text.replace('___',option));b.onclick=()=>{answered++;const right=option===answer;if(right)score++;[...answers.children].forEach(c=>{c.disabled=true;if(c.textContent===answer)c.classList.add('correct');});b.classList.add(right?'correct':'wrong');feedback.textContent=`${right?'✅':'❌'} ${right?'Bien.':`La respuesta es «${answer}».`} ${why}`;$('score').textContent=`${score} de 15 · ${answered} respuestas`;};answers.append(b);});item.append(sentence,answers,feedback);$('quiz').append(item);});}
if($('quiz')){$('again').onclick=renderQuiz;renderQuiz();}
const tips=[
 ['Mientras hablas',['Sigue hablando. Si no sabes una palabra, explícala con otras palabras en español.','Haz una pausa en silencio en vez de decir «este» o «eh».','Habla desde la parte delantera de la boca. Al descansar, deja la punta de la lengua detrás de los dientes inferiores.','Usa vocales claras y cortas: a, e, i, o, u. Sonríe con i y e; redondea los labios con o y u.','Une las palabras. Usa un conector como aunque, sin embargo o por eso.','Usa a propósito la regla de gramática de esta semana.']],
 ['Hablar con la IA',['Busca el error antes de que te diga la respuesta.','Pide respuestas cortas para hablar tú más tiempo.','Practica un tiempo verbal: «Pregúntame del futuro».','Ensaya una entrevista de trabajo, una consulta médica o una reunión con un cliente.','Al terminar, lee el texto de la charla y busca errores que repites.']],
 ['Podcasts · en el coche o al caminar',['Escucha en español: primero busca la idea principal, luego repite las partes difíciles.','Anota frases que usa la gente y úsalas esa semana. Pausa y repite una frase con el mismo ritmo.','Prueba Radio Ambulante (historias de América Latina), El Hilo (noticias) o Hoy Hablamos (España).','Elige temas que te gusten para seguir escuchando.']],
 ['Tus grabaciones · los sábados',['Usa Notas de Voz en el iPhone o Mac. Habla dos minutos sobre tu semana sin parar.','Escucha una vez: busca muletillas, palabras en inglés y palabras que repites mucho.','Elige solo tres cosas para mejorar y vuelve a grabar el mismo tema.','Guarda tus grabaciones en Notas de Voz y compáralas después de un mes. Poco a poco, llega a cuatro o cinco minutos.']],
 ['Libro de gramática · los lunes, 10 minutos',['Lee los ejemplos e intenta descubrir la regla. Luego lee la explicación.','Haz los ejercicios en voz alta y revisa las respuestas.','Crea cinco frases tuyas con la regla y úsala al hablar ese día.','Lleva una lista de los errores que repites. Diez minutos bastan.']],
 ['Piensa en español · durante el día',['Narra lo que haces: «Ahora abro la puerta…». Planea tu día en español.','Habla contigo mismo al conducir o al ducharte.','Anota las palabras que no sabes; búscalas después y mándalas a Claude para Anki.','Ora una vez al día en español. Pon tu teléfono en español. Antes de dormir, cuenta tu día en tu mente.']],
 ['Personas reales · cuando puedas',['Habla con una persona que hable español cada vez que tengas oportunidad. Ese día puede reemplazar la charla con la IA.','Practicar un poco cada día ayuda más que hacer mucho de una vez. Ponte de pie y usa las manos. Equivocarte está bien: sigue hablando.']],
 ['Sonidos claros y naturales',['Vocales puras: di «no, se, mi, tu» frente a un espejo. Los labios y la mandíbula no deben moverse al final de la vocal. Si la barbilla se mueve al terminar «no», estás cambiando el sonido.','Sin soplo fuerte en p, t, k: sostén un papel frente a la boca y di «papá, taco, casa». El papel casi no debe moverse.','La r de «pero» y «caro» es un toque rápido, como el sonido central de butter en inglés americano. Vibra para rr en «perro» y r inicial en «rojo».','Suaviza d, b y g entre vocales. En «nada», la d se parece al th de this. En «lobo», los labios casi se tocan. En «lago», la lengua casi toca el paladar.','Para t y d, toca con la punta de la lengua la parte de atrás de los dientes superiores: «tú, dos, todo».']],
 ['Ritmo y fluidez',['Une vocales entre palabras: «mi amigo está en casa» → «mia-mi-goes-táen-ca-sa».','Une una consonante con la vocal siguiente: «los otros» → «lo-so-tros».','Da un tiempo parecido a cada sílaba, sin pausas entre palabras.','Imita cinco minutos de una grabación: misma velocidad, ritmo y tono.']],
 ['Personas a quienes imitar · 5 a 10 minutos',['Easy Spanish: entrevistas en la calle en México, América Latina y España, con subtítulos en español. Empieza con entrevistas en México.','Dreaming Spanish: usa los videos avanzados, con habla clara y natural.','Butterfly Spanish: formas de hablar y diferencias entre países. María Español: entrevistas y lenguaje coloquial.','Reproduce una frase, pausa y repítela con la misma melodía. Primero el ritmo, luego las palabras. Si va muy rápido, usa 0,75 de velocidad. Repite el mismo video toda la semana.']],
 ['Palabras de la gente',['Muletillas naturales: pues, bueno, o sea, la verdad, es que, ¿no?','Reacciones: ¡qué padre! (México), ¡qué bueno!, ¿en serio?, no manches (México), ¡ándale!','Diminutivos: ahorita, un ratito, cafecito, poquito.','Elige un acento y mantenlo. El de tu misión está bien.']],
 ['Trampas del inglés',['realize → darse cuenta; realizar significa hacer o llevar a cabo.','Para un trabajo: solicitar, en vez de aplicar.','Di «tiene sentido», «estoy emocionado», «por otro lado» y «devolver la llamada». Evita «hace sentido», «estoy excitado», «en la otra mano» y «llamar para atrás».']]
];
if($('tips'))tips.forEach(([title,lines])=>{const item=document.createElement('article');item.className='tip';const h=document.createElement('h3');h.textContent=title;const list=document.createElement('ul');lines.forEach(line=>{const li=document.createElement('li');li.textContent=line;list.append(li);});item.append(h,list);$('tips').append(item);});
// Se actualiza sola: si hay una versión nueva, la app se recarga una vez.
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
 const hadController=!!navigator.serviceWorker.controller;let reloaded=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!reloaded){reloaded=true;location.reload();}});
 navigator.serviceWorker.register('sw.js').then(reg=>{const check=()=>reg.update().catch(()=>{});check();document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});}).catch(()=>{ /* Una primera visita sin conexión no puede instalar la caché. */ });
}
