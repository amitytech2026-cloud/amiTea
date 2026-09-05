const state={size:'16oz',temp:null,basetype:null,fruit:null,tea:null,add:null,boba:null,bobaPrice:0,qty:1};
let menuTeaOptions=null;
let menuAddOptions=null;

const MENU=[
  {
    title:'Tea',
    items:[
      ['Black Tea · no add','$5'],
      ['Oolong Tea · no add','$5'],
      ['Black/Oolong Tea · Whole or 2% milk latte','$5.50'],
      ['Black or Oolong · oat milk latte','$6.00'],
      ['Black or Oolong · lemonade','$6.00'],
      ['Black or Oolong · sparkling water','$6.00'],
      ['Matcha Tea · no add','$6.00'],
      ['Matcha Tea · Whole or 2% milk latte','$6.50'],
      ['Matcha · oat milk latte','$7.00'],
      ['Matcha · lemonade','$7.00'],
      ['Matcha · sparkling water','$7.00']
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

localStorage.removeItem('amitea-sales');
sessionStorage.removeItem('amitea-current-order');
sessionStorage.removeItem('amitea-active-order-number');
if(!localStorage.getItem('amitea-records-reset-v3')){
  localStorage.removeItem('amitea-sales-v2');
  sessionStorage.removeItem('amitea-current-order-v2');
  sessionStorage.removeItem('amitea-active-order-number-v2');
  localStorage.setItem('amitea-records-reset-v3','1');
}
const CART_KEY='amitea-current-order-v2';
const ORDER_KEY='amitea-active-order-number-v2';
const cart=JSON.parse(sessionStorage.getItem(CART_KEY)||'[]');
const REVIEW=5; // index of the review and sale-record step
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

document.getElementById('saleRecordAccess').addEventListener('click',()=>{
  showReview();
  openBookkeeping();
});

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

  if(g==='temp'){
    state.temp=opt.dataset.val;
    applyTemperatureRules();
  }
  if(g==='basetype'){
    state.basetype=opt.dataset.val;state.fruit=null;state.tea=null;state.add=null;
    document.querySelectorAll('.opt[data-group="fruit"],.opt[data-group="tea"]').forEach(o=>o.classList.remove('sel'));
    const showFruit=state.basetype==='fruit'||state.basetype==='mixed';
    const showTea=state.basetype==='tea'||state.basetype==='mixed';
    document.getElementById('fruitBlock').style.display=showFruit?'block':'none';
    document.getElementById('teaBlock').style.display=showTea?'block':'none';
    applyBaseRules();
    applyTeaRules();
    applyMatchaRules();
  }
  if(g==='fruit'){
    state.fruit=opt.dataset.val;
    if(state.basetype!=='mixed'){
      state.basetype='fruit';
      state.tea=null;
      document.querySelectorAll('.opt[data-group="tea"]').forEach(o=>o.classList.remove('sel'));
    }
    applyBaseRules();
    applyTeaRules();
    applyAddRules();
  }
  if(g==='tea'){
    state.tea=opt.dataset.val;
    if(state.basetype!=='mixed'){
      state.basetype='tea';
      state.fruit=null;
      document.querySelectorAll('.opt[data-group="fruit"]').forEach(o=>o.classList.remove('sel'));
    }
    applyBaseRules();
    applyTeaRules();
    applyMatchaRules();
  }
  if(g==='add'){
    state.add=opt.dataset.val;
    applyAddRules();
    applyTemperatureRules();
  }
  if(g==='boba'){state.boba=opt.dataset.val;state.bobaPrice=+opt.dataset.price;}

  refreshNext();
  renderSoFar();
    applyAddRules();
});

// Fruit and tea combinations are restricted for Fruit & Tea drinks.
function applyTeaRules(){
  const restrictions=menuTeaOptions
    ? ['Matcha'].filter(tea=>!menuTeaOptions.includes(tea))
    : (state.tea==='Black'||state.tea==='Oolong' ? ['Matcha'] : []);
  document.querySelectorAll('.opt[data-group="tea"]').forEach(o=>{
    const disabled=restrictions.includes(o.dataset.val);
    o.classList.toggle('disabled',disabled);
    if(disabled && state.tea===o.dataset.val){
      state.tea=null;o.classList.remove('sel');
    }
  });
}

function applyBaseRules(){
  document.querySelectorAll('.opt[data-group="basetype"]').forEach(option=>{
    const disabled=!!state.basetype && option.dataset.val!==state.basetype;
    option.classList.toggle('disabled',disabled);
    option.disabled=disabled;
    option.setAttribute('aria-disabled',String(disabled));
  });
}

function applyMatchaRules(){
  const addOptions=[...document.querySelectorAll('.opt[data-group="add"]')];
  const teaOnly=state.basetype==='tea' && (state.tea==='Matcha'||((state.tea==='Black'||state.tea==='Oolong')&&!menuAddOptions));
  if(teaOnly){
    const noAdd=addOptions.find(option=>option.dataset.val==='No add');
    if(noAdd){
      state.add='No add';
      noAdd.disabled=false;
      noAdd.classList.remove('disabled');
      noAdd.click();
    }
  }
  applyAddRules();
}

function applyAddRules(){
  const addOptions=[...document.querySelectorAll('.opt[data-group="add"]')];
  const teaOnly=state.basetype==='tea' && (state.tea==='Matcha'||((state.tea==='Black'||state.tea==='Oolong')&&!menuAddOptions));
  addOptions.forEach(option=>{
    const allowed=menuAddOptions || (state.add ? [state.add] : null);
    const disabled=teaOnly
      ? option.dataset.val!=='No add'
      : !!allowed && !allowed.includes(option.dataset.val);
    option.classList.toggle('disabled',disabled);
    option.disabled=disabled;
    option.setAttribute('aria-disabled',String(disabled));
  });
}

function applyTemperatureRules(){
  const hot=document.querySelector('.opt[data-group="temp"][data-val="Hot"]');
  const sparklingOption=document.querySelector('.opt[data-group="add"][data-val="Sparkling water"]');
  if(!hot || !sparklingOption) return;
  const sparkling=state.add==='Sparkling water';
  const hotSelected=state.temp==='Hot';
  hot.classList.toggle('disabled',sparkling);
  hot.disabled=sparkling;
  hot.setAttribute('aria-disabled',String(sparkling));
  sparklingOption.classList.toggle('disabled',hotSelected);
  sparklingOption.disabled=hotSelected;
  sparklingOption.setAttribute('aria-disabled',String(hotSelected));
  if(sparkling && state.temp!=='Iced') selectPresetOption('temp','Iced');
  if(hotSelected && sparkling){
    state.add=null;
    sparklingOption.classList.remove('sel');
    applyAddRules();
  }
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
  if(item.includes('whole or 2% milk')) menuAddOptions=['Whole milk','2% milk'];
  else if(item.includes('oat milk')) menuAddOptions=['Oat milk'];
  else if(item.includes('lemonade')) menuAddOptions=['Lemonade'];
  else if(item.includes('sparkling water')) menuAddOptions=['Sparkling water'];
  if(item.includes('black/oolong/matcha')) menuTeaOptions=['Black','Oolong','Matcha'];
  else if(item.includes('black') && item.includes('oolong')) menuTeaOptions=['Black','Oolong'];
  else if(item.includes('matcha')) menuTeaOptions=['Matcha'];
  else if(item.includes('black')) menuTeaOptions=['Black'];
  else if(item.includes('oolong')) menuTeaOptions=['Oolong'];
  const hasFruit= item.includes('fruit') || item.includes('strawberry') || item.includes('blueberry') || item.includes('mango');
  if(item.includes('fruit & tea') || item.includes(' + ')) selectPresetOption('basetype','mixed');
  else if(hasFruit) selectPresetOption('basetype','fruit');
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

  applyTemperatureRules();

  showPanel(0);
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
  const orderNumber=ensureOrderNumber();
  const unit=drinkUnitPrice();
  cart.push({orderNumber,name:drinkName(),desc:drinkDesc(),qty:state.qty,unit,total:unit*state.qty});
  sessionStorage.setItem(CART_KEY,JSON.stringify(cart));
}
function resetBuilder(){
  Object.assign(state,{size:'16oz',temp:null,basetype:null,fruit:null,tea:null,add:null,boba:null,bobaPrice:0,qty:1});
  menuTeaOptions=null;
  menuAddOptions=null;
  document.querySelectorAll('.opt.sel').forEach(o=>o.classList.remove('sel'));
  document.getElementById('fruitBlock').style.display='none';
  document.getElementById('teaBlock').style.display='none';
  document.getElementById('qtyNum').textContent='1';
  panels.forEach(p=>{const b=p.querySelector('[data-next]');if(b)b.disabled=true;});
  document.getElementById('addMore').disabled=false;
  document.getElementById('orderMore2').disabled=false;
  reached=0;
  applyBaseRules();
  applyTeaRules();
  applyMatchaRules();
  applyTemperatureRules();
  renderSoFar();
}

/* amount step actions */
document.getElementById('addOrder').onclick=()=>{
  const button=document.getElementById('addOrder');
  if(button.disabled || !state.temp || !baseComplete() || !state.add || !state.boba) return;
  commitDrink();
  button.disabled=true;
  resetBuilder();
  renderReview();
  showReview();
};
document.getElementById('addMore').onclick=()=>{
  if(!state.temp || !baseComplete() || !state.add || !state.boba) return;
  commitDrink();
  resetBuilder();
  document.getElementById('addOrder').disabled=false;
  if(cart.length>=4){
    renderReview();
    showReview();
  }else showPanel(0);
};
function startAnotherDrink(){
  resetBuilder();
  document.getElementById('addOrder').disabled=false;
  showPanel(0);
}
document.getElementById('orderMore2').onclick=startAnotherDrink;

/* cart + review */
function money(n){return '$'+n.toFixed(2);}
function cartTotal(){return cart.reduce((s,d)=>s+d.total,0);}
const WI_TAX_MULTIPLIER=1.055;
function orderTax(){return cartTotal()*(WI_TAX_MULTIPLIER-1);}
function orderTotal(){return cartTotal()*WI_TAX_MULTIPLIER;}
function formatOrderNumber(orderNumber){return `#${orderNumber}`;}
function ensureOrderNumber(){
  let orderNumber=Number(sessionStorage.getItem(ORDER_KEY));
  if(orderNumber)return orderNumber;
  const next=getSales().reduce((highest,sale)=>Math.max(highest,Number(sale.orderNumber)||0),0)+1;
  sessionStorage.setItem(ORDER_KEY,String(next));
  return next;
}
function activeOrderNumber(){return Number(sessionStorage.getItem(ORDER_KEY))||cart[0]?.orderNumber||null;}
function renderReview(){
  const list=document.getElementById('reviewList');
  if(!cart.length){list.innerHTML='<p class="sub">Nothing here yet.</p>';return;}
  list.innerHTML=`<div class="review-order"><div class="order-number">Order ${formatOrderNumber(activeOrderNumber())}</div>${cart.map((d,i)=>`
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
      </div>`).join('')}
      <div class="receipt-row" style="color:var(--green-deep);"><span>Subtotal</span><span>${money(cartTotal())}</span></div>
      <div class="receipt-row" style="color:var(--green-deep);"><span>WI tax</span><span>${money(orderTax())}</span></div>
      <div class="cart-total" style="color:var(--green-deep);border-top-color:var(--line);"><span>Total</span><span>${money(orderTotal())}</span></div>
    </div>`;
}
function removeItem(i){
  cart.splice(i,1);
  sessionStorage.setItem(CART_KEY,JSON.stringify(cart));
  renderReview();
    // Clear any visible sale confirmation when the cart is emptied.
  if(!cart.length){
    sessionStorage.removeItem(CART_KEY);
    sessionStorage.removeItem(ORDER_KEY);
    document.getElementById('receiptArea').innerHTML='';
    resetBuilder();showPanel(0);
  }
}
function changeReviewQty(i, delta){
  const drink=cart[i];
  if(!drink) return;
  drink.qty=Math.max(1,drink.qty+delta);
  drink.total=drink.unit*drink.qty;
  sessionStorage.setItem(CART_KEY,JSON.stringify(cart));
  renderReview();
}
/* local sales record and PIN-locked bookkeeping */
const SALES_KEY='amitea-sales-v2';
const BOOKKEEPING_PIN='226283';
const bookkeepingPanel=document.getElementById('bookkeepingPanel');
const bookkeepingLock=document.getElementById('bookkeepingLock');
const bookkeepingContent=document.getElementById('bookkeepingContent');
const bookkeepingPin=document.getElementById('bookkeepingPin');
const bookkeepingError=document.getElementById('bookkeepingError');

function getSales(){
  try{return JSON.parse(localStorage.getItem(SALES_KEY)||'[]');}
  catch{return []}
}
function saveSale(){
  const sales=getSales();
  sales.unshift({id:Date.now(),orderNumber:activeOrderNumber(),createdAt:new Date().toISOString(),subtotal:cartTotal(),tax:orderTax(),total:orderTotal(),items:cart.map(d=>({name:d.name,desc:d.desc,qty:d.qty,total:d.total}))});
  localStorage.setItem(SALES_KEY,JSON.stringify(sales));
}
function renderBookkeeping(){
  const sales=getSales().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const total=sales.reduce((sum,sale)=>sum+sale.total,0);
  document.getElementById('bookkeepingSummary').innerHTML=`<strong>${sales.length}</strong> sale${sales.length===1?'':'s'} · <strong>${money(total)}</strong> total`;
  const groups=sales.reduce((byDate,sale)=>{
    const date=new Date(sale.createdAt);
    const key=date.toLocaleDateString();
    (byDate[key] ||= []).push(sale);
    return byDate;
  },{});
  document.getElementById('salesList').innerHTML=sales.length
    ? Object.entries(groups).map(([date,dateSales])=>`
      <section class="sales-date">
        <h3>${date}</h3>
        ${dateSales.map(sale=>`
          <article class="sale-record">
            <div class="sale-record-head"><strong>Order ${formatOrderNumber(sale.orderNumber)} · ${money(sale.total)}</strong><time>${new Date(sale.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</time></div>
            <div class="sale-record-items">${sale.items.map(item=>`${item.qty}× ${item.name}`).join(' · ')}</div>
          </article>`).join('')}
      </section>`).join('')
    : '<p class="sub">No sales recorded yet.</p>';
}
function openBookkeeping(){
  bookkeepingPanel.hidden=false;
  bookkeepingLock.hidden=false;
  bookkeepingContent.hidden=true;
  bookkeepingError.hidden=true;
  bookkeepingPin.value='';
  bookkeepingPanel.scrollIntoView({behavior:'smooth',block:'start'});
  bookkeepingPin.focus();
}
document.getElementById('unlockBookkeeping').onclick=()=>{
  const entered=bookkeepingPin.value.trim();
  if(entered!==BOOKKEEPING_PIN){
    bookkeepingError.textContent='Incorrect PIN.';
    bookkeepingError.hidden=false;
    bookkeepingPin.select();
    return;
  }
  bookkeepingError.hidden=true;
  bookkeepingLock.hidden=true;
  bookkeepingContent.hidden=false;
  renderBookkeeping();
};
bookkeepingPin.addEventListener('keydown',event=>{if(event.key==='Enter')document.getElementById('unlockBookkeeping').click();});
document.getElementById('lockBookkeeping').onclick=()=>{
  bookkeepingContent.hidden=true;
  bookkeepingLock.hidden=false;
  bookkeepingPin.value='';
  bookkeepingPin.focus();
};
document.getElementById('emailBookkeeping').onclick=()=>{
  const sales=getSales().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const body=sales.length
    ? sales.map(sale=>{
        const date=new Date(sale.createdAt).toLocaleString();
        const items=sale.items.map(item=>`${item.qty}x ${item.name}`).join(', ');
        return `Order ${formatOrderNumber(sale.orderNumber)} | ${date} | ${items} | Total ${money(sale.total)}`;
      }).join('\n')
    : 'No sales recorded yet.';
  const subject=encodeURIComponent('amiTEA sales records');
  const message=encodeURIComponent(`amiTEA sales records\n\n${body}`);
  window.location.href=`mailto:support@amiteatea.com?subject=${subject}&body=${message}`;
};
document.getElementById('recordSale').onclick=()=>{
  if(!cart.length)return;
  saveSale();
  const total=cartTotal();
  cart.length=0;
  sessionStorage.removeItem(CART_KEY);
  sessionStorage.removeItem(ORDER_KEY);
  renderReview();
  document.getElementById('receiptArea').innerHTML=`<div class="receipt"><h4>Sale recorded</h4><div class="receipt-row"><span>Subtotal</span><span>${money(total)}</span></div><div class="receipt-row"><span>WI tax</span><span>${money(total*(WI_TAX_MULTIPLIER-1))}</span></div><div class="receipt-row"><span>Total to charge in Jim.com</span><strong>${money(total*WI_TAX_MULTIPLIER)}</strong></div><p class="thanks">This sale is saved in Bookkeeping.</p></div>`;
  resetBuilder();
  showReview();
};
document.getElementById('endOrder').onclick=()=>{
  if(cart.length){
    document.getElementById('receiptArea').innerHTML='<p class="co-error">Record the sale before ending this order.</p>';
    return;
  }
  document.getElementById('receiptArea').innerHTML='';
  resetBuilder();
  document.getElementById('addOrder').disabled=false;
  showPanel(0);
};

/* initial state on load */
renderMenu();
renderReview();
applyTemperatureRules();
renderSoFar();
if(new URLSearchParams(window.location.search).get('bookkeeping')==='1')openBookkeeping();
