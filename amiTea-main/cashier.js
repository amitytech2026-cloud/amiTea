/**
 * amiTEA Cashier Register & Staff Terminal Logic
 */

const POS_CATALOG = [
  // Tea menu matches the customer menu names and pricing
  { id: "tea_black", name: "Black Tea", base: "Black", price: 5.00, cat: "Tea" },
  { id: "tea_green", name: "Green Tea", base: "Green", price: 5.00, cat: "Tea" },
  { id: "tea_matcha", name: "Matcha", base: "Matcha", price: 6.00, cat: "Tea" },
  { id: "tea_black_latte_whole", name: "Black Tea · Whole milk", base: "Black", add: "Whole milk", price: 5.50, cat: "Tea" },
  { id: "tea_black_latte_2pct", name: "Black Tea · 2% milk", base: "Black", add: "2% milk", price: 5.50, cat: "Tea" },
  { id: "tea_black_latte_oat", name: "Black Tea · Oat milk", base: "Black", add: "Oat milk", price: 6.00, cat: "Tea" },
  { id: "tea_black_lemonade", name: "Black Tea · Lemonade", base: "Black", add: "Lemonade", price: 6.00, cat: "Tea" },
  { id: "tea_black_fizzy", name: "Black Tea · Fizzy", base: "Black", add: "Fizzy", price: 6.00, cat: "Tea" },
  { id: "tea_green_latte_whole", name: "Green Tea · Whole milk", base: "Green", add: "Whole milk", price: 5.50, cat: "Tea" },
  { id: "tea_green_latte_2pct", name: "Green Tea · 2% milk", base: "Green", add: "2% milk", price: 5.50, cat: "Tea" },
  { id: "tea_green_latte_oat", name: "Green Tea · Oat milk", base: "Green", add: "Oat milk", price: 6.00, cat: "Tea" },
  { id: "tea_green_lemonade", name: "Green Tea · Lemonade", base: "Green", add: "Lemonade", price: 6.00, cat: "Tea" },
  { id: "tea_green_fizzy", name: "Green Tea · Fizzy", base: "Green", add: "Fizzy", price: 6.00, cat: "Tea" },
  { id: "tea_matcha_latte_whole", name: "Matcha · Whole milk", base: "Matcha", add: "Whole milk", price: 6.50, cat: "Tea" },
  { id: "tea_matcha_latte_2pct", name: "Matcha · 2% milk", base: "Matcha", add: "2% milk", price: 6.50, cat: "Tea" },
  { id: "tea_matcha_latte_oat", name: "Matcha · Oat milk", base: "Matcha", add: "Oat milk", price: 7.00, cat: "Tea" },
  { id: "tea_matcha_fizzy", name: "Matcha · Fizzy", base: "Matcha", add: "Fizzy", price: 7.00, cat: "Tea" },

  // Fruit menu matches the customer menu names and pricing
  { id: "fruit_strawberry", name: "Strawberry", base: "Strawberry", price: 6.00, cat: "Fruit" },
  { id: "fruit_strawberry_fizzy", name: "Strawberry · Fizzy", base: "Strawberry", add: "Fizzy", price: 7.00, cat: "Fruit" },
  { id: "fruit_strawberry_lemonade", name: "Strawberry · Lemonade", base: "Strawberry", add: "Lemonade", price: 7.00, cat: "Fruit" },
  { id: "fruit_strawberry_latte_whole", name: "Strawberry · Whole milk", base: "Strawberry", add: "Whole milk", price: 6.50, cat: "Fruit" },
  { id: "fruit_strawberry_latte_2pct", name: "Strawberry · 2% milk", base: "Strawberry", add: "2% milk", price: 6.50, cat: "Fruit" },
  { id: "fruit_strawberry_latte_oat", name: "Strawberry · Oat milk", base: "Strawberry", add: "Oat milk", price: 7.00, cat: "Fruit" },
  { id: "fruit_mango", name: "Mango Fruit", base: "Mango", price: 6.00, cat: "Fruit" },
  { id: "fruit_mango_lemonade", name: "Mango · Lemonade", base: "Mango", add: "Lemonade", price: 7.00, cat: "Fruit" },
  { id: "fruit_mango_fizzy", name: "Mango · Fizzy", base: "Mango", add: "Fizzy", price: 7.00, cat: "Fruit" },
  { id: "fruit_mango_latte_whole", name: "Mango · Whole milk", base: "Mango", add: "Whole milk", price: 6.50, cat: "Fruit" },
  { id: "fruit_mango_latte_2pct", name: "Mango · 2% milk", base: "Mango", add: "2% milk", price: 6.50, cat: "Fruit" },
  { id: "fruit_mango_latte_oat", name: "Mango · Oat milk", base: "Mango", add: "Oat milk", price: 7.00, cat: "Fruit" },

  // Fruit & Tea menu matches the customer menu
  { id: "mix_strawberry_blacktealatte_whole", name: "Strawberry  ·  Black Tea  ·  Whole Milk", base: "Strawberry  ·  Black Tea Latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_strawberry_blacktealatte_2pct", name: "Strawberry  ·  Black Tea  ·  2% Milk", base: "Strawberry  ·  Black Tea Latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_strawberry_blacktealatte_oat", name: "Strawberry  ·  Black Tea  ·  Oat Milk", base: "Strawberry  ·  Black Tea Latte", price: 8.00, cat: "Fruit & Tea" },
  { id: "mix_strawberry_greentealatte_whole", name: "Strawberry  ·  Green Tea  ·  Whole Milk", base: "Strawberry  ·  Green Tea latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_strawberry_greentealatte_2pct", name: "Strawberry  ·  Green Tea  ·  2 % Milk", base: "Strawberry  ·  Green Tea latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_strawberry_greentealatte_oat", name: "Strawberry  ·  Green Tea  ·  Oat Milk", base: "Strawberry  ·  Green Tea latte", price: 8.00, cat: "Fruit & Tea" },
  { id: "mix_mango_blacktealatte_whole", name: "Mango  ·  Black Tea  ·  Whole Milk", base: "Mango  ·  Black Tea Latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_mango_blacktealatte_2pct", name: "Mango  ·  Black Tea  ·  2% Milk", base: "Mango  ·  Black Tea Latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_mango_blacktealatte_oat", name: "Mango  ·  Black Tea  ·  Oat Milk", base: "Mango  ·  Black Tea Latte", price: 8.00, cat: "Fruit & Tea" },
  { id: "mix_mango_greentealatte_whole", name: "Mango  ·  Green Tea  ·  Whole Milk", base: "Mango  ·  Green Tea Latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_mango_greentealatte_2pct", name: "Mango  ·  Green Tea  ·  2 % Milk", base: "Mango  ·  Green Tea Latte", price: 7.50, cat: "Fruit & Tea" },
  { id: "mix_mango_greentealatte_oat", name: "Mango  ·  Green Tea  ·  Oat Milk", base: "Mango  ·  Green Tea Latte", price: 8.00, cat: "Fruit & Tea" },
];

