from functools import partial
import errno
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from urllib.parse import urlsplit

orders_store = []


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        path = urlsplit(self.path).path
        if path == "/api/orders":
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS, DELETE")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
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

        routes = {
            "": "/menu.html",
            "/": "/menu.html",
            "/staff": "/cashier.html",
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
            "": "/menu.html",
            "/": "/menu.html",
            "/staff": "/cashier.html",
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