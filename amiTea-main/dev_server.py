from functools import partial
import errno
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_GET(self):
        if self.path in ("", "/"):
            self.send_response(302)
            self.send_header("Location", "/menu.html")
            self.end_headers()
            return
        return super().do_GET()

    def do_HEAD(self):
        if self.path in ("", "/"):
            self.send_response(302)
            self.send_header("Location", "/menu.html")
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