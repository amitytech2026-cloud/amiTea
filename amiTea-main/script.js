const state={size:'16oz',temp:null,basetype:null,fruit:null,tea:null,add:null,boba:null,bobaPrice:0,qty:1};

const MENU=[
  {
    title:'Tea',
    items:[
      ['Black Tea · no add','$5'],
      ['Oolong Tea · no add','$5'],
      ['Black/Oolong Tea · Whole or 2% milk latte','$5.50'],
      ['Black or Oolong · oat milk latte','$6.00'],
      ['Black or Oolong · lemonade or sparkling water','$6.00'],
      ['Matcha Tea · no add','$6.00'],
      ['Matcha Tea · Whole or 2% milk latte','$6.50'],
      ['Matcha · oat milk latte','$7.00'],
      ['Matcha · lemonade or sparkling water','$7.00']
    ]
  },
  {
    title:'Fruit',
    items:[
      ['Strawberry Fruit','$6.00'],
      ['Strawberry . Whole or 2% milk latte','$6.50'],
      ['Strawberry . oat milk latte','$7.00'],
      ['Blueberry Fruit','$6.00'],
      ['Blueberry . Whole or 2% milk latte','$6.50'],
      ['Blueberry . oat milk latte','$7.00'],
      ['Mango Fruit','$7.00'],
      ['Mango . Whole or 2% milk latte','$7.50'],
      ['Mango . oat milk latte','$8.00']
    ]
  },
  {
    title:'Fruit & Tea',
    items:[
        ['Strawberry + Black/Oolong/Matcha Tea','$7.00'],
        ['Strawberry + Black/Oolong/Matcha Tea . Whole or 2% milk latte','$7.50'],
        ['Strawberry + Black/Oolong/Matcha Tea . oat milk latte','$8.00'],
        ['Blueberry + Black/Oolong/Matcha Tea','$7.00'],
        ['Blueberry + Black/Oolong/Matcha Tea . Whole or 2% milk latte','$7.50'],
        ['Blueberry + Black/Oolong/Matcha Tea . oat milk latte','$8.00'],
        ['Mango + Black/Oolong/Matcha Tea','$7.00'],
        ['Mango + Black/Oolong/Matcha Tea . Whole or 2% milk latte','$7.50'],
        ['Mango + Black/Oolong/Matcha Tea . oat milk latte','$8.00'],
    ]
  }
];

const cart=[];
const REVIEW=5; // index of the review/checkout step
let current=0;
let reached=0; // furthest step the customer has unlocked
const panels=[...document.querySelectorAll('.panel')];
const stepEls=[...document.querySelectorAll('#stepper .s')];

function renderMenu(){
  const menu=document.getElementById('menuGroups');
  if(!menu) return;
  menu.innerHTML=MENU.map(group=>`
    <section class="menu-group">
      <h3>${group.title}</h3>
      <div class="menu-items">
        ${group.items.map(item=>`<div class="menu-item"><span>${item[0]}</span><span>${item[1]}</span></div>`).join('')}
      </div>
    </section>`).join('')+
    '<p class="menu-note">Whole milk and 2% milk add $0.50. Oat milk adds $1.00. Boba adds $0.75.</p>';
}

function showPanel(i){
  current=i;
  if(i>reached) reached=i;
  panels.forEach(p=>p.classList.toggle('on',+p.dataset.panel===i));
  stepEls.forEach(s=>{
    const si=+s.dataset.i;
    s.classList.toggle('active',si===i);
    s.classList.toggle('done',si<i);
  });
  document.getElementById('sofar').style.display=(i===REVIEW)?'none':'';
  window.scrollTo({top:0,behavior:'smooth'});
  renderSoFar();
}

// show the review panel without unlocking the empty builder's mid-steps
function showReview(){
  current=REVIEW;
  panels.forEach(p=>p.classList.toggle('on',+p.dataset.panel===REVIEW));
  stepEls.forEach(s=>{const si=+s.dataset.i;s.classList.toggle('active',si===REVIEW);s.classList.toggle('done',si<REVIEW);});
  document.getElementById('sofar').style.display='none';
  window.scrollTo({top:0,behavior:'smooth'});
}

