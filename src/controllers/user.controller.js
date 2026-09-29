import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })
    //tale input from frontend
    // validate input
        // check all rewuired thing are there or not
        // check unique
        // check for image
        //check for avtar
    // add data in model
    // add model in db
    // return apiresponse

    const {userName , fullName, email, password} = req.body;
    if([userName , fullName, email, password].some((field) =>
    field?.trim() ==="")

    ){
        throw new ApiError(400,"all fields are required")
    }
    const existedUser = await User.findOne({
        $or: [{ userName },{ email }]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or user Name already exist")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(400, "avatar is required")
 
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        userName: userName.toLowerCase(),
        email,
        password
    })
    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"somthing went wrong while regestring the user");
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Register sucessfully")
    )
})

export {registerUser}