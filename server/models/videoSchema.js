const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    directLink: String
});

module.exports = mongoose.model('Video', videoSchema);