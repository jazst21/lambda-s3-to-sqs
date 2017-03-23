#!/usr/bin/env node
const lambda = require('../index');
const commandLineArgs = require('command-line-args');
const url = require('url');
const options = commandLineArgs([
    { name: 'queue', alias: 'q', type: String, defaultOption: true },
    { name: 'tasks', alias: 't', type: String }
]);

function usage() {
    console.info("Usage: s3tosqs -q url -t s3path")
}

if (! ('queue' in options)) {
    usage();
    console.error("Missing Argument: queue");
    process.exit(2);
}

if (! ('tasks' in options)) {
    usage();
    console.error("Missing Argument: tasks");
    process.exit(2);
}

process.env.QUEUE = options.queue
s3path = url.parse(options.tasks);

var createdEvent = {
    "Records": [
        {
            "s3": {
                "bucket": {
                    "name": s3path.host
                },
                "object": {
                    "key": s3path.pathname.replace(/^\/|\/$/g, '')
                }
            }
        }
    ]
};

lambda.handler(createdEvent, {}, () => console.log);
