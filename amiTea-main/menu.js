const MENU=[
  {
    title:'Tea',
    items:[
      ['Black or Oolong Tea','$5.00'],
      ['Matcha Tea','$6.00'],
      ['Black or Oolong · whole or 2% milk latte','$5.50'],
      ['Black or Oolong · oat milk latte','$6.00'],
      ['Black or Oolong · lemonade or sparkling water','$6.00'],
      ['Matcha · whole or 2% milk latte','$6.50'],
      ['Matcha · oat milk latte','$7.00'],
      ['Matcha · lemonade or sparkling water','$7.00']
    ]
  },
  {
    title:'Fruit',
    items:[
      ['Strawberry/Blueberry/Mango','$6.00'],
      ['Strawberry/Blueberry/Mango · whole or 2% milk latte','$6.50'],
      ['Strawberry/Blueberry/Mango · oat milk latte','$7.00'],
      ['Strawberry/Blueberry/Mango · lemonade or sparkling water','$7.00']
    ]
  },
  {
    title:'Fruit & Tea',
    items:[
      ['Strawberry/Blueberry/Mango + Black/Oolong/Matcha Tea','$7.00'],
      ['Fruit + tea · whole or 2% milk latte','$7.50'],
      ['Fruit + tea · oat milk latte','$8.00'],
      ['Strawberry/Blueberry/Mango + Matcha · lemonade or sparkling water','$8.00']
    ]
  }
];

const menu=document.getElementById('menuGroups');
menu.innerHTML=MENU.map(group=>`
  <section class="menu-group">
    <h3>${group.title}</h3>
    <div class="menu-items">
      ${group.items.map(item=>`<div class="menu-item"><span>${item[0]}</span><span>${item[1]}</span></div>`).join('')}
    </div>
  </section>`).join('')+
  '<p class="menu-note">Whole milk and 2% milk add $0.50. Oat milk adds $1.00. Boba adds $0.75.</p>';
