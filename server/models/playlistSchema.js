const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = Schema({
    userId: String,
    videoList: [String]
})

module.exports = mongoose.model('Playlist', playlistSchema);