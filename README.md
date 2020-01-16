# seamless-health-ratings
A Firefox web extension (add-on) that searches NYC open data to display latest health inspection grade for selected restuarant.

Installation
-----
Currently the extension is not published and will need to be loaded as a temporary add-on using either of the following 2 methods...<br>


**Run using `web-ext` command line tool:**
1. Clone/download this repository
2. Install the [web-ext](https://www.npmjs.com/package/web-ext) command line tool (requires NPM)
3. Navigate to the add-on directory and run `$ web-ext run`

A Firefox browser will open and the add-on will be preloaded.

**Load as temporary add-on**:
1. Open a tab in Firefox and visit `about:debugging`
2. Select "This Firefox"
3. Click the button "Load Temporary Add-on..."
4. Select any file within the add-on directory

***NOTE about the API I am using**: NYC Open Data is hosted via a service called Socrata. In order to use the API you will need to [register for an app token here](https://dev.socrata.com/register). I have removed my Socrata app token from the version history of this repo.*

Usage
-----
This add-on is setup to work within any page martching the URL pattern "\*://seamless.com/menu\*" which is the case when viewing a single restauraunts menu.

In the case when viewing a restaurant found in any of the NYC 5 boroughs, the add-on will attempt to search the NYC open data API for a corresponding restaurant and display the latest health inspection rating underneath the restaurant's name.

TODO
-----
- ~Utilize background scripts to detect new page loads~
  - ~re-fetch new restaurant data~
- ~Consider missing inspection grades, display "Unavailable", "N/A", etc...~
- Create link back to NYC health data
- Create tooltip with disclaimer about possible data innacuracy
- Make compatible with Chrome browser
- Utilize restaurant address for better API results
