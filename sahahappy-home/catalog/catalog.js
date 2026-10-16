import {photoMarkup,escapeHTML as esc} from './media.js';
const data=JSON.parse(document.getElementById('catalog-data').textContent);
const products=new Map(data.products.map(p=>[p.id,p]));
const groups=new Map(data.groups.map(g=>[g.id,g]));
const grid=document.getElementById('catalog-grid');
const cards=Array.from(grid.querySelectorAll('.product'));
const search=document.getElementById('catalog-search');
const category=document.getElementById('catalog-category');
const sort=document.getElementById('catalog-sort');
const count=document.getElementById('catalog-count');
const more=document.getElementById('catalog-more');
const dialog=document.getElementById('product-dialog');
const content=document.getElementById('product-detail');
const normalize=value=>value.normalize('NFKC').toLocaleLowerCase().trim();
const searchable=p=>normalize([p.id,p.name,data.categories[p.category],p.dimensions,...p.details,...p.variants].join(' '));
const price=p=>p.price===null?'สอบถามราคา':`฿${p.price.toLocaleString('th-TH')}`;
let limit=12,opener,currentGroup;
function groupPrice(g){const values=g.productIds.map(id=>products.get(id).price).filter(p=>p!==null);return values.length?Math.min(...values):null;}
function filter(reset=true){
  if(reset)limit=12;
  const query=normalize(search.value);
  const matched=cards.filter(card=>{const g=groups.get(card.dataset.id);return (!category.value||category.value===g.category)&&(normalize(g.name).includes(query)||g.productIds.some(id=>searchable(products.get(id)).includes(query)));});
  if(sort.value!=='catalog')matched.sort((a,b)=>{const pa=groupPrice(groups.get(a.dataset.id)),pb=groupPrice(groups.get(b.dataset.id));if(pa===null)return pb===null?0:1;if(pb===null)return -1;return sort.value==='price-asc'?pa-pb:pb-pa;});
  const visible=new Set(matched.slice(0,limit));
  cards.forEach(card=>{card.hidden=!visible.has(card);});
  matched.forEach(card=>grid.appendChild(card));
  count.textContent=`แสดง ${Math.min(limit,matched.length)} จาก ${matched.length} รายการ`;
  more.hidden=matched.length<=limit;
  more.textContent=`ดูเพิ่มเติม (${Math.max(0,matched.length-limit)} รายการ)`;
  document.getElementById('catalog-empty').hidden=matched.length!==0;
  document.getElementById('catalog-filter-state').hidden=!query&&!category.value;
  document.getElementById('catalog-filter-label').textContent=[category.value?data.categories[category.value]:'ทุกหมวดหมู่',query?`คำค้น: ${search.value.trim()}`:''].filter(Boolean).join(' · ');
}
function clearFilters(){search.value='';category.value='';sort.value='catalog';filter();}
search.addEventListener('input',()=>filter());category.addEventListener('change',()=>filter());sort.addEventListener('change',()=>filter());
more.addEventListener('click',()=>{const firstNew=limit;limit+=12;filter(false);const shown=Array.from(grid.querySelectorAll('.product:not([hidden])'));shown[firstNew]?.querySelector('a')?.focus({preventScroll:true});});
for(const id of ['catalog-reset','catalog-clear'])document.getElementById(id).addEventListener('click',()=>{clearFilters();search.focus();});
document.querySelectorAll('[data-category-link]').forEach(link=>link.addEventListener('click',()=>{clearFilters();category.value=link.dataset.categoryLink;filter();}));
function galleryViews(p){return p.detailViews||p.images.map((src,i)=>({src,label:`รูปที่ ${i+1}`}));}
function galleryPhoto(p,view,ratio){
  const photoData=view.crop?{...data,media:{...data.media,[view.src]:{...data.media[view.src],crop:view.crop}}}:data;
  return photoMarkup(photoData,view.src,`${p.name} — ${view.label}`,ratio,false);
}
function renderDetails(g,id){
  const p=products.get(id);
  const views=galleryViews(p),initial=p.initialDetailView||0,ratio=p.detailAspectRatio||4/3;
  content.innerHTML=`<div class="catalog-gallery"><div id="detail-image" class="catalog-gallery-main" style="aspect-ratio:${ratio}">${galleryPhoto(p,views[initial],ratio)}</div>${views.length>1?`<div class="catalog-thumbnails" aria-label="รูปสินค้า">${views.map((view,i)=>`<button class="catalog-thumbnail${p.detailViews?' catalog-thumbnail-labeled':''}" type="button" data-view="${i}" aria-label="ดู${esc(view.label)}" aria-pressed="${i===initial}">${galleryPhoto(p,view,1)}${p.detailViews?`<span class="thumbnail-label">${esc(view.label)}</span>`:''}</button>`).join('')}</div>`:''}<p class="photo-caption">ภาพประกอบจากแคตตาล็อก · สอบถามสีและวัสดุก่อนสั่งซื้อ</p></div>
  <div class="catalog-detail-copy"><p class="catalog-card-category">${esc(data.categories[p.category])}</p><h2 id="product-title">${esc(g.name)}</h2>
  <div id="variant-details" aria-live="polite"><p class="detail-model">${g.productIds.length>1?esc(p.name):''}${/^(YS|SHR)/.test(p.id)?`<span>รหัสสินค้า ${esc(p.id)}</span>`:''}</p><p class="detail-price">${price(p)}</p><p class="detail-price-note">${p.price!==null?(p.priceSource?'ราคาสินค้า · ยืนยันราคากับร้านก่อนสั่งซื้อ':'ราคาตามแคตตาล็อก · ยืนยันราคากับร้านก่อนสั่งซื้อ'):'ติดต่อเราเพื่อขอรายละเอียดและใบเสนอราคา'}</p>
  ${p.dimensions?`<dl class="detail-spec"><dt>ขนาด</dt><dd>${esc(p.dimensions)}</dd></dl>`:''}${p.details.length?`<ul>${p.details.map(detail=>`<li>${esc(detail)}</li>`).join('')}</ul>`:''}${p.variants.map(variant=>`<p class="catalog-variant">${esc(variant)}</p>`).join('')}${p.note?`<p class="detail-note">${esc(p.note)}</p>`:''}</div>
  <div class="catalog-contact-panel"><img src="catalog/contact-qr.png" alt="QR Code สำหรับติดต่อ SAHA HAPPY HOME" width="252" height="254"><div><strong>สแกนเพื่อติดต่อร้าน</strong><p>ส่งชื่อหรือรหัสสินค้าที่สนใจ แล้วสอบถามราคา สี และรายละเอียดเพิ่มเติมได้ทันที</p><div class="catalog-actions"><a class="btn" href="https://line.me/ti/p/~himandjim" target="_blank" rel="noopener noreferrer">สอบถามผ่าน LINE</a></div></div></div><div class="catalog-contact-list" aria-label="เบอร์โทรติดต่อ"><a class="catalog-secondary-contact" href="tel:0649544987"><span>คุณฮิม</span><strong>064-954-4987</strong></a><a class="catalog-secondary-contact" href="tel:0954699239"><span>คุณจิม</span><strong>095-469-9239</strong></a></div><p class="detail-source"><a class="catalog-source" href="catalog/pages/page-${String(p.sourcePage).padStart(2,'0')}.webp" target="_blank" rel="noopener">ดูแคตตาล็อกต้นฉบับ หน้า ${p.sourcePage}</a></p></div>`;
}
function openProduct(trigger,useSearch=true){
  currentGroup=groups.get(trigger.dataset.product);if(!currentGroup)return;
  opener=trigger;
  const query=useSearch?normalize(search.value):'';
  const selected=currentGroup.productIds.find(id=>query&&searchable(products.get(id)).includes(query))||currentGroup.productIds[0];
  renderDetails(currentGroup,selected);dialog.showModal();dialog.scrollTop=0;document.body.classList.add('catalog-modal-open');
}
grid.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-product]');
  if(!trigger||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();openProduct(trigger);
});
content.addEventListener('click',event=>{const thumb=event.target.closest('[data-view]');if(!thumb)return;const p=products.get(currentGroup.productIds[0]);const view=galleryViews(p)[Number(thumb.dataset.view)];document.getElementById('detail-image').innerHTML=galleryPhoto(p,view,p.detailAspectRatio||4/3);content.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button===thumb)));});
document.getElementById('catalog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('catalog-modal-open');opener?.focus({preventScroll:true});});
document.getElementById('catalog-controls').hidden=false;
filter();

const hero=document.querySelector('[data-hero-carousel]');
if(hero){
  const slides=Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots=Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active=0,timer;
  function showSlide(next){
    active=(next+slides.length)%slides.length;
    slides.forEach((slide,index)=>{
      const selected=index===active;
      slide.classList.toggle('is-active',selected);
      slide.setAttribute('aria-hidden',String(!selected));
      slide.tabIndex=selected?0:-1;
    });
    dots.forEach((dot,index)=>dot.setAttribute('aria-pressed',String(index===active)));
  }
  function stop(){clearInterval(timer);}
  function start(){
    stop();
    if(!reduceMotion)timer=setInterval(()=>showSlide(active+1),6000);
  }
  hero.querySelector('[data-hero-prev]').addEventListener('click',()=>{showSlide(active-1);start();});
  hero.querySelector('[data-hero-next]').addEventListener('click',()=>{showSlide(active+1);start();});
  dots.forEach((dot,index)=>dot.addEventListener('click',()=>{showSlide(index);start();}));
  slides.forEach(slide=>slide.addEventListener('click',()=>openProduct(slide,false)));
  hero.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();showSlide(active+(event.key==='ArrowLeft'?-1:1));slides[active].focus();start();
    }
  });
  hero.addEventListener('pointerenter',stop);
  hero.addEventListener('pointerleave',start);
  hero.addEventListener('focusin',stop);
  hero.addEventListener('focusout',event=>{if(!hero.contains(event.relatedTarget))start();});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  showSlide(0);start();
}
