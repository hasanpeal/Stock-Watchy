import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const tickerData = JSON.parse(
  fs.readFileSync(__dirname + "/tickerToName.json", "utf8")
);

const newData = Object.keys(tickerData);

newData.forEach(element => {
  console.log(element);
});
