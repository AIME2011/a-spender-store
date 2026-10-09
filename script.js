const sections=['accueil','boutique','panier','paiement','compte','equipe','galerie','contact','admin'];
const navLabels={accueil:'Accueil',boutique:'Boutique',equipe:'Équipe',galerie:'Galerie',contact:'Contact'};
const backend=window.supabase.createClient(window.ASPENDER_CONFIG.url,window.ASPENDER_CONFIG.publishableKey);
const adminEmail=window.ASPENDER_CONFIG.adminEmail.toLowerCase();
let adminUser=null;
let currentSection='accueil';
const sectionHistory=[];
let shopTransitionTimer;
document.body.dataset.world='premium';
function updateBackButton(){document.getElementById('backBtn').hidden=sectionHistory.length===0;}
function showSection(id){
 if(id==='admin'&&!isAdmin()){window.openAdmin();return;}
 if(currentSection && currentSection!==id){sectionHistory.push(currentSection);}
 currentSection=id;
 sections.forEach(s=>document.getElementById(s).style.display=s===id?'block':'none');
 const activeSection=document.getElementById(id);
 activeSection.classList.remove('section-enter');
 void activeSection.offsetWidth;
 activeSection.classList.add('section-enter');
 document.querySelectorAll('.navlink').forEach(a=>a.classList.toggle('active',a.dataset.sec===id));
 if(id==='boutique')renderProducts();
 updateBackButton();
 window.scrollTo(0,0);
}
function showShop(tier){
 clearTimeout(shopTransitionTimer);
 setShopTier(tier);
 const transition=document.getElementById('worldTransition');
 transition.classList.remove('is-active');
 void transition.offsetWidth;
 transition.classList.add('is-active');
 shopTransitionTimer=setTimeout(()=>{
  showSection('boutique');
  shopTransitionTimer=setTimeout(()=>transition.classList.remove('is-active'),730);
 },320);
}
function goBack(){
 if(!sectionHistory.length)return;
 currentSection=sectionHistory.pop();
 sections.forEach(s=>document.getElementById(s).style.display=s===currentSection?'block':'none');
 document.querySelectorAll('.navlink').forEach(a=>a.classList.toggle('active',a.dataset.sec===currentSection));
 updateBackButton();
 window.scrollTo(0,0);
}
document.getElementById('nav').innerHTML=Object.keys(navLabels).map(id=>`<button class="navlink" data-sec="${id}" onclick="showSection('${id}')">${navLabels[id]}</button>`).join('');
updateBackButton();
document.getElementById('yr').textContent=new Date().getFullYear();

/* interactive 3D ball */
const ballWrap=document.querySelector('.ball-wrap');
ballWrap.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch')return;
 const bounds=ballWrap.getBoundingClientRect();
 const x=(e.clientX-bounds.left)/bounds.width-.5;
 const y=(e.clientY-bounds.top)/bounds.height-.5;
 ballWrap.style.transform=`rotateX(${y*-14}deg) rotateY(${x*18}deg)`;
});
ballWrap.addEventListener('pointerleave',()=>{ballWrap.style.transform='';});

