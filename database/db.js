import mongoose from "mongoose";


export const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.DB);
        console.log("database connected successfully");
    }
    catch(err)
    {
        console.log("error connecting to database ",err);
    }
} 