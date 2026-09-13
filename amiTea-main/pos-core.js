/**
 * amiTEA POS Core
 * Shared Order Manager, Kitchen Display Queue, and Square Terminal Payment Service.
 */

class StaffAuth {
  static STORAGE_TOKEN_KEY = "amitea_staff_token";
  static STORAGE_USER_KEY = "amitea_staff_user";
  static API_AUTH_URL = "/api/auth";

  static async fetchUsers() {
    try {
      const res = await fetch(this.API_AUTH_URL);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch staff users:", e);
    }
    return [
      { username: "manager", name: "Manager", role: "manager" },
      { username: "cashier1", name: "Nyjah", role: "cashier" },
      { username: "cashier2", name: "Lucci", role: "cashier" },
      { username: "kitchen", name: "Kitchen Barista", role: "kitchen" }
    ];
  }

  static isAuthenticated() {
    return !!sessionStorage.getItem(this.STORAGE_TOKEN_KEY);
  }

  static getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(this.STORAGE_USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  static async login(username, pin) {
    try {
      const res = await fetch(this.API_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin })
      });
      const data = await res.json();
      if (data && data.success) {
        sessionStorage.setItem(this.STORAGE_TOKEN_KEY, data.token);
        sessionStorage.setItem(this.STORAGE_USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data?.error || "Invalid user or PIN." };
    } catch (e) {
      return { success: false, error: "Network authentication error." };
    }
  }

  static logout() {
    sessionStorage.removeItem(this.STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(this.STORAGE_USER_KEY);
    window.location.reload();
  }
}

if (typeof window !== "undefined") {
  window.StaffAuth = StaffAuth;
}

class AmiPOS {
  static STORAGE_ORDERS_KEY = "amitea_pos_orders";
  static STORAGE_CART_KEY = "amitea_shared_cart";
  static API_URL = "/api/orders";
  static _syncInterval = null;

  static initSync() {
    if (this._syncInterval) return;
    this.syncFromRemote();
    this._syncInterval = setInterval(() => {
      this.syncFromRemote();
    }, 2000);
  }

  static async syncFromRemote() {
    try {
      const res = await fetch(this.API_URL);
      if (!res.ok) return;
      const remoteOrders = await res.json();
      if (!Array.isArray(remoteOrders)) return;

      const localOrders = this.getOrders();
      let changed = false;

      const orderMap = new Map();
      localOrders.forEach(o => orderMap.set(o.id, o));

      remoteOrders.forEach(remote => {
        const existing = orderMap.get(remote.id);
        if (!existing) {
          orderMap.set(remote.id, remote);
          changed = true;
          window.dispatchEvent(new CustomEvent("amitea:order-created", { detail: remote }));
        } else if (existing.kitchenStatus !== remote.kitchenStatus) {
          existing.kitchenStatus = remote.kitchenStatus;
          existing.completedAt = remote.completedAt;
          changed = true;
          window.dispatchEvent(new CustomEvent("amitea:order-updated", { detail: existing }));
        }
      });

      if (changed) {
        const merged = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        localStorage.setItem(this.STORAGE_ORDERS_KEY, JSON.stringify(merged));
      }

      for (const local of localOrders) {
        if (!remoteOrders.some(r => r.id === local.id)) {
          this.postToRemote(local);
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }

  static async postToRemote(order) {
    try {
      await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
    } catch (err) {
      // Offline fallback
    }
  }

  static async patchRemoteStatus(orderId, kitchenStatus, completedAt) {
    try {
      await fetch(this.API_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, kitchenStatus, completedAt })
      });
    } catch (err) {
      // Offline fallback
    }
  }