let cashierTicket = [];
let activeCategory = "all";
let selectedCatalogItemId = null;

// DOM Elements
const posItemsGrid = document.getElementById("posItemsGrid");
const posCartList = document.getElementById("posCartList");
const posSubtotal = document.getElementById("posSubtotal");
const posTax = document.getElementById("posTax");
const posTaxLabel = document.getElementById("posTaxLabel");
const posTotalDue = document.getElementById("posTotalDue");
const posActiveOrderNum = document.getElementById("posActiveOrderNum");
const currentLocDisplay = document.getElementById("currentLocDisplay");
const posCustomerTag = document.getElementById("posCustomerTag");

// Buttons & Modals
const changeLocationBtn = document.getElementById("changeLocationBtn");
const locationModal = document.getElementById("locationModal");
const closeLocModal = document.getElementById("closeLocModal");
const tenderSquareBtn = document.getElementById("tenderSquareBtn");
const tenderCashBtn = document.getElementById("tenderCashBtn");
const posClearTicketBtn = document.getElementById("posClearTicketBtn");

// Cash Modal
const cashModal = document.getElementById("cashModal");
const closeCashModal = document.getElementById("closeCashModal");
const cashDueDisplay = document.getElementById("cashDueDisplay");
const cashGivenInput = document.getElementById("cashGivenInput");
const cashChangeDisplay = document.getElementById("cashChangeDisplay");
const cashExactBtn = document.getElementById("cashExactBtn");
const confirmCashOrderBtn = document.getElementById("confirmCashOrderBtn");

