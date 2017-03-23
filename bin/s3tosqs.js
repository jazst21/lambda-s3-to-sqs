#!/usr/bin/env node
const lambda = require('../index');
const commandLineArgs = require('command-line-args');
const url = require('url');
const options = commandLineArgs([
    { name: 'tasks', alias: 't', type: String, defaultOption: true }
]);

function usage() {
    console.info("Usage: s3tosqs -t s3path")
}

if (! ('tasks' in options)) {
    usage();
    console.error("Missing Argument: tasks");
    process.exit(2);
}

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
