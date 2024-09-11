
import {Mongoose, Schema, model} from "mongoose";
import mongoose from "mongoose";4 

const mainSchema=new Schema({
    id:String,
    header:[],
    rowsData:[],
    outputData:[],
})
const mainmodel=mongoose.model('ImageProcessingDataModel',mainSchema);
export {mainmodel}