// Success Modal
const cashierSuccessModal = document.getElementById("cashierSuccessModal");
const closeSuccessModal = document.getElementById("closeSuccessModal");
const successOrderNum = document.getElementById("successOrderNum");
const nextTicketBtn = document.getElementById("nextTicketBtn");

// Tabs
const tabRegisterBtn = document.getElementById("tabRegisterBtn");
const tabBookkeepingBtn = document.getElementById("tabBookkeepingBtn");
const sectionRegister = document.getElementById("sectionRegister");
const sectionBookkeeping = document.getElementById("sectionBookkeeping");

// Bookkeeping Elements
const BOOKKEEPING_PIN = "226283";
const bkLockView = document.getElementById("bkLockView");
const bkContentView = document.getElementById("bkContentView");
const bkPinInput = document.getElementById("bkPinInput");
const bkPinError = document.getElementById("bkPinError");
const unlockBkBtn = document.getElementById("unlockBkBtn");
const lockBkBtn = document.getElementById("lockBkBtn");
const emailBkRecordsBtn = document.getElementById("emailBkRecordsBtn");
const resetTestDataBtn = document.getElementById("resetTestDataBtn");

// Bookkeeping Metrics
const bkGrossSales = document.getElementById("bkGrossSales");
const bkTaxCollected = document.getElementById("bkTaxCollected");
const bkTotalCollected = document.getElementById("bkTotalCollected");
const bkNetRevenue = document.getElementById("bkNetRevenue");
const bkOrderCount = document.getElementById("bkOrderCount");
const bkTenderSplit = document.getElementById("bkTenderSplit");
const bkSalesHistoryList = document.getElementById("bkSalesHistoryList");

function initCashier() {
  updateLocationBadge();
  renderCatalog();
  renderTicket();
  renderShiftReport();
  updateNextOrderNumber();

  // Tabs switching
  tabRegisterBtn.addEventListener("click", () => {
    tabRegisterBtn.classList.add("active");
    tabBookkeepingBtn.classList.remove("active");
    sectionRegister.hidden = false;
    sectionBookkeeping.hidden = true;
  });

  tabBookkeepingBtn.addEventListener("click", () => {
    tabBookkeepingBtn.classList.add("active");
    tabRegisterBtn.classList.remove("active");
    sectionRegister.hidden = true;
    sectionBookkeeping.hidden = false;
    if (!bkContentView.hidden) {
      renderBookkeeping();
    }
  });

  // Bookkeeping PIN Unlock
  unlockBkBtn.addEventListener("click", () => {
    const entered = bkPinInput.value.trim();
    if (entered !== BOOKKEEPING_PIN) {
      bkPinError.textContent = "Incorrect manager PIN. (Default test PIN: 226283)";
      bkPinError.hidden = false;
      bkPinInput.select();
      return;
    }
    bkPinError.hidden = true;
    bkLockView.hidden = true;
    bkContentView.hidden = false;
    lockBkBtn.style.display = "inline-block";
    renderBookkeeping();
  });

  bkPinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockBkBtn.click();
  });

  lockBkBtn.addEventListener("click", () => {
    bkContentView.hidden = true;
    bkLockView.hidden = false;
    lockBkBtn.style.display = "none";
    bkPinInput.value = "";
  });

  // Email records
  emailBkRecordsBtn.addEventListener("click", exportEmailRecords);

  // Reset test sales
  if (resetTestDataBtn) {
    resetTestDataBtn.addEventListener("click", () => {
      if (confirm("Reset and clear all test sales data from local storage?")) {
        localStorage.removeItem(AmiPOS.STORAGE_ORDERS_KEY);
        localStorage.removeItem("amitea-sales-v2");
        AmiPOS.clearCart();
        cashierTicket = [];
        renderTicket();
        renderShiftReport();
        if (!bkContentView.hidden) renderBookkeeping();
        alert("Test data has been reset.");
      }
    });
  }

  const sendSelectedToTicketBtn = document.getElementById("sendSelectedToTicketBtn");
  if (sendSelectedToTicketBtn) {
    sendSelectedToTicketBtn.addEventListener("click", addSelectedCatalogItemToTicket);
  }

  // Category filter
  document.querySelectorAll("[data-pos-cat]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-pos-cat]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.posCat;
      renderCatalog();
    });
  });

  // Location selector
  changeLocationBtn.addEventListener("click", () => locationModal.hidden = false);
  closeLocModal.addEventListener("click", () => locationModal.hidden = true);

  locationModal.querySelectorAll("[data-loc]").forEach(b => {
    b.addEventListener("click", () => {
      StoreSettings.setLocation(b.dataset.loc);
      updateLocationBadge();
      renderTicket();
      renderShiftReport();
      if (!bkContentView.hidden) renderBookkeeping();
      locationModal.hidden = true;
    });
  });

  document.getElementById("saveCustomLocBtn").addEventListener("click", () => {
    const city = document.getElementById("customCity").value.trim();
    const state = document.getElementById("customState").value.trim() || "WI";
    const rate = parseFloat(document.getElementById("customTaxRate").value) || 0.055;
    StoreSettings.setCustomTax(city, state, rate);
    updateLocationBadge();
    renderTicket();
    renderShiftReport();
    if (!bkContentView.hidden) renderBookkeeping();
    locationModal.hidden = true;
  });

  // Clear ticket
  posClearTicketBtn.addEventListener("click", () => {
    cashierTicket = [];
    posCustomerTag.value = "";
    renderTicket();
  });

  // Square Tender
  tenderSquareBtn.addEventListener("click", handleSquareTender);

  // Cash Tender
  tenderCashBtn.addEventListener("click", openCashModal);
  closeCashModal.addEventListener("click", () => cashModal.hidden = true);

  cashGivenInput.addEventListener("input", recalculateCashChange);
  cashExactBtn.addEventListener("click", () => {
    const totals = AmiPOS.calculateTotals(cashierTicket, 0);
    cashGivenInput.value = totals.total.toFixed(2);
    recalculateCashChange();
  });

  document.querySelectorAll(".cash-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      cashGivenInput.value = parseFloat(btn.dataset.amt).toFixed(2);
      recalculateCashChange();
    });
  });

  confirmCashOrderBtn.addEventListener("click", handleCashOrderComplete);

  // Success modal
  closeSuccessModal.addEventListener("click", () => cashierSuccessModal.hidden = true);
  nextTicketBtn.addEventListener("click", () => {
    cashierSuccessModal.hidden = true;
    cashierTicket = [];
    posCustomerTag.value = "";
    renderTicket();
    updateNextOrderNumber();
    renderShiftReport();
  });

  document.getElementById("refreshReportBtn").addEventListener("click", renderShiftReport);
}

