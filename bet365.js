const axios = require('axios');
const eventDetail = require('./b365EventFormat.js');


// bet365 ============================
const bet365_options_filter = {
  method: 'GET',
  url: 'https://betsapi2.p.rapidapi.com/v1/bet365/inplay_filter?sport_id=1&skip_esports=1',
  headers: {
    'X-RapidAPI-Key': 'test!test!test!test!test!test!test!test!test!',
    'X-RapidAPI-Host': 'betsapi2.p.rapidapi.com'
  }
};

function bet365_markets(callback) {
  axios.request(bet365_options_filter).then(function (response) {
    if(response.error) {
      console.log("errFilter===>", response.error);
    } else if(response.data && response.data.results) {
      for(var i = 0; i < response.data.results.length; i++) {
        // console.log('FI====>', response.data.results[i].id);
      }
      callback(response.data.results)
    }
    
  }).catch(function (error) {
    console.error(error);
  });
}

function bet365_getDetails(id, callback) {
  var options = {
    method: 'GET',
    url: 'https://betsapi2.p.rapidapi.com/v1/bet365/event?FI=' + id,
    headers: {
      'X-RapidAPI-Key': 'test!test!test!test!test!test!test!test!test!',
      'X-RapidAPI-Host': 'betsapi2.p.rapidapi.com'
    }
  };
  axios.request(options).then(function(response) {
    if(response.error) {
      console.log("errDetail===>", response.error);
    } else {
      if(!response.data.stats) {
        console.log("dR====>", id, "  ", response.data);
      }
      if(response.data.stats) {
        callback({updated: response.data.stats.update_at, data: response.data.results[0]});
      } else {
        callback({updated: "NAN", data: null, FI});
      }
      
    }
  }).catch(function (error) {
    console.log(id, ' detaileError============>', error);
  });
}

// bet365 get event details ------------------
function updateBPool(bPool) {
  bet365_markets(function(list) {
    // every list filter do clear closed games
    for(var k = 0; k < bPool.length; k++) {
      var sames = list.filter(function(one) {
        return one.id == bPool[k].event_id;
      });
      if(!sames.length) {
        bPool.splice(k, 1);
        k--;
      }
    }

    for(let i = 0; i < list.length; i++) {
      if(!list[i].id) console.log('li====>', list[i]);
      bet365_getDetails(list[i].id, function(obj) {
        if(obj.updated == 'NAN') { // error

        } else {
          var eDetail = eventDetail.getDetail(obj);
          eDetail.event_id = list[i].id;

          // push new event to pool
          var pushFlag = true;
          for(let k = 0; k < bPool.length; k++) {
            if(bPool[k].event_id == eDetail.event_id) { // already exist, then update
              bPool[k] = eDetail;
              pushFlag = false;
              break;
            }
          }
          if(pushFlag) {
            bPool.push(eDetail);
          }
        }
        // console.log('detailedEvent ', i);
        
        
      });
    }
  });
}




exports.updatePool = function (bPool) {
  return updateBPool(bPool);
};
