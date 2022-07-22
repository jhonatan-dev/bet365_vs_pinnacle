
var mathjs = require("mathjs");

/*
'6v' + FI + 

* home => C1T1_1_1
* away => C1T2_1_1
* league_name => C1A_1_1 ->CT
* Fulltime Result => C1G1777_1_1
* Halfime Result => C1G10161_1_1
* Asian Handicap => C1-G12_1_1
* 1st Half Asian Handicap => C1-G3_1_1
* Goal Line => C1-G15_1_1
* 1st Half Goal Line => C1-G4_1_1

*/

const name_fullTimeResult = "Fulltime Result";
const name_halfTimeResult = "Halftime Result";
const name_asianHandicap = "Asian Handicap";
const name_1stHalfAsianHandicap = "1st Half Asian Handicap";
const name_goalLine = "Goal Line";
const name_1stHalfGoalLine = "1st Half Goal Line";

function allBetsFun(data) {
    var C3 = data[0]["C3"];
    var FI = data[0]["FI"];
    var CL = data[0]["CL"];
    var allBetsOut = [];
    var memberFlag = false;
    var type = "-----------------";
    
    var home = '';
    var away = '';
    var league_name = '';
    var identTxt = "6V" + FI + "C" + CL;

    for(var i = 0; i < data.length; i++) {
        if(data[i]["IT"] == identTxt + "T1_1_1") {
            home = data[i]["NA"];
        }
        if(data[i]["IT"] == identTxt + "T2_1_1") {
            away = data[i]["NA"];
        }
        if(data[i]["IT"] == identTxt + "A_1_1") {
            league_name = data[i]["CT"];
        }
    
        if(data[i]["type"] == "MG") {
            memberFlag = false;
    
            if(data[i]["IT"] == identTxt + "G1777_1_1") { // fulltime result
                type = name_fullTimeResult;
                memberFlag = true;
            } else if(data[i]["IT"] == identTxt + "G10161_1_1") { // Halfime Result
                type = name_halfTimeResult;
                memberFlag = true;
            } else if(data[i]["IT"] == identTxt + "-G12_1_1") { // Halfime Result
                type = name_asianHandicap;
                memberFlag = true;
            } else if(data[i]["IT"] == identTxt + "-G3_1_1") { // Halfime Result
                type = name_1stHalfAsianHandicap;
                memberFlag = true;
            } else if(data[i]["IT"] == identTxt + "-G15_1_1") { // Halfime Result
                type = name_goalLine;
                memberFlag = true;
            } else if(data[i]["IT"] == identTxt + "-G4_1_1") { // Halfime Result
                type = name_1stHalfGoalLine;
                memberFlag = true;
            } 
        } else {
            if(memberFlag == true && data[i]["type"] == "PA" && data[i]["FI"] == C3) {
                if(!allBetsOut[type]) {
                    allBetsOut[type] = [];
                }
                // convert odds fractional to decimal
                data[i]["OD"] = 1 + Math.floor(mathjs.fraction(data[i]["OD"]).valueOf() * 1000) / 1000;
                allBetsOut[type].push(data[i]);
            }
        }
        
    }
    return {home: home, away: away, league_name: league_name, data: allBetsOut};
}

function pairAsianHandicap(handicaps) {
    let outHandicapsObj = {};
    if(handicaps && handicaps.length)
    for(let i = 0; i < handicaps.length / 2; i++) {
        outHandicapsObj[handicaps[i]["HA"]] = {
            "home": handicaps[i]["OD"],
            "away": handicaps[i + handicaps.length / 2]["OD"]
        }
    }
    return outHandicapsObj;
}

function pairTotals(totals) {
    let outTotalsObj = {};
    if(totals && totals.length)
    for(let i = 0; i < totals.length / 2; i++) {
        outTotalsObj[totals[i]["HA"]] = {
            "home": totals[i]["OD"],
            "away": totals[i + totals.length/2]["OD"]
        }
    }
    return outTotalsObj;
}

function pairMoneyLine(moneyLines) {
    if(moneyLines && moneyLines.length) {
        return {
            "home": moneyLines[0]["OD"],
            "draw": moneyLines[1]["OD"],
            "away": moneyLines[2]["OD"]
        }
    } else {
        return {};
    }
    
}

function eventDetail(allBetsObj, last) {
    var allBets = allBetsObj.data;
    return {
        league_name: allBetsObj.league_name,
        home: allBetsObj.home,
        away: allBetsObj.away,
        last: last,
        periods: {
            num_0: {
                "money_line" : pairMoneyLine(allBets[name_fullTimeResult]),
                "spreads" : pairAsianHandicap(allBets[name_asianHandicap]),
                "totals" : pairTotals(allBets[name_goalLine])
            },
            num_1: {
                "money_line" : pairMoneyLine(allBets[name_halfTimeResult]),
                "spreads" : pairAsianHandicap(allBets[name_1stHalfAsianHandicap]),
                "totals" : pairTotals(allBets[name_1stHalfGoalLine])
            }
        }
    }
}

exports.getDetail = function (event) {
    return eventDetail(allBetsFun(event.data), event.updated);
};
