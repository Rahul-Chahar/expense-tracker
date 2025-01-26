// // // services/awsService.js
// // const AWS = require('aws-sdk');

// // // Configure AWS S3
// // const s3 = new AWS.S3({
// //    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// //    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// //    region: process.env.AWS_REGION
// // });

// // exports.uploadToS3 = async (data, fileName) => {
// //    try {
// //        const params = {
// //            Bucket: process.env.AWS_BUCKET_NAME,
// //            Key: `reports/${fileName}`,
// //            Body: data,
// //            ContentType: 'text/csv',
// //            ContentDisposition: 'attachment',
// //            ACL: 'public-read',
// //            Metadata: {
// //                'Content-Type': 'text/csv'
// //            }
// //        };

// //        const result = await s3.upload(params).promise();
// //        return result.Location;
// //    } catch (error) {
// //        console.error('S3 upload error:', error);
// //        throw new Error('Failed to upload file to S3');
// //    }
// // };

// // exports.deleteFromS3 = async (fileKey) => {
// //    try {
// //        await s3.deleteObject({
// //            Bucket: process.env.AWS_BUCKET_NAME,
// //            Key: `reports/${fileKey}`
// //        }).promise();
// //        return true;
// //    } catch (error) {
// //        console.error('S3 delete error:', error);
// //        throw new Error('Failed to delete file from S3');
// //    }
// // };

// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// const s3Client = new S3Client({ 
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     }
// });

// exports.uploadToS3 = async (data, fileName) => {
//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `reports/${fileName}`,
//         Body: data,
//         ContentType: 'text/csv'
//     };

//     try {
//         const command = new PutObjectCommand(params);
//         await s3Client.send(command);
//         return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
//     } catch (error) {
//         console.error('S3 upload error:', error);
//         throw new Error('Failed to upload file to S3');
//     }
// };