const assert = require('assert');
const lambda = require('../test_helper');

describe('sqsParamsTemplate()', function() {

    it('Builds the correct SQS params', function() {
        var expected = {
            Entries: [
                { Id: 'cc5daf26edcf4540ef4306619d42ee4c', MessageBody: 'task1' },
                { Id: 'aa5de87e0e61ab62e9526281dc037a62', MessageBody: 'task2' }
            ],
            QueueUrl: 'somequeue' };

        var actual = lambda.sqsParamsTemplate(['task1','task2'], 'somequeue');
        assert.deepEqual(actual, expected);

    });

});
