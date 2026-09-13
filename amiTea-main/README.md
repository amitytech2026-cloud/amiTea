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

## Staff Accounts & Authentication

The Cashier POS (`/cashier.html`) and Kitchen Display Board (`/kds.html`) are secured behind user authentication. Staff members can select from **4 user accounts**:

1. **Manager** (`manager`)
2. **Nyjah** (`cashier1`)
3. **Lucci** (`cashier2`)
4. **Kitchen Barista** (`kitchen`)

### Secret PIN Storage (Vercel KV Database & Environment Variables)

PINs and keys are verified via the backend API (`/api/auth`) and are **never stored in client-side code** or exposed in the README. 

#### Option 1: Vercel KV Database (Recommended)
Store secret staff PINs dynamically in your Vercel KV (Redis) database under key `amitea_staff_pins`:

```json
SET amitea_staff_pins '{"manager":{"pin":"<YOUR_SECRET_MANAGER_PIN>","name":"Manager","role":"manager"},"cashier1":{"pin":"<YOUR_SECRET_CASHIER1_PIN>","name":"Cashier 1","role":"cashier"},"cashier2":{"pin":"<YOUR_SECRET_CASHIER2_PIN>","name":"Cashier 2","role":"cashier"},"kitchen":{"pin":"<YOUR_SECRET_KITCHEN_PIN>","name":"Kitchen Barista","role":"kitchen"}}'
```

When connected to Vercel KV (`KV_URL` or `REDIS_URL`), `/api/auth` automatically checks `amitea_staff_pins` first.

#### Option 2: Vercel Environment Variables
You can also store PIN secrets in Vercel project environment variables (or `.env`):

```bash
# Individual Secret PINs
MANAGER_PIN="<YOUR_SECRET_MANAGER_PIN>"
CASHIER1_PIN="<YOUR_SECRET_CASHIER1_PIN>"
CASHIER2_PIN="<YOUR_SECRET_CASHIER2_PIN>"
KITCHEN_PIN="<YOUR_SECRET_KITCHEN_PIN>"

# Or as a JSON string
STAFF_USERS_JSON='{"manager":{"pin":"<SECRET_PIN>","name":"Manager","role":"manager"},...}'
```

*(Note: For local offline development without KV or environment variables, default fallback demo PINs are used.)*

---

## Deploy to Vercel
```bash
npx vercel --prod --yes
```
