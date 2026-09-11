from functools import partial
import errno
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from urllib.parse import urlsplit


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_GET(self):
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
        return super().do_GET()

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