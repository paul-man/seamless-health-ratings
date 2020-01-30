(() => {
  if (window.seamlessHealthRunning) {
    return;
  }
  window.seamlessHealthRunning = true;

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
      let healthRatingElement = document.getElementById('health-rating-text');
      if (healthRatingElement) {
        healthRatingElement.style.color = ratingColor;
        healthRatingElement.innerText = `Health Rating: ${latestInspection.grade}`;
      } else {
        let restaurantNameElement = body.querySelector('h1.ghs-restaurant-nameHeader');

        healthRatingElement = document.createElement('h1');
        healthRatingElement.setAttribute('id', 'health-rating-text');
        healthRatingElement.setAttribute('style', `color:${ratingColor}`);
        healthRatingElement.innerText = `Health Rating: ${latestInspection.grade}`;

        insertElementAfter(restaurantNameElement, healthRatingElement);
        insertElementAfter(restaurantNameElement, document.createElement('br'));
      }
    }).catch(onError);
  }

  function insertElementAfter(originalElement, afterElement) {
    originalElement.parentNode.insertBefore(afterElement, originalElement.nextSibling);
  }
})();
