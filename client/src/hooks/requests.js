const API_URL = 'http://localhost:8000/v1';

async function httpGetPlanets() {
  // Load planets and return as JSON.
  const response = await fetch(`${API_URL}/planets`)
  return await response.json()
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${API_URL}/launches`)
  const fetchedLaunches = await response.json();
  // Sort comparing two numbers  in this case fligthNumber
  return fetchedLaunches.sort((a, b) => {
    return a.fligthNumber - b.fligthNumber
  })
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  // We are managing the POST method here
  // We need to manage exceptions with the server with try catch
  try{
    return await fetch(`${API_URL}/launches`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      // Value needs to be a string, instead of an object
      body: JSON.stringify(launch)
    })
  } catch(err) {
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(id) {
  // Delete launch with given ID.
  try{
    return await fetch(`${API_URL}/launches/${id}`, {
      method: "delete"
    });
  } catch(err) {
    console.log(err)
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};