// let customers jump to any step they've already reached
stepEls.forEach(s=>s.addEventListener('click',()=>{
  const target=+s.dataset.i;
  if(target===REVIEW && cart.length) return showReview();
  if(target<=reached) showPanel(target);
}));

/* selection handling */
document.addEventListener('click',e=>{
  const opt=e.target.closest('.opt');
  if(!opt) return;
  const g=opt.dataset.group;
  document.querySelectorAll(`.opt[data-group="${g}"]`).forEach(o=>o.classList.remove('sel'));
  opt.classList.add('sel');

  if(g==='temp'){state.temp=opt.dataset.val;}
  if(g==='basetype'){
    state.basetype=opt.dataset.val;state.fruit=null;state.tea=null;
    document.querySelectorAll('.opt[data-group="fruit"],.opt[data-group="tea"]').forEach(o=>o.classList.remove('sel'));
    const showFruit=state.basetype==='fruit'||state.basetype==='mixed';
    const showTea=state.basetype==='tea'||state.basetype==='mixed';
    document.getElementById('fruitBlock').style.display=showFruit?'block':'none';
    document.getElementById('teaBlock').style.display=showTea?'block':'none';
    applyTeaRules();
  }
  if(g==='fruit'){state.fruit=opt.dataset.val;applyTeaRules();}
  if(g==='tea'){state.tea=opt.dataset.val;}
  if(g==='add'){state.add=opt.dataset.val;}
  if(g==='boba'){state.boba=opt.dataset.val;state.bobaPrice=+opt.dataset.price;}

  refreshNext();
  renderSoFar();
});

// Fruit and tea combinations are restricted for Fruit & Tea drinks.
function applyTeaRules(){
  const restrictions=[];
  document.querySelectorAll('.opt[data-group="tea"]').forEach(o=>{
    const disabled=restrictions.includes(o.dataset.val);
    o.classList.toggle('disabled',disabled);
    if(disabled && state.tea===o.dataset.val){
      state.tea=null;o.classList.remove('sel');
    }
  });
}

// build the "so far" chips from current choices; each chip jumps back to its step
function renderSoFar(){
  const bar=document.getElementById('sofar');
  const wrap=document.getElementById('sofarChips');
  const chips=[];
  if(state.temp)  chips.push({k:'Temp',v:state.temp,step:0});
  if(state.tea)   chips.push({k:'Tea',v:state.tea,step:1});
  if(state.fruit) chips.push({k:'Fruit',v:state.fruit,step:1});
  if(state.add)   chips.push({k:'Add',v:state.add,step:2});
  if(state.boba)  chips.push({k:'Boba',v:state.boba,step:3});

  // hidden on the first step and the review step, or when nothing is chosen
  if(!chips.length || current===0 || current===REVIEW){bar.style.display='none';wrap.innerHTML='';return;}
  bar.hidden=false;
  bar.style.display='';
  wrap.innerHTML=chips.map(c=>
    `<button type="button" class="chip" data-step="${c.step}"><span class="k">${c.k}</span>${c.v}</button>`
  ).join('');
  wrap.querySelectorAll('.chip').forEach(ch=>ch.addEventListener('click',()=>{
    const t=+ch.dataset.step;
    if(t<=reached) showPanel(t);
  }));
}

function baseComplete(){
  if(!state.basetype) return false;
  if(state.basetype==='fruit') return !!state.fruit;
  if(state.basetype==='tea') return !!state.tea;
  if(state.basetype==='mixed') return !!state.fruit && !!state.tea;
  return false;
}
function refreshNext(){
  // gated steps in order: temp, base, add, boba
  const checks=[()=>!!state.temp,baseComplete,()=>!!state.add,()=>!!state.boba];
  const btn=panels[current].querySelector('[data-next]');
  if(btn && checks[current]) btn.disabled=!checks[current]();
}

function selectPresetOption(group,value){
  const option=[...document.querySelectorAll(`.opt[data-group="${group}"]`)]
    .find(opt=>opt.dataset.val===value);
  if(option) option.click();
}

