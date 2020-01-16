/**
 * listening for a message from the content_script containing the dba(restaurant name)
 */
browser.runtime.onMessage.addListener((request, sender) => {
  if (request.dba.length > 0) {
    return Promise.resolve(getHealthGrade(request.dba));
  } else {
    return Promise.reject();
  }
});

/**
 * Calls NYC data API with restaurant name to retireve inspection data/results
 * @param {String} dba : Doing Business As (restuarant name)
 */
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

/**
 * Listener for tab update. If a tab is updated that matches the patterns below the content script is called again
 */
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

// Regex patterns to match compatible online food service websites
let seamlessReg = /.*:\/\/.*\.seamless\.com\/menu\/.*/g;
let grubhubReg = /.*:\/\/.*\.grubhub\.com\/restaurant\/.*/g;