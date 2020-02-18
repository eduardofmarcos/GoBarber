# GoBarber

A Node.js API project of a Barber Shop from RocketSeat GoStack BootCamp 

###Features:

CRUD operations on:

* Register Users
* Register Providers
* Register Apointments
* Register Schedules
* Log in sessions using token JWT
* Uploading files using Multer and FileSystem
* Sending notifications to providers using a non-relational database MongoDB
* Checking available schedule
* Sendind Cancellation and New Orders e-mails to deliveryman using NodeMailer and bee-queue/Redis to gain performance

### Built with:

* docker
* mongoDB
* postgres
* redis:alpine

##### Dependecies:     

    "@sentry/node": "^5.12.2",
    "bcryptjs": "^2.4.3",
    "bee-queue": "^1.2.3",
    "date-fns": "^2.0.0-beta.5",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "express-async-errors": "^3.1.1",
    "express-handlebars": "^3.1.0",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.8.11",
    "multer": "^1.4.2",
    "nodemailer": "^6.4.2",
    "nodemailer-express-handlebars": "^3.1.0",
    "pg": "^7.18.0",
    "pg-hstore": "^2.3.3",
    "sequelize": "^5.21.3",
    "youch": "^2.0.10",
    "yup": "^0.28.1"
    
### How to run:

    "dev": "nodemon src/server.js",
    "queue": "nodemon src/queue.js", //email queue running parallel with the main app
    "dev:debug": "nodemon --inspect src/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