function applyMenuPreset(){
  const menuItem=new URLSearchParams(window.location.search).get('menuItem');
  if(!menuItem) return;

  const item=menuItem.toLowerCase();
  if(item.includes('fruit & tea') || item.includes(' + ')) selectPresetOption('basetype','mixed');
  else if(item.includes('fruit')) selectPresetOption('basetype','fruit');
  else selectPresetOption('basetype','tea');

  if(item.includes('matcha') && !item.includes('black/oolong/matcha')) selectPresetOption('tea','Matcha');
  else if(item.includes('oolong') && !item.includes('black')) selectPresetOption('tea','Oolong');
  else if(item.includes('black') && !item.includes('oolong')) selectPresetOption('tea','Black');

  if(item.includes('strawberry') && !item.includes('blueberry') && !item.includes('mango')) selectPresetOption('fruit','Strawberry');
  else if(item.includes('blueberry') && !item.includes('strawberry') && !item.includes('mango')) selectPresetOption('fruit','Blueberry');
  else if(item.includes('mango') && !item.includes('strawberry') && !item.includes('blueberry')) selectPresetOption('fruit','Mango');

  if(item.includes('oat milk')) selectPresetOption('add','Oat milk');
  else if(item.includes('whole milk')) selectPresetOption('add','Whole milk');
  else if(item.includes('lemonade') && !item.includes('sparkling water')) selectPresetOption('add','Lemonade');
  else if(item.includes('sparkling water') && !item.includes('lemonade')) selectPresetOption('add','Sparkling water');

  showPanel(1);
  refreshNext();
}

document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{showPanel(current+1);refreshNext();}));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>showPanel(current-1)));
applyMenuPreset();

/* quantity */
document.getElementById('plus').onclick=()=>{state.qty++;document.getElementById('qtyNum').textContent=state.qty;};
document.getElementById('minus').onclick=()=>{if(state.qty>1){state.qty--;document.getElementById('qtyNum').textContent=state.qty;}};

/* build a drink object */
function drinkUnitPrice(){
  let basePrice;
  if(state.basetype==='tea'){
    basePrice=state.tea==='Matcha'?6:5;
    if(state.add==='Lemonade' || state.add==='Sparkling water'){
      basePrice=state.tea==='Matcha'?7:6;
    }else if(state.add==='Whole milk' || state.add==='2% milk'){
      basePrice+=0.5;
    }else if(state.add==='Oat milk'){
      basePrice+=1;
    }
  }else if(state.basetype==='fruit'){
    basePrice=6;
    if(state.add==='Whole milk' || state.add==='2% milk') basePrice+=0.5;
    if(state.add==='Oat milk') basePrice+=1;
    if(state.add==='Lemonade' || state.add==='Sparkling water') basePrice=7;
  }else{
    basePrice=7;
    if(state.add==='Whole milk' || state.add==='2% milk') basePrice+=0.5;
    if(state.add==='Oat milk') basePrice+=1;
    if(state.add==='Lemonade' || state.add==='Sparkling water') basePrice=8;
  }
  return basePrice+state.bobaPrice;
}
function drinkName(){
  let name;
  if(state.basetype==='fruit') name=state.fruit+' Fruit';
  else if(state.basetype==='tea') name=state.tea+' Tea';
  else name=state.fruit+' + '+state.tea;

  const milkAdditions=['Whole milk','2% milk','Oat milk'];
  return milkAdditions.includes(state.add) ? name+' Latte' : name;
}
function drinkDesc(){
  const bits=[state.size,state.temp];
  if(state.add && state.add!=='No add') bits.push(state.add);
  bits.push(state.boba==='Boba'?'boba':'no boba');
  return bits.join(' · ');
}
function commitDrink(){
  const unit=drinkUnitPrice();
  cart.push({name:drinkName(),desc:drinkDesc(),qty:state.qty,unit,total:unit*state.qty});
  renderCart();
}
function resetBuilder(){
  Object.assign(state,{size:'16oz',temp:null,basetype:null,fruit:null,tea:null,add:null,boba:null,bobaPrice:0,qty:1});
  document.querySelectorAll('.opt.sel').forEach(o=>o.classList.remove('sel'));
  document.getElementById('fruitBlock').style.display='none';
  document.getElementById('teaBlock').style.display='none';
  document.getElementById('qtyNum').textContent='1';
  panels.forEach(p=>{const b=p.querySelector('[data-next]');if(b)b.disabled=true;});
  reached=0;
  applyTeaRules();
  renderSoFar();
}

