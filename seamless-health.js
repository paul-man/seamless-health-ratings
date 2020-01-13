/*
  1. get restaurant names/address
    - search for elements with class 'restaurant-name'
  2. send request to NYC for health data
  3. add new text next to restauraunt name to represent 'grade'
*/
let body = document.body;
let timer = setInterval(waitForRestaurantData, 1000);
// debugger
function waitForRestaurantData() {
  if(body.getElementsByTagName('ghs-schema-place-action')[0]) {
    clearInterval(timer);
    setRestaurantData();
    return;
  }
}

function setRestaurantData() {
  restaurantData = JSON.parse(body.getElementsByTagName('ghs-schema-place-action')[0].firstChild.innerText);
  let address = restaurantData.address.streetAddress;
  console.log(restaurantData.address);
  let i = address.indexOf(' ');
  let splits = [address.slice(0,i), address.slice(i+1)];
  // console.log(splits);
  console.log(restaurantData);
  loadHealthRatings(splits[0], splits[1].toUpperCase(), 
  restaurantData.address.postalCode, 
  restaurantData.geo.longitude, 
  restaurantData.geo.latitude, 
  restaurantData.telephone,
  restaurantData.name);
}

function loadHealthRatings(buildingNum, street, zipcode, long, lat, phone, dba) {
  console.log(dba);
  $.ajax({
    url: "https://data.cityofnewyork.us/resource/43nn-pn8j.json",
    type: "GET",
    data: {
      "$limit" : 5000,
      "$$app_token" : "nycDataAppToken",
      "dba": dba.toUpperCase()
    }
  }).done(function(data) {
    data.sort((a, b) => {
      return a.inspection_date < b.inspection_date;
    });
    console.log(data);
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
    // debugger
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

// A $( document ).ready() block.
// $( document ).ready(function() {
//   debugger
//   console.log( "ready!" );
// });