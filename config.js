require("dotenv").config();

module.exports = {
    mongoDbUsername: process.env.MONGO_DB_USERNAME,
    mongoDbPassword: process.env.MONGO_DB_PASSWORD,
    mongoDbName: process.env.MONGO_DB_NAME,
    mongoCollection: process.env.MONGO_COLLECTION,
    portNumber: process.argv[2] || 3000 // default port number set to 3000
};
