const MENU=[
  {
    title:'Tea',
    items:[
      ['Black or Green Tea','$5.00'],
      ['Matcha Tea','$6.00'],
      ['Black or Green · whole or 2% milk latte','$5.50'],
      ['Black or Green · oat milk latte','$6.00'],
      ['Black or Green · lemonade','$6.00'],
      ['Black or Green · fizzy','$6.00'],
      ['Matcha · whole or 2% milk latte','$6.50'],
      ['Matcha · oat milk latte','$7.00'],
      ['Matcha · lemonade','$7.00'],
      ['Matcha · fizzy','$7.00']
    ]
  },
  {
    title:'Fruit',
    items:[
      ['Strawberry/Blueberry/Mango','$6.00'],
      ['Strawberry/Blueberry/Mango · whole or 2% milk latte','$6.50'],
      ['Strawberry/Blueberry/Mango · oat milk latte','$7.00'],
      ['Strawberry/Blueberry/Mango · lemonade','$7.00'],
      ['Strawberry/Blueberry/Mango · fizzy','$7.00']
    ]
  },
  {
    title:'Fruit & Tea',
    items:[
      ['Strawberry/Blueberry/Mango + Black/Green/Matcha Tea','$7.00'],
      ['Fruit + tea · whole or 2% milk latte','$7.50'],
      ['Fruit + tea · oat milk latte','$8.00'],
      ['Strawberry/Blueberry/Mango + Matcha · lemonade','$8.00'],
      ['Strawberry/Blueberry/Mango + Matcha · fizzy','$8.00']
    ]
  }
];

const menu=document.getElementById('menuGroups');
menu.innerHTML=MENU.map(group=>`
  <section class="menu-group">
    <h3>${group.title}</h3>
    <div class="menu-items">
        ${group.items.map(item=>`<button type="button" class="menu-item" data-book-item="${item[0]}">
        <span>${item[0]}</span><span>${item[1]}</span>
      </button>`).join('')}
    </div>
  </section>`).join('')+
  '<p class="menu-note">Whole milk and 2% milk: $0.50 extra. Oat milk: $1.00 extra. Boba: $0.75 extra.</p>';

menu.addEventListener('click', event=>{
  const item=event.target.closest('[data-book-item]');
  if(item){
    const menuItem=encodeURIComponent(item.dataset.bookItem);
    window.location.href=`index.html?menuItem=${menuItem}`;
  }
});