/* amount step actions */
document.getElementById('addOrder').onclick=()=>{commitDrink();resetBuilder();renderReview();showReview();};
document.getElementById('addMore').onclick=()=>{commitDrink();resetBuilder();showPanel(0);};
document.getElementById('orderMore2').onclick=()=>{showPanel(0);};

/* cart + review */
function money(n){return '$'+n.toFixed(2);}
function cartTotal(){return cart.reduce((s,d)=>s+d.total,0);}
function renderCart(){
  const body=document.getElementById('cartBody');
  if(!cart.length){body.innerHTML='<p class="cart-empty">No drinks yet — build one above.</p>';return;}
  body.innerHTML=cart.map((d,i)=>`
    <div class="cart-item">
      <div>
        <div class="ci-name">${d.qty}× ${d.name}</div>
        <div class="ci-desc">${d.desc}</div>
        <button class="rm" onclick="removeItem(${i})">remove</button>
      </div>
      <div class="ci-price">${money(d.total)}</div>
    </div>`).join('')
    +`<div class="cart-total"><span>Total</span><span>${money(cartTotal())}</span></div>`;
}
function removeItem(i){
  cart.splice(i,1);renderCart();renderReview();
  // keep an open checkout form's total in sync
  if(!cart.length){
    document.getElementById('receiptArea').innerHTML='';
    // close checkout form and restore buttons if the cart is now empty
    if(coForm){coForm.hidden=true;coError.hidden=true;}
    const cb=document.getElementById('checkout'),om=document.getElementById('orderMore2');
    if(cb)cb.style.display='';if(om)om.style.display='';
    resetBuilder();showPanel(0);
  }
}
function changeReviewQty(i, delta){
  const drink=cart[i];
  if(!drink) return;
  drink.qty=Math.max(1,drink.qty+delta);
  drink.total=drink.unit*drink.qty;
  renderCart();
  renderReview();
}
function renderReview(){
  const list=document.getElementById('reviewList');
  if(!cart.length){list.innerHTML='<p class="sub">Nothing here yet.</p>';return;}
  list.innerHTML=cart.map((d,i)=>`
    <div class="cart-item" style="background:var(--cream);color:var(--ink);">
      <div>
        <div class="ci-name" style="color:var(--green-deep)">${d.qty}× ${d.name}</div>
        <div class="ci-desc" style="opacity:.7">${d.desc}</div>
        <div class="review-qty" aria-label="Change number of cups">
          <button type="button" aria-label="Remove one cup" onclick="changeReviewQty(${i},-1)"${d.qty===1?' disabled':''}>−</button>
          <span>${d.qty} cup${d.qty===1?'':'s'}</span>
          <button type="button" aria-label="Add one cup" onclick="changeReviewQty(${i},1)">+</button>
        </div>
        <button class="rm" style="color:var(--gold-deep)" onclick="removeItem(${i})">remove</button>
      </div>
      <div class="ci-price" style="color:var(--green-deep)">${money(d.total)}</div>
    </div>`).join('')
    +`<div class="cart-total" style="color:var(--green-deep);border-top-color:var(--line);"><span>Total</span><span>${money(cartTotal())}</span></div>`;
}

/* checkout */
const coForm=document.getElementById('checkoutForm');
const coError=document.getElementById('coError');

document.getElementById('checkout').onclick=()=>{
  if(!cart.length){
    document.getElementById('receiptArea').innerHTML='<p class="thanks">Add a drink first 🍵</p>';
    return;
  }
  document.getElementById('receiptArea').innerHTML='';
  coForm.hidden=false;
  // hide the pre-form buttons while paying
  document.getElementById('checkout').style.display='none';
  document.getElementById('orderMore2').style.display='none';
  document.getElementById('orderName').focus();
  coForm.scrollIntoView({behavior:'smooth',block:'nearest'});
};

document.getElementById('coCancel').onclick=()=>{
  coForm.hidden=true;
  coError.hidden=true;
  document.getElementById('checkout').style.display='';
  document.getElementById('orderMore2').style.display='';
};

