'use strict';
// Práctica de las Reglas del Español (del artifact «Reglas del Español») + conectores.
(function(){
const box=document.getElementById('rqs');if(!box)return;
const T=[['se','SE'],['ser','Ser / estar'],['por','Por / para'],['pas','Pasado'],['sub','Subjuntivo'],['pro','Lo / le'],['gus','Gustar'],['gen','Género'],['ace','Acentos'],['con','Conectores']];
const SE7=['Le disfrazado','Reflexivo','Recíproco','Accidental','Impersonal','Pasiva','Verbo con se'];
const Q=[
 {t:'se',s:'Se lo expliqué al cliente ayer.',o:SE7,a:'Le disfrazado',w:'Viene "lo" después del se. Era "le lo", y se cambió a "se lo".'},
 {t:'se',s:'Mi hermano se ducha por la noche.',o:SE7,a:'Reflexivo',w:'Se ducha a sí mismo.'},
 {t:'se',s:'Mis papás se llaman todos los días.',o:SE7,a:'Recíproco',w:'Se llaman el uno al otro.'},
 {t:'se',s:'Se me cayó el celular en la calle.',o:SE7,a:'Accidental',w:'Pasó sin querer, y "me" es la víctima.'},
 {t:'se',s:'En Provo se come temprano.',o:SE7,a:'Impersonal',w:'La gente come temprano. No hay una cosa, verbo singular.'},
 {t:'se',s:'Se buscan misioneros que hablen español.',o:SE7,a:'Pasiva',w:'Hay una cosa (misioneros) y el verbo va en plural con ella.'},
 {t:'se',s:'Ya me voy, se hace tarde.',o:SE7,a:'Verbo con se',w:'Irse = to leave. El verbo cambia de sentido.'},
 {t:'se',s:'Se la di a mi esposa.',o:SE7,a:'Le disfrazado',w:'Viene "la" después del se. Era "le la".'},
 {t:'se',s:'Se nos acabó la leche.',o:SE7,a:'Accidental',w:'Sin querer. "Nos" son las víctimas.'},
 {t:'se',s:'¿Cómo se escribe "abogado"?',o:SE7,a:'Impersonal',w:'Cualquier persona, en general.'},
 {t:'se',s:'Se venden libros usados.',o:SE7,a:'Pasiva',w:'La cosa (libros) es plural y el verbo también.'},
 {t:'se',s:'Me dormí durante la película.',o:SE7,a:'Verbo con se',w:'Dormirse = to fall asleep.'},
 {t:'se',s:'Los dos abogados se saludaron.',o:SE7,a:'Recíproco',w:'Se saludaron el uno al otro.'},
 {t:'se',s:'Ella se maquilla antes de salir.',o:SE7,a:'Reflexivo',w:'Se maquilla a sí misma.'},
 {t:'se',s:'Se le olvidaron las llaves.',o:SE7,a:'Accidental',w:'Sin querer; el verbo va con las llaves (plural).'},
 {t:'se',s:'No me acuerdo de su nombre.',o:SE7,a:'Verbo con se',w:'Acordarse = to remember. Sin se es "to agree".'},
 {t:'se',s:'Se busca a los culpables.',o:SE7,a:'Impersonal',w:'Hay "a" + personas: es impersonal y el verbo queda singular.'},
 {t:'se',s:'Se me cayeron las llaves.',o:SE7,a:'Accidental',w:'Sin querer. "Cayeron" va con las llaves (plural), no con "me".'},
 {t:'se',s:'Se habla español aquí.',o:SE7,a:'Pasiva',w:'La cosa es "español" y el verbo va con ella (singular). Piensa en el letrero.'},
 {t:'se',s:'¿Cuál está bien? "Ya ___ voy, adiós."',o:['se','me'],a:'me',w:'Irse cambia con la persona: me voy, te vas, se va.'},
 {t:'se',s:'Se buscan actores para la obra.',o:SE7,a:'Pasiva',w:'Sin "a": actores es el sujeto y el verbo va en plural con ellos.'},
 {t:'se',s:'Se habla de política en la cena.',o:SE7,a:'Impersonal',w:'"De" bloquea el sujeto: no hay cosa que mande el verbo.'},
 {t:'se',s:'¿Cuál está bien? "Se ____ cuartos."',o:['alquila','alquilan'],a:'alquilan',w:'Pasiva: cuartos es plural, el verbo también.'},
 {t:'se',s:'¿Cuál está bien? "Se ____ a los culpables."',o:['busca','buscan'],a:'busca',w:'Con "a" + persona es impersonal: siempre singular.'},
 {t:'ser',s:'Mi esposa ____ de Utah.',o:['es','está'],a:'es',w:'Origen = DOCTOR = ser.'},
 {t:'ser',s:'Hoy ____ muy cansado.',o:['soy','estoy'],a:'estoy',w:'Condición = PLACE = estar.'},
 {t:'ser',s:'La reunión ____ en la capilla.',o:['es','está'],a:'es',w:'Un evento usa SER aunque hable de lugar.'},
 {t:'ser',s:'¿Ya ____ listo para salir? (ready)',o:['eres','estás'],a:'estás',w:'Estar listo = ready. Ser listo = smart.'},
 {t:'ser',s:'Mi papá ____ abogado.',o:['es','está'],a:'es',w:'Ocupación = ser.'},
 {t:'ser',s:'Provo ____ en Utah.',o:['es','está'],a:'está',w:'Lugar de una cosa = estar.'},
 {t:'por',s:'Gracias ____ la ayuda.',o:['por','para'],a:'por',w:'Razón, mira atrás: ← POR.'},
 {t:'por',s:'Estudio ____ ser abogado.',o:['por','para'],a:'para',w:'Meta: PARA →.'},
 {t:'por',s:'La tarea es ____ el viernes.',o:['por','para'],a:'para',w:'Fecha límite = para.'},
 {t:'por',s:'Te llamo ____ teléfono.',o:['por','para'],a:'por',w:'Medio = por.'},
 {t:'por',s:'Pagué $20 ____ el libro.',o:['por','para'],a:'por',w:'Intercambio = por.'},
 {t:'por',s:'____ mí, el subjuntivo es lo más difícil.',o:['Por','Para'],a:'Para',w:'Opinión = para mí.'},
 {t:'pas',s:'Cuando ____ niño, jugaba fútbol.',o:['fui','era'],a:'era',w:'Edad y fondo = imperfecto.'},
 {t:'pas',s:'Ayer ____ a la biblioteca.',o:['fui','iba'],a:'fui',w:'Una vez, terminó = pretérito.'},
 {t:'pas',s:'____ cuando llegué a casa.',o:['Llovió','Llovía'],a:'Llovía',w:'La escena de fondo = imperfecto; "llegué" interrumpe.'},
 {t:'pas',s:'En la misión siempre ____ a las 6:30.',o:['me levanté','me levantaba'],a:'me levantaba',w:'Siempre = hábito = imperfecto.'},
 {t:'pas',s:'De repente, el teléfono ____.',o:['sonó','sonaba'],a:'sonó',w:'De repente = pretérito.'},
 {t:'sub',s:'Quiero que tú ____ conmigo.',o:['vienes','vengas'],a:'vengas',w:'W (wish) + que + otra persona.'},
 {t:'sub',s:'Creo que ____ verdad.',o:['es','sea'],a:'es',w:'Creer = estás seguro = indicativo.'},
 {t:'sub',s:'Dudo que ____ verdad.',o:['es','sea'],a:'sea',w:'D (duda) = subjuntivo.'},
 {t:'sub',s:'Ojalá que mañana no ____.',o:['llueve','llueva'],a:'llueva',w:'O (ojalá) = subjuntivo.'},
 {t:'sub',s:'Cuando ____ a Provo, llámame.',o:['llegas','llegues'],a:'llegues',w:'Cuando + futuro = subjuntivo.'},
 {t:'sub',s:'Es importante que ____ cada día.',o:['estudias','estudies'],a:'estudies',w:'I (impersonal) + que.'},
 {t:'pro',s:'Compré el carro → ____ compré.',o:['Lo','Le'],a:'Lo',w:'El carro es la cosa = lo.'},
 {t:'pro',s:'Di el libro a Juan → ____ di el libro.',o:['Lo','Le'],a:'Le',w:'Juan es la persona que recibe = le.'},
 {t:'pro',s:'Di el libro a Juan → ____ di.',o:['Le lo','Se lo','Lo le'],a:'Se lo',w:'Le + lo = se lo. Persona primero.'},
 {t:'pro',s:'¿Llamaste a tu mamá? Sí, ____ llamé.',o:['la','le'],a:'la',w:'Llamar lleva lo/la: ella es el objeto directo.'},
 {t:'pro',s:'¿Le dijiste la verdad? Sí, ____ dije.',o:['se la','le la','la le'],a:'se la',w:'La verdad = la; a ella = le → se.'},
 {t:'pro',s:'Quiero ver la película → Quiero ____.',o:['verla','verle','laver'],a:'verla',w:'Se pega al infinitivo: verla.'},
 {t:'gus',s:'Me ____ los tacos.',o:['gusta','gustan'],a:'gustan',w:'Los tacos = plural.'},
 {t:'gus',s:'A mi esposa le ____ la cabeza.',o:['duele','duelen'],a:'duele',w:'La cabeza = una cosa.'},
 {t:'gus',s:'Nos ____ las películas de acción.',o:['encanta','encantan'],a:'encantan',w:'Las películas = plural.'},
 {t:'gen',s:'____ problema es grave.',o:['El','La'],a:'El',w:'-ma griega = masculina.'},
 {t:'gen',s:'____ canción es bonita.',o:['El','La'],a:'La',w:'-ción = femenina.'},
 {t:'gen',s:'____ agua está fría.',o:['El','La'],a:'El',w:'Á tónica: el agua, pero "fría" sigue femenina.'},
 {t:'gen',s:'Levanta ____ mano.',o:['el','la'],a:'la',w:'Excepción: la mano.'},
 {t:'gen',s:'____ idioma español.',o:['El','La'],a:'El',w:'-ma griega: el idioma.'},
 {t:'ace',s:'¿Cuál está bien escrita?',o:['cancion','canción'],a:'canción',w:'Aguda que termina en N = tilde.'},
 {t:'ace',s:'¿Cuál está bien escrita?',o:['arbol','árbol'],a:'árbol',w:'Llana que termina en L (no N, S, vocal) = tilde.'},
 {t:'ace',s:'¿Cuál está bien escrita?',o:['medico','médico'],a:'médico',w:'Esdrújula = siempre tilde.'},
 {t:'ace',s:'¿Cuál está bien escrita?',o:['reloj','relój'],a:'reloj',w:'Aguda que termina en J = sin tilde.'},
 {t:'ace',s:'____ eres mi mejor amigo.',o:['Tu','Tú'],a:'Tú',w:'Tú (pronombre) lleva tilde; tu (posesivo) no.'}
];
Q.push(...[{"t": "con", "s": "Voy ____ la iglesia.", "o": ["a", "de", "sin"], "a": "a", "w": "A indica el destino."}, {"t": "con", "s": "Este regalo es ____ mi madre.", "o": ["por", "para", "contra"], "a": "para", "w": "Para indica para quién es algo."}, {"t": "con", "s": "Envié el contrato ____ correo.", "o": ["para", "entre", "por"], "a": "por", "w": "Por indica el medio que usas."}, {"t": "con", "s": "No firmes ____ leer el poder.", "o": ["sin", "hacia", "desde"], "a": "sin", "w": "Sin indica algo que falta hacer."}, {"t": "con", "s": "Vivo en Utah ____ enero.", "o": ["hasta", "desde", "sobre"], "a": "desde", "w": "Desde marca el punto de inicio."}, {"t": "con", "s": "La escritura ____ leí habla de la fe.", "o": ["que", "quien", "cuyo"], "a": "que", "w": "Que une la frase con una cosa: la escritura."}, {"t": "con", "s": "La abogada con ____ hablé me ayudó.", "o": ["donde", "quien", "lo que"], "a": "quien", "w": "Quien se usa para una persona después de una preposición."}, {"t": "con", "s": "Los misioneros, ____ llegaron ayer, nos visitan.", "o": ["quien", "quienes", "cuya"], "a": "quienes", "w": "Quienes se refiere a varias personas entre comas."}, {"t": "con", "s": "El cliente ____ casa vendimos está contento.", "o": ["cuyo", "que", "cuya"], "a": "cuya", "w": "Cuya concuerda con casa, femenino singular."}, {"t": "con", "s": "No entiendo ____ dice el contrato.", "o": ["lo que", "quienes", "donde"], "a": "lo que", "w": "Lo que se refiere a una idea sin nombre concreto."}, {"t": "con", "s": "Esta es la capilla ____ me bauticé.", "o": ["quien", "donde", "cuyos"], "a": "donde", "w": "Donde se refiere a un lugar."}, {"t": "con", "s": "Estudio español ____ historia.", "o": ["y", "e", "u"], "a": "e", "w": "Y cambia a e antes del sonido i de historia."}, {"t": "con", "s": "¿Quieres venir mañana ____ hoy?", "o": ["o", "e", "u"], "a": "u", "w": "O cambia a u antes del sonido o de hoy."}, {"t": "con", "s": "No es un testamento, ____ un poder.", "o": ["pero", "sino", "porque"], "a": "sino", "w": "Sino corrige una idea después de no."}, {"t": "con", "s": "Oro ____ necesito ayuda.", "o": ["aunque", "porque", "mientras"], "a": "porque", "w": "Porque explica la causa de la oración."}]);
const K='reglas-misses';
let miss=new Set();try{miss=new Set(JSON.parse(localStorage.getItem(K)||'[]'))}catch(e){}
let cur='se',right=0,done=0;
const $=id=>document.getElementById(id);
function keep(){try{localStorage.setItem(K,JSON.stringify([...miss]))}catch(e){}}
function chips(){const c=$('rchips');c.replaceChildren();
 [...T,['miss','Mis errores']].forEach(([id,name])=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',String(id===cur));b.onclick=()=>{cur=id;right=0;done=0;$('rscore').textContent='0 / 0';chips();render()};c.append(b)});}
function render(){box.replaceChildren();
 const list=Q.map((q,i)=>[q,i]).filter(([q,i])=>cur==='miss'?miss.has(i):q.t===cur);
 if(!list.length){const p=document.createElement('p');p.className='muted';p.textContent='No tienes errores guardados. ¡Bien!';box.append(p);return}
 list.forEach(([q,i])=>{const tt=T.find(t=>t[0]===q.t);
  const d=document.createElement('article');d.className='question';
  const k=document.createElement('p');k.className='qkind';k.textContent=tt[1];
  const s=document.createElement('p');s.textContent=q.s;
  const o=document.createElement('div');o.className='answers';
  const f=document.createElement('p');f.className='feedback';f.setAttribute('role','status');
  q.o.forEach(x=>{const b=document.createElement('button');b.type='button';b.textContent=x;
   b.onclick=()=>{[...o.children].forEach(c=>{c.disabled=true;if(c.textContent===q.a)c.classList.add('correct')});
    const ok=x===q.a;if(!ok)b.classList.add('wrong');done++;if(ok){right++;miss.delete(i)}else miss.add(i);keep();
    f.textContent=(ok?'✅ ¡Correcto! ':'❌ Es «'+q.a+'». ')+q.w;$('rscore').textContent=right+' / '+done;};o.append(b)});
  d.append(k,s,o,f);box.append(d)});}
$('rreset').onclick=()=>{right=0;done=0;$('rscore').textContent='0 / 0';render()};
chips();render();
})();
