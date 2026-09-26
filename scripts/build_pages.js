// docs/page.html (artifact fragment) -> docs/index.html (GitHub Pages) ; src/v1.js -> docs/perinto.js
const fs = require("fs"), d = __dirname + "/../docs/";
fs.copyFileSync(__dirname + "/../src/v1.js", d + "perinto.js");
fs.writeFileSync(d + "index.html", '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' +
  fs.readFileSync(d + "page.html", "utf8") + "\n</html>\n");