/* contact method toggle (email / text) */
let contactMethod='email';
const emailWrap=document.getElementById('emailWrap');
const phoneWrap=document.getElementById('phoneWrap');
document.querySelectorAll('#contactToggle .seg-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    contactMethod=btn.dataset.contact;
    document.querySelectorAll('#contactToggle .seg-btn').forEach(b=>b.classList.toggle('on',b===btn));
    emailWrap.hidden=contactMethod!=='email';
    phoneWrap.hidden=contactMethod!=='phone';
    document.getElementById(contactMethod==='email'?'contactEmail':'contactPhone').focus();
  });
});
document.getElementById('contactPhone').addEventListener('input',e=>{
  let v=e.target.value.replace(/\D/g,'').slice(0,10);
  if(v.length>6) v=`(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
  else if(v.length>3) v=`(${v.slice(0,3)}) ${v.slice(3)}`;
  else if(v.length) v=`(${v}`;
  e.target.value=v;
});

function markBad(el,bad){el.classList.toggle('bad',bad);return bad;}

document.getElementById('placeOrder').onclick=()=>{
  const name=document.getElementById('orderName');

  // validate
  let firstBad=null;
  const bad=(el,cond)=>{if(markBad(el,cond)&&!firstBad)firstBad=el;return cond;};
  const nameBad=bad(name,name.value.trim().length===0);

  // contact: validate the active method
  const emailEl=document.getElementById('contactEmail');
  const phoneEl=document.getElementById('contactPhone');
  const emailVal=emailEl.value.trim();
  const phoneDigits=phoneEl.value.replace(/\D/g,'');
  let contactBad=false, contactValue='';
  if(contactMethod==='email'){
    contactBad=bad(emailEl,!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal));
    contactValue=emailVal;
    markBad(phoneEl,false);
  }else{
    contactBad=bad(phoneEl,phoneDigits.length!==10);
    contactValue=phoneEl.value.trim();
    markBad(emailEl,false);
  }

  if(nameBad||contactBad){
    coError.textContent = nameBad
      ? "Please enter a name for the order."
      : (contactMethod==='email' ? "Please enter a valid email address." : "Please enter a valid 10-digit phone number.");
    coError.hidden=false;
    if(firstBad) firstBad.focus();
    return;
  }
  coError.hidden=true;

  // success — build receipt
  const orderName=name.value.trim();
  const sentWord=contactMethod==='email'?'Emailed to':'Texted to';
  const subject=encodeURIComponent('amiTEA order confirmation');
  const message=encodeURIComponent(`Order confirmed for ${orderName}. Total: ${money(cartTotal())}.`);
  const confirmationHref=contactMethod==='email'
    ? `mailto:${contactValue}?subject=${subject}&body=${message}`
    : `sms:${phoneDigits}?body=${message}`;
  const rows=cart.map(d=>`<div class="receipt-row"><span>${d.qty}× ${d.name}</span><span>${money(d.total)}</span></div>`).join('');
  coForm.hidden=true;
  document.getElementById('receiptArea').innerHTML=`
    <div class="receipt">
      <h4>Order confirmed — ${orderName}</h4>
      ${rows}
      <div class="receipt-row" style="font-weight:700;"><span>Order total</span><span>${money(cartTotal())}</span></div>
      <div class="receipt-row" style="opacity:.7;"><span>Confirmation</span><span>${sentWord} ${contactValue}</span></div>
      <div class="receipt-actions">
        <a class="btn primary" href="${confirmationHref}">${contactMethod==='email'?'Send email':'Send text'}</a>
        <button class="btn ghost" id="backToMenu">Back to Menu</button>
      </div>
    </div>
    <p class="thanks">Thanks, ${orderName} — use the button above to send your confirmation 💛💚</p>`;
  document.getElementById('backToMenu').onclick=()=>{
    cart.length=0;
    renderCart();
    document.getElementById('receiptArea').innerHTML='';
    document.getElementById('checkout').style.display='';
    document.getElementById('orderMore2').style.display='';
    resetBuilder();
    showPanel(0);
  };
  document.getElementById('receiptArea').scrollIntoView({behavior:'smooth',block:'nearest'});
};

/* initial state on load */
renderMenu();
renderSoFar();
