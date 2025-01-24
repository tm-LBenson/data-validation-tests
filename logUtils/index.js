const fs = require("fs");

function extractData(logFilePath) {
  const logData = fs.readFileSync(logFilePath, "utf8").split("\n");
  const ouData = [];
  const userData = [];
  let collectingUsers = false;

  logData.forEach((line) => {
    if (line.includes("BUILDING USERS")) {
      collectingUsers = true;
    } else {
      const match = line.match(/{.*}/);
      if (match) {
        const jsonObject = JSON.parse(match[0]);
        if (collectingUsers) {
          userData.push(jsonObject);
        } else {
          ouData.push(jsonObject);
        }
      }
    }
  });

  return { ouData, userData };
}


module.exports = { extractData };
