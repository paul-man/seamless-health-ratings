let body = document.body;
let timer = setInterval(waitForRestaurantData, 1000);
/*
  Seamless loads the restaurant data in a clean JSON object but we must wait for the object to be loaded to take advantage
  TODO: Utilize background scripts to set an onLoad event listener
*/
function waitForRestaurantData() {
  if(body.getElementsByTagName('ghs-schema-place-action')[0]) {
    clearInterval(timer);
    setRestaurantData();
    return;
  }
}

function setRestaurantData() {
  restaurantData = JSON.parse(body.getElementsByTagName('ghs-schema-place-action')[0].firstChild.innerText);
  loadHealthRatings(restaurantData.name);
}

function loadHealthRatings(dba) {
  $.ajax({
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
  });
}
