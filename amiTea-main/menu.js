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
      ['Mango + Black/Oolong/Matcha Tea . oat milk latte','$8.00']
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
