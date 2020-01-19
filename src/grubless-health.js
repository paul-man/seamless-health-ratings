/**
 * Seamless loads the restaurant data in a clean JSON object but we must wait for the object to be loaded to take advantage
 */
(() => {
  let attemptCount = 0;
  let waitForRestaurantData = setInterval(function() {
    if (document.body.getElementsByTagName('ghs-schema-place-action').length) {
       clearInterval(waitForRestaurantData);
       setRestaurantData();
    } else {
      if (attemptCount++ >= 10) {
        clearInterval(waitForRestaurantData);
        displayConnectionError();
      }
    }
  }, 100); 
})();

/**
 * If 10 unsuccessful attempts are made to get the Seamless/Grubhub restaurant data element we alert the user
 */
function displayConnectionError(msg) {
  let healthRatingNotFoundElement = document.getElementById('health-rating-not-found');
  if (healthRatingNotFoundElement) return;

  let restaurantNameElement = document.body.querySelector('h1.ghs-restaurant-nameHeader');
  let healthRatingElement = document.getElementById('health-rating-text');
  if (healthRatingElement) {
    healthRatingElement.parentElement.removeChild(healthRatingElement);
  }
  healthRatingNotFoundElement = document.createElement('h4');
  healthRatingNotFoundElement.setAttribute('id', 'health-rating-not-found');
  healthRatingNotFoundElement.innerText = msg || 'Unable to find restauraunt data';
  insertElementAfter(restaurantNameElement, healthRatingNotFoundElement);
}

/**
 * Grab the restaurant data from the webpage and call function to load the data
 */
function setRestaurantData() {
  restaurantData = JSON.parse(document.body.getElementsByTagName('ghs-schema-place-action')[0].firstChild.innerText);
  let address = restaurantData.address.streetAddress.split(' ');
  loadHealthRatingsBackground(restaurantData.name, address.shift(), address.join(' ').toUpperCase(), restaurantData.address.postalCode);
}

/**
 * Calls background script to make API request to NYC open data and retrieve health rating information
 * @param {String} dba : Doing Business As (restuarant name)
 */
function loadHealthRatingsBackground(dba, building, street, zipcode){
  building = building.replace(/-/g, '');
  // street = street.replace(/BLVD/g, 'BOULEVARD');
  street = street.replace(/AVE/g, 'AVENUE');
  browser.runtime.sendMessage({
    "dba": dba,
    "building": building,
    "street": street,
    "zipcode": zipcode
  }).then(data => {
    if (data.length === 0) {
      displayConnectionError('Unable to find health inspection data');
      return      
    }
    let latestInspection = data[0];
    if (!latestInspection.grade) {
      latestInspection.grade = 'N/A';
    }
    let ratingColor = '';
    switch (latestInspection.grade) {
      case 'A':
        ratingColor = '#2A3E83';
        break;
      case 'B':
        ratingColor = '#58944C';
        break;
      case 'C':
        ratingColor = '#C4673C';
        break;
      default:
        latestInspection.grade = 'N/A'
        ratingColor = 'gray';
    }
    let healthRatingNotFoundElement = document.getElementById('health-rating-not-found');
    if (healthRatingNotFoundElement) {
      healthRatingNotFoundElement.parentElement.removeChild(healthRatingNotFoundElement);
    }

    let healthRatingElement = document.getElementById('health-rating-text');
    if (healthRatingElement) {
      healthRatingElement.style.color = ratingColor;
      healthRatingElement.innerText = `Health Rating: ${latestInspection.grade}`;
    } else {
      let restaurantNameElement = document.body.querySelector('h1.ghs-restaurant-nameHeader');
      let healthRatingElement = createHealthRatingElement(dba, building, street, zipcode, ratingColor, latestInspection.grade);

      insertElementAfter(restaurantNameElement, healthRatingElement);
      insertElementAfter(restaurantNameElement, document.createElement('br'));
    }
  }).catch(onError);
}

function createHealthRatingElement(dba, building, street, zipcode, ratingColor, grade) {
  let healthRatingElement = document.createElement('h1');
  healthRatingElement.setAttribute('id', 'health-rating-text');
  healthRatingElement.setAttribute('style', `color:${ratingColor}`);
  healthRatingElement.setAttribute('class', 'gh-tooltip');
  healthRatingElement.innerText = `Health Rating: ${grade}`;

  let tooltipNode = document.createElement('div');
  tooltipNode.setAttribute('class', 'gh-right');
  tooltipNode.innerHTML = 
  `
    <p>
      ${grade === 'N/A' ? 'No health rating may indicate "Grade Pending"<br>': ''}
      If rating does not load or you have any doubts please confirm on the 
      <a href="https://a816-health.nyc.gov/ABCEatsRestaurants/#/Search" target="_blank">NYC Health website</a>
    </p>
    <i></i>
  `;

  healthRatingElement.appendChild(tooltipNode);
  return healthRatingElement;
}

/**
 * Short hand for inserting an element after another
 * @param {HTMLElement} originalElement : Element that already exists
 * @param {HTMLElement} afterElement : Element that is to be inserted into the DOM after the originalElement
 */
function insertElementAfter(originalElement, afterElement) {
  originalElement.parentNode.insertBefore(afterElement, originalElement.nextSibling);
}
