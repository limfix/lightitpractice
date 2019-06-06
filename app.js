const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const rp = require('request-promise');
const path = require('path');
const bodyParser = require('body-parser');

const usersRouter = require('./server/routes/users');
const db = require('./server/mongoose');
const v = require('./server/videoHandle');

const app = express();
const client_key = "YOUR_SECRET_KEY";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, '/views')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ url: 'mongodb://localhost:27017/playlist-db' })
}))

app.use('/users',usersRouter);

app.use('/search', (req, res) => {
    if(req.session.user) {
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
                v.getPlaylist(req.session.user.username, function(err, playlist) {
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
    }
    else {
        res.render('login');
    } 
});


app.use("/register", function(req,res){
    if(req.session.user){
		var data = {
            videoVisible: false,
            listType: 'search',
			user : req.session.user
		}
		res.render('index', data)
	} else {
		res.render('register');
	}
});


app.use('/playlist', function(req, res) {
    if(req.session.user) {
        v.getPlaylist(req.session.user.username, function(err, playlist) {
            if(playlist != undefined) {
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
            }
            else {
                res.render('index',{
                    listType: 'playlist',
                    videoVisible: false
                })
            }
        })
    }
    else{
        res.render('login');
    }
});

app.post('/update', (req, res) => {
    if(req.session.user) {
        let videoId = req.body.video_id;
        v.getPlaylist(req.session.user.username, function(err, playlist) {
            if (err) {
            console.log(err);
            }
            if ( playlist == undefined ) {
                v.createPlaylist(req.session.user.username, videoId);
                console.log(`Created playlist for user ${req.session.user.username} with video ${videoId}`);
            }  
            else if(playlist.videoList.indexOf(videoId) == -1) {
                console.log(`Added to playlist with user ${req.session.user.username} a video ${videoId}`);
                v.saveInPlaylist(req.session.user.username,videoId);
            }
            else{
                console.log(`Video ${videoId} deleted from playlist of ${req.session.user.username} user`);
                v.deleteFromPlaylist(req.session.user.username,videoId);
            }
            res.redirect(req.get('referer'));
        });
    }
    else {
        res.render('login');
    }
    
})

app.use("/", function(req,res){
    if(req.session.user){
		var data = {
            videoVisible: false,
            listType: 'search',
			user : req.session.user
		}
		res.render('index', data)
	} else {
		res.render('login');
	}
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});