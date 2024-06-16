// Other way to start our express server
// This way not only gonna respond HTTP request but also web sockets (real time communication)
const http = require("http")
const cluster = require('cluster')
const os = require('os')

// Populates the .env file properties in this file
require('dotenv').config({ path: __dirname + "/.env"});

const app = require('./app')
const { mongoConnect } = require('./services/mongo')
const { loadPlanetsData } = require('./models/planets.model')
const { loadLaunchData } = require('./models/launches.model')

// Enable more CPU cores in Windows
cluster.schedulingPolicy = cluster.SCHED_RR;

// We can set an env variable
const PORT = process.env.PORT || 8000;

const server = http.createServer(app)

// This to have ready our CSV data from beginning, because we are using streams
async function startServer() {
    // Connect to Mongo
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();
    // Cluster solution (this works with windows)
    if(cluster.isMaster) {
        console.log("Master has been started...")
        // Logical Cores
        // We can have 4 Physical cores, but 8 logical cores
        const NUM_WORKERS = os.cpus().length;
        console.log(NUM_WORKERS)
        for (let i = 0; i < NUM_WORKERS; i++) {
            cluster.fork();
        }
    } else {
        console.log('Worker process started.')
        server.listen(PORT, ()=> {
            console.log(`Listening on port ${PORT}...`)
        })
    }
}

// Node Pattern, to load data, we need to await
startServer();