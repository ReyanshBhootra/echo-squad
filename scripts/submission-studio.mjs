// Local capture only. No screen, microphone, account or third-party upload access.
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(root, "..");
const origin = "http://127.0.0.1:4174";
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, origin);
      if (req.method === "POST" && url.pathname === "/__studio/save") {
        if (req.headers.origin !== origin) {
          res.writeHead(403);
          return res.end();
        }
        const mime = req.headers["content-type"] || "";
        if (!["video/webm", "video/mp4", "application/json"].includes(mime)) {
          res.writeHead(415);
          return res.end();
        }
        let size = 0;
        const chunks = [];
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 200 * 1024 * 1024) {
            res.writeHead(413);
            res.end();
            req.destroy();
            return;
          }
          chunks.push(chunk);
        }
        const suffix =
          mime === "application/json"
            ? "json"
            : mime === "video/mp4"
              ? "mp4"
              : "webm";
        const name = `echo-squad-demo.${suffix}`;
        await writeFile(path.join(output, name), Buffer.concat(chunks));
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ saved: name, bytes: size }));
      }
      if (req.method !== "GET") {
        res.writeHead(405);
        return res.end();
      }
      const pathname = decodeURIComponent(url.pathname);
      let file;
      if (["/echo-squad-demo.mp4", "/echo-squad-demo.webm"].includes(pathname))
        file = path.join(output, pathname.slice(1));
      else {
        if (pathname.split("/").some((p) => p.startsWith("."))) {
          res.writeHead(403);
          return res.end();
        }
        file = path.resolve(
          root,
          "." +
            (pathname === "/"
              ? "/tools/submission-studio/index.html"
              : pathname),
        );
        if (!file.startsWith(root + path.sep)) {
          res.writeHead(403);
          return res.end();
        }
      }
      const data = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    } catch (error) {
      res.writeHead(404);
      res.end("Unavailable");
    }
  })
  .listen(4174, "127.0.0.1", () =>
    console.log(`Submission studio ready: ${origin}`),
  );
