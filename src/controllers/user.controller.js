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
const generateAccessAndRefreshToken = async(userId) => {
    try{
        
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken =  user.generateAccessToken();
        const refreshToken =  user.generateRefreshToken(); 
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500,"somthing went wrong while generation access and refresh token")
    }
} 


const longUser = asyncHandler(async (req, res) => {
    // take inpur from user
    const {email , password} = req.body
    if(!email || !password){
        throw new ApiError(400, "email and password is required")
    }
    // check email is exist or not 
    const user = await User.findOne({ email: email });
    if(!user){
        throw new ApiError(401 , "email or password is incorect")
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "email or password is incorrect")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loginUser = await User.findById(user._id).select("-password -refreshToken");
    const option = {
        httpOnly : true,
        secure: true
    }
    return res.status(200).cookie("accessToken",accessToken,option)
    .cookie("refreshToken", refreshToken,option)
    .json(new ApiResponse(
        200,
        {
            user: loginUser, accessToken, refreshToken
        },
        "user login successfully"
    ))
    // check password is corect or not
    // return access token and refresh token 

})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req._id);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (!user.refreshToken) {
        throw new ApiError(401, "User is already logged out");
    }

    user.refreshToken = undefined;
    await user.save();
    const option = {
        httpOnly : true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    );
})

const refreshAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefreshTOken = req.cookie?.refreshToken || req.body.refreshToken
    if(!incomingRefreshTOken){
        throw new ApiError(401, "unothorise request")
    }
    
})

export {registerUser, longUser, logoutUser}