/* products */
const products=[
 {id:1,tier:"premium",name:"Maillot Domicile A-SPENDER",cat:"Maillots",price:15000,sizes:["S","M","L","XL"],tag:"Nouveau"},
 {id:2,tier:"premium",name:"Maillot Extérieur A-SPENDER",cat:"Maillots",price:15000,sizes:["S","M","L","XL"],tag:""},
 {id:3,tier:"premium",name:"Short Performance",cat:"Shorts",price:8000,sizes:["S","M","L","XL"],tag:""},
 {id:4,tier:"premium",name:"Casquette Snapback",cat:"Casquettes",price:6000,sizes:["Unique"],tag:"Promo"},
 {id:5,tier:"premium",name:"Chaussures Court Pro",cat:"Chaussures",price:35000,sizes:["40","41","42","43","44","45"],tag:""},
 {id:6,tier:"premium",name:"Chaussures Street",cat:"Chaussures",price:28000,sizes:["40","41","42","43","44"],tag:"Nouveau"},
 {id:7,tier:"premium",name:"Sac de Sport A-SPENDER",cat:"Sacs",price:12000,sizes:["Unique"],tag:""},
 {id:8,tier:"premium",name:"Short Training",cat:"Shorts",price:7000,sizes:["S","M","L"],tag:"Promo"},
 {id:101,tier:"standard",name:"Porte-clés A-SPENDER",cat:"Accessoires",price:500,sizes:["Unique"],tag:""},
 {id:102,tier:"standard",name:"Bracelet supporter",cat:"Accessoires",price:1000,sizes:["Unique"],tag:""},
 {id:103,tier:"standard",name:"Chaussettes sport",cat:"Accessoires",price:2500,sizes:["S","M","L"],tag:""},
 {id:104,tier:"standard",name:"Bandeau de poignet",cat:"Accessoires",price:1500,sizes:["Unique"],tag:""},
 {id:105,tier:"standard",name:"Gourde d'entraînement",cat:"Accessoires",price:3500,sizes:["Unique"],tag:""},
 {id:106,tier:"standard",name:"Serviette de sport",cat:"Accessoires",price:5000,sizes:["Unique"],tag:""},
 {id:107,tier:"standard",name:"Autocollant A-SPENDER",cat:"Accessoires",price:200,sizes:["Unique"],tag:""}
];
const defaultHeroTitle=document.querySelector('#accueil h1').textContent;
const defaultHeroText=document.querySelector('#accueil .hero p').textContent;
function escapeHtml(value){
 return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
let teamPlayers=[];
let teamMatches=[];
let galleryPhotos=[];
let siteSettings={title:defaultHeroTitle,description:defaultHeroText};
function isAdmin(){return Boolean(adminUser&&adminUser.email&&adminUser.email.toLowerCase()===adminEmail);}
function showBackendStatus(message){
 const status=document.getElementById('backendStatus');
 if(!status)return;
 status.textContent=message;
 status.hidden=!message;
}
function reportBackendError(context,error){
 console.error(`${context}:`,error);
 showBackendStatus(`${context} : ${error.message||'erreur inconnue'}`);
}
async function loadSharedData(){
 const queries=[
  backend.from('products').select('*').order('id'),
  backend.from('site_settings').select('*').eq('id',true).maybeSingle(),
  backend.from('team_players').select('*'),
  backend.from('team_matches').select('*').order('date'),
  backend.from('gallery_photos').select('*')
 ];
 const results=await Promise.all(queries);
 const failed=results.find(result=>result.error);
 if(failed)throw failed.error;
 products.splice(0,products.length,...results[0].data.map(row=>({
  id:Number(row.id),tier:row.tier,name:row.name,cat:row.cat,price:Number(row.price),
  sizes:Array.isArray(row.sizes)?row.sizes:[],tag:row.tag||'',image:row.image||''
 })));
 if(results[1].data){
  siteSettings={title:results[1].data.title,description:results[1].data.description};
  document.querySelector('#accueil h1').textContent=siteSettings.title;
  document.querySelector('#accueil .hero p').textContent=siteSettings.description;
 }
 teamPlayers=results[2].data;
 teamMatches=results[3].data;
 galleryPhotos=results[4].data;
 rebuildShopFilters();
 renderProducts();
 renderTeamAndGallery();
 showBackendStatus('');
}
function renderTeamAndGallery(){
 document.getElementById('playerGrid').innerHTML=teamPlayers.length
  ?teamPlayers.map(player=>`<div class="player"><b>#${escapeHtml(player.number)}</b>${escapeHtml(player.name)}<br><span style="font-size:12px;color:var(--ink-soft)">${escapeHtml(player.position)}</span></div>`).join('')
  :'<p class="empty">L’effectif du club sera affiché ici dès qu’il sera ajouté dans Accès SPENDER.</p>';
 document.getElementById('matchList').innerHTML=teamMatches.length
  ?teamMatches.map(match=>`<div class="match-row"><span>${escapeHtml(new Date(`${match.date}T00:00:00`).toLocaleDateString('fr-FR'))}</span><span>A-SPENDER vs ${escapeHtml(match.opponent)}</span><span>${escapeHtml(match.venue)}</span></div>`).join('')
  :'<p class="empty">Le calendrier des matchs sera affiché ici dès qu’il sera renseigné.</p>';
 document.getElementById('galGrid').innerHTML=galleryPhotos.length
  ?galleryPhotos.map(photo=>`<div class="gal-tile"><img src="${escapeHtml(photo.image)}" alt="${escapeHtml(photo.name)}" loading="lazy"><span>${escapeHtml(photo.name)}</span></div>`).join('')
  :'<p class="empty">Les photos du club seront affichées ici dès qu’elles seront ajoutées dans Accès SPENDER.</p>';
}
function hashAdminPassword(password,existingHash=''){
 if(existingHash.startsWith('local-fnv1a:')||(!existingHash&&(!window.crypto||!window.crypto.subtle))){
  let hash=0x811c9dc5;
  for(const byte of new TextEncoder().encode(password)){hash^=byte;hash=Math.imul(hash,0x01000193);}
  return Promise.resolve(`local-fnv1a:${(hash>>>0).toString(16).padStart(8,'0')}`);
 }
 if(!window.crypto||!window.crypto.subtle)throw new Error('Ce navigateur ne peut pas vérifier ce mot de passe. Réessaie avec le navigateur utilisé à sa création.');
 return window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(password)).then(hash=>{
  const digest=Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
  return existingHash.startsWith('sha256:')?`sha256:${digest}`:digest;
 });
}
function openLegacyLocalAdmin(){
 if(sessionStorage.getItem('aspender_admin_authenticated')==='yes'){
  renderAdminEditor();
  showSection('admin');
  return;
 }
 const configured=Boolean(localStorage.getItem('aspender_admin_password_hash'));
 document.getElementById('modalBody').innerHTML=`
  <h3>${configured?'Accès administration':'Créer le mot de passe administrateur'}</h3>
  <p>${configured?'Saisis ton mot de passe pour ouvrir l’éditeur local.':'Choisis un mot de passe d’au moins 8 caractères pour cet appareil.'}</p>
  <form id="adminLoginForm">
   <label for="adminPassword">${configured?'Mot de passe':'Nouveau mot de passe'}</label>
   <input id="adminPassword" type="password" required minlength="${configured?1:8}" autocomplete="${configured?'current-password':'new-password'}">
   ${configured?'':`<label for="adminPasswordConfirm">Confirmer le mot de passe</label><input id="adminPasswordConfirm" type="password" required minlength="8" autocomplete="new-password">`}
   <p id="adminLoginError" class="admin-error" role="alert"></p>
   <button class="btn" type="submit">${configured?'Se connecter':'Créer le mot de passe'}</button>
  </form>`;
 document.getElementById('modal').style.display='flex';
 document.getElementById('adminLoginForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const password=document.getElementById('adminPassword').value;
  const error=document.getElementById('adminLoginError');
  try{
   const existingHash=localStorage.getItem('aspender_admin_password_hash')||'';
   const passwordHash=await hashAdminPassword(password,configured?existingHash:'');
   if(configured){
    if(passwordHash!==existingHash){error.textContent='Mot de passe incorrect.';return;}
   }else{
    if(password!==document.getElementById('adminPasswordConfirm').value){error.textContent='Les deux mots de passe ne correspondent pas.';return;}
    localStorage.setItem('aspender_admin_password_hash',passwordHash);
   }
   sessionStorage.setItem('aspender_admin_authenticated','yes');
   closeModal();
   renderAdminEditor();
   showSection('admin');
  }catch(error){
   document.getElementById('adminLoginError').textContent=error.message||'Impossible de vérifier le mot de passe.';
  }
 });
}
function adminLogout(){
 sessionStorage.removeItem('aspender_admin_authenticated');
 showSection('accueil');
}
function saveLocalCatalog(){
 localStorage.setItem('aspender_admin_catalog',JSON.stringify(products.map(({id,tier,name,cat,price,sizes,tag,image})=>({id,tier,name,cat,price,sizes,tag,image:image||''}))));
}
function renderAdminEditor(){
 document.getElementById('adminHeroTitle').value=document.querySelector('#accueil h1').textContent||defaultHeroTitle;
 document.getElementById('adminHeroText').value=document.querySelector('#accueil .hero p').textContent||defaultHeroText;
 document.getElementById('adminPasswordChangeForm').reset();
 document.getElementById('adminPasswordChangeStatus').textContent='';
 const productEditor=product=>`
  <form class="admin-product" data-product-id="${product.id}">
   <h3>${escapeHtml(product.name)}</h3>
   <label>Nom de l’article</label><input class="admin-input" name="name" type="text" required value="${escapeHtml(product.name)}">
   <label>Prix (FCFA)</label><input class="admin-input" name="price" type="number" min="${product.tier==='standard'?200:0}" max="${product.tier==='standard'?5000:99999999}" required value="${product.price}">
   <label>Changer la photo</label><input class="admin-input" name="photo" type="file" accept="image/*">
   <img class="admin-preview" src="${escapeHtml(product.image||'')}" alt="Aperçu de ${escapeHtml(product.name)}" ${product.image?'':'hidden'}>
   <button class="btn" type="submit">Enregistrer l’article</button>
  </form>`;
 document.getElementById('adminPremiumProducts').innerHTML=products.filter(product=>product.tier==='premium').map(productEditor).join('');
 document.getElementById('adminStandardProducts').innerHTML=products.filter(product=>product.tier==='standard').map(productEditor).join('');
 renderAdminRecords();
 renderTeamAndGallery();
}
function renderAdminRecords(){
 document.getElementById('adminPlayers').innerHTML=teamPlayers.map(player=>`
  <div class="admin-record"><span>#${escapeHtml(player.number)} — ${escapeHtml(player.name)} · ${escapeHtml(player.position)}</span>
   <button type="button" class="btn btn-outline" data-remove-player="${escapeHtml(player.id)}">Supprimer</button>
  </div>`).join('')||'<p class="empty">Aucun joueur ajouté.</p>';
 document.getElementById('adminMatches').innerHTML=teamMatches.map(match=>`
  <div class="admin-record"><span>${escapeHtml(match.date)} — A-SPENDER vs ${escapeHtml(match.opponent)} · ${escapeHtml(match.venue)}</span>
   <button type="button" class="btn btn-outline" data-remove-match="${escapeHtml(match.id)}">Supprimer</button>
  </div>`).join('')||'<p class="empty">Aucun match ajouté.</p>';
 document.getElementById('adminGallery').innerHTML=galleryPhotos.map(photo=>`
  <div class="admin-gallery-item"><img src="${escapeHtml(photo.image)}" alt="${escapeHtml(photo.name)}">
   <span>${escapeHtml(photo.name)}</span><button type="button" class="btn btn-outline" data-remove-photo="${escapeHtml(photo.id)}">Supprimer</button>
  </div>`).join('');
}
function compressImageFile(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=()=>reject(reader.error||new Error('Impossible de lire le fichier image.'));
  reader.onload=()=>{
   const image=new Image();
   image.onerror=()=>reject(new Error(`Impossible d’ouvrir l’image "${file.name}".`));
   image.onload=()=>{
    try{
     const scale=Math.min(1,1200/Math.max(image.width,image.height));
     const canvas=document.createElement('canvas');
     canvas.width=Math.max(1,Math.round(image.width*scale));
     canvas.height=Math.max(1,Math.round(image.height*scale));
     const context=canvas.getContext('2d');
     if(!context)throw new Error('Le navigateur ne peut pas traiter cette image.');
     context.drawImage(image,0,0,canvas.width,canvas.height);
     resolve(canvas.toDataURL('image/jpeg',.76));
    }catch(error){reject(error);}
   };
   image.src=reader.result;
  };
  reader.readAsDataURL(file);
 });
}
document.getElementById('adminPasswordChangeForm')?.addEventListener('submit',async event=>{
 event.preventDefault();
 const form=event.currentTarget;
 const status=document.getElementById('adminPasswordChangeStatus');
 const currentPassword=form.elements.currentPassword.value;
 const newPassword=form.elements.newPassword.value;
 if(newPassword!==form.elements.confirmPassword.value){
  status.textContent='Les deux nouveaux mots de passe ne correspondent pas.';
  return;
 }
 const existingHash=localStorage.getItem('aspender_admin_password_hash');
 if(!existingHash){
  status.textContent='Aucun mot de passe administrateur n’est configuré sur cet appareil.';
  return;
 }
 try{
  if(await hashAdminPassword(currentPassword,existingHash)!==existingHash){
   status.textContent='Le mot de passe actuel est incorrect.';
   return;
  }
  const updatedHash=await hashAdminPassword(newPassword,existingHash);
  localStorage.setItem('aspender_admin_password_hash',updatedHash);
  form.reset();
  status.textContent='Mot de passe modifié sur cet appareil. Garde-le en lieu sûr.';
 }catch(error){
  status.textContent=`Impossible de modifier le mot de passe : ${error.message}`;
 }
});
document.getElementById('adminSettings').addEventListener('submit',event=>{
 event.preventDefault();
 const title=document.getElementById('adminHeroTitle').value.trim();
 const description=document.getElementById('adminHeroText').value.trim();
 try{
  localStorage.setItem('aspender_admin_site',JSON.stringify({title,description}));
  document.querySelector('#accueil h1').textContent=title;
  document.querySelector('#accueil .hero p').textContent=description;
  alert('Textes enregistrés dans ce navigateur.');
 }catch(error){alert(`Impossible d’enregistrer les textes : ${error.message}`);}
});
document.getElementById('adminProducts').addEventListener('change',event=>{
 if(!event.target.matches('input[name="photo"]'))return;
 const file=event.target.files[0];
 if(!file)return;
 if(!file.type.startsWith('image/')){alert('Choisis un fichier image valide.');event.target.value='';return;}
 const reader=new FileReader();
 reader.onerror=()=>alert('Impossible de lire cette image.');
 reader.onload=()=>{
  const image=new Image();
  image.onerror=()=>alert('Impossible de charger cette image.');
  image.onload=()=>{
   const scale=Math.min(1,900/Math.max(image.width,image.height));
   const canvas=document.createElement('canvas');
   canvas.width=Math.round(image.width*scale);
   canvas.height=Math.round(image.height*scale);
   canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
   const form=event.target.closest('.admin-product');
   form.dataset.imageData=canvas.toDataURL('image/jpeg',.78);
   const preview=form.querySelector('.admin-preview');
   preview.src=form.dataset.imageData;
   preview.hidden=false;
  };
  image.src=reader.result;
 };
 reader.readAsDataURL(file);
});
document.getElementById('adminProducts').addEventListener('submit',event=>{
 if(!event.target.matches('.admin-product'))return;
 event.preventDefault();
 const form=event.target;
 const product=products.find(item=>item.id===Number(form.dataset.productId));
 const name=form.elements.name.value.trim();
 const price=Number(form.elements.price.value);
 if(!product||!name||!Number.isFinite(price)||price<Number(form.elements.price.min)||price>Number(form.elements.price.max)){
  alert('Vérifie le nom et le prix autorisé pour cet article.');
  return;
 }
 const previous={name:product.name,price:product.price,image:product.image};
 product.name=name;
 product.price=price;
 if(form.dataset.imageData)product.image=form.dataset.imageData;
 try{
  saveLocalCatalog();
  rebuildShopFilters();
  renderProducts();
  renderAdminEditor();
 }catch(error){
  Object.assign(product,previous);
  alert(`Impossible d’enregistrer l’article dans le stockage local : ${error.message}`);
 }
});
document.querySelectorAll('.admin-add-product').forEach(form=>{
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const tier=form.dataset.tier;
  const name=form.elements.name.value.trim();
  const category=form.elements.category.value.trim();
  const price=Number(form.elements.price.value);
  const sizes=form.elements.sizes.value.split(',').map(size=>size.trim()).filter(Boolean);
  const isStandard=tier==='standard';
  if(!name||!category||!sizes.length||!Number.isFinite(price)||(isStandard&&(price<200||price>5000))||(!isStandard&&price<0)){
   alert(isStandard?'Vérifie les champs et choisis un prix entre 200 et 5 000 FCFA.':'Vérifie le nom, la catégorie, le prix et les tailles.');
   return;
  }
  const file=form.elements.photo.files[0];
  if(file&&!file.type.startsWith('image/')){
   alert('Choisis un fichier image valide.');
   return;
  }
  const nextId=Math.max(0,...products.filter(product=>product.tier===tier).map(product=>product.id))+1;
  let image='';
  try{
   if(file)image=await compressImageFile(file);
   const product={id:nextId,tier,name,cat:category,price,sizes,tag:'',image};
   products.push(product);
   try{
    saveLocalCatalog();
   }catch(error){
    products.pop();
    throw error;
   }
   rebuildShopFilters();
   renderProducts();
   renderAdminEditor();
   alert(`Article ajouté à la Boutique ${isStandard?'Standard':'Premium'} sur cet appareil.`);
  }catch(error){
   alert(`Impossible d’ajouter l’article : ${error.message}`);
  }
 });
});
document.getElementById('adminPlayerForm').addEventListener('submit',event=>{
 event.preventDefault();
 const form=event.currentTarget;
 const player={id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:form.elements.name.value.trim(),number:Number(form.elements.number.value),position:form.elements.position.value.trim()};
 const updated=[...teamPlayers,player];
 try{
  saveLocalRecords('aspender_admin_players',updated);
  teamPlayers=updated;
  renderAdminRecords();
  renderTeamAndGallery();
  form.reset();
 }catch(error){alert(`Impossible d’enregistrer le joueur sur cet appareil : ${error.message}`);}
});
document.getElementById('adminMatchForm').addEventListener('submit',event=>{
 event.preventDefault();
 const form=event.currentTarget;
 const match={id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,date:form.elements.date.value,opponent:form.elements.opponent.value.trim(),venue:form.elements.venue.value.trim()};
 const updated=[...teamMatches,match];
 try{
  saveLocalRecords('aspender_admin_matches',updated);
  teamMatches=updated;
  renderAdminRecords();
  renderTeamAndGallery();
  form.reset();
 }catch(error){alert(`Impossible d’enregistrer le match sur cet appareil : ${error.message}`);}
});
document.getElementById('adminPlayers').addEventListener('click',event=>{
 const button=event.target.closest('[data-remove-player]');
 if(!button)return;
 const updated=teamPlayers.filter(player=>String(player.id)!==button.dataset.removePlayer);
 try{
  saveLocalRecords('aspender_admin_players',updated);
  teamPlayers=updated;
  renderAdminRecords();
  renderTeamAndGallery();
 }catch(error){alert(`Impossible de supprimer le joueur : ${error.message}`);}
});
document.getElementById('adminMatches').addEventListener('click',event=>{
 const button=event.target.closest('[data-remove-match]');
 if(!button)return;
 const updated=teamMatches.filter(match=>String(match.id)!==button.dataset.removeMatch);
 try{
  saveLocalRecords('aspender_admin_matches',updated);
  teamMatches=updated;
  renderAdminRecords();
  renderTeamAndGallery();
 }catch(error){alert(`Impossible de supprimer le match : ${error.message}`);}
});
document.getElementById('adminGallery').addEventListener('click',event=>{
 const button=event.target.closest('[data-remove-photo]');
 if(!button)return;
 const updated=galleryPhotos.filter(photo=>String(photo.id)!==button.dataset.removePhoto);
 try{
  saveLocalRecords('aspender_admin_gallery',updated);
  galleryPhotos=updated;
  renderAdminRecords();
  renderTeamAndGallery();
  document.getElementById('adminGalleryStatus').textContent='Photo supprimée de cet appareil.';
 }catch(error){alert(`Impossible de supprimer la photo : ${error.message}`);}
});
document.getElementById('adminGalleryFiles').addEventListener('change',async event=>{
 const input=event.currentTarget;
 const files=Array.from(input.files||[]);
 const status=document.getElementById('adminGalleryStatus');
 if(!files.length)return;
 if(files.some(file=>!file.type.startsWith('image/'))){
  status.textContent='Un ou plusieurs fichiers ne sont pas des images. Choisis uniquement des images.';
  input.value='';
  return;
 }
 status.textContent='Préparation et enregistrement des photos…';
 try{
  const newPhotos=[];
  for(const file of files){
   const image=await compressImageFile(file);
   newPhotos.push({id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:file.name.replace(/\.[^.]+$/,'')||'Photo A-SPENDER',image});
  }
  const updated=[...galleryPhotos,...newPhotos];
  saveLocalRecords('aspender_admin_gallery',updated);
  galleryPhotos=updated;
  renderAdminRecords();
  renderTeamAndGallery();
  status.textContent=`${newPhotos.length} photo(s) enregistrée(s) sur cet appareil.`;
 }catch(error){
  status.textContent=`Impossible d’enregistrer les photos sur cet appareil : ${error.message}`;
 }finally{input.value='';}
});
const fCat=document.getElementById('fCat'),fSize=document.getElementById('fSize');
let shopTier='premium';
function setShopTier(tier){
 shopTier=tier;
 const standard=tier==='standard';
 document.body.dataset.world=tier;
 document.getElementById('shopTitle').textContent=standard?'Boutique Standard':'Boutique Premium';
 document.getElementById('shopDescription').textContent=standard
  ?'Des accessoires pratiques et des essentiels du club, à petits prix : de 200 à 5 000 FCFA.'
  :'Maillots, chaussures et équipements sélectionnés pour leur style et leur qualité, à des prix raisonnables.';
 document.querySelectorAll('.shop-choice').forEach(button=>{
  const active=button.dataset.tier===tier;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 document.getElementById('fSearch').value='';
 rebuildShopFilters();
 renderProducts();
}
function rebuildShopFilters(){
 const catalog=products.filter(p=>p.tier===shopTier);
 fCat.innerHTML='<option value="">Toutes catégories</option>';
 [...new Set(catalog.map(p=>p.cat))].forEach(c=>fCat.add(new Option(c,c)));
 fSize.innerHTML='<option value="">Toutes tailles</option>';
 [...new Set(catalog.flatMap(p=>p.sizes))].forEach(s=>fSize.add(new Option(s,s)));
 const priceOptions=shopTier==='standard'
  ?[['','Tous les prix'],['0-1000','Moins de 1 000 FCFA'],['1000-2500','1 000 - 2 500 FCFA'],['2500-5000','2 500 - 5 000 FCFA']]
  :[['','Tous les prix'],['0-8000','Moins de 8 000 FCFA'],['8000-20000','8 000 - 20 000 FCFA'],['20000-999999','Plus de 20 000 FCFA']];
 document.getElementById('fPrice').replaceChildren(...priceOptions.map(([value,label])=>new Option(label,value)));
}
function fmt(n){return n.toLocaleString('fr-FR')+' FCFA'}
function renderProducts(){
 const q=document.getElementById('fSearch').value.toLowerCase(),cat=fCat.value,size=fSize.value,pr=document.getElementById('fPrice').value;
 let [min,max]=pr?pr.split('-').map(Number):[0,shopTier==='standard'?5000:999999];
 const list=products.filter(p=>p.tier===shopTier&&p.name.toLowerCase().includes(q)&&(!cat||p.cat===cat)&&(!size||p.sizes.includes(size))&&p.price>=min&&p.price<=max);
 document.getElementById('shopCount').textContent=list.length+' article(s)';
 document.getElementById('productGrid').innerHTML=list.map((p,index)=>`
  <div class="card" style="--card-index:${index}">
   <div class="thumb">${p.tag?`<span class="tag">${escapeHtml(p.tag)}</span>`:''}${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`:'Photo à ajouter'}</div>
   <div class="card-body">
    <h3>${escapeHtml(p.name)}</h3><div class="price">${fmt(p.price)}</div>
    <select id="sz${p.id}">${p.sizes.map(s=>`<option>${s}</option>`).join('')}</select>
    <button class="btn btn-full" onclick="addToCart(${p.id})">Ajouter au panier</button>
   </div>
  </div>`).join('')||'<p class="empty">Aucun article ne correspond à votre recherche.</p>';
}
['fSearch','fCat','fSize','fPrice'].forEach(id=>document.getElementById(id).addEventListener('input',renderProducts));
rebuildShopFilters();
renderProducts();

/* cart */
let cart=JSON.parse(localStorage.getItem('aspender_cart')||'[]');
function saveCart(){localStorage.setItem('aspender_cart',JSON.stringify(cart));renderCart();}
function addToCart(id){
 const p=products.find(x=>x.id===id),size=document.getElementById('sz'+id).value;
 const row=cart.find(c=>c.id===id&&c.size===size);
 if(row)row.qty++;else cart.push({id,name:p.name,price:p.price,size,qty:1});
 saveCart();
}
function changeQty(i,d){cart[i].qty+=d;if(cart[i].qty<1)cart.splice(i,1);saveCart();}
function removeRow(i){cart.splice(i,1);saveCart();}
function renderCart(){
 document.getElementById('cartCount').textContent=cart.reduce((a,c)=>a+c.qty,0);
 const el=document.getElementById('cartList');
 el.innerHTML=cart.length?cart.map((c,i)=>`
  <div class="cart-row"><div class="ci"><b>${c.name}</b><br><span style="font-size:12.5px;color:var(--ink-soft)">Taille ${c.size}</span></div>
  <input type="number" min="1" value="${c.qty}" onchange="setQty(${i},this.value)">
  <div class="cp">${fmt(c.price*c.qty)}</div>
  <button onclick="removeRow(${i})">Retirer</button></div>`).join('')
  :'<p class="empty">Votre panier est vide. Allez faire un tour en boutique.</p>';
 const total=cart.reduce((a,c)=>a+c.price*c.qty,0);
 document.getElementById('cartTotal').textContent=fmt(total);
 document.getElementById('toCheckout').style.display=cart.length?'inline-block':'none';
}
function setQty(i,v){cart[i].qty=Math.max(1,parseInt(v)||1);saveCart();}
renderCart();

/* checkout */
const whatsappNumber='22892951311';
function sendOrderToWhatsApp(){
 const form=document.getElementById('checkoutForm');
 const name=document.getElementById('ckName').value.trim();
 const phone=document.getElementById('ckPhone').value.trim();
 const address=document.getElementById('ckAddr').value.trim();
 const payMode=document.querySelector('input[name="pay"]:checked') ? document.querySelector('input[name="pay"]:checked').parentElement.textContent.replace(/\s+/g,' ').trim() : 'Paiement à la livraison';
 const total=cart.reduce((a,c)=>a+c.price*c.qty,0);
 const items=cart.map(c=>`- ${c.name} (${c.size}) x${c.qty} : ${fmt(c.price*c.qty)}`).join('\n');
 const ref='ASP-'+Math.floor(10000+Math.random()*89999);
 const message=`Bonjour, je souhaite confirmer ma commande *${ref}*.%0A%0A*Client :* ${encodeURIComponent(name)}%0A*Téléphone :* ${encodeURIComponent(phone)}%0A*Adresse :* ${encodeURIComponent(address)}%0A*Mode de paiement :* ${encodeURIComponent(payMode)}%0A%0A*Produits :*%0A${encodeURIComponent(items)}%0A%0A*Total :* ${encodeURIComponent(fmt(total))}`;
 window.open(`https://wa.me/${whatsappNumber}?text=${message}`,'_blank');
 return ref;
}
document.getElementById('checkoutForm').addEventListener('submit',e=>{
 e.preventDefault();
 const ref=sendOrderToWhatsApp();
 document.getElementById('confRef').textContent=`Commande ${ref} confirmée pour un total de ${fmt(cart.reduce((a,c)=>a+c.price*c.qty,0))}. Vous serez contacté au numéro indiqué pour la livraison.`;
 document.getElementById('confBox').style.display='block';
 cart=[];saveCart();
});

/* account */
let accMode='in';
function accTab(m){
 accMode=m;
 document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('on', tab.textContent.trim().toLowerCase().includes(m==='in'?'connexion':'compte')));
 document.getElementById('accSubmit').textContent=m==='in'?'Se connecter':'Créer le compte';
}
document.getElementById('accForm').addEventListener('submit',e=>{
 e.preventDefault();
 document.getElementById('accEmail').textContent=document.getElementById('accEmailIn').value;
 document.getElementById('accLogged').style.display='block';
 document.getElementById('accForms').style.display='none';
});
function logout(){document.getElementById('accLogged').style.display='none';document.getElementById('accForms').style.display='block';}

/* reviews */
document.getElementById('reviewForm').addEventListener('submit',e=>{
 e.preventDefault();
 const el=document.getElementById('reviewList');
 if(el.querySelector('.empty'))el.innerHTML='';
 el.insertAdjacentHTML('afterbegin',`<div class="review-item"><b>${document.getElementById('rvName').value}</b> — ${document.getElementById('rvScore').value}/5<br>${document.getElementById('rvText').value}</div>`);
 e.target.reset();
});

/* team and gallery */
renderTeamAndGallery();

/* contact / whatsapp */
document.getElementById('waBtn').href=`https://wa.me/${whatsappNumber}`;
document.getElementById('waBtn').textContent='Écrire sur WhatsApp';
document.getElementById('contactForm').addEventListener('submit',e=>{e.preventDefault();window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour A-SPENDER STORE, je souhaite vous contacter.')}`,'_blank');e.target.reset();});

/* legal modal */
const legal={
 privacy:{t:'Politique de confidentialité',b:"Modèle à adapter avant publication. A-SPENDER STORE collecte les données nécessaires au traitement des commandes : nom, téléphone, adresse de livraison. Ces données ne sont pas revendues à des tiers. Le client peut demander la consultation ou la suppression de ses données en contactant la boutique. Ce texte doit être validé par un professionnel du droit avant mise en ligne."},
 terms:{t:"Conditions générales d'utilisation",b:"Modèle à adapter avant publication. L'utilisation du site implique l'acceptation des présentes conditions. Les prix sont indiqués en FCFA. Les commandes sont confirmées par téléphone avant expédition. Les délais de livraison sont communiqués au moment de la commande. Ce texte doit être validé par un professionnel du droit avant mise en ligne."}
};
function openModal(k){document.getElementById('modalBody').innerHTML=`<h3>${legal[k].t}</h3><p>${legal[k].b}</p>`;document.getElementById('modal').style.display='flex';}
function closeModal(){document.getElementById('modal').style.display='none';}

function openCloudAdmin(){
 if(isAdmin()){
  window.renderAdminEditor();
  showSection('admin');
  return;
 }
 document.getElementById('modalBody').innerHTML=`
  <h3>Accès administrateur</h3>
  <p>Un lien de connexion sécurisé sera envoyé à l’adresse administrateur configurée.</p>
  <form id="adminLoginForm">
   <p id="adminLoginError" class="admin-error" role="status"></p>
   <button class="btn" type="submit">M’envoyer le lien de connexion</button>
  </form>`;
 document.getElementById('modal').style.display='flex';
 document.getElementById('adminLoginForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const status=document.getElementById('adminLoginError');
  try{
   const {error}=await backend.auth.signInWithOtp({
    email:window.ASPENDER_CONFIG.adminEmail,
    options:{emailRedirectTo:window.location.href}
   });
   if(error)throw error;
   status.textContent=`Lien envoyé à ${window.ASPENDER_CONFIG.adminEmail}.`;
  }catch(error){
   status.textContent=`Impossible d’envoyer le lien : ${error.message}`;
  }
 });
}
window.openAdmin=openCloudAdmin;
window.adminLogout=async function(){
 const {error}=await backend.auth.signOut();
 if(error){reportBackendError('Impossible de fermer la session',error);return;}
 adminUser=null;
 showSection('accueil');
};
window.renderAdminEditor=function(){
 document.getElementById('adminHeroTitle').value=siteSettings.title||defaultHeroTitle;
 document.getElementById('adminHeroText').value=siteSettings.description||defaultHeroText;
 const productEditor=product=>`
  <form class="admin-product" data-product-id="${product.id}">
   <h3>${escapeHtml(product.name)}</h3>
   <label>Nom de l’article</label><input class="admin-input" name="name" type="text" required value="${escapeHtml(product.name)}">
   <label>Prix (FCFA)</label><input class="admin-input" name="price" type="number" min="${product.tier==='standard'?200:0}" max="${product.tier==='standard'?5000:99999999}" required value="${product.price}">
   <label>Changer la photo</label><input class="admin-input" name="photo" type="file" accept="image/*">
   <img class="admin-preview" src="${escapeHtml(product.image||'')}" alt="Aperçu de ${escapeHtml(product.name)}" ${product.image?'':'hidden'}>
   <button class="btn" type="submit">Enregistrer l’article</button>
  </form>`;
 document.getElementById('adminPremiumProducts').innerHTML=products.filter(product=>product.tier==='premium').map(productEditor).join('');
 document.getElementById('adminStandardProducts').innerHTML=products.filter(product=>product.tier==='standard').map(productEditor).join('');
 renderAdminRecords();
 renderTeamAndGallery();
};

async function uploadSharedImage(dataUrl){
 const blob=await (await fetch(dataUrl)).blob();
 const path=`${Date.now()}-${crypto.randomUUID()}.jpg`;
 const {error}=await backend.storage.from('aspender-images').upload(path,blob,{contentType:'image/jpeg'});
 if(error)throw error;
 return backend.storage.from('aspender-images').getPublicUrl(path).data.publicUrl;
}
async function saveProductFromForm(form){
 const product=products.find(item=>item.id===Number(form.dataset.productId));
 const name=form.elements.name.value.trim();
 const price=Number(form.elements.price.value);
 if(!product||!name||!Number.isFinite(price)||price<Number(form.elements.price.min)||price>Number(form.elements.price.max)){
  throw new Error('Vérifie le nom et le prix autorisé pour cet article.');
 }
 let image=product.image||'';
 if(form.dataset.imageData)image=await uploadSharedImage(form.dataset.imageData);
 const updated={...product,name,price,image};
 const {error}=await backend.from('products').update({name,price,image}).eq('id',product.id);
 if(error)throw error;
 Object.assign(product,updated);
 rebuildShopFilters();
 renderProducts();
 renderAdminEditor();
}
async function addProductFromForm(form){
 const tier=form.dataset.tier;
 const name=form.elements.name.value.trim();
 const cat=form.elements.category.value.trim();
 const price=Number(form.elements.price.value);
 const sizes=form.elements.sizes.value.split(',').map(size=>size.trim()).filter(Boolean);
 const standard=tier==='standard';
 if(!name||!cat||!sizes.length||!Number.isFinite(price)||(standard&&(price<200||price>5000))||(!standard&&price<0)){
  throw new Error(standard?'Vérifie les champs et choisis un prix entre 200 et 5 000 FCFA.':'Vérifie le nom, la catégorie, le prix et les tailles.');
 }
 const file=form.elements.photo.files[0];
 if(file&&!file.type.startsWith('image/'))throw new Error('Choisis un fichier image valide.');
 const id=Math.max(0,...products.filter(product=>product.tier===tier).map(product=>product.id))+1;
 const image=file?await uploadSharedImage(await compressImageFile(file)):'';
 const product={id,tier,name,cat,price,sizes,tag:'',image};
 const {error}=await backend.from('products').insert(product);
 if(error)throw error;
 products.push(product);
 form.reset();
 rebuildShopFilters();
 renderProducts();
 renderAdminEditor();
}
async function saveSiteSettings(form){
 const title=form.elements.adminHeroTitle.value.trim();
 const description=form.elements.adminHeroText.value.trim();
 const {error}=await backend.from('site_settings').upsert({id:true,title,description});
 if(error)throw error;
 siteSettings={title,description};
 document.querySelector('#accueil h1').textContent=title;
 document.querySelector('#accueil .hero p').textContent=description;
 alert('Textes enregistrés et publiés pour tous les visiteurs.');
}
async function addTeamPlayer(form){
 const player={id:crypto.randomUUID(),name:form.elements.name.value.trim(),number:Number(form.elements.number.value),position:form.elements.position.value.trim()};
 const {error}=await backend.from('team_players').insert(player);
 if(error)throw error;
 teamPlayers.push(player);
 renderAdminRecords();
 renderTeamAndGallery();
 form.reset();
}
async function addTeamMatch(form){
 const match={id:crypto.randomUUID(),date:form.elements.date.value,opponent:form.elements.opponent.value.trim(),venue:form.elements.venue.value.trim()};
 const {error}=await backend.from('team_matches').insert(match);
 if(error)throw error;
 teamMatches.push(match);
 renderAdminRecords();
 renderTeamAndGallery();
 form.reset();
}
async function removeSharedRow(table,id,records){
 const {error}=await backend.from(table).delete().eq('id',id);
 if(error)throw error;
 const index=records.findIndex(record=>String(record.id)===String(id));
 if(index!==-1)records.splice(index,1);
 renderAdminRecords();
 renderTeamAndGallery();
}
async function addGalleryFiles(input){
 const files=Array.from(input.files||[]);
 const status=document.getElementById('adminGalleryStatus');
 if(!files.length)return;
 if(files.some(file=>!file.type.startsWith('image/')))throw new Error('Choisis uniquement des fichiers image.');
 status.textContent='Préparation et enregistrement des photos…';
 const added=[];
 for(const file of files){
  const image=await uploadSharedImage(await compressImageFile(file));
  const photo={id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,'')||'Photo A-SPENDER',image};
  const {error}=await backend.from('gallery_photos').insert(photo);
  if(error)throw error;
  added.push(photo);
 }
 galleryPhotos.push(...added);
 renderAdminRecords();
 renderTeamAndGallery();
 status.textContent=`${added.length} photo(s) publiées pour tous les visiteurs.`;
}
window.addEventListener('submit',event=>{
 const form=event.target;
 const isAdminForm=form.matches('#adminSettings,#adminPlayerForm,#adminMatchForm,.admin-product,.admin-add-product');
 if(!isAdminForm)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 (async()=>{
  if(!isAdmin())throw new Error('Connecte-toi avec le compte administrateur.');
  if(form.id==='adminSettings')await saveSiteSettings(form);
  else if(form.id==='adminPlayerForm')await addTeamPlayer(form);
  else if(form.id==='adminMatchForm')await addTeamMatch(form);
  else if(form.matches('.admin-product'))await saveProductFromForm(form);
  else await addProductFromForm(form);
 })().catch(error=>alert(`Échec de l’enregistrement : ${error.message}`));
},true);
window.addEventListener('change',event=>{
 const target=event.target;
 if(target.matches('#adminProducts input[name="photo"]')){
  event.stopImmediatePropagation();
  const file=target.files[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){alert('Choisis un fichier image valide.');target.value='';return;}
  const form=target.closest('.admin-product');
  compressImageFile(file).then(dataUrl=>{
   form.dataset.imageData=dataUrl;
   const preview=form.querySelector('.admin-preview');
   preview.src=dataUrl;
   preview.hidden=false;
  }).catch(error=>alert(`Impossible de préparer l’image : ${error.message}`));
 }else if(target.matches('#adminGalleryFiles')){
  event.stopImmediatePropagation();
  addGalleryFiles(target).catch(error=>{
   document.getElementById('adminGalleryStatus').textContent=`Impossible de publier les photos : ${error.message}`;
  }).finally(()=>{target.value='';});
 }
},true);
window.addEventListener('click',event=>{
 const button=event.target.closest('[data-remove-player],[data-remove-match],[data-remove-photo]');
 if(!button)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 if(!isAdmin()){alert('Connecte-toi avec le compte administrateur.');return;}
 if(button.hasAttribute('data-remove-player')){
  removeSharedRow('team_players',button.dataset.removePlayer,teamPlayers).catch(error=>alert(`Impossible de supprimer le joueur : ${error.message}`));
 }else if(button.hasAttribute('data-remove-match')){
  removeSharedRow('team_matches',button.dataset.removeMatch,teamMatches).catch(error=>alert(`Impossible de supprimer le match : ${error.message}`));
 }else{
  removeSharedRow('gallery_photos',button.dataset.removePhoto,galleryPhotos).then(()=>{
   document.getElementById('adminGalleryStatus').textContent='Photo supprimée.';
  }).catch(error=>alert(`Impossible de supprimer la photo : ${error.message}`));
 }
},true);

backend.auth.onAuthStateChange((event,session)=>{
 adminUser=session?.user||null;
 if(adminUser&&!isAdmin()){
  adminUser=null;
  backend.auth.signOut().catch(error=>reportBackendError('Impossible de fermer la session non autorisée',error));
  const status=document.getElementById('adminLoginError');
  if(status)status.textContent='Ce compte n’est pas autorisé à administrer la boutique.';
  return;
 }
 if(event==='SIGNED_IN'&&isAdmin()){
  closeModal();
  window.renderAdminEditor();
  showSection('admin');
 }
});
backend.auth.getSession().then(({data,error})=>{
 if(error)throw error;
 adminUser=data.session?.user||null;
 if(adminUser&&!isAdmin()){
  adminUser=null;
  return backend.auth.signOut();
 }
 return null;
}).catch(error=>reportBackendError('Impossible de vérifier la session',error));
loadSharedData().catch(error=>reportBackendError('Impossible de charger les données en ligne',error));