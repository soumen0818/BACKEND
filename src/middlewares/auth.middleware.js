import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT =  asyncHandler(async(req, res, next) => {
try {
        const token = req.cookies?. accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unautharized request");
            
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401,  "invalid accessToken");
            
        }
    
        req.user = user; next()
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid accessToken");
    
}
})

