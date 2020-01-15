browser.runtime.onMessage.addListener((request, sender) => {
  if (request.dba.length > 0) {
    return Promise.resolve(getHealthGrade(request.dba));
  } else {
    return Promise.reject();
  }
});

function getHealthGrade(dba) {    
  return $.ajax({
    url: "https://data.cityofnewyork.us/resource/43nn-pn8j.json",
    type: "GET",
    data: {
      "$limit" : 5000,
      "$$app_token" : "nycDataAppToken",
      "dba": dba.toUpperCase() // "Doing Business As"
    }
  }).done(function(data) {
    data.sort((a, b) => {
      return a.inspection_date < b.inspection_date;
    });
    return data;
  });
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (tab.url.match(reg)) {
    if (changeInfo.status == 'complete') {
      browser.tabs.executeScript(tabId, {file:"/seamless-health.js"}).then(()=>{
      console.log("Executed!");
      }).catch(err=>{
        console.error(err);
      });
    }
  }
});

let reg = /.*:\/\/.*\.seamless\.com\/menu\/.*/g;