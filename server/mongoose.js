let mongoose = require('mongoose');

const server = 'localhost:27017'; // REPLACE WITH YOUR DB SERVER
const database = 'playlist-db';      // REPLACE WITH YOUR DB NAME
const _url = `mongodb://${server}/${database}`;

class Database {
    constructor() {
        this._connect()
    }
    _connect() {
        mongoose.connect(_url, {useNewUrlParser: true})
        .then(() => {
            console.log('Database connection successful')
        })
        .catch(err => {
            console.log(err);
            console.error('Database connection error')
        })
    }
};

module.exports = new Database();
