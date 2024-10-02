//dotenv.config();
const uuid = require("uuid").v4;
const {S3} = require('aws-sdk');

exports.iS3Uploadv1 = async (file) => {
  
    const region = process.env.AWS_REGION;
    const access_key = process.env.AWS_ACCESS_KEY_ID;
    const secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;
    //const folder = process.env.MONGO_FOLDER_LIVE;
    const folder = process.env.MONGO_FOLDER;
    //console.log("1 Folder Name: " + folder)
        const s3 = new S3({
            region,
            access_key,
            secret_access_key
        });
    
        
        const param = {
            Bucket: bucketName,
            Key: `${folder}/${file.originalname}`,
            Body: file.buffer
       };
    
        return await s3.upload(param).promise() ;
    
}

exports.iS3Profilev1 = async (file) => {
  
    const region = process.env.AWS_REGION;
    const access_key = process.env.AWS_ACCESS_KEY_ID;
    const secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;
    const folder = process.env.MONGO_FOLDER;

    const s3 = new S3({
        region,
        access_key,
        secret_access_key
    });

    
    const param = {
        Bucket: bucketName,
        Key: `${folder}/${file.originalname}`,
        Body: file.buffer
   };

    return await s3.upload(param).promise() ;
}


exports.iS3Uploadv2 = async (files) => {
  
    const region = process.env.AWS_REGION;
    const access_key = process.env.AWS_ACCESS_KEY_ID;
    const secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;
    const folder = process.env.MONGO_FOLDER;
    //console.log("2 Folder Name: " + folder)
    const s3 = new S3({
        region,
        access_key,
        secret_access_key
    });
    
    const params = files.map(file => {
       return {
            Bucket: bucketName,
            Key: `${folder}/${uuid()}-${file.originalname}`,
            Body: file.buffer
       }
    });

    return await Promise.all(params.map(param => s3.upload(param).promise())) ;
}

exports.iS3DeleteIMG = async (keyString) => {
  
    const region = process.env.AWS_REGION;
    const access_key = process.env.AWS_ACCESS_KEY_ID;
    const secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;
    const folder = process.env.MONGO_FOLDER;

    console.log("3 Folder Name: " + folder)
    const s3 = new S3({
        region,
        access_key,
        secret_access_key
    });
    console.log(":::::::::::::::::::::::::::::::::");
    console.log("KEY: " + keyString);
    console.log(":::::::::::::::::::::::::::::::::");
    const param = {
        Bucket: bucketName,
        Key: `${folder}/${keyString}`,
   };
   //console.log(param);

   s3.deleteObject(param, function(err, data){
    if(err){
        console.log("Something went wrong deleting")
        console.log(err)
    }else {
        console.log("AWS Deleteing was successful")
        console.log(data);
    }
   })
}