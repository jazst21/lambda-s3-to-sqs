
// Dependencies
const AWS = require('aws-sdk');
const es = require('event-stream');
const async = require('async');
const md5 = require('md5-jkmyers');
const S3 = new AWS.S3();
const SQS = new AWS.SQS({region:process.env.region, apiVersion: '2012-11-05'});

// Configuration
process.env.region = 'us-east-1';
process.env.concurrency = 10;
process.env.queue = 'https://sqs.us-east-1.amazonaws.com/674223647607/ktpi'

// Globals
var params = {Bucket: 'tesera.ktpi', Key: 'h1638/input/gridcellsSqs.txt'};
var blockOfLines = [];
var linesRead = 0;

exports.blockQueue = async.queue(exports.processBlockFromQueue, process.env.concurrency);

exports.getS3 = function() {
    return S3;
};

exports.getSQS = function() {
    return SQS;
}

exports.handler = function(event, context, cb) {

    exports.blockQueue.drain = cb;

    return exports.getS3().getObject(params).createReadStream()
        .on('end', function() {
            exports.pushToQueue(blockOfLines);
            console.log("Sending "+linesRead+" tasks to SQS.");
        })
        .on('error', function(err) {
            console.log("ERROR" + err)
            cb(err);
        })
        .pipe(es.split())
        .pipe(es.map(function(line){
            if(line && line.length) blockOfLines.push(line);
            if(blockOfLines.length >= 10) exports.pushToQueue(blockOfLines);
            linesRead += 1;
        }));
};

exports.pushToQueue = function(block) {
    console.log('acutal queue');
    exports.blockQueue.push(exports.sqsParamsTemplate(block, process.env.queue));
    block.length = 0;
}

exports.processBlockFromQueue = function(block, cb) {
    exports.getSQS().sendMessageBatch(block, function(err, data) {
        if(err) {
            console.log("Message: ", block);
            console.log("Error: ", err, err.stack);
        }
        cb();
    });
}

exports.sqsParamsTemplate = function(messages, queue) {
    return params = {
        Entries: messages.map(function(message) {
            return {
                Id: md5(message),
                MessageBody: message
            };
        }),
        QueueUrl: queue
    };
}
