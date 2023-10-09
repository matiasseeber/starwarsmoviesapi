<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Installation

1) Go to the DB.sql file and run all the scripts in the query tool in postgres

2) 

```bash
$ npm install
```

3) Create a .env file and add the following credentials

DATABASE_URL=postgresql://username:password@address:port/star_wars_api?schema=public
<br>
fromEmail= email
<br>
emailPassword= emailApiKey
<br>
SECRET_KEY=secretkey #(secret key for jwt encoding)

4) 

```bash
$ npx prisma generate
```

You will have a postman collection for testing the API.



## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Workflow

1) Create a user (with a valid email)
2) You will receive an email with a verification code (has an expiration of one hour, if expired resend the code using the /auth/resend_verification_email endpoint)
3) Verify your email using /auth/verify endpoint
4) Set your password using /auth/change_password endpoint

## Endpoints

All endpoints are private except /auth/verify, /auth/login and /users
The GET /movies endpoint is only available for regular users and creation, deletion and update actions are only available for admin users.
This property can only be changed via database manipulation.