function updateLocationBadge() {
  const settings = StoreSettings.getSettings();
  const taxPct = (settings.taxRate * 100).toFixed(1);
  currentLocDisplay.textContent = `${settings.city}, ${settings.state} (${taxPct}%)`;
}

function updateNextOrderNumber() {
  posActiveOrderNum.textContent = AmiPOS.generateOrderNumber();
}

function updateSelectedCatalogButtonState() {
  const sendBtn = document.getElementById("sendSelectedToTicketBtn");
  if (!sendBtn) return;
  sendBtn.disabled = !selectedCatalogItemId;
  sendBtn.textContent = "Send to Ticket";
}

function renderCatalog() {
  const filtered = POS_CATALOG.filter(item => {
    if (activeCategory === "all") return true;
    return item.cat === activeCategory;
  });

  if (!filtered.some(item => item.id === selectedCatalogItemId)) {
    selectedCatalogItemId = null;
  }

  posItemsGrid.innerHTML = filtered.map(item => `
    <button type="button" class="pos-tap-btn ${selectedCatalogItemId === item.id ? "selected" : ""}" data-pos-item="${item.id}">
      <div class="p-name">${item.name}</div>
      <div class="p-price">$${item.price.toFixed(2)}</div>
    </button>
  `).join("");

  posItemsGrid.querySelectorAll(".pos-tap-btn").forEach(button => {
    button.addEventListener("click", () => {
      selectedCatalogItemId = button.dataset.posItem;
      renderCatalog();
      updateSelectedCatalogButtonState();
    });
  });

  updateSelectedCatalogButtonState();
}

