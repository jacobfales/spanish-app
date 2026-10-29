'use strict';
// Cambia esta versión cuando cambies el HTML, CSS, JS o los iconos.
const CACHE = 'spanish-v4';
const ASSETS = ['./','index.html','gramatica.html','app.css','app.js','manifest.webmanifest','vocab.json','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('spanish-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.pathname===new URL('vocab.json',self.registration.scope).pathname){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(!response.ok)throw Error('No disponible');await cache.put(event.request,response.clone());return response;}catch{return (await cache.match(event.request))||Response.error();}})());return;
 }
 event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
