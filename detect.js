var stringSimilarity = require("string-similarity");


function isObject(object) {
    return object != null && typeof object === 'object';
}

function detectHighValues(gain, bObj, pinnObj, seekArr, path) {
    var keysBObj = Object.keys(bObj);
    var keysPinnObj = Object.keys(pinnObj);

    for(var i =0; i < keysBObj.length; i++) {
        var bVal = bObj[keysBObj[i]];
        var pinnVal = pinnObj[keysBObj[i]];
        var areObjects = isObject(bVal) && isObject(pinnVal);

        if(areObjects) {
            detectHighValues(gain, bVal, pinnVal, seekArr, path +  ' -> '+ keysBObj[i]);
        } else if(bVal >1 && pinnVal >1 && bVal >= pinnVal * gain){ // set high volumes
            var obj = {};
            obj[keysBObj[i]] = bObj[keysBObj[i]];
            obj.path = path;
            obj.pinnOdd = pinnVal;
            seekArr.push(obj);
        }
    }
}

function getSuitables(gain, bPool, pPool) {
    var suitableEvents = [];
    for(var i = 0; i < bPool.length; i++) {
        var kkArr = [];
        var similars = pPool.filter(function(pOne) {
            return stringSimilarity.compareTwoStrings(
                pOne.league_name + " "+pOne.home + " " + pOne.away,
                bPool[i].league_name + " "+bPool[i].home + " " + bPool[i].away,
            ) > 0.7;
        });
        if(similars) {
            var pinnObj = similars[0];
            if(bPool[i] && pinnObj)
                detectHighValues(gain, bPool[i].periods, pinnObj.periods, kkArr, "");
        }
        if(kkArr.length) {
            var event = {};
            event = {league_name: bPool[i].league_name, home: bPool[i].home, away: bPool[i].away, fields: JSON.stringify(kkArr)};
            suitableEvents.push(event);
        }
    }
    return suitableEvents;
}

exports.getSuitableEvents = function (gain, bPool, pPool, ) {
    return getSuitables(gain, bPool, pPool);
};
