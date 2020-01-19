chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.msg === "new_restaurant_fetched") {
          //  To do something
          console.log(request.data);
      }
  }
);

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.msg === "new_restaurant_fetched") {
    let myNode = document.getElementById('error-content');
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
    document.getElementById('error-content').innerText = 'POOOOP';
  }
});