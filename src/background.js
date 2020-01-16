browser.runtime.onMessage.addListener((request, sender) => {
  if (request.dba.length > 0) {
    return Promise.resolve(getHealthGrade(request.dba));
  } else {
    return Promise.reject();
  }
});

function getHealthGrade(dba) {
  var url = new URL('https://data.cityofnewyork.us/resource/43nn-pn8j.json')
  var params = {
    "$limit" : 5000,
    "$$app_token" : "nycDataAppToken",
    "dba": dba.toUpperCase() // "Doing Business As"
  };
  url.search = new URLSearchParams(params).toString();
  
  return fetch(url)
  .then((response) => response.json())
  .then((data) => {
    data.sort((a, b) => {
      return a.inspection_date < b.inspection_date;
    });
    return data;
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (tab.url.match(seamlessReg) || tab.url.match(grubhubReg)) {
    if (changeInfo.status == 'complete') {
      browser.tabs.executeScript(tabId, {file:"/src/seamless-health.js"}).then(()=>{
      console.log("Executed!");
      }).catch(err=>{
        console.error(err);
      });
    }
  }
});

let seamlessReg = /.*:\/\/.*\.seamless\.com\/menu\/.*/g;
let grubhubReg = /.*:\/\/.*\.grubhub\.com\/restaurant\/.*/g;