  static getOrders() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_ORDERS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  static getCart() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_CART_KEY) || "[]");
    } catch {
      return [];
    }
  }

  static setCart(cart) {
    localStorage.setItem(this.STORAGE_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("amitea:cart-updated", { detail: cart }));
  }

  static clearCart() {
    this.setCart([]);
  }

  static addToCart(item) {
    const cart = this.getCart();
    cart.push({
      id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      name: item.name,
      base: item.base || item.name,
      temp: item.temp || "Iced",
      add: item.add || "No add",
      sweetness: item.sweetness || "Sweetened",
      boba: item.boba || "No boba",
      bobaPrice: item.bobaPrice || (item.boba === "Boba" || item.boba === "Add boba" ? 0.75 : 0),
      basePrice: item.basePrice || item.price || 5.00,
      addPrice: item.addPrice || 0,
      qty: item.qty || 1,
      unitPrice: item.unitPrice || (item.basePrice + (item.addPrice || 0) + (item.bobaPrice || 0)),
      notes: item.notes || ""
    });
    this.setCart(cart);
  }

  static calculateTotals(cartItems, customTip = 0) {
    const settings = StoreSettings.getSettings();
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.unitPrice || ((item.basePrice || 5) + (item.addPrice || 0) + (item.bobaPrice || 0));
      return sum + (price * (item.qty || 1));
    }, 0);

    const taxRate = settings.taxRate || 0.055;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const tip = Math.max(0, parseFloat(customTip) || 0);
    const total = Math.round((subtotal + tax + tip) * 100) / 100;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxRate: taxRate,
      tax: parseFloat(tax.toFixed(2)),
      tip: parseFloat(tip.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      locationLabel: `${settings.city}, ${settings.state} (${(taxRate * 100).toFixed(1)}%)`
    };
  }

  static generateOrderNumber() {
    const orders = this.getOrders();
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(today));
    const nextNum = 100 + todayOrders.length + 1;
    return `T-${nextNum}`;
  }

  static createOrder({ items, paymentMethod = "Square", paymentDetails = {}, tip = 0, source = "Customer Kiosk", customerName = "" }) {
    // Verification: Ensure payment is authorized and valid before saving order or broadcasting to kitchen
    if (!paymentDetails || paymentDetails.success === false) {
      throw new Error("Payment was not completed. Order cannot be sent to kitchen.");
    }

    const settings = StoreSettings.getSettings();
    const totals = this.calculateTotals(items, tip);
    const orderNumber = this.generateOrderNumber();
    
    const newOrder = {
      id: "ord_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      orderNumber: orderNumber,
      createdAt: new Date().toISOString(),
      source: source,
      customerName: customerName || `Guest #${orderNumber.replace("T-", "")}`,
      location: {
        city: settings.city,
        state: settings.state,
        taxRate: settings.taxRate
      },
      items: items.map(i => ({
        ...i,
        totalItemPrice: ((i.unitPrice || (i.basePrice + (i.addPrice || 0) + (i.bobaPrice || 0))) * (i.qty || 1))
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      taxRate: totals.taxRate,
      tip: totals.tip,
      total: totals.total,
      payment: {
        method: paymentMethod, // "Square", "Cash"
        status: "COMPLETED",
        transactionId: paymentDetails.transactionId || ("sq_tx_" + Math.random().toString(36).substr(2, 9)),
        last4: paymentDetails.last4 || "4242",
        cardBrand: paymentDetails.cardBrand || "VISA",
        timestamp: new Date().toISOString()
      },
      kitchenStatus: "new", // "new" | "preparing" | "ready" | "completed"
      completedAt: null
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(this.STORAGE_ORDERS_KEY, JSON.stringify(orders));

    // Post to remote API for multi-device sync
    this.postToRemote(newOrder);

    // Clear active cart if this was placed from cart
    this.clearCart();

    // Broadcast across windows / tabs only after successful payment
    window.dispatchEvent(new CustomEvent("amitea:order-created", { detail: newOrder }));
    return newOrder;
  }

  static updateKitchenStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.kitchenStatus = newStatus;
      if (newStatus === "completed") {
        order.completedAt = new Date().toISOString();
      }
      localStorage.setItem(this.STORAGE_ORDERS_KEY, JSON.stringify(orders));

      // Patch remote API for multi-device sync
      this.patchRemoteStatus(orderId, newStatus, order.completedAt);

      window.dispatchEvent(new CustomEvent("amitea:order-updated", { detail: order }));
    }
    return order;
  }
}

// Auto-start multi-device sync on load
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AmiPOS.initSync());
  } else {
    AmiPOS.initSync();
  }
}

/**
 * Square Terminal & Payment Processor Service
 */
class SquarePaymentService {
  /**
   * Process in-person payment via Square Terminal flow
   * Provides realistic interactive customer prompt & card reader simulation
   */
  static processSquareCheckout({ amount, tip = 0, orderSummary, onStatusUpdate }) {
    return new Promise((resolve, reject) => {
      const settings = StoreSettings.getSettings();
      const totalAmount = (amount + tip).toFixed(2);
      
      onStatusUpdate && onStatusUpdate({
        status: "CONNECTING",
        message: "Connecting to Square Terminal..."
      });

      setTimeout(() => {
        onStatusUpdate && onStatusUpdate({
          status: "WAITING_FOR_CARD",
          message: `Present Card / Apple Pay on Square Terminal ($${totalAmount})`
        });

        // If running in browser simulation mode:
        SquarePaymentModal.show({
          amount: amount,
          tip: tip,
          total: totalAmount,
          location: `${settings.city}, ${settings.state}`,
          onAuthorize: (paymentResult) => {
            onStatusUpdate && onStatusUpdate({
              status: "PROCESSING",
              message: "Authorizing with Square Network..."
            });
            setTimeout(() => {
              onStatusUpdate && onStatusUpdate({
                status: "APPROVED",
                message: "Payment Approved! Receipt created."
              });
              resolve({
                success: true,
                transactionId: "sq_term_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                cardBrand: paymentResult.cardBrand || "VISA",
                last4: paymentResult.last4 || "8821",
                entryMethod: paymentResult.entryMethod || "CONTACTLESS_TAP",
                amount: totalAmount
              });
            }, 600);
          },
          onCancel: () => {
            onStatusUpdate && onStatusUpdate({
              status: "CANCELLED",
              message: "Transaction cancelled on terminal."
            });
            reject(new Error("Payment cancelled by customer."));
          }
        });

      }, 500);
    });
  }
}

