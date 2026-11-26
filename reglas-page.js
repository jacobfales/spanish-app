// Reglas page: question counts on practice buttons, connectors, vocab by topic, all-practices grid.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
if(window.PREGUNTAS){
  document.querySelectorAll('.plink[data-t]').forEach(a=>{const n=(PREGUNTAS[a.dataset.t]||[]).length;const s=a.querySelector('.pc');if(s&&n)s.textContent=n+' preguntas · una a la vez';});
  const g=$('allp');
  if(g){TEMAS.forEach(m=>{const a=el('a');a.href='practica.html?t='+m.k;a.style.setProperty('--k',m.color);a.append(document.createTextNode(m.name),el('small',null,PREGUNTAS[m.k].length+' preguntas'));g.append(a)});
    const all=el('a');all.href='practica.html?t=todo';all.style.setProperty('--k','#e8ecea');all.append(document.createTextNode('🎲 Todo mezclado'),el('small',null,'30 preguntas al azar'));g.append(all);}
}
if(window.CONECTORES&&$('con-groups')){
  CONECTORES.forEach(([name,concept,words])=>{const b=el('div','box con-g');b.append(el('h4',null,name),el('p','ex',concept));const ul=el('ul');
    words.forEach(([w,m,ex])=>{const li=el('li');li.append(el('b',null,w),document.createTextNode(' · '+m+' '),el('i',null,ex));ul.append(li)});b.append(ul);$('con-groups').append(b)});
}
const box=$('vocab-temas');
if(box) fetch('vocab.json').then(r=>r.json()).then(words=>{
  box.replaceChildren();
  const groups=[['Natural','🗣️ Palabras naturales','#5cc8d0'],['Legal','⚖️ Palabras legales','#e0b44a'],['Correcciones','✏️ Mis correcciones (de Claude)','#f08a8a']];
  groups.forEach(([top,title,color])=>{
    const mine=words.filter(w=>w.top===top);if(!mine.length)return;
    const wrap=el('div','vgroup');wrap.append(el('h3',null,title));const grid=el('div','vtemas');
    [...new Set(mine.map(w=>w.tema))].forEach(t=>{
      const list=mine.filter(w=>w.tema===t), c=el('div','vt');c.style.setProperty('--k',color);
      c.append(el('b','n',t+' · '+list.length));
      const d=el('details'),sm=el('summary',null,'Ver las palabras');d.append(sm);const ul=el('ul');
      list.forEach(w=>{const li=el('li');li.append(el('span',null,top==='Correcciones'?'Dije: '+w.es:w.es),el('span',null,top==='Correcciones'?'Mejor: '+w.en:w.en));ul.append(li)});
      d.append(ul);c.append(d);
      if(top!=='Correcciones'&&list.length>=2){const a=el('a','plink');a.href='practica.html?v='+encodeURIComponent(top)+'&tema='+encodeURIComponent(t);
        const sp=el('span',null,'📝 Practicar');sp.append(el('small',null,'Ves el inglés, escoges el español'));a.append(sp,el('span','go2','→'));c.append(a);}
      grid.append(c);
      if(window.TEMAS&&$('allp')&&top!=='Correcciones'&&list.length>=2){const a=el('a');a.href='practica.html?v='+encodeURIComponent(top)+'&tema='+encodeURIComponent(t);a.style.setProperty('--k',color);a.append(document.createTextNode('📚 '+t),el('small',null,list.length+' palabras'));$('allp').append(a);}
    });
    wrap.append(grid);box.append(wrap);
  });
}).catch(()=>{box.textContent='No se pudo cargar el vocabulario.';});
})();
if(window.LIBRO)document.querySelectorAll('.plink[data-l]').forEach(a=>{const sets=LIBRO[a.dataset.l];if(!sets){a.remove();return}const n=sets.reduce((x,s)=>x+s.items.length,0);a.querySelector('.lc').textContent=n+' frases para escribir · como el libro';});
