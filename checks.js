const fs = require("fs")
const path = require('path');

const dataPath = path.join(__dirname, 'recordReports.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

console.log(data.length)