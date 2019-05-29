const mongoose = require('mongoose');
const Video = require('./models/videoSchema');

module.exports = {
    saveInPlaylist : function(dlink) {
        const tempVideo = new Video({directLink: dlink});
        tempVideo.save(function(err) {
            mongoose.disconnect();
            if (err) return console.log(err);
            console.log("saved successfully",tempVideo);
        })
    },
    inPlaylist : function(dlink) {
        Video.findOne({'directLink': dlink},(error, result) => {
            if(error) {
              return console.log(`Error has occurred: ${error}`);
            }
            return(result == null)
          })
    }
}