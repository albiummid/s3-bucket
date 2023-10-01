const NODE_ENV = process.env.NODE_ENV || 'development';


module.exports = {
    NODE_ENV,
    appName:'S3 Bucket',
    port:process.env.PORT || 5000,
    db:{
        dbName:'MongoDB',
        dbURL:'mongodb://127.0.0.1:27017/s3_bucket',
    }
}