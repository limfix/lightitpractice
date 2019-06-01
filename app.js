const express = require('express');
const rp = require('request-promise');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./server/mongoose');
const v = require('./server/videoHandle');

const app = express();
const client_key = "YOUR_SECRET_KEY";
const userId = "1337";

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({ extended: true })); 

app.use('/search', (req, res) => {
    let query = req.query.q;
    if(query !== "") {
        rp({
            uri: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${query}&type=video&key=${client_key}`,
            qs: {
                method: 'GET'
              },
            json: true
        })
        .then((data) => {
            let buttonsList = [];
            v.getPlaylist(userId, function(err, playlist) {
                if (err) {
                  console.log(err);
                }
                data.items.forEach(element => {
                    let _result;
                    if(playlist == undefined) {
                        _result = false;
                    }
                    else {
                        _result = (playlist.videoList.includes(element.id.videoId));
                    }
                    buttonsList.push({
                        button: _result,
                    });
                });
                res.render('index', {
                    data: data.items,
                    listType: 'search',
                    buttons: buttonsList,
                    videoVisible: true
                });
            });
        })
        .catch((err) => {
            console.log(err)
            res.render('error')
        })
    }
    
})



app.use('/playlist', function(req, res) {
    v.getPlaylist(userId, function(err, playlist) {
        if (err) {
          console.log(err);
        }
        let videoIdList = playlist.videoList;
        rp({
            uri: `https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoIdList}&key=${client_key}`,
            qs: {
                method: 'GET'
              },
            json: true
        })
        .then((data) => {
            res.render('index',{
                data: data.items,
                listType: 'playlist',
                videoVisible: true
            })
        })    
    })
});

app.post('/update', (req, res) => {
    let videoId = req.body.video_id;
    v.getPlaylist(userId, function(err, playlist) {
        if (err) {
          console.log(err);
        }
        if ( playlist == undefined ) {
            v.createPlaylist(userId, videoId);
            console.log(`Created playlist for user ${userId} with video ${videoId}`);
        }  
        else if(playlist.videoList.indexOf(videoId) == -1) {
            console.log(`Added to playlist with user ${userId} a video ${videoId}`);
            v.saveInPlaylist(userId,videoId);
        }
        else{
            console.log(`Video ${videoId} deleted from playlist of ${userId} user`);
            v.deleteFromPlaylist(userId,videoId);
        }
        res.redirect(req.get('referer'));
    });
})

app.use("/", function(req,res){
    res.render('index',{
        videoVisible: false
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});