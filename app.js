'use strict';
const $ = id => document.getElementById(id);
const WAIT = "Antes de hablar, espera. Dame tiempo para pensar. Si me callo, no hables: espera por lo menos 5 segundos. Si quieres, di solo 'Tómate tu tiempo' o 'Sigue' y espera otra vez. Responde solo cuando yo diga 'listo' o cuando claramente terminé. Nunca me interrumpas. Habla despacio y con frases cortas.";
const FIX = 'Si cometo un error, no me des la respuesta: dime que hay un error y déjame arreglarlo yo. Al final, dame 2 palabras más avanzadas. Guarda automáticamente las palabras nuevas y mis correcciones en Anki si tienes esa función disponible. Si no puedes guardarlas, dámelas listas para añadir a Anki y no digas que las guardaste.';
const prompts = {
 'Inglés → Español':'Dime una frase en inglés. Yo la digo en español. Corrígeme y dame la forma más natural. Sube la dificultad poco a poco.',
 'Español → Inglés':'Dime una frase en español, rápido y natural, como habla la gente. Yo la digo en inglés. Así entreno el oído.',
 'Intérprete legal':'Tú eres un abogado (habla en inglés) y un cliente hispano (habla en español). Explica un poder notarial, una directiva médica o un formulario HIPAA. Yo interpreto los dos lados. Corrige mis palabras legales.',
 'Misionero en español':'Lee una frase del evangelio en inglés (de Predicad Mi Evangelio o una escritura). Yo la digo en español, como si enseñara una lección.',
 'Hazlo natural':'Dime una frase en español que suena a gringo, traducida palabra por palabra. Yo la digo como lo diría un nativo. Incluye falsos amigos (embarazada, actual, realizar).',
 'Profesor':'Actúa como un profesor universitario escéptico. Después de que hable, hazme preguntas difíciles, una a la vez, y pregúntame por qué.',
 'Debate':'Vamos a debatir. Yo elijo un tema y tú tomas el lado contrario. Desafía mis argumentos y no me dejes ganar fácil.',
 'Amigo':'Actúa como un amigo latino de mi edad. Habla natural, con expresiones comunes, y cuéntame cosas de tu vida también. Respuestas cortas para que yo hable más.',
 'Cliente':'Actúa como un cliente hispano de 65 años que viene a mi oficina para hacer un fideicomiso. Hazme preguntas sobre testamentos, poderes y qué pasa cuando uno muere.',
 'Entrevista':'Actúa como entrevistador para un trabajo en una firma de abogados. Hazme preguntas de entrevista reales, una a la vez.',
 'Investigador':'Actúa como un investigador con dudas sinceras sobre la Iglesia. Hazme preguntas difíciles mientras te enseño una lección.',
 'Periodista':'Actúa como un periodista que me entrevista sobre mi vida, mi misión y mis metas. Pide detalles y ejemplos.',
 'Subjuntivo':'Hazme preguntas que me obliguen a usar el subjuntivo (ojalá, es importante que, si hubiera…). Una pregunta a la vez.',
 'Futuro':'Hazme preguntas sobre mis planes y el futuro, para que use el futuro y el condicional. Una pregunta a la vez.',
 'Sin vergüenza':'Me da mucha vergüenza hablar español. Ayúdame a hablar sin miedo. Hazme preguntas fáciles sobre mi vida (mi carrera, mis notas, mi familia) y sube poco a poco. No corrijas cada error: corrige solo lo que no se entiende. Si me trabo, dime "sigue, vas bien" y espera. Celebra cuando hable más de 30 segundos sin parar. Al final, dime 2 cosas que hice bien.',
 'Escena real':'Hagamos una escena de la vida real: tú eres el doctor, el mecánico o el empleado del banco (tú eliges). Yo soy el cliente con un problema.'
};
const topics = ['Cuenta tu día de hoy con todos los detalles.','Explica algo interesante que aprendiste esta semana.','Piensa en una noticia reciente y da tu opinión por 3 minutos.','¿Debes decirle la verdad a un amigo aunque lo lastime?','Defiende o critica una regla de BYU.','¿Las redes sociales hacen más daño que bien?','Compara la cultura de tu misión con la de Utah.','Si pudieras cambiar una ley de Estados Unidos, ¿cuál sería y por qué?','Describe a la persona que más admiras y por qué.','Explica cómo hacer tu comida favorita, paso a paso.','¿Qué harías con un millón de dólares?','¿Debería la universidad ser gratis?','Cuenta el momento más difícil de tu misión y qué aprendiste.','Explica cómo funciona un fideicomiso a alguien de 60 años.','¿La inteligencia artificial ayuda o perjudica a los estudiantes?','Explica un dato interesante que leíste en español.','Imagina que eres alcalde de Provo. ¿Qué cambias primero?','Elige: un trabajo que paga mucho lejos de tu familia, o uno normal cerca.','Habla de tu carrera y tus notas: ¿qué estudias, cómo te va y por qué?'];
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* La sesión sigue aunque el almacenamiento esté bloqueado. */ } }
const blocks = [
 {name:'Oración',seconds:60,instruction:'Ora en voz alta. Pide ayuda para hablar con claridad y sentir el Espíritu.',fixed:'Voy a orar en voz alta en español. Espera en silencio hasta que termine. Voy a pedir ayuda para hablar con claridad y sentir el Espíritu.'},
 {name:'Calentamiento del evangelio',seconds:120,instruction:'Elige un principio y explícalo como a un amigo.',fixed:'Voy a elegir un principio: la Expiación, la oración, la fe, el arrepentimiento, el bautismo o el Espíritu Santo. Lo explicaré como a un amigo. Espera hasta que termine, hazme una pregunta fácil y ayúdame a corregir mis errores.'},
 {name:'Tema 1',seconds:480,instruction:'Traduce en voz alta. Intenta corregir tus propios errores.',prompt:'Inglés → Español',topic:topics[0]},
 {name:'Tema 2',seconds:480,instruction:'Busca una forma más natural de decirlo. Luego responde las preguntas.',prompt:'Hazlo natural',topic:topics[1]},
 {name:'Tema 3 (Debate)',seconds:480,instruction:'Elige un lado y defiéndelo. Al final, pide tus dos palabras para Anki.',prompt:'Debate',topic:topics[5]},
 {name:'Cierre del evangelio',seconds:180,instruction:'Enseña el principio del calentamiento y responde una pregunta difícil.',fixed:prompts.Investigador+' Pregúntame qué principio expliqué en el calentamiento y hazme una pregunta difícil sobre él.'}
];
const choices = read('spanish-choices', []);
blocks.forEach((block, i) => {
 if (block.topic && choices[i]) { if(topics.includes(choices[i].topic)) block.topic=choices[i].topic; if(prompts[choices[i].prompt] && (i!==4 || choices[i].prompt==='Debate')) block.prompt=choices[i].prompt; }
});
function fullPrompt(b) { return [WAIT, b.fixed || `Tema: ${b.topic}\n${prompts[b.prompt]}`, FIX].join('\n\n'); }
function storeChoices(){save('spanish-choices',blocks.map(b=>({topic:b.topic,prompt:b.prompt})));}
async function copyText(text, area, status, button) {
 let copied=false;
 try { if(navigator.clipboard?.writeText) {await navigator.clipboard.writeText(text);copied=true;} } catch { /* Se intenta el método de Safari. */ }
 if(!copied) {
  const input=document.createElement('textarea');input.value=text;input.setAttribute('readonly','');input.style.cssText='position:fixed;top:0;left:0;opacity:0;font-size:16px';document.body.append(input);
  input.focus();input.select();input.setSelectionRange(0,text.length);
  try {copied=document.execCommand('copy');} catch {copied=false;}
  input.remove();button.focus({preventScroll:true});
 }
 if(copied){status.textContent='¡Copiado!';button.textContent='¡Copiado!';setTimeout(()=>{button.textContent='Copiar';status.textContent='';},2200);}
 else {area.closest('details').open=true;area.focus();area.select();status.textContent='Mantén pulsado el texto y elige Copiar.';}
}
blocks.forEach((b,i)=>{
 const card=document.createElement('article');card.className='panel block';card.id=`block-${i}`;
 card.innerHTML=`<div class="block-heading"><h3>${b.name}</h3><span class="duration">${format(b.seconds)}</span></div><p class="muted">${b.instruction}</p>`;
 if(b.topic){
  const topic=document.createElement('p');topic.className='topic';topic.textContent=b.topic;card.append(topic);
  const change=document.createElement('button');change.className='secondary topic-change';change.textContent='Otro tema';change.onclick=()=>{const others=topics.filter(t=>t!==b.topic);b.topic=others[Math.floor(Math.random()*others.length)];topic.textContent=b.topic;update();storeChoices();};card.append(change);
  const label=document.createElement('label');label.htmlFor=`prompt-${i}`;label.textContent='Cómo practicar';card.append(label);
  const select=document.createElement('select');select.id=label.htmlFor;
  (i===4?['Debate']:Object.keys(prompts)).forEach(name=>{const option=document.createElement('option');option.value=option.textContent=name;select.append(option);});select.value=b.prompt;
  select.onchange=()=>{b.prompt=select.value;update();storeChoices();};card.append(select);
 }
 const copy=document.createElement('button');copy.className='copy';copy.textContent='Copiar';copy.setAttribute('aria-label',`Copiar texto de ${b.name}`);
 const status=document.createElement('p');status.className='copy-status';status.setAttribute('role','status');
 const details=document.createElement('details');details.className='prompt-view';
 const summary=document.createElement('summary');summary.textContent='Ver texto';
 const area=document.createElement('textarea');area.readOnly=true;area.setAttribute('aria-label',`Texto de ${b.name}`);
 details.append(summary,area);card.append(copy,status,details);$('blocks').append(card);
 function update(){area.value=fullPrompt(b);status.textContent='';}update();
 copy.onclick=()=>copyText(fullPrompt(b),area,status,copy);
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
const timer=makeTimer('spanish-timer-v1',blocks.map(b=>b.seconds),s=>{
 $('clock').textContent=format(s.remaining);$('current').textContent=s.finished?'¡Terminaste!':blocks[s.index].name;
 $('next-action').textContent=s.finished?'Buen trabajo. Vuelve mañana.':blocks[s.index].instruction;
 $('start').textContent=s.startedAt!==null?'Pausar':s.finished?'Empezar de nuevo':s.remaining<blocks[s.index].seconds?'Continuar':'Empezar';
 $('skip').disabled=s.finished;
 $('progress').value=blocks.slice(0,s.index).reduce((sum,b)=>sum+b.seconds,0)+(s.finished?0:blocks[s.index].seconds-s.remaining);
 $('timer-status').textContent=s.finished?'Sesión completa.':s.startedAt!==null?'En marcha · un paso a la vez.':'Copia el texto de '+blocks[s.index].name+' y empieza.';
 blocks.forEach((b,i)=>{const card=$(`block-${i}`);card.classList.toggle('active',i===s.index);card.classList.toggle('done',i<s.index);if(i===s.index)card.setAttribute('aria-current','step');else card.removeAttribute('aria-current');});
});
$('start').onclick=()=>timer.toggle();$('skip').onclick=()=>timer.skip();$('reset').onclick=()=>timer.reset();
const drill=makeTimer('spanish-drill-v1',[240,180,120],s=>{$('drill-clock').textContent=format(s.remaining);$('drill-round').textContent=s.finished?'¡Listo! ¿Fue más fácil la última vuelta?':`Vuelta ${s.index+1} de 3 · la misma historia`;$('drill-start').textContent=s.startedAt!==null?'Pausar':s.finished?'Otra vez':s.remaining<[240,180,120][s.index]?'Continuar':'Empezar';});
$('drill-start').onclick=()=>drill.toggle();$('drill-reset').onclick=()=>drill.reset();
timer.tick();drill.tick();setInterval(()=>{timer.tick();drill.tick();},250);document.addEventListener('visibilitychange',()=>{timer.tick();drill.tick();if(!document.hidden)pullSync();});
pullSync();listenSync();window.addEventListener('focus',pullSync);
let vocabulary=[],filter='';
const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
['Vocabulario','Legal','Correcciones'].forEach(group=>{const b=document.createElement('button');b.textContent=group;b.setAttribute('aria-pressed','false');b.onclick=()=>{filter=filter===group?'':group;[...$('filters').children].forEach(c=>c.setAttribute('aria-pressed',String(c.textContent===filter)));renderVocab();};$('filters').append(b);});
function renderVocab(){
 const term=normalize($('search').value.trim());
 const rows=vocabulary.filter(v=>(!filter||v.grupo===filter)&&normalize(v.es+' '+v.en).includes(term));
 $('count').textContent=rows.length?'': 'No hay coincidencias.';
 $('count').hidden=rows.length>0;
 $('vocab-groups').replaceChildren();
 for(let i=0;i<rows.length;i+=5){
  const group=rows.slice(i,i+5),card=document.createElement('details'),title=document.createElement('summary');
  card.className='vocab-group';card.open=i===0;
  title.textContent=`${i/5+1} · ${group[0].es} a ${group[group.length-1].es}`;card.append(title);
  group.forEach(v=>{const row=document.createElement('p');row.className='vocab-row';row.textContent=v.grupo==='Correcciones'?`Dije: ${v.es} → Mejor: ${v.en}`:`${v.es} — ${v.en}`;card.append(row);});
  $('vocab-groups').append(card);
 }
}
async function loadVocab(){try{const response=await fetch('vocab.json',{cache:'no-cache'});if(!response.ok)throw Error();const data=await response.json();if(!Array.isArray(data)||!data.every(v=>typeof v.es==='string'&&typeof v.en==='string'&&['Vocabulario','Legal','Correcciones'].includes(v.grupo)))throw Error();vocabulary=data;save('spanish-vocab',data);$('retry-vocab').hidden=true;renderVocab();}catch{vocabulary=read('spanish-vocab',[]);if(vocabulary.length)renderVocab();else {$('count').hidden=false;$('count').textContent='No se pudo cargar el vocabulario. Abre la app desde un servidor local o vuelve a intentarlo con conexión.';}$('retry-vocab').hidden=false;}}
$('search').oninput=renderVocab;$('retry-vocab').onclick=loadVocab;loadVocab();
const connectorGroups=[
 ['Preposiciones','Relacionan una palabra con otra. Úsalas para decir lugar, tiempo, causa o destino.',[
 ['a','Dirección, hora o persona que recibe una acción.','Voy a la iglesia a las nueve.'],['con','Compañía o instrumento.','Hablo con mi abogado.'],['en','Lugar o momento.','El contrato está en la mesa.'],['de','Origen, posesión o tema.','Hablamos de la fe.'],['para','Meta, destino o para quién.','Este poder es para mi madre.'],['por','Causa, medio, a cambio o por dónde. Para = meta; por = causa o camino.','Te lo envío por correo por tu seguridad.'],['sin','Algo que falta.','No firmes sin leer.'],['sobre','Tema o posición encima.','La lección es sobre la oración.'],['entre','En medio de dos o más.','Es un acuerdo entre dos personas.'],['hasta','Límite de tiempo o lugar.','Trabajo hasta las cinco.'],['desde','Punto de inicio.','Vivo aquí desde enero.'],['hacia','Dirección aproximada.','Camino hacia el templo.'],['contra','Oposición o contacto.','Votaron contra la propuesta.']]],
 ['Relativos','Unen frases sobre personas o cosas para no repetir sus nombres. Úsalos para añadir información.',[
 ['que','Para personas o cosas.','El libro que leo es interesante.'],['quien','Solo una persona; después de una preposición o entre comas.','La abogada con quien hablé me ayudó.'],['quienes','Solo dos o más personas; después de preposición o entre comas.','Los misioneros, quienes llegaron ayer, nos visitan.'],['el que / la que / los que / las que','Señalan una persona o cosa; concuerdan en género y número.','La que firma es mi madre.'],['lo que','Una idea o algo sin nombre concreto.','No entiendo lo que dice el contrato.'],['cuyo / cuya / cuyos / cuyas','Posesión: concuerda con la cosa poseída, no con su dueño.','El cliente cuya casa vendimos está contento.'],['donde','Un lugar.','Esta es la capilla donde me bauticé.']]],
 ['Conjunciones','Unen palabras o ideas. Úsalas para sumar, elegir, explicar o mostrar un contraste.',[
 ['y / e','Suma ideas. Usa e antes del sonido i (i-/hi-); no ante el sonido de hielo.','Estudiamos español e historia.'],['o / u','Da opciones. Usa u antes del sonido o (o-/ho-).','¿Mañana u hoy?'],['pero','Contraste entre dos ideas.','Es difícil, pero puedo hacerlo.'],['sino','Corrige una idea después de un no.','No es un testamento, sino un poder.'],['porque','Explica una causa.','Oro porque necesito ayuda.'],['aunque','Algo no impide la otra acción.','Voy aunque llueva.'],['entonces','Resultado o siguiente momento.','Terminó la reunión; entonces salimos.'],['así que','Resultado de lo que acabas de decir.','Ya leí el contrato, así que puedo firmar.'],['mientras','Dos acciones al mismo tiempo.','Escucho mientras camino.'],['cuando','El momento de una acción.','Te llamo cuando llegue.'],['si','Una condición; sin tilde.','Si tienes dudas, pregunta.']]]
];
connectorGroups.forEach(([name,concept,words])=>{const section=document.createElement('section');section.className='connector-group';const heading=document.createElement('h4');heading.textContent=name;const intro=document.createElement('p');intro.textContent=concept;section.append(heading,intro);words.forEach(([word,meaning,example])=>{const item=document.createElement('div');item.className='connector';const strong=document.createElement('strong');strong.textContent=word;const p=document.createElement('p');p.textContent=meaning;const ex=document.createElement('p');ex.className='example';ex.textContent=example;item.append(strong,p,ex);section.append(item);});$('conectores').append(section);});
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
$('again').onclick=renderQuiz;renderQuiz();
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
tips.forEach(([title,lines])=>{const item=document.createElement('article');item.className='tip';const h=document.createElement('h3');h.textContent=title;const list=document.createElement('ul');lines.forEach(line=>{const li=document.createElement('li');li.textContent=line;list.append(li);});item.append(h,list);$('tips').append(item);});
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{ /* Una primera visita sin conexión no puede instalar la caché. */ });
