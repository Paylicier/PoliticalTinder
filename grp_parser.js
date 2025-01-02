const fs = require("fs");
const path = require("path");

const folderPath = "./groups";

function processJsonFiles(folderPath) {
  const resultArray = [];

  fs.readdirSync(folderPath).forEach((file) => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(folderPath, file);

      const fileContent = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(fileContent);

      if (jsonData.codeType === "GP") {
        resultArray.push({
          uid: jsonData.uid,
          abrev: jsonData.libelleAbrege,
          name: jsonData.libelle,
          color: jsonData.couleurAssociee,
        });
      }
    }
  });

  return resultArray;
}

const result = processJsonFiles(folderPath);

fs.writeFileSync("./groups.json", JSON.stringify(result, null, 2));
