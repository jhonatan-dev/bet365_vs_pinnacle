const axios = require("axios");

// Math.floor(new Date().getTime()/1000)

var since = Math.floor(new Date().getTime()/1000) - 1000 * 10;  // normally 10 secs before

function pinn_markets(callback) {
  var options = {
    method: 'GET',
    url: 'https://pinnacle-odds.p.rapidapi.com/kit/v1/markets',
    params: {sport_id: '1', is_have_odds: 'true',event_type: "live", since: since},
    headers: {
      'X-RapidAPI-Key': 'test!test!test!test!test!test!test!test!test!',
      'X-RapidAPI-Host': 'pinnacle-odds.p.rapidapi.com'
    }
  };
  axios.request(options).then(function (response) {
    since = response.data.last;
    callback(response.data.events, since);
  }).catch(function (error) {
    console.error(error);
  });
}


function updatePPool(pPool) {
  pinn_markets(function(events) {
    // console.log('-------------------',new Date(since * 1000).toISOString(), ', ', events.length);
    for(var i = 0; i<events.length; i++) {
        var pushFlag = true;
        for(var k =0; k < pPool.length; k++) {
            if(pPool[k].event_id == events[i].event_id) { // exist
                pPool[k] = events[i];
                pushFlag = false;
                break;
            }
        }
        if(pushFlag) {
            pPool.push(events[i]);
        }
    }
    //
  });
  // clearUnEventInPPool
  for(var j = 0; j < pPool.length; j++) {
    var pResults = pPool[j].period_results;
    if(pResults) {
        for(var k = 0; k < pResults.length; k++) {
            if(pResults[k].number == 0 && pResults[k].status == 1) {
                pPool.splice(j, 1);
                j--;
            }
        }
    }
  }
}

exports.updatePool = function (pPool) {
  return updatePPool(pPool);
};


