from functools import partial
import errno
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from urllib.parse import urlsplit

orders_store = []

def get_default_staff_users():
    return {
        "manager": {
            "pin": os.environ.get("MANAGER_PIN", "2262"),
            "name": "Manager",
            "role": "manager"
        },
        "cashier1": {
            "pin": os.environ.get("CASHIER1_PIN") or os.environ.get("Nyjah", "1001"),
            "name": "Nyjah",
            "role": "cashier"
        },
        "cashier2": {
            "pin": os.environ.get("CASHIER2_PIN") or os.environ.get("Lucci", "1002"),
            "name": "Lucci",
            "role": "cashier"
        },
        "kitchen": {
            "pin": os.environ.get("KITCHEN_PIN", "2001"),
            "name": "Kitchen Barista",
            "role": "kitchen"
        }
    }

def get_staff_users():
    configured_users = None
    if os.environ.get("STAFF_USERS_JSON"):
        try:
            configured_users = json.loads(os.environ["STAFF_USERS_JSON"])
        except Exception:
            pass
    defaults = get_default_staff_users()
    users = {
        username: {
            **account,
            **(configured_users.get(username, {}) if isinstance(configured_users, dict) else {})
        }
        for username, account in defaults.items()
    }
    if os.environ.get("MANAGER_PIN"):
        users["manager"]["pin"] = os.environ["MANAGER_PIN"]
    if os.environ.get("CASHIER1_PIN") or os.environ.get("Nyjah"):
        users["cashier1"]["pin"] = os.environ.get("CASHIER1_PIN") or os.environ["Nyjah"]
    if os.environ.get("CASHIER2_PIN") or os.environ.get("Lucci"):
        users["cashier2"]["pin"] = os.environ.get("CASHIER2_PIN") or os.environ["Lucci"]
    if os.environ.get("KITCHEN_PIN"):
        users["kitchen"]["pin"] = os.environ["KITCHEN_PIN"]
    users["cashier1"]["name"] = "Nyjah"
    users["cashier2"]["name"] = "Lucci"
    users["kitchen"]["name"] = "Kitchen Barista"
    return users


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        path = urlsplit(self.path).path
        if path in ("/api/orders", "/api/auth"):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS, DELETE")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.end_headers()
            return
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/api/orders":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(orders_store).encode('utf-8'))
            return

        if path == "/api/auth":
            users = get_staff_users()
            public_users = [
                {"username": uid, "name": acc["name"], "role": acc["role"]}
                for uid, acc in users.items()
            ]
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(public_users).encode('utf-8'))
            return

        routes = {
            "": "/index.html",
            "/": "/index.html",
            "/staff": "/cashier.html",
            "/kitchen": "/kds.html",
            "/menu": "/menu.html",
            "/menu.html": "/menu",
            "/customer": "/menu.html",
        }
        if path in routes:
            destination = routes[path]
            query = urlsplit(self.path).query
            if query:
                destination += f"?{query}"
            self.send_response(302)
            self.send_header("Location", destination)
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):
        path = urlsplit(self.path).path
        if path == "/api/auth":
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length > 0 else b""
            response_data = {"success": False, "error": "Invalid request"}
            status_code = 400
            if body:
                try:
                    payload = json.loads(body.decode('utf-8'))
                    username = payload.get("username")
                    pin = str(payload.get("pin", "")).strip()
                    users = get_staff_users()
                    if username in users and str(users[username]["pin"]).strip() == pin:
                        response_data = {
                            "success": True,
                            "token": "token_" + username + "_" + os.urandom(8).hex(),
                            "user": {
                                "username": username,
                                "name": users[username]["name"],
                                "role": users[username]["role"]
                            }
                        }
                        status_code = 200
                    else:
                        response_data = {"success": False, "error": "Invalid user or PIN."}
                        status_code = 401
                except Exception as e:
                    response_data = {"success": False, "error": str(e)}
                    status_code = 500

            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            return

        if path == "/api/orders":
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length > 0 else b""
            if body:
                try:
                    new_order = json.loads(body.decode('utf-8'))
                    if isinstance(new_order, dict) and "id" in new_order:
                        existing = next((i for i, o in enumerate(orders_store) if o.get("id") == new_order["id"]), None)
                        if existing is not None:
                            orders_store[existing] = new_order
                        else:
                            orders_store.insert(0, new_order)
                except Exception:
                    pass
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(orders_store).encode('utf-8'))
            return
        self.send_response(404)
        self.end_headers()

    def do_PATCH(self):
        path = urlsplit(self.path).path
        if path == "/api/orders":
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length > 0 else b""
            if body:
                try:
                    patch_data = json.loads(body.decode('utf-8'))
                    order_id = patch_data.get("id")
                    kitchen_status = patch_data.get("kitchenStatus")
                    completed_at = patch_data.get("completedAt")
                    for o in orders_store:
                        if o.get("id") == order_id:
                            if kitchen_status:
                                o["kitchenStatus"] = kitchen_status
                            if completed_at:
                                o["completedAt"] = completed_at
                except Exception:
                    pass
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(orders_store).encode('utf-8'))
            return
        self.send_response(404)
        self.end_headers()

    def do_HEAD(self):
        path = urlsplit(self.path).path
        routes = {
            "": "/index.html",
            "/": "/index.html",
            "/staff": "/cashier.html",
            "/kitchen": "/kds.html",
            "/menu": "/menu.html",
            "/menu.html": "/menu",
            "/customer": "/menu.html",
        }
        if path in routes:
            destination = routes[path]
            query = urlsplit(self.path).query
            if query:
                destination += f"?{query}"
            self.send_response(302)
            self.send_header("Location", destination)
            self.end_headers()
            return
        return super().do_HEAD()


requested_port = int(os.environ.get("PORT", "8000"))
port = requested_port
while True:
    try:
        server = ThreadingHTTPServer(("0.0.0.0", port), partial(NoCacheHandler, directory="."))
        break
    except OSError as error:
        if error.errno != errno.EADDRINUSE or os.environ.get("PORT"):
            raise
        port += 1

print(f"Serving amiTEA on http://localhost:{port}")
server.serve_forever()