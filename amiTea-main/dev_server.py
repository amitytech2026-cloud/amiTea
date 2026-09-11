from functools import partial
import errno
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


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