import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
//filesystem read write remove operation 

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async(localFilePath)=> {
    try{
        if(!localFilePath)return null //wrong file path
        //upload file on Clodinary 
        const responce = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file upload succesfully
        console.log(responce.url, "file uploaded on cloudinary ");
        return responce;

    }catch(error){
        fs.unlinkSync(localFilePath) //removed the locally saved files from the server
        return null;

    }

}

export{uploadOnCloudinary}




