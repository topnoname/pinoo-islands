# เซิร์ฟเวอร์สำหรับทดสอบเกม: เหมือน python -m http.server แต่สั่งไม่ให้เบราว์เซอร์จำไฟล์เก่า
# วิธีใช้: python tools/serve.py 8766  (เปิดโฟลเดอร์เกมให้เอง ไม่ว่าจะรันจากที่ไหน)
import functools
import http.server
import pathlib
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    root = pathlib.Path(__file__).resolve().parent.parent
    handler = functools.partial(NoCacheHandler, directory=str(root))
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
