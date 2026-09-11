const MENU=[
  {
    title:'Tea',
    teaColumns:[
      {
        name:'Black Tea',
        price:'$5.00',
        items:[['Whole Milk','$5.50'],['2% Milk','$5.50'],['Oat Milk','$6.00'],['Lemonade','$6.00'],['Fizzy','$6.00']]
      },
      {
        name:'Green Tea',
        price:'$5.00',
        items:[['Whole Milk','$5.50'],['2% Milk','$5.50'],['Oat Milk','$6.00'],['Lemonade','$6.00'],['Fizzy','$6.00']]
      },
      {
        name:'Matcha',
        price:'$6.00',
        items:[['Whole Milk','$6.50'],['2% Milk','$6.50'],['Oat Milk','$7.00'],['Fizzy','$7.00']]
      }
    ]
  },
  {
    title:'Fruit',
    fruitColumns:[
      {
        name:'Strawberry',
        price:'$6.00',
        items:[['Whole Milk','$6.50'],['2% Milk','$6.50'],['Oat Milk','$7.00'],['Lemonade','$7.00'],['Fizzy','$7.00']]
      },
      {},
      {
        name:'Mango',
        price:'$6.00',
        items:[['Whole Milk','$6.50'],['2% Milk','$6.50'],['Oat Milk','$7.00'],['Lemonade','$7.00'],['Fizzy','$7.00']]
      }
    ]
  },
  {
    title:'Fruit & Tea',
    fruitAndTeaItems:[
      ['Strawberry/Mango + Black/Green/Matcha Tea','$7.00'],
      ['Fruit + tea · whole or 2% milk latte','$7.50'],
      ['Fruit + tea · oat milk latte','$8.00'],
      ['Strawberry/Mango + Matcha · lemonade','$8.00'],
      ['Strawberry/Mango + Matcha · fizzy','$8.00']
    ]
  }
];

const menu=document.getElementById('menuGroups');
menu.innerHTML=MENU.map(group=>`
  <section class="menu-group${group.teaColumns ? ' tea-menu-group' : ''}${group.fruitColumns ? ' fruit-menu-group' : ''}">
    <h3>${group.title}</h3>
    ${group.teaColumns ? `<div class="tea-menu-columns">
      ${group.teaColumns.map(column=>`<div class="tea-menu-column">
        <button type="button" class="tea-base" data-book-item="${column.name}">
          <span>${column.name}</span><span>${column.price}</span>
        </button>
        <div class="menu-items">
          ${column.items.map(item=>`<button type="button" class="menu-item" data-book-item="${column.name} latte · ${item[0]}">
            <span>${item[0]}</span><span>${item[1]}</span>
          </button>`).join('')}
        </div>
      </div>`).join('')}
    </div>` : group.fruitColumns ? `<div class="fruit-menu-columns">
      ${group.fruitColumns.map(column=>Object.keys(column).length===0
        ? '<div class="fruit-menu-column fruit-menu-spacer" aria-hidden="true"><img src="amitea-instagram.png" alt=""></div>'
        : `<div class="fruit-menu-column">
        <button type="button" class="fruit-base" data-book-item="${column.name}">
          <span>${column.name}</span><span>${column.price}</span>
        </button>
        <div class="menu-items">
          ${column.items.map(item=>`<button type="button" class="menu-item" data-book-item="${column.name} latte · ${item[0]}">
            <span>${item[0]}</span><span>${item[1]}</span>
          </button>`).join('')}
        </div>
      </div>`).join('')}
    </div>` : `<div class="menu-items">
      ${group.fruitAndTeaItems.map(item=>`<button type="button" class="menu-item" data-book-item="${item[0]}">
        <span>${item[0]}</span><span>${item[1]}</span>
      </button>`).join('')}
    </div>`}
  </section>`).join('')+
  '<p class="menu-note">Whole milk and 2% milk: $0.50 extra * Oat milk: $1.00 extra * Lemonade: $1.00 extra * Fizzy: $1.00 extra * Boba: $0.75 extra</p>';

menu.addEventListener('click', event=>{
  const item=event.target.closest('[data-book-item]');
  if(item){
    const menuItem=encodeURIComponent(item.dataset.bookItem);
    window.location.href=`index.html?menuItem=${menuItem}`;
  }
});
