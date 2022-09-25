
// Dependencies
const AWS = require('aws-sdk');
const es = require('event-stream');
const async = require('async');
const md5 = require('md5-jkmyers');
const winston = require('winston');

// Configuration
if(!process.env.REGION) process.env.REGION = 'us-east-1';
if(!process.env.CONCURRENCY) process.env.CONCURRENCY = 10;
const S3 = new AWS.S3();
const SQS = new AWS.SQS({region:process.env.REGION, apiVersion: '2012-11-05'});
try {
    require('node-env-file')('.env');
    if(process.env.LOG_LEVEL) winston.level = process.env.LOG_LEVEL;
} catch(err) {
    if(err instanceof TypeError && err.message.substring(0,30) == "Environment file doesn't exist") winston.warn('ERROR: Could not find .env file.');
    else throw err;
}

// Globals
var blockOfLines = [];
var linesRead = 0;


exports.handler = function(event, context, cb) {

    var params = {
        Bucket: event.Records[0].s3.bucket.name,
        Key: event.Records[0].s3.object.key
//        Bucket: "secondbucket.net22.live",
//        Key: "aws-waf-logs-stream-kinesis-s3.net22(4).live-1-2022-09-15-01-01-20-c0690f71-4709-40a0-b801-f5313577ca47"

    };

    exports.blockQueue = async.queue(exports.processBlockFromQueue, process.env.CONCURRENCY);
    exports.blockQueue.drain = cb;

    return exports.getS3().getObject(params).createReadStream()
        .on('end', function() {
            exports.pushToQueue(blockOfLines);
            winston.info("Sending "+linesRead+" tasks to SQS.");
        })
        .on('error', function(err) {
            winston.error("ERROR" + err)
            cb(err);
        })
        .pipe(es.split())
        .pipe(es.map(function(line){
            if(line && line.length) blockOfLines.push(line);
            if(blockOfLines.length >= 10) exports.pushToQueue(blockOfLines);
            linesRead += 1;
        }));
};

exports.getS3 = function() {
    return S3;
};

exports.getSQS = function() {
    return SQS;
}

exports.pushToQueue = function(block) {
    // exports.blockQueue.push(exports.sqsParamsTemplate(block, process.env.QUEUE));
    exports.blockQueue.push(exports.sqsParamsTemplate(block, process.env.QUEUE1));
    exports.blockQueue.push(exports.sqsParamsTemplate(block, process.env.QUEUE2));
    block.length = 0;
}

exports.processBlockFromQueue = function(block, cb) {
    exports.getSQS().sendMessageBatch(block, function(err, data) {
        if(err) {
            winston.error("Error: ", err, err.stack);
            winston.error("Error occurred on block: ", block);
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
