import {normalizeSections} from './page-sections.js';
import {normalizeMedia} from './media-library.js';
import {normalizeRooms} from './site-designs/hotel.js';
import {normalizePackages} from './site-designs/packages.js';
import {normalizeMenu} from './site-designs/cafe-menu.js';
import {cafeMenu} from './site-designs/cafe.js';
import {timoSeedIds,normalizeTimoExtra} from './timo-store.js';
import {pagesFor,applyRoomRoutes,applyProductRoutes} from './site-pages.js';
import {cleanState,demos} from './data.js';

export function normalize(raw) {
  if (!raw || !Object.hasOwn(demos,raw.id) || ![undefined,1,2,3].includes(raw.schema_version)) throw Error('Neplatná šablona nebo verze');
  const base = cleanState(demos[raw.id]);
  const pick = (shape, value) => {
    if (Array.isArray(shape)) return Array.isArray(value) ? value.filter(x=>typeof x==='string').slice(0,9).map(x=>x.slice(0,300)) : shape;
    if (shape && typeof shape==='object') return Object.fromEntries(Object.entries(shape).map(([key,item])=>[key,pick(item,value?.[key])]));
    return typeof value===typeof shape ? (typeof value==='string' ? value.slice(0,1200) : value) : shape;
  };
  const state=pick(base,raw);
  state.projectId=typeof raw.projectId==='string'&&/^[a-z0-9-]{1,80}$/.test(raw.projectId)?raw.projectId:base.id;
  state.projectName=typeof raw.projectName==='string'?raw.projectName.slice(0,90):state.brand;
  state.id=base.id;
  state.type=base.type;
  state.locale=['cs','en','ar'].includes(state.locale)?state.locale:'cs';
  for(const key of ['hero','featureImage','galleryImage','suiteImage','experienceImage','courtyardDetail','atticDetail','salonDetail','video']){
    const value=raw[key];
    state[key]=base[key];
    const mime=key!=='video'?'image\\/(?:png|jpeg|webp)':'video\\/mp4';
    if(typeof value==='string' && value.length<=14_000_000 &&
      (new RegExp('^data:'+mime+';base64,[a-z0-9+/=]+$','i').test(value) ||
       /^assets\/(?:[a-z0-9_/-]+)\.(?:webp|png|jpe?g|mp4)$/i.test(value) ||
       /^https:\/\/[^\s<>"']+$/i.test(value) || value==='')) state[key]=value;
  }
  state.productImages=Array.from({length:8},(_,i)=>{
    const src=raw.productImages?.[i];
    return typeof src==='string'&&src.length<=670000&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(src)?src:'';
  });
  if(state.id==='cafe')state.cafeMenu=normalizeMenu(raw.cafeMenu,state.catalogue,structuredClone(cafeMenu));
  if(state.id==='blackline')state.detailPackages=normalizePackages(raw.detailPackages);
  if(state.id==='hotel'){
    state.hotelRoomsCustom=raw.hotelRoomsCustom===true;
    state.hotelRooms=normalizeRooms(raw.hotelRooms,state.hotelRoomsCustom);
  }
  if(state.id==='timo'){
    state.timoHidden=timoSeedIds.filter(id=>Array.isArray(raw.timoHidden)&&raw.timoHidden.includes(id));
    state.timoExtra=normalizeTimoExtra(raw.timoExtra);
  }
  state.pages=pagesFor(raw.pages);
  applyProductRoutes(state);
  applyRoomRoutes(state);
  const paths=['',...state.pages.map(page=>page.slug)];
  state.mediaLibrary=normalizeMedia(raw.mediaLibrary,paths);
  state.siteSections=normalizeSections(raw.siteSections,paths);
  const order=['services','about','review','contact'];
  state.sectionOrder=[...new Set([...(Array.isArray(raw.sectionOrder)?raw.sectionOrder.filter(x=>order.includes(x)):[]),...order])];
  state.schema_version=3;
  return state;
}

export function draftDB() {
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open('dtmates-studio',1);
    r.onupgradeneeded=()=>r.result.createObjectStore('drafts');
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  });
}
