const assert = require('assert');
const lambda = require('../test_helper');
const fs = require('fs');

beforeEach(function() {return lambda.unstub();});

describe('handler()', function() {

    var createEvent = {
        "Records": [
            {
                "s3": {
                    "bucket": {
                        "name": "tesera.ktpi"
                    },
                    "object": {
                        "key": "someproj/tasks/tasks.txt"
                    }
                }
            }
        ]
    };

    it('Reads the tasks from s3', function(done) {
        var expected = ['task1','task2','task3'];

        lambda.stub('getS3', () => ({
            getObject: (params) =>
                ({ createReadStream: () => fs.createReadStream('test/fixtures/tasks.txt') })
        }));

        lambda.stub('pushToQueue', (actualBlock) => {
            assert.deepEqual(actualBlock, expected);
            done();
        });

        return lambda.handler(createEvent);


    });

});
