import express from "express";
import cors from "cors"
import genUniId from "generate-unique-id";
import bodyParser from "body-parser";
import { connectDB } from "./DB.js";
import {mainmodel} from "./MainSchema.js";
import axios from "axios"
import dotenv from "dotenv";
dotenv.config();
import fs  from 'fs';
import sharp from "sharp";
import { listObjectsInFolder, mainCall } from "./AwsBucket.js";
const app=express();
app.use(cors());

app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extented:true}));

connectDB();
app.get("/",(req,res)=>{
    res.json({mess:'server is on'})
})
app.post('/sendfile',async(req,res)=>{
    const {header,rowsData}=(req.body);
    fs.mkdir('./images', { recursive: true }, (err) => {
        if (err) {
          return console.error('Error creating folder:', err);
        }
        console.log('Folder created successfully.');
      });
    try{
        const id=await genUniId({
            length:10
        })
        async function processRowsData(rowsData, id) {
            // Iterate over each row of data
            console.log("processRowDatabegin");
            for (const e of rowsData) {
              const outputFilePath = './images';
              const arr = e[2].split(","); // Assuming e[2] contains comma-separated image URLs
          
              // Iterate over each URL in the array
              for (let i = 0; i < arr.length; i++) {
                console.log(arr[i], i);
          
                // Extract the image name from the URL
                const name = arr[i].split("/").pop();
                console.log(name);
          
                // Compress and save the image, waiting for each compression to complete
                await compressImageFromURL(arr[i], `${outputFilePath}/_${id}_${i}_${name.split(".")[0]}.jpg`, 10);
              }
            }
          }
        await processRowsData(rowsData,id);
        console.log("addedDatatoDB");
        const resp =new mainmodel({header,rowsData,id});
        resp.save();
        console.log("DbSubmissionfinised");

       await mainCall(id);
       fs.rm('./images', { recursive: true, force: true }, (err) => {
        if (err) {
          return console.error('Error removing folder:', err);
        }
        console.log('Folder and all contents deleted successfully.');
      });
            // const resp= await mainmodel.find();
            // console.log(resp);
        res.json({mess:"recieved",id});
    }
    catch(e){
        res.json({err:e?.message});
    }
})

app.post('/getbyid',async(req,res)=>{
    const {data}= req.body;
    console.log(data)
   var main=((await listObjectsInFolder(`${data}/`)));
   const resp= await mainmodel.find({id:data});
  //  console.log(resp[0]?.rowsData);
  if(!resp[0]?.outputData?.length){
   var arr=resp[0]?.rowsData.map(e=>{
    return e[2].split(',')
   })
  //  console.log(arr);
  var main2=[]
arr.forEach(e=>{
  var l=[];
  e.forEach(j=>{
    l.push(main.splice(main.length-1,main.length)[0])
  })
  main2.push(l);
})
console.log(main2);

var resp3=await mainmodel.updateOne({id:data},{$set:{
  outputData:main2
}});
var resp4=await mainmodel.find({id:data});
console.log(resp3);         
res.json({msg:"we get the id",data:resp4[0]})
  }
    else{
      res.json({msg:"we get the id",data:resp[0]})
    }
})

async function compressImageFromURL(imageUrl, outputFilePath, quality=10 ) {
    try {
      // Step 1: Download the image from the URL using axios
      const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'arraybuffer', // Get the image data as a buffer
      });
      
      const imageBuffer = Buffer.from(response.data, 'binary'); // Create a buffer from the downloaded data
  
      // Step 2: Use sharp to compress the image
      await sharp(imageBuffer)
        .jpeg({ quality: quality })  // Compress image to JPEG with the specified quality (80 by default)
        .toFile(outputFilePath);     // Save the compressed image to a file
  
      console.log('Image compressed and saved to:', outputFilePath);
    } catch (error) {
      console.error('Error during image compression:', error);
    }
  }
  



app.listen(3971);