const fs = require("fs");
const path = require("path");

const sourceDir = "./amendements/16";
const destDir = "./parsed_am/16";

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (path.extname(item) === ".json") {
      processJsonFile(itemPath);
    }
  });
}

function processJsonFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const jsonData = JSON.parse(fileContent);

  const id = jsonData.amendement.identification.numeroOrdreDepot;
  if (!jsonData.amendement.signataires?.libelle)
    return console.log(`No author found for: ${filePath}`);
  const authorName = jsonData.amendement.signataires.libelle
    .split(" ")[0]
    .replace(/&#160;/g, "")
    .replace("M.", "")
    .replace("Mme", "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();

  const newFileName = `${id}_${authorName}.json`;
  const newFilePath = path.join(destDir, newFileName);

  console.log(`Copying and renaming: ${filePath}`);
  fs.copyFileSync(filePath, newFilePath);
  console.log(`Copied and renamed: ${newFilePath}`);
}

processDirectory(sourceDir);
