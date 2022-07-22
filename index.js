const bet365 = require('./bet365.js');
const pinn = require('./pinn.js');
const detectHighs = require('./detect.js');

var bPool = [], pPool = [], gain = 1.5;

const dataUpdateSeconds = 5;
const detectSeconds = 3;
const handleSheetsSecond = 5;

//=====================================
// update api data every 5 seconds
setInterval(function() {
  bet365.updatePool(bPool);
  pinn.updatePool(pPool);
}, 1000 * dataUpdateSeconds);

const { GoogleSpreadsheet } = require('google-spreadsheet');

// Initialize the sheet - doc ID is the long id in the sheets URL
const doc = new GoogleSpreadsheet('test!test!test!test!test!test!test!test!');
const creds = require('./sheetsCred.json');

(async function() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo()
  console.log(doc.title);

  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  const settingSheet = doc.sheetsByIndex[1];

  const rows = await sheet.getRows();
  // detect high values every 3 seconds
  setInterval(async function() {
    var sutables = detectHighs.getSuitableEvents(gain, JSON.parse(JSON.stringify(bPool)) , JSON.parse(JSON.stringify(pPool)));
    console.log("-------------b==>", bPool.length, ", p==>", pPool.length, ", s==>", sutables.length, "-------------");
    // console.log(sutables);
    await sheet.addRows(sutables);
  }, 1000 * detectSeconds);

  // handle sheets every 5 seconds
  setInterval(async function() {
    var tRows = await sheet.getRows();
    var settingRows = await settingSheet.getRows();
    gain = settingRows[0].percent;

    if(tRows.length > 300) {
      for(var k = 0; k < tRows.length - 300; k++)
      await tRows[k].delete();
    }
  }, 1000 * handleSheetsSecond)
  
})();
