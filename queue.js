"use strict";

const async = require('async');

let arr = [1,2,3,4,5,6,7,8,9,10];
let end = [];

let q  = async.queue(function(val, callback) {
    
    setTimeout(function(){
        end.push(val);
        callback("Pushed " + val);
    }, 1000)
    
}, 1);

q.drain = function() {
    console.log(end);
};

q.push(arr, function(err) {
    if (err) {
        console.log(err);
    }

    console.log("finished processing item");
});