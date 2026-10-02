import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler((req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401, "unothorize request");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req._id = decodedToken?._id;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})