window.addCatalogItemToTicket = function(itemId) {
  const item = POS_CATALOG.find(i => i.id === itemId);
  if (!item) return;

  const temp = document.getElementById("posDefaultTemp").value;
  const sweetness = document.getElementById("posDefaultSweetness").value;
  const hasBoba = document.getElementById("posAddBobaCheckbox").checked;
  const bobaPrice = hasBoba ? 0.75 : 0;
  const add = item.add || "No add";

  cashierTicket.push({
    id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    name: item.name,
    base: item.base,
    basePrice: item.price,
    temp: temp,
    add: add,
    addPrice: 0,
    sweetness: sweetness,
    boba: hasBoba ? "Boba" : "No boba",
    bobaPrice: bobaPrice,
    unitPrice: item.price + bobaPrice,
    qty: 1
  });

  selectedCatalogItemId = null;
  renderCatalog();
  renderTicket();
};

function addSelectedCatalogItemToTicket() {
  if (!selectedCatalogItemId) return;
  addCatalogItemToTicket(selectedCatalogItemId);
}

function renderTicket() {
  const totals = AmiPOS.calculateTotals(cashierTicket, 0);

  if (cashierTicket.length === 0) {
    posCartList.innerHTML = `
      <div style="text-align:center; padding:30px 10px; opacity:0.6; font-size:0.9rem;">
        No items in ticket. Tap drinks on the left to add.
      </div>
    `;
    tenderSquareBtn.disabled = true;
    tenderCashBtn.disabled = true;
    posSubtotal.textContent = "$0.00";
    posTax.textContent = "$0.00";
    posTotalDue.textContent = "$0.00";
    return;
  }

  tenderSquareBtn.disabled = false;
  tenderCashBtn.disabled = false;

  posCartList.innerHTML = cashierTicket.map((item, idx) => `
    <div class="pos-cart-row">
      <div style="flex:1;">
        <div style="font-weight:700; color:var(--green-deep);">${item.qty}x ${item.name}</div>
        <div style="font-size:0.8rem; opacity:0.8;">${item.temp} · ${item.sweetness} ${item.boba !== 'No boba' ? '· +Boba' : ''}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700; color:var(--green);">$${(item.unitPrice * item.qty).toFixed(2)}</div>
        <button type="button" class="rm" style="font-size:0.8rem; color:#c0392b; cursor:pointer;" onclick="removeTicketItem(${idx})">✕</button>
      </div>
    </div>
  `).join("");

  posSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
  posTaxLabel.textContent = `WI Tax (${(totals.taxRate * 100).toFixed(1)}%)`;
  posTax.textContent = `$${totals.tax.toFixed(2)}`;
  posTotalDue.textContent = `$${totals.total.toFixed(2)}`;
}

window.removeTicketItem = function(idx) {
  cashierTicket.splice(idx, 1);
  renderTicket();
};

async function handleSquareTender() {
  if (!cashierTicket.length) return;
  const totals = AmiPOS.calculateTotals(cashierTicket, 0);
  const custName = posCustomerTag.value.trim();

  try {
    tenderSquareBtn.disabled = true;
    const paymentResult = await SquarePaymentService.processSquareCheckout({
      amount: totals.total,
      tip: 0,
      orderSummary: `${cashierTicket.length} drinks (Cashier Register)`
    });

    const order = AmiPOS.createOrder({
      items: cashierTicket,
      paymentMethod: "Square Terminal",
      paymentDetails: paymentResult,
      tip: 0,
      source: "Cashier POS Register",
      customerName: custName
    });

    showSuccessModal(order);
  } catch (e) {
    console.warn("Square payment error", e);
  } finally {
    tenderSquareBtn.disabled = false;
  }
}

function openCashModal() {
  if (!cashierTicket.length) return;
  const totals = AmiPOS.calculateTotals(cashierTicket, 0);
  cashDueDisplay.textContent = `$${totals.total.toFixed(2)}`;
  cashGivenInput.value = "";
  cashChangeDisplay.textContent = "$0.00";
  cashModal.hidden = false;
  cashGivenInput.focus();
}

function recalculateCashChange() {
  const totals = AmiPOS.calculateTotals(cashierTicket, 0);
  const given = parseFloat(cashGivenInput.value) || 0;
  const change = Math.max(0, given - totals.total);
  cashChangeDisplay.textContent = `$${change.toFixed(2)}`;
}

