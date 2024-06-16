import { useCallback, useEffect, useState } from "react";

import { httpGetPlanets } from "./requests";

// It is returning the planets variable
// Here we have the state, our idea is to save that state
// For that, we are using savePlanets and we are consulting our endpoint
// to GET the planets and save the state
function usePlanets() {
  const [planets, savePlanets] = useState([]);

  const getPlanets = useCallback(async () => {
    const fetchedPlanets = await httpGetPlanets();
    savePlanets(fetchedPlanets);
  }, []);

  // with useEffect, will call getPlanets()
  // when application first load
  useEffect(() => {
    getPlanets();
  }, [getPlanets]);

  return planets;
}

export default usePlanets;
