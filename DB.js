import mongoose from "mongoose";
const Url='mongodb+srv://Mkhan:Ashad123@cluster0.uydprj9.mongodb.net/'

const connectDB=async()=>{
    try{
     await mongoose.connect(Url);
        console.log("DB connected");
    }
    catch(e){
        console.log(e?.message);
    }
}
export {connectDB}