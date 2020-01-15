var body = document.body;
var timer = setInterval(waitForRestaurantData, 1000);
var attemptCount = 0;

/*
  Seamless loads the restaurant data in a clean JSON object but we must wait for the object to be loaded to take advantage
  TODO: Utilize background scripts to set an onLoad event listener
*/
function waitForRestaurantData() {
  if (attemptCount++ >= 10) clearInterval(timer);
  if(body.getElementsByTagName('ghs-schema-place-action')[0]) {
    clearInterval(timer);
    setRestaurantData();
    return;
  }
}

function setRestaurantData() {
  restaurantData = JSON.parse(body.getElementsByTagName('ghs-schema-place-action')[0].firstChild.innerText);
  loadHealthRatingsBackground(restaurantData.name);
}

function loadHealthRatingsBackground(dba){
  browser.runtime.sendMessage({"dba": dba}).then(data => {
    let ratingColor = '';
    switch (data[0].grade) {
      case 'A':
        ratingColor = 'blue';
        break;
      case 'B':
        ratingColor = 'green';
        break;
      case 'C':
        ratingColor = 'orange';
        break;
      default:
        ratingColor = 'gray';
    }
    let healthRating = document.getElementById('health-rating-text');
    if (healthRating) {
      healthRating.style.color = ratingColor;
      healthRating.innerHTML = `Health Rating: ${data[0].grade}`;
    } else {
      let restaurantName = body.querySelector('h1.ghs-restaurant-nameHeader').innerHTML;
      body.querySelector('h1.ghs-restaurant-nameHeader').innerHTML = 
        `${restaurantName}<br><span id="health-rating-text" style='color:${ratingColor};'>Health Rating: ${data[0].grade}</span>`;
    }
  }).catch(onError);
}
