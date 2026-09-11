const state={size:'16oz',temp:null,basetype:null,fruit:null,tea:null,sweetness:null,add:null,boba:null,bobaPrice:0,qty:1};
let menuTeaOptions=null;
let menuAddOptions=null;
let menuMatchaFizzy=false;

const DANE_COUNTY_TAX_RATE=0.055;
const JIM_PROCESSING_RATE=0.0199;
const JIM_PROCESSING_FLAT_FEE=0.30;
const SELF_EMPLOYMENT_TAX_RATE=0.153;
const ESTIMATED_INCOME_TAX_RATE=0.22;

const MENU=[
  {
    title:'Tea',
    items:[
      ['Black Tea · no add','$5'],
      ['Green Tea · no add','$5'],
      ['Black/Green Tea · Whole or 2% milk latte','$5.50'],
      ['Black or Green · oat milk latte','$6.00'],
      ['Black or Green · lemonade','$6.00'],
      ['Black or Green · fizzy','$6.00'],
      ['Matcha Tea · no add','$6.00'],
      ['Matcha Tea · Whole or 2% milk latte','$6.50'],
      ['Matcha · oat milk latte','$7.00'],
      ['Matcha · lemonade','$7.00'],
      ['Matcha · fizzy','$7.00']
    ]
  },
  {
    title:'Fruit',
    items:[
      ['Strawberry Fruit','$6.00'],
      ['Strawberry . Whole or 2% milk latte','$6.50'],
      ['Strawberry . oat milk latte','$7.00'],
      [' Fruit','$6.00'],
      [' . Whole or 2% milk latte','$6.50'],
      [' . oat milk latte','$7.00'],
      ['Mango Fruit','$7.00'],
      ['Mango . Whole or 2% milk latte','$7.50'],
      ['Mango . oat milk latte','$8.00']
    ]
  },
  {
    title:'Fruit & Tea',
    items:[
        ['Strawberry + Black/Green/Matcha Tea','$7.00'],
        ['Strawberry + Black/Green/Matcha Tea . Whole or 2% milk latte','$7.50'],
        ['Strawberry + Black/Green/Matcha Tea . oat milk latte','$8.00'],
        [' + Black/Green/Matcha Tea','$7.00'],
        [' + Black/Green/Matcha Tea . Whole or 2% milk latte','$7.50'],
        [' + Black/Green/Matcha Tea . oat milk latte','$8.00'],
        ['Mango + Black/Green/Matcha Tea','$7.00'],
        ['Mango + Black/Green/Matcha Tea . Whole or 2% milk latte','$7.50'],
        ['Mango + Black/Green/Matcha Tea . oat milk latte','$8.00'],
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
    state.basetype=opt.dataset.val;state.fruit=null;state.tea=null;state.sweetness=null;state.add=null;
    document.querySelectorAll('.opt[data-group="fruit"],.opt[data-group="tea"],.opt[data-group="sweetness"]').forEach(o=>o.classList.remove('sel'));
    const showFruit=state.basetype==='fruit'||state.basetype==='mixed';
    const showTea=state.basetype==='tea'||state.basetype==='mixed';
    document.getElementById('fruitBlock').style.display=showFruit?'block':'none';
    document.getElementById('teaBlock').style.display=showTea?'block':'none';
    document.getElementById('sweetBlock').style.display='none';
    applyBaseRules();
    applyTeaRules();
    applyMatchaRules();
    applyTemperatureRules();
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
    document.getElementById('sweetBlock').style.display=state.basetype==='tea'?'block':'none';
    applyBaseRules();
    applyTeaRules();
    applyMatchaRules();
    applyTemperatureRules();
  }
  if(g==='sweetness'||g==='unsweetness'){
    state.sweetness=opt.dataset.val;
    document.querySelectorAll('.opt[data-group="sweetness"],.opt[data-group="unsweetness"]').forEach(o=>o.classList.toggle('sel',o===opt));
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
    : (state.tea==='Black'||state.tea==='Green' ? ['Matcha'] : []);
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
  const teaOnly=state.basetype==='tea' && (state.tea==='Matcha'||((state.tea==='Black'||state.tea==='Green')&&!menuAddOptions));
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
  const teaOnly=state.basetype==='tea' && (state.tea==='Matcha'||((state.tea==='Black'||state.tea==='Green')&&!menuAddOptions));
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
  const sparklingOption=document.querySelector('.opt[data-group="add"][data-val="Fizzy"]');
  if(!hot || !sparklingOption) return;
  const sparkling=state.add==='Fizzy' || menuMatchaFizzy;
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
  if(state.sweetness) chips.push({k:'Sweetness',v:state.sweetness,step:1});
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
  if(state.basetype==='tea') return !!state.tea && !!state.sweetness;
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
  menuMatchaFizzy=item.includes('matcha') && item.includes('fizzy');
  if(item.includes('whole or 2% milk')) menuAddOptions=['Whole milk','2% milk'];
  else if(item.includes('oat milk')) menuAddOptions=['Oat milk'];
  else if(item.includes('lemonade')) menuAddOptions=['Lemonade'];
  else if(item.includes('fizzy')) menuAddOptions=['Fizzy'];
  if(item.includes('black/oolong/matcha')) menuTeaOptions=['Black','Green','Matcha'];
  else if(item.includes('black') && item.includes('oolong')) menuTeaOptions=['Black','Green'];
  else if(item.includes('matcha')) menuTeaOptions=['Matcha'];
  else if(item.includes('black')) menuTeaOptions=['Black'];
  else if(item.includes('oolong')) menuTeaOptions=['Green'];
  const hasFruit= item.includes('fruit') || item.includes('strawberry') || item.includes('blueberry') || item.includes('mango');
  if(item.includes('fruit & tea') || item.includes(' + ')) selectPresetOption('basetype','mixed');
  else if(hasFruit) selectPresetOption('basetype','fruit');
  else selectPresetOption('basetype','tea');

  if(item.includes('matcha') && !item.includes('black/oolong/matcha')) selectPresetOption('tea','Matcha');
  else if(item.includes('oolong') && !item.includes('black')) selectPresetOption('tea','Green');
  else if(item.includes('black') && !item.includes('oolong')) selectPresetOption('tea','Black');

  if(item.includes('strawberry') && !item.includes('blueberry') && !item.includes('mango')) selectPresetOption('fruit','Strawberry');
  else if(item.includes('blueberry') && !item.includes('strawberry') && !item.includes('mango')) selectPresetOption('fruit','');
  else if(item.includes('mango') && !item.includes('strawberry') && !item.includes('blueberry')) selectPresetOption('fruit','Mango');

  if(item.includes('oat milk')) selectPresetOption('add','Oat milk');
  else if(item.includes('whole milk')) selectPresetOption('add','Whole milk');
  else if(item.includes('lemonade') && !item.includes('fizzy')) selectPresetOption('add','Lemonade');
  else if(item.includes('fizzy') && !item.includes('lemonade')) selectPresetOption('add','Fizzy');

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
    if(state.add==='Lemonade' || state.add==='Fizzy'){
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
    if(state.add==='Lemonade' || state.add==='Fizzy') basePrice=7;
  }else{
    basePrice=7;
    if(state.add==='Whole milk' || state.add==='2% milk') basePrice+=0.5;
    if(state.add==='Oat milk') basePrice+=1;
    if(state.add==='Lemonade' || state.add==='Fizzy') basePrice=8;
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
  if(state.sweetness) bits.push(state.sweetness);
  if(state.add && state.add!=='No add') bits.push(state.add);
  bits.push(state.boba==='Boba'?'boba':'no boba');
  return bits.join(' · ');
}
function commitDrink(){
  const orderNumber=ensureOrderNumber();
  const unit=drinkUnitPrice();
  cart.push({
    orderNumber,
    name:drinkName(),
    desc:drinkDesc(),
    qty:state.qty,
    unit,
    total:unit*state.qty,
    temp:state.temp||'Iced',
    base:(state.basetype==='fruit'?state.fruit:state.basetype==='tea'?state.tea:`${state.fruit} + ${state.tea}`),
    add:state.add||'No add',
    sweetness:state.sweetness||'Sweetened',
    boba:state.boba||'No boba',
    bobaPrice:state.bobaPrice||0
  });
  sessionStorage.setItem(CART_KEY,JSON.stringify(cart));
}
function resetBuilder(){
  Object.assign(state,{size:'16oz',temp:null,basetype:null,fruit:null,tea:null,sweetness:null,add:null,boba:null,bobaPrice:0,qty:1});
  menuTeaOptions=null;
  menuAddOptions=null;
  document.querySelectorAll('.opt.sel').forEach(o=>o.classList.remove('sel'));
  document.getElementById('fruitBlock').style.display='none';
  document.getElementById('teaBlock').style.display='none';
  document.getElementById('sweetBlock').style.display='none';
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
let builderTipPercent=0.18;
function money(n){return '$'+(Number(n)||0).toFixed(2);}
function cartTotal(){return cart.reduce((s,d)=>s+d.total,0);}
function calculateBreakdown(basePrice=cartTotal()){
  const settings=(typeof StoreSettings!=='undefined')?StoreSettings.getSettings():{taxRate:0.055,city:'Madison',state:'WI'};
  const taxRate=settings.taxRate||0.055;
  const salesTax=Math.round(basePrice*taxRate*100)/100;
  const tipAmount=Math.round(basePrice*builderTipPercent*100)/100;
  const customerTotal=Math.round((basePrice+salesTax+tipAmount)*100)/100;
  return {
    basePrice,
    taxRate,
    salesTax,
    tipAmount,
    customerTotal,
    locationLabel:`${settings.city}, ${settings.state} (${(taxRate*100).toFixed(1)}%)`
  };
}
function orderBreakdown(){return calculateBreakdown();}
function orderTax(){return orderBreakdown().salesTax;}
function orderTotal(){return orderBreakdown().customerTotal;}
function formatOrderNumber(orderNumber){return `#${orderNumber}`;}
function ensureOrderNumber(){
  let orderNumber=Number(sessionStorage.getItem(ORDER_KEY));
  if(orderNumber)return orderNumber;
  const next=(typeof AmiPOS!=='undefined')?AmiPOS.generateOrderNumber():'T-101';
  sessionStorage.setItem(ORDER_KEY,String(next));
  return next;
}
function activeOrderNumber(){return sessionStorage.getItem(ORDER_KEY)||(typeof AmiPOS!=='undefined'?AmiPOS.generateOrderNumber():'T-101');}

function renderReview(){
  const list=document.getElementById('reviewList');
  if(!cart.length){list.innerHTML='<p class="sub">Nothing in your order yet.</p>';return;}
  const breakdown=orderBreakdown();
  list.innerHTML=`<div class="review-order"><div class="order-number">Order ${activeOrderNumber()}</div>${cart.map((d,i)=>`
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
      <div class="receipt-row" style="color:var(--green-deep);"><span>Subtotal</span><span>${money(breakdown.basePrice)}</span></div>
      <div class="receipt-row" style="color:var(--green-deep);"><span>WI Sales Tax (${breakdown.locationLabel})</span><span>${money(breakdown.salesTax)}</span></div>
      
      <div class="tip-section" style="margin:12px 0 8px;">
        <label class="fl" style="margin-bottom:6px;">Add Barista Tip</label>
        <div class="tip-grid">
          <button type="button" class="tip-btn${builderTipPercent===0.15?' sel':''}" onclick="setBuilderTip(0.15)">15%</button>
          <button type="button" class="tip-btn${builderTipPercent===0.18?' sel':''}" onclick="setBuilderTip(0.18)">18%</button>
          <button type="button" class="tip-btn${builderTipPercent===0.20?' sel':''}" onclick="setBuilderTip(0.20)">20%</button>
          <button type="button" class="tip-btn${builderTipPercent===0?' sel':''}" onclick="setBuilderTip(0)">None</button>
        </div>
      </div>
      
      <div class="cart-total" style="color:var(--green-deep);border-top-color:var(--line);"><span>Total Due</span><span>${money(breakdown.customerTotal)}</span></div>
    </div>`;
}

window.setBuilderTip=function(pct){
  builderTipPercent=pct;
  renderReview();
};

function removeItem(i){
  cart.splice(i,1);
  sessionStorage.setItem(CART_KEY,JSON.stringify(cart));
  renderReview();
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

document.getElementById('recordSale').onclick=async ()=>{
  if(!cart.length)return;
  const btn=document.getElementById('recordSale');
  btn.disabled=true;
  btn.textContent='Connecting to Square Terminal...';

  try {
    const breakdown=orderBreakdown();
    const chargeAmount=breakdown.basePrice+breakdown.salesTax;

    const paymentResult=await SquarePaymentService.processSquareCheckout({
      amount:chargeAmount,
      tip:breakdown.tipAmount,
      orderSummary:`${cart.length} drinks`
    });

    const order=AmiPOS.createOrder({
      items:cart.map(d=>({
        name:d.name,
        base:d.base||d.name,
        temp:d.temp||'Iced',
        add:d.add||'No add',
        sweetness:d.sweetness||'Sweetened',
        boba:d.boba||'No boba',
        bobaPrice:d.bobaPrice||0,
        qty:d.qty||1,
        unitPrice:d.unit,
        totalItemPrice:d.total
      })),
      paymentMethod:"Square Terminal",
      paymentDetails:paymentResult,
      tip:breakdown.tipAmount,
      source:"Customer Step Builder",
      customerName:"Customer Kiosk"
    });

    cart.length=0;
    sessionStorage.removeItem(CART_KEY);
    sessionStorage.removeItem(ORDER_KEY);
    renderReview();

    document.getElementById('receiptArea').innerHTML=`
      <div class="receipt" style="text-align:left;">
        <div style="text-align:center; margin-bottom:12px;">
          <div style="font-size:2.4rem;">🧋✨</div>
          <h3 style="font-family:'Fraunces', serif; color:var(--green); margin:4px 0;">Order Sent to Kitchen!</h3>
          <div style="font-size:1.9rem; font-weight:700; color:var(--gold-deep); font-family:'Fraunces', serif;">${order.orderNumber}</div>
          <p style="font-size:0.85rem; color:var(--green-deep); margin:2px 0 10px;">Payment Approved via Square (${paymentResult.cardBrand} ··· ${paymentResult.last4})</p>
        </div>
        <div class="receipt-row"><span>Store Location</span><span>${order.location.city}, ${order.location.state}</span></div>
        <div class="receipt-row"><span>Base Price</span><span>${money(order.subtotal)}</span></div>
        <div class="receipt-row"><span>WI Sales Tax (${(order.taxRate*100).toFixed(1)}%)</span><span>${money(order.tax)}</span></div>
        ${order.tip > 0 ? `<div class="receipt-row"><span>Barista Tip</span><span>${money(order.tip)}</span></div>` : ''}
        <div class="receipt-row" style="font-weight:700; font-size:1.1rem; color:var(--green-deep); border-top:1px solid var(--line); margin-top:6px; padding-top:6px;">
          <span>Total Paid</span><span>${money(order.total)}</span>
        </div>
        <p class="thanks">Thank you! Your drinks are currently brewing on the Barista Kitchen Screen.</p>
      </div>
    `;
    resetBuilder();
    showReview();
  } catch(err) {
    console.warn("Square payment cancelled:", err);
  } finally {
    btn.disabled=false;
    btn.textContent='💳 Pay with Square';
  }
};
document.getElementById('endOrder').onclick=()=>{
  cart.length=0;
  sessionStorage.removeItem(CART_KEY);
  sessionStorage.removeItem(ORDER_KEY);
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
