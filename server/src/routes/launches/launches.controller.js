const { 
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById 
} = require('../../models/launches.model')

const {
    getPagination
} = require('../../services/query')

async function httpGetAllLaunches(req, res) {
    const { skip, limit, orderNumber } = getPagination(req.query) 
    // We want the values from our map in this case
    // .values is a method from Map
    // After that we need to transform this in an Array
    // Now our function has pagination
    const launches = await getAllLaunches(skip, limit, orderNumber)
    return res.status(200).json(Array.from(launches));
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    // Validations
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: "Missing required launch property",
        })
    }

    // We need to transform our date in a Date object
    launch.launchDate = new Date(launch.launchDate)
    // If the launch date is invalid, will be impossible to obtain a number
    // that is the reason because of the NaN validation here
    // other option is using toString() method to see if the date is valid or not
    if(isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch date'
        })
    }

    // our scheduleNewLaunch function is adding a property called $setOnInsert
    await scheduleNewLaunch(launch)
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    // This need to be a number
    const launchId = Number(req.params.id)

    // Exist a launch condition
    const existLaunch = await existsLaunchWithId(launchId)

    if(!existLaunch){
        return res.status(404).json({
            error: "Launch not found"
        })
    }

    const aborted = await abortLaunchById(launchId)
    if(!aborted) {
        return res.status(400).json({
            error: 'Launch not aborted'
        })
    }
    return res.status(200).json({
        ok: true
    })
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}