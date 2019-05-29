const express = require('express');
const rp = require('request-promise');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./server/mongoose');
const v = require('./server/videoHandle');

const app = express();
const client_key = "YOUR_SECRET_KEY";

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({ extended: true })); 

app.use('/search', (req, res) => {
    let query = req.body.search_query;
    if(query !== "") {
        rp({
            uri: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${query}&type=video&key=${client_key}`,
            qs: {
                method: 'GET'
              },
            json: true
        })
        .then((data) => {
            let videos = [];
            data.items.forEach(element => {
                videos.push({
                    id: element.id.videoId,
                    button: v.inPlaylist(element.id.videoId),
                    pubDate: element.snippet.publishedAt,
                    title: element.snippet.title,
                    img: element.snippet.thumbnails.default.url
                })
            });
            console.log(videos);
            res.render('index', {
                data: data.items,
                //buttons: buttons,
                videoVisible: true
            })
        })
        .catch((err) => {
            console.log(err)
            res.render('error')
        })
    }
    
})

app.use('/update', (req, res) => {
    let videoId = req.body.video_id;
    if(!v.inPlaylist(videoId)){
        v.saveInPlaylist(videoId);
    };
    res.send('done');
})

app.use("/", function(req,res){
    res.render('index',{
        videoVisible: false
    });
});

app.get("/playlist", function(req, res){
        
    Video.find({}, function(err, users){
 
        if(err) return console.log(err);
        res.send(users)
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});