const express = require('express');

const planetsRouter =require('./planets/planets.router')
const launchesRouter = require('./launches/launches.router')

const api = express.Router();

api.use("/planets", planetsRouter);
// Generalize a little bit putting '/launches' as general route
api.use('/launches', launchesRouter);

module.exports = api;