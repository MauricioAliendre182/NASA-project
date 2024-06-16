const axios = require('axios');

// Model for our launch page
// Import files which are a layer below of our current layer (model - Access layer)
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 1;

// Choosing database
// Our data is standalone, there are no complex relationships between our launches
// Flight number, increase by one, our database needs to be clever to track this number, this number needs to be unique


// Here we can use Map from JS
// const launch = {
//     flightNumber: 100, // flight_number, response SpaceX API
//     mission: 'Kepler exploration X', //name, response SpaceX API
//     rocket: 'Explorer IS1', //rocket.name API response SpaceX API
//     launchDate: new Date('December 27, 2030'), //date_utc, response SpaceX API
//     target: 'Kepler-442 b', // not applicable
//     customers: ['ZTM', 'NASA'], // payload.customers for each payload, response SpaceX API
//     upcoming: true, // upcoming, response SpaceX API
//     success: true // success, response SpaceX API
// }

// launches.set(launch.flightNumber, launch)
// saveLaunch(launch)

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

// Function to map the data to database
async function populateLaunches() {
    console.log('Downloading launch data...');
    // Make a post request, using pagination (Query + Pagination Guide)
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: "payloads",
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    // We need to manage different status codes
    if (response.status != 200) {
        console.log('Problem downloading launch data')
        throw new Error('Launch data download failed')
    }

    // Mapping the response values to the DataBase
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];

        // return a single list to be adapted in out lunch
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers, 
        }

        console.log(`${launch.flightNumber} ${launch.mission} ${launch.customers}`)

        await saveLaunch(launch)
    }
}

// Here we will user the SpaceX API
async function loadLaunchData() {
    // Criteria that a launch does not exist and improve the performance
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    if(firstLaunch){
        console.log('Launch data already loaded!')
    } else {
        await populateLaunches();
    }
}

// Implmentation that the rest does not need to know about it
async function getAllLaunches(skip, limit, orderNumber) {
    return await launchesDatabase
    .find({}, { "_id": 0, "__v": 0 })
    // -1 is for descending value
    // 1 for ascending values
    .sort({ flightNumber: orderNumber })
    .skip(skip)
    .limit(limit);
    // return Array.from(launches.values())
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
            .findOne()
            // We can sort the JS Object by flight number, descending order ('-')
            .sort('-flightNumber');
    // If there is no lastest flight number we can return a fixed value
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {
    // Upsert operation
    // Moongose include a feature to not only update something in MongoDB
    // but also updates that launch object in memory ("$setOnInsert")
    // this is because we are using updateOne, so we can replace it by findOneAndUpdate
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

// Function to find only the launches that we already have in our Database
async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
} 

// Function to work with out Database
async function scheduleNewLaunch(launch) {
    // We need to add a condition here to ensure that our target planet exists
    const planet = await planets.findOne({
        keplerName: launch.target
    });
    
    // We can throw an error, in this case because we are in access layer
    if (!planet) {
        throw new Error("No matching planets was found")
    }

    // Latest flight number
    const newFLightNumber = await getLatestFlightNumber() + 1;

    // Set some properties by default, same that addNewLaunch
    // with Object.assign we will assign some properties
    // that we do not need that our client sends us
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Nasa'],
        flightNumber: newFLightNumber,
    });

    await saveLaunch(newLaunch);
}

// // function to set a value in launches Map
// function addNewLaunch(launch) {
//     latestFlihtNumber++
//     // with Object.assign we will assign some properties
//     // that we do not need that our client sends us
//     launches.set(
//         latestFlihtNumber, 
//         Object.assign(launch, {
//             flightNumber: latestFlihtNumber,
//             customers: ['Nasa'],
//             upcoming: true,
//             success: true,
//         })
//     );
// }

async function existsLaunchWithId(launchId) {
    // Use the database to find a launch
    return await findLaunch({
        flightNumber: launchId
    })
}

async function abortLaunchById(launchId) {
    // Abort a launch
    // Database
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false,
    })

    // Clean the database
    // await launchesDatabase.deleteOne({
    //     flightNumber: launchId
    // })

    return aborted.modifiedCount === 1;

    // const aborted = launches.get(launchId)
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
}