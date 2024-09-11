
import { S3Client,PutObjectCommand,GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs  from 'fs';
import dotenv from "dotenv";
dotenv.config();

const bucketname= `${process.env.bucketname}`;
const location =`${process.env.location}`;
const policy= `${process.env.policy}`;
const Access_key= `${process.env.Access_key}`;
const Secret_AccessKey= `${process.env.Secret_AccessKey}`;


const s3=new S3Client({
    credentials:{
        accessKeyId:Access_key,
        secretAccessKey:Secret_AccessKey,
    },
    region:location
})
const folderPath = './images'; 

const uploadToS3 = async (fileName, filePath,folderid) => {
  console.log("uploadtoS3 function begins");
    const fileStream = fs.createReadStream(filePath);
  
    const uploadParams = {
      Bucket: bucketname,
      Key: `${folderid}/${fileName}`, // Path in the S3 bucket
      Body: fileStream,
      ContentType: 'image/jpg', // Set content type to image/jpeg
    };
  
    try {
      const command = new PutObjectCommand(uploadParams);
      const data = await s3.send(command);
      console.log(`Successfully uploaded ${fileName} to S3:`, data);
    } catch (err) {
      console.error(`Error uploading ${fileName} to S3:`, err);
    }
  };
  

async function mainCall(folderid){
  console.log("mainCall");
   
    fs.readdir('./images/', (err, files) => {
      if (err) {
        return console.error('Unable to read directory', err);
      }
      console.log("files",files)
      files.forEach((file) => {
        console.log("file",file);
        // Create the file path by concatenating the folder path and file name
        const filePath = `images/${file}`; // This works on most systems, regardless of OS
    
        // Upload each image to S3
        uploadToS3(file, filePath,folderid);
      });
    });
}





async function listObjectsInFolder(folderPrefix) {
  console.log("folder",folderPrefix);
  const command = new ListObjectsV2Command({
    Bucket: 'imagecompressingbucket',
    Prefix: folderPrefix, // Simulated folder path
    Delimiter: '/' // To list objects directly under the folder
  });
  console.log("command",command);
  try {
    const data = await s3.send(command);
    console.log("data",data);
    const objects = data.Contents || [];
   return ( await simpcall(objects));
  } catch (err) {
    console.error('Error listing objects in folder:', err);
  }
}
async function simpcall(objects){
  var list=[];
  // objects.forEach(async (object) => {
    
  // });
  for(var i=0;i<=objects.length-1;i++){
    var object=objects[i]
    console.log("object key ",object.Key);
    const val=(await generateSignedUrl('imagecompressingbucket', `${object.Key}`))
    list.push(val);
  }
  // console.log(list);
  return list;
}

async function generateSignedUrl(bucketName, objectKey) {
  console.log("generateSignedUrl");
  const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 }); // URL expires in 1 hour
    // console.log(signedUrl);
    return signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
  }
}









export {mainCall,listObjectsInFolder}