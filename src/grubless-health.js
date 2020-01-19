/**
 * Seamless loads the restaurant data in a clean JSON object but we must wait for the object to be loaded to take advantage
 */
(() => {
  let attemptCount = 0;
  let waitForRestaurantData = setInterval(function() {
    if (document.body.getElementsByTagName('ghs-schema-place-action').length) {
       clearInterval(waitForRestaurantData);
       setRestaurantData();
       return true;
    } else {
      if (attemptCount++ >= 10) {
        clearInterval(waitForRestaurantData);
        displayConnectionError();
        return true;
      }
    }
  }, 100);
  return true;
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
  street = street.replace(/BLVD/g, 'BOULEVARD');
  street = street.replace(/AVE/g, 'AVENUE');
  browser.runtime.sendMessage({
    "dba": dba,
    "building": building,
    "street": street,
    "zipcode": zipcode
  }).then(data => {
    if (data.length === 0) {
      displayConnectionError('Unable to find health inspection data');
      return true;
    }
    let latestInspection = data[0];
    if (!latestInspection.grade) {
      latestInspection.grade = 'N/A';
    }
    if(latestInspection.grade === 'Z') {
      latestInspection.grade = 'Pending';
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
      let healthRatingElement = createHealthRatingElement(latestInspection.grade);

      insertElementAfter(restaurantNameElement, healthRatingElement);
      insertElementAfter(restaurantNameElement, document.createElement('br'));
    }
    return true;
  }).catch(onError => {
    console.log(onError);
  });
  return true;
}

function createTooltip(grade) {
  var parser = new DOMParser();
  var domString = 
  `
  <div class="gh-right">
    <p>
      ${grade === 'N/A' ? 'No health rating may indicate "Grade Pending"<br>': ''}
      If rating does not load or you have any doubts please confirm on the 
      <a href="https://a816-health.nyc.gov/ABCEatsRestaurants/#/Search" target="_blank">NYC Health website</a>
    </p>
    <i></i>
  </div>
  `;
  var html = parser.parseFromString(domString, 'text/html');    
  return html.body.firstChild;
}

/**
 * Creates the HTMLElement for the restaurants health rating, including the disclaimer tooltip
 * @param {string} grade - Health grade of restaurant
 */
function createHealthRatingElement(grade) {
  let healthRatingElement = document.createElement('h1');
  let gradeClass = grade.toLowerCase().replace('/', '');
  healthRatingElement.setAttribute('id', 'health-rating-text');
  healthRatingElement.setAttribute('class', `gh-tooltip gh-grade-${gradeClass}`);
  healthRatingElement.innerText = `Health Rating: ${grade}`;

  healthRatingElement.appendChild(createTooltip(grade));
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

/**
 * Removes a class from an element based on only partial classname
 * @param {HTMLElement} element - target element for class removal
 * @param {string} classname - partial or whole name of class to remove by regex
 */
function removeClassByReg(element, classname) {
  element.classname.replace(`/\b${classname}*?\b/g`, '');
  element.classname.replace(/ +/g, ' ');
}
