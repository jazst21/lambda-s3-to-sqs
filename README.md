[![codeship][2]][1]

# lambda-s3-to-sqs

The purpose of this project is to maintain a simple lambda service which will load SQS messages from a text file uploaded to s3.

# Installation

1. In the AWS Console, create a new blank lambda function.
2. Configure the S3 trigger. We use "Object Created" Event with "txt" suffix.
3. Choose or create an IAM role with SQS and S3 access
4. Clone the repository and run `npm install`
5. Copy sample.env to .env and set your sqs url
6. Edit the deploy.sh script to point to your function and run `./bin/deploy.sh`

  [1]: https://www.codeship.io/projects/209658/
  [2]: https://img.shields.io/codeship/7e310930-f226-0134-1b93-5239b5a04655.svg
