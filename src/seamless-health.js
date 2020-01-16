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
function displayConnectionError() {
  let healthRatingNotFoundElement = document.getElementById('health-rating-not-found');
  if (healthRatingNotFoundElement) return;

  let restaurantNameElement = document.body.querySelector('h1.ghs-restaurant-nameHeader');
  let healthRatingElement = document.getElementById('health-rating-text');
  if (healthRatingElement) {
    healthRatingElement.parentElement.removeChild(healthRatingElement);
  }
  healthRatingNotFoundElement = document.createElement('h4');
  healthRatingNotFoundElement.setAttribute('id', 'health-rating-not-found');
  healthRatingNotFoundElement.innerText = 'Unable to find restauraunt data';
  insertElementAfter(restaurantNameElement, healthRatingNotFoundElement);
}

/**
 * Grab the restaurant data from the webpage and call function to load the data
 */
function setRestaurantData() {
  restaurantData = JSON.parse(document.body.getElementsByTagName('ghs-schema-place-action')[0].firstChild.innerText);
  loadHealthRatingsBackground(restaurantData.name);
}

/**
 * Calls background script to make API request to NYC open data and retrieve health rating information
 * @param {String} dba : Doing Business As (restuarant name)
 */
function loadHealthRatingsBackground(dba){
  browser.runtime.sendMessage({"dba": dba}).then(data => {
    if (data.length === 0) {
      data.push({grade: 'N/A'});
    }
    let latestInspection = data[0];

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

      healthRatingElement = document.createElement('h1');
      healthRatingElement.setAttribute('id', 'health-rating-text');
      healthRatingElement.setAttribute('style', `color:${ratingColor}`);
      healthRatingElement.innerText = `Health Rating: ${latestInspection.grade}`;

      insertElementAfter(restaurantNameElement, healthRatingElement);
      insertElementAfter(restaurantNameElement, document.createElement('br'));
    }
  }).catch(onError);
}

/**
 * Short hand for inserting an element after another
 * @param {HTMLElement} originalElement : Element that already exists
 * @param {HTMLElement} afterElement : Element that is to be inserted into the DOM after the originalElement
 */
function insertElementAfter(originalElement, afterElement) {
  originalElement.parentNode.insertBefore(afterElement, originalElement.nextSibling);
}