function handleCashOrderComplete() {
  const totals = AmiPOS.calculateTotals(cashierTicket, 0);
  const given = parseFloat(cashGivenInput.value) || 0;
  if (given < totals.total) {
    alert("Amount tendered is less than total due.");
    return;
  }

  const custName = posCustomerTag.value.trim();
  const order = AmiPOS.createOrder({
    items: cashierTicket,
    paymentMethod: "Cash",
    paymentDetails: {
      tendered: given,
      change: (given - totals.total).toFixed(2),
      transactionId: "cash_" + Date.now()
    },
    tip: 0,
    source: "Cashier POS Register",
    customerName: custName
  });

  cashModal.hidden = true;
  showSuccessModal(order);
}

function showSuccessModal(order) {
  successOrderNum.textContent = order.orderNumber;
  cashierSuccessModal.hidden = false;
}

function renderShiftReport() {
  const orders = AmiPOS.getOrders();
  const shiftStatsEl = document.getElementById("shiftSalesStats");
  if (!shiftStatsEl) return;

  const totalSales = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const squareOrders = orders.filter(o => o.payment.method.includes("Square")).length;
  const cashOrders = orders.filter(o => o.payment.method === "Cash").length;

  shiftStatsEl.innerHTML = `
    <div style="background:var(--cream); padding:10px; border-radius:8px;">
      <div style="font-size:0.8rem; opacity:0.7;">Total Orders</div>
      <div style="font-size:1.4rem; font-weight:700; color:var(--green);">${orders.length}</div>
      <div style="font-size:0.75rem;">${squareOrders} Square · ${cashOrders} Cash</div>
    </div>
    <div style="background:var(--cream); padding:10px; border-radius:8px;">
      <div style="font-size:0.8rem; opacity:0.7;">Gross Sales (Subtotal)</div>
      <div style="font-size:1.4rem; font-weight:700; color:var(--green-deep);">$${totalSales.toFixed(2)}</div>
    </div>
    <div style="background:var(--cream); padding:10px; border-radius:8px;">
      <div style="font-size:0.8rem; opacity:0.7;">WI Sales Tax Collected</div>
      <div style="font-size:1.4rem; font-weight:700; color:var(--gold-deep);">$${totalTax.toFixed(2)}</div>
    </div>
    <div style="background:var(--cream); padding:10px; border-radius:8px;">
      <div style="font-size:0.8rem; opacity:0.7;">Total Collected</div>
      <div style="font-size:1.4rem; font-weight:700; color:var(--green);">$${totalRevenue.toFixed(2)}</div>
    </div>
  `;
}

