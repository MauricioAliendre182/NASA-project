const mongoose = require('mongoose')

const planetSchema = new mongoose.Schema({
    // By conevetion we should use the same name that we use in FE for the planets
    keplerName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Planet', planetSchema)