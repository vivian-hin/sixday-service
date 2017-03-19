const http = require("http");
const pg = require('pg');
const ResultSet = require('pg');
const uuid = require('node-uuid');
const Promise = require('promise')

let config = {
    user: "postgres",
    host: "localhost",
    database: "sixday",
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};
let pool = new pg.Pool(config);

http.createServer(function (req, res) {
    if (req.url == "/users" && req.method.toLowerCase() == "get"){
        let weekday = new Date().getDay();
        let sql = "SELECT * FROM diaries";
        query(sql).then((result) => {
            console.log(result.rows);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify({results: result.rows}));
        }).catch(err => {
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('service error' + err);
        });
    }
}).listen(8888);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');

function query(sql) {
    return new Promise((resolve, reject) => {
        pool.connect(function (err, client, done) {
            if (err) {
                reject('error fetching client from pool', err);
            } else {
                client.query(sql, function (err, result) {
                    done();
                    if (err) {
                        console.log(err + "==========");
                        reject('error running query', err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
        pool.on('error', function (err, client) {
            reject('idle client error', err.message, err.stack);
        });
    });
}

function today() {
    let date = new Date();
    let today = date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate();
    console.log(today);
    return today;
}