function renderBookkeeping() {
  const orders = AmiPOS.getOrders();

  const totalGross = orders.reduce((s, o) => s + (o.subtotal || 0), 0);
  const totalTax = orders.reduce((s, o) => s + (o.tax || 0), 0);
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const squareOrders = orders.filter(o => o.payment.method.includes("Square"));
  const cashOrders = orders.filter(o => o.payment.method === "Cash");
  
  // Estimated Processing and Net
  const estCardFees = squareOrders.reduce((s, o) => s + (o.total * 0.027 + 0.05), 0);
  const estNetRevenue = totalRevenue - totalTax - estCardFees;

  bkGrossSales.textContent = `$${totalGross.toFixed(2)}`;
  bkOrderCount.textContent = `${orders.length} Total Shift Orders`;
  bkTaxCollected.textContent = `$${totalTax.toFixed(2)}`;
  bkTotalCollected.textContent = `$${totalRevenue.toFixed(2)}`;
  bkTenderSplit.textContent = `${squareOrders.length} Square ($${squareOrders.reduce((s,o)=>s+o.total,0).toFixed(2)}) · ${cashOrders.length} Cash ($${cashOrders.reduce((s,o)=>s+o.total,0).toFixed(2)})`;
  bkNetRevenue.textContent = `$${Math.max(0, estNetRevenue).toFixed(2)}`;

  if (orders.length === 0) {
    bkSalesHistoryList.innerHTML = `
      <div style="text-align:center; padding:40px 10px; color:var(--ink); opacity:0.7;">
        <p style="font-family:'Fraunces', serif; font-size:1.2rem;">No sales records found in current test session.</p>
        <p class="sub">Complete transactions in Register or Customer Kiosk to populate bookkeeping records.</p>
      </div>
    `;
    return;
  }

  // Group by date
  const groups = orders.reduce((byDate, order) => {
    const date = new Date(order.createdAt).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    (byDate[date] ||= []).push(order);
    return byDate;
  }, {});

  bkSalesHistoryList.innerHTML = Object.entries(groups).map(([date, dateOrders]) => `
    <section class="sales-date" style="margin-top:22px;">
      <h3 style="font-family:'Fraunces',serif; color:var(--green); font-size:1.1rem; border-bottom:2px solid var(--gold); padding-bottom:6px; margin-bottom:12px;">
        📅 ${date} (${dateOrders.length} order${dateOrders.length === 1 ? '' : 's'})
      </h3>
      <div style="display:grid; gap:12px;">
        ${dateOrders.map(order => `
          <article class="sale-record" style="background:var(--cream); padding:16px; border-radius:12px; border:1px solid var(--line);">
            <div class="sale-record-head" style="display:flex; justify-content:space-between; align-items:baseline;">
              <div>
                <strong style="font-family:'Fraunces', serif; font-size:1.15rem; color:var(--green-deep);">${order.orderNumber}</strong>
                <span style="font-size:0.85rem; color:var(--gold-deep); font-weight:600; margin-left:8px;">${order.source || 'POS'} · ${order.customerName || 'Guest'}</span>
              </div>
              <time style="font-size:0.85rem; opacity:0.75;">${new Date(order.createdAt).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}</time>
            </div>

            <div class="sale-record-items" style="margin:8px 0; font-size:0.9rem; color:var(--ink);">
              ${(order.items || []).map(i => `<strong>${i.qty}x</strong> ${i.name} (${i.temp || 'Iced'})`).join(' · ')}
            </div>

            <div class="sale-record-finance" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; background:var(--white); padding:10px 12px; border-radius:8px; font-size:0.85rem; border:1px dashed var(--line);">
              <div><span>Subtotal:</span> <strong>$${(order.subtotal || 0).toFixed(2)}</strong></div>
              <div><span>WI Tax (${((order.taxRate || 0.055) * 100).toFixed(1)}%):</span> <strong>$${(order.tax || 0).toFixed(2)}</strong></div>
              ${order.tip > 0 ? `<div><span>Tip:</span> <strong>$${order.tip.toFixed(2)}</strong></div>` : ''}
              <div><span>Total Paid:</span> <strong style="color:var(--green);">$${(order.total || 0).toFixed(2)}</strong></div>
              <div><span>Payment:</span> <strong>${order.payment?.method || 'Square'}</strong></div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `).join('');
}

function exportEmailRecords() {
  const orders = AmiPOS.getOrders();
  if (!orders.length) {
    alert("No sales records available to export.");
    return;
  }

  const lines = orders.map(o => {
    const dt = new Date(o.createdAt).toLocaleString();
    const itemStr = (o.items || []).map(i => `  - ${i.qty}x ${i.name} (${i.temp || 'Iced'})`).join("\n");
    return `ORDER ${o.orderNumber} (${o.source || 'POS'})
Date: ${dt}
Items:
${itemStr}
Subtotal: $${(o.subtotal||0).toFixed(2)}
Sales Tax: $${(o.tax||0).toFixed(2)}
Tip: $${(o.tip||0).toFixed(2)}
Total Paid: $${(o.total||0).toFixed(2)} (${o.payment?.method || 'Square'})
----------------------------------------`;
  }).join("\n\n");

  const totalGross = orders.reduce((s, o) => s + (o.subtotal || 0), 0);
  const totalTax = orders.reduce((s, o) => s + (o.tax || 0), 0);
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const summary = `amiTEA Shift Sales & Bookkeeping Export
Total Orders: ${orders.length}
Gross Subtotal: $${totalGross.toFixed(2)}
WI Sales Tax Collected: $${totalTax.toFixed(2)}
Total Revenue: $${totalRevenue.toFixed(2)}

========================================
INDIVIDUAL TICKET LEDGER
========================================

${lines}`;

  const subject = encodeURIComponent(`amiTEA Sales Records - ${new Date().toLocaleDateString()}`);
  const body = encodeURIComponent(summary);
  window.location.href = `mailto:support@amiteatea.com?subject=${subject}&body=${body}`;
}

document.addEventListener("DOMContentLoaded", initCashier);