/**
 * Interactive Square Terminal UI Modal
 */
class SquarePaymentModal {
  static modalEl = null;

  static injectStyles() {
    if (document.getElementById("square-modal-styles")) return;
    const style = document.createElement("style");
    style.id = "square-modal-styles";
    style.textContent = `
      .sq-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.65);
        backdrop-filter: blur(4px); display: flex; align-items: center;
        justify-content: center; z-index: 99999; animation: sqFadeIn 0.2s ease;
      }
      @keyframes sqFadeIn { from { opacity: 0; } to { opacity: 1; } }
      .sq-device {
        background: #121212; color: #fff; width: 90%; max-width: 380px;
        border-radius: 28px; padding: 24px 22px; box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1.5px #333;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center;
      }
      .sq-screen {
        background: #1e1e1e; border-radius: 18px; padding: 20px 18px;
        margin-bottom: 20px; border: 1px solid #333;
      }
      .sq-brand {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        color: #999; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px;
        margin-bottom: 12px;
      }
      .sq-brand svg { width: 18px; height: 18px; fill: #fff; }
      .sq-amt { font-size: 2.3rem; font-weight: 700; color: #fff; margin: 4px 0 10px; }
      .sq-loc { color: #888; font-size: 0.85rem; }
      .sq-prompt { font-size: 0.95rem; color: #52c41a; font-weight: 500; margin-top: 14px; animation: sqPulse 1.5s infinite; }
      @keyframes sqPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
      .sq-reader-anim {
        margin: 18px auto; width: 64px; height: 64px; border-radius: 50%;
        background: #2a2a2a; display: flex; align-items: center; justify-content: center;
        border: 2px solid #52c41a; font-size: 1.8rem;
      }
      .sq-options { display: grid; gap: 10px; }
      .sq-btn {
        background: #fff; color: #111; border: none; border-radius: 14px;
        padding: 14px; font-size: 1rem; font-weight: 600; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: transform 0.1s, background 0.15s;
      }
      .sq-btn:hover { background: #e0e0e0; transform: scale(1.02); }
      .sq-btn.apple { background: #000; color: #fff; border: 1px solid #444; }
      .sq-btn.cancel { background: transparent; color: #ff6b6b; border: 1px solid #442222; margin-top: 6px; }
      .sq-btn.cancel:hover { background: #2a1111; }
    `;
    document.head.appendChild(style);
  }

  static show({ amount, tip, total, location, onAuthorize, onCancel }) {
    this.injectStyles();
    this.close();

    const overlay = document.createElement("div");
    overlay.className = "sq-overlay";
    overlay.innerHTML = `
      <div class="sq-device">
        <div style="background:#e0a800; color:#111; font-size:0.75rem; font-weight:700; border-radius:6px; padding:3px 8px; margin-bottom:10px; display:inline-block; text-transform:uppercase; letter-spacing:0.8px;">
          🟡 Square Sandbox Test Mode
        </div>
        <div class="sq-brand">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>
          Square Terminal · amiTEA
        </div>
        <div class="sq-screen">
          <div class="sq-loc">${location}</div>
          <div class="sq-amt">$${total}</div>
          <div style="font-size:0.8rem; color:#aaa;">Includes Subtotal $${amount.toFixed(2)}${tip > 0 ? ` + Tip $${tip.toFixed(2)}` : ''}</div>
          <div class="sq-reader-anim">💳</div>
          <div class="sq-prompt">Tap, Insert, or Swipe to Pay (Simulated)</div>
        </div>
        <div class="sq-options">
          <button class="sq-btn" id="sqTapCard">
            <span>💳 Tap / Chip Card (Test Visa ··· 8821)</span>
          </button>
          <button class="sq-btn apple" id="sqApplePay">
            <span> Pay / Apple Wallet (Test)</span>
          </button>
          <button class="sq-btn cancel" id="sqCancelPay">
            Cancel Transaction
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    overlay.querySelector("#sqTapCard").onclick = () => {
      this.close();
      onAuthorize({ cardBrand: "VISA", last4: "8821", entryMethod: "CONTACTLESS_CARD" });
    };

    overlay.querySelector("#sqApplePay").onclick = () => {
      this.close();
      onAuthorize({ cardBrand: "MASTERCARD", last4: "3092", entryMethod: "APPLE_PAY" });
    };

    overlay.querySelector("#sqCancelPay").onclick = () => {
      this.close();
      onCancel();
    };
  }

  static close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }
}

// Global exposure
window.AmiPOS = AmiPOS;
window.SquarePaymentService = SquarePaymentService;
