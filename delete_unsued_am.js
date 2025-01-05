const fs = require('fs');
const path = require('path');

const jsonFilePath = path.join(__dirname, 'cards.json');

const directoryPath = path.join(__dirname, 'parsed_am');

fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    return console.error('Error reading JSON file:', err);
  }

  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (parseError) {
    return console.error('Error parsing JSON:', parseError);
  }

  const filesToKeep = jsonData.map((item) => item.amendement);

  console.log(`Files to keep: ${filesToKeep.join(', ')}`);

  const processDirectory = (dirPath) => {
    fs.readdir(dirPath, (err, items) => {
      if (err) {
        return console.error('Unable to scan directory:', err);
      }

      items.forEach((item) => {
        const itemPath = path.join(dirPath, item);

        fs.stat(itemPath, (err, stats) => {
          if (err) {
            return console.error('Error checking item:', err);
          }

          if (stats.isFile()) {
            const relativePath = path.relative(directoryPath, itemPath);

            if (!filesToKeep.includes(relativePath)) {
              fs.unlink(itemPath, (err) => {
                if (err) {
                  return console.error('Error deleting file:', err);
                }
                console.log(`Deleted file: ${relativePath}`);
              });
              console.log(`Deleted file: ${relativePath}`);
            } else {
              console.log(`Kept file: ${relativePath}`);
            }
          } else if (stats.isDirectory()) {
            processDirectory(itemPath);
          }
        });
      });
    });
  };

  processDirectory(directoryPath);
});