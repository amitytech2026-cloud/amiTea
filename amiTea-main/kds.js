/**
 * amiTEA Barista Kitchen Display System (KDS)
 * Real-time queue for orders from Customer Builder, Menu & Search, and Cashier.
 */

const cardsNew = document.getElementById("cardsNew");
const cardsPrep = document.getElementById("cardsPrep");
const cardsReady = document.getElementById("cardsReady");
const countNew = document.getElementById("countNew");
const countPrep = document.getElementById("countPrep");
const countReady = document.getElementById("countReady");
const kdsActiveDrinksCount = document.getElementById("kdsActiveDrinksCount");
const kdsLocDisplay = document.getElementById("kdsLocDisplay");

function initKDS() {
  updateLocationHeader();
  renderBoard();

  // Listen for real-time storage events across tabs
  window.addEventListener("storage", (e) => {
    if (e.key === AmiPOS.STORAGE_ORDERS_KEY) {
      renderBoard();
    }
  });

  window.addEventListener("amitea:order-created", () => {
    playNotificationChime();
    renderBoard();
  });

  window.addEventListener("amitea:order-updated", renderBoard);
  window.addEventListener("amitea:settings-changed", updateLocationHeader);

  // Auto-refresh timer every 10 seconds for elapsed times
  setInterval(renderBoard, 10000);
}

function updateLocationHeader() {
  const settings = StoreSettings.getSettings();
  if (kdsLocDisplay) {
    kdsLocDisplay.textContent = `${settings.city}, ${settings.state}`;
  }
}

function renderBoard() {
  const allOrders = AmiPOS.getOrders();
  
  // Guard: Only show orders with confirmed successful payments on the Kitchen Board
  const orders = allOrders.filter(o => o.payment && o.payment.status === "COMPLETED");
  
  const newOrders = orders.filter(o => o.kitchenStatus === "new");
  const prepOrders = orders.filter(o => o.kitchenStatus === "preparing");
  const readyOrders = orders.filter(o => o.kitchenStatus === "ready");

  countNew.textContent = newOrders.length;
  countPrep.textContent = prepOrders.length;
  countReady.textContent = readyOrders.length;

  const totalActiveDrinks = [...newOrders, ...prepOrders].reduce((sum, o) => {
    return sum + (o.items ? o.items.reduce((iSum, i) => iSum + (i.qty || 1), 0) : 0);
  }, 0);
  kdsActiveDrinksCount.textContent = totalActiveDrinks;

  cardsNew.innerHTML = newOrders.length ? newOrders.map(o => renderTicketCard(o, "new")).join("") : emptyPlaceholder("No new orders in queue");
  cardsPrep.innerHTML = prepOrders.length ? prepOrders.map(o => renderTicketCard(o, "prep")).join("") : emptyPlaceholder("No drinks currently brewing");
  cardsReady.innerHTML = readyOrders.length ? readyOrders.map(o => renderTicketCard(o, "ready")).join("") : emptyPlaceholder("No drinks waiting for pickup");
}

function emptyPlaceholder(msg) {
  return `<div style="text-align:center; padding:40px 10px; color:#556e5c; font-size:0.9rem; font-style:italic;">${msg}</div>`;
}

function formatElapsedTime(isoString) {
  if (!isoString) return "just now";
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}m ago`;
}

function renderTicketCard(order, stage) {
  const elapsed = formatElapsedTime(order.createdAt);
  const isUrgent = stage === "new" && (Date.now() - new Date(order.createdAt).getTime()) > 3 * 60 * 1000;

  return `
    <div class="kds-ticket ${isUrgent ? 'urgent' : ''}" id="card_${order.id}">
      <div class="kds-ticket-head">
        <div>
          <span class="kds-ord-num">${order.orderNumber}</span>
          <span style="font-size:0.85rem; color:#d8caa8; margin-left:6px;">(${order.customerName || 'Guest'})</span>
        </div>
        <span class="kds-time">⏱ ${elapsed}</span>
      </div>

      <div style="margin-bottom:12px;">
        ${order.items.map(item => `
          <div class="kds-item-row">
            <div class="kds-item-name">
              <span style="color:#d59a2c; font-weight:700;">${item.qty}x</span> ${item.name}
            </div>
            <div class="kds-tags">
              <span class="kds-tag ${item.temp === 'Hot' ? 'hot' : 'iced'}">${item.temp === 'Hot' ? '🔥 Hot' : '🧊 Iced'}</span>
              ${item.add && item.add !== 'No add' ? `<span class="kds-tag">${item.add}</span>` : ''}
              ${item.sweetness ? `<span class="kds-tag">${item.sweetness}</span>` : ''}
              ${item.boba && item.boba !== 'No boba' ? `<span class="kds-tag boba">🧋 +Boba</span>` : ''}
            </div>
          </div>
        `).join("")}
      </div>

      <div class="kds-actions">
        ${stage === 'new' ? `
          <button type="button" class="kds-btn kds-btn-prep" onclick="advanceOrderStatus('${order.id}', 'preparing')">Start Brewing →</button>
        ` : stage === 'prep' ? `
          <button type="button" class="kds-btn kds-btn-ready" onclick="advanceOrderStatus('${order.id}', 'ready')">Mark Ready ✓</button>
        ` : `
          <button type="button" class="kds-btn kds-btn-complete" onclick="advanceOrderStatus('${order.id}', 'completed')">Hand to Customer ✕</button>
        `}
      </div>
    </div>
  `;
}

window.advanceOrderStatus = function(orderId, nextStatus) {
  AmiPOS.updateKitchenStatus(orderId, nextStatus);
  renderBoard();
};

function playNotificationChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Audio Context might require user interaction in some browsers
  }
}

document.addEventListener("DOMContentLoaded", initKDS);
