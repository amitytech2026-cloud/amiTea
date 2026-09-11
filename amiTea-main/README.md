# amiTEA POS & Ordering System

A unified point-of-sale and customer ordering system with **Square Terminal payment processing**, **Wisconsin municipal tax support** (Madison $5.5\%$ vs Milwaukee $7.9\%$), and real-time **Kitchen Display System (KDS)**.

## Quick Start

Start the local server from this directory:

```bash
python3 dev_server.py
```

Open http://localhost:8000 in your browser.

---

## System Interfaces

| Screen | URL | Purpose |
| :--- | :--- | :--- |
| **Step-by-Step Builder** | [index.html](index.html) | Customer kiosk guided flow (Temp $\rightarrow$ Base $\rightarrow$ Milk $\rightarrow$ Boba $\rightarrow$ Quantity). |
| **Menu Catalog** | [menu.html](menu.html) | Customer search bar, category filters, quick drink customizer modal, and Square checkout. |
| **Staff Cashier POS** | [cashier.html](cashier.html) | Staff touch register, location/tax selector, Square Terminal tender, and Cash change calculator. |
| **Kitchen Display Board** | [kds.html](kds.html) | Real-time barista ticket board with drink tags (Hot/Iced, Sweetness, Milk, Boba) and queue progression. |

---

## Features

- **Wisconsin Tax Calculator**: Switch seamlessly between **Madison (5.5%)** and **Milwaukee (7.9%)** or enter custom municipal rates.
- **Square Terminal Integration**: Includes interactive contactless tap/chip card simulation and terminal checkout payload.
- **Real-Time Cross-Screen Sync**: Orders placed from customer kiosk or menu immediately appear on the Barista Kitchen Screen with audio chimes.