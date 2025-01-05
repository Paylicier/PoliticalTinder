const fs = require('fs');
const path = require('path');

function readJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function addStatusField(jsonArray, votesFolder) {
    jsonArray.forEach(obj => {
        const voteFilePath = path.join(votesFolder, `${obj.uid}.json`);
        if (fs.existsSync(voteFilePath)) {
            const voteData = readJsonFile(voteFilePath);
            const status = voteData.scrutin.sort.code;
            obj.status = status;
        } else {
            console.warn(`Vote file not found: ${voteFilePath}`);
        }
    });
}

const jsonArray = readJsonFile('./cards.json');
const votesFolder = './votes';

addStatusField(jsonArray, votesFolder);

writeJsonFile('cardsupdated.json', jsonArray);

console.log('Status field added successfully.');