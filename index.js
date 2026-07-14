// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area=";

// Grab the DOM elements once, up top, so we're not calling
// document.getElementById() repeatedly inside our functions.
const stateInput = document.getElementById("state-input");
const fetchBtn = document.getElementById("fetch-alerts");
const alertsDisplay = document.getElementById("alerts-display");
const errorMessageDiv = document.getElementById("error-message");

// STEP 1: Fetch alerts for a state from the API
// async/await lets us write this top-to-bottom instead of
// chaining .then() calls. fetch() itself returns a Promise.
async function fetchWeatherAlerts(state) {
  const url = `${weatherApi}${state}`;

  try {
    const response = await fetch(url);

    // fetch() only rejects on a true network failure (no internet,
    // DNS error, etc). A bad status like 404 still "succeeds" as
    // far as fetch is concerned, so we check response.ok ourselves
    // and throw manually if something's wrong.
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}. Check the state abbreviation and try again.`);
    }

    const data = await response.json();

    // Log it for now so we can inspect the shape of the response.
    console.log(data);

    displayAlerts(data);

  } catch (errorObject) {
    // Both the manual throw above and any real network failure
    // land here. errorObject.message holds the readable text.
    console.log(errorObject.message);
    displayError(errorObject.message);
  }
}

// STEP 2: Display the alerts on the page
function displayAlerts(data) {
  // "features" is the array of individual alerts in the response.
  const alerts = data.features;

  // Build a summary line, e.g. "Current watches, warnings, and
  // advisories for Minnesota: 11"
  const summary = document.createElement("p");
  summary.textContent = `${data.title}: ${alerts.length}`;
  alertsDisplay.appendChild(summary);

  // Build the list of headlines with an explicit for loop.
  const list = document.createElement("ul");

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const headline = alert.properties.headline;

    const listItem = document.createElement("li");
    listItem.textContent = headline;

    list.appendChild(listItem);
  }

  alertsDisplay.appendChild(list);
}

// STEP 3: Clear and reset the UI
// Called at the start of every new request so old alerts and
// old errors don't linger while we fetch fresh data.
function resetUI() {
  stateInput.value = "";

  // Remove every existing child from alerts-display before we
  // add new ones. A while loop keeps this explicit.
  while (alertsDisplay.firstChild) {
    alertsDisplay.removeChild(alertsDisplay.firstChild);
  }

  hideError();
}

// STEP 4: Error handling helpers
function displayError(message) {
  errorMessageDiv.textContent = message;
  errorMessageDiv.classList.remove("hidden");
}

function hideError() {
  errorMessageDiv.textContent = "";
  errorMessageDiv.classList.add("hidden");
}

// STEP 5 (optional): Validate the input looks like "MN", "TX", etc.
function isValidStateAbbreviation(state) {
  const twoCapitalLetters = /^[A-Z]{2}$/;
  return twoCapitalLetters.test(state);
}

// Wire up the button click
fetchBtn.addEventListener("click", function () 
{
  const stateValue = stateInput.value.trim().toUpperCase();

  // Reset old results/errors first. We already saved stateValue
  // above, so clearing the input field here is safe.
  resetUI();

  if (!isValidStateAbbreviation(stateValue)) {
    displayError("Please enter a valid two-letter state abbreviation (e.g. MN, TX, CA).");
    return;
  }

  fetchWeatherAlerts(stateValue);
});