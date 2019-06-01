const mongoose = require('mongoose');
const Video = require('./models/videoSchema');
const Playlist = require('./models/playlistSchema');

module.exports = {
    createPlaylist: function(user_id, dlink) {
        new Playlist({
            userId: user_id,
            videoList: [dlink]
        }).save()
    },
    deleteFromPlaylist : function(user_id, dlink) {
        Playlist.findOneAndUpdate(
            { userId: user_id }, 
            { $pull: { videoList: dlink  } },
            function (error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(success);
                }
        });
    },
    saveInPlaylist: function(user_id, dlink) {
        Playlist.findOneAndUpdate(
            { userId: user_id }, 
            { $push: { videoList: dlink  } },
            function (error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(success);
                    }
            });
    },
    getPlaylist : function (user_id, callback) {
        Playlist.find({userId: user_id}, function(err, videos) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, videos[0]);
            }
        });
    }
}