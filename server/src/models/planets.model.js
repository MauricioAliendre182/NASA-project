const { parse } = require('csv-parse');
const path = require('path')
const fs = require("fs")

// Stream large datasets
// parse() does not deal with files directly

const planets = require('./planets.mongo');

// function to filter habitable planets
function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === "CONFIRMED"
    // values of stellar flux, read this article to understand the values
    // https://www.centauri-dreams.org/2015/01/30/a-review-of-the-best-habitable-planet-candidates/ 
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    // planetarius radius
    && planet['koi_prad'] < 1.6;
}

// Create a new promise to deal with the 
// Asynchronism to manage CSV file
/*const promise = new Promise((resolve, reject) => {
    resolve(42);
});
promise.then((result) => {

})
const result = await promise
console.log(result)
*/

function loadPlanetsData() {
    // First we will read our file
    // Stream code
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'src', 'data', 'kepler_data.csv'))
            // Connect the two streams together
            .pipe(parse({
                // comments starts with # and with columns true, each row that we get from this
                // will be a JS object with key values pairs
                comment: '#',
                columns: true
            }))
            // the data now is parse data
            // Event emitter
            .on('data', async (data) => {
                // We will obtain buffers, they are just objects
                // that Node uses to represent collection of bytes
                // results.push(data)

                // Now as we will obtain JS objects
                if(isHabitablePlanet(data)) {
                    // habitablePlanets.push(data)

                    savePlanet(data)
                }
            })
            .on('error', (err)=>{
                console.log('error')
                console.log(err)
                reject(err);
            })
            //Chaining
            .on('end', async ()=>{
                const countPlanetsFound = (await getAllPlanets()).length
                console.log(`${countPlanetsFound} habitable planets found!`)
                resolve();
            })
            }
        )
}

async function getAllPlanets() {
    // Empty object means that all documents will be returned
    // We can exclude this two fields in our response
    return await planets.find({}, {
        '_id': 0,
        '__v': 0
    });

    // We can find by a certain field, in this case keplerName
    // The second argument is to say which fileds I want to recover
    // - symbol is to exclude a field
    // return planets.find({
    //     keplerName: "Kepler-62 f"
    // }, '-keplerName anotherField')
}

async function savePlanet(planet) {
    try{
        // Create a Mongo document
        // Replace below create with insert + update = updert
        // If the object exists, it will update with the same name
        // If does not exist, wont do anything
        // Need to specify our upsert operation
        await planets.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch(err) {
        console.error(`Could not save planet ${err}`)
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets,
}