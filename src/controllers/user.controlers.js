import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";

const registerUser = asyncHandler(async (req, res) => { 
  // get user details from fronend
  // validation - not empty
  // check if user already exists : email, username
  // check for image , check for avature
  // upload them to cloudinary, avature
  // creat user object and save to db
  // remove password and refresh token field from response
  // check for user creation success
  // send response to frontend

  const { fullname, username, email, password } = req.body;
  console.log("email : ", email);

  console.log(req.body);
  console.log(req.files);

  if(email === ""){
    throw new ApiError(400, "Email is required");
  }

  if (!fullname || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existeduser) {
    throw new ApiError(400, "User already exists");
  }

  const avatarlocalpath = req.files?.avatar[0].path;
  const imagelocalpath = req.files?.coverImage[0].path;
  console.log("avatarlocalpath : ", avatarlocalpath);

  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarlocalpath);
  const coverImage = await uploadOnCloudinary(imagelocalpath);

  if (!avatar || !coverImage) {
    throw new ApiError(400, "Image & avatar upload failed");
  }

  const createdUser = await User.create({
    fullName: fullname, 
    avature: avatar.url, 
    coverImage: coverImage.url,
    username: username.toLowerCase(),
    email,
    password,
  });

  const createUser = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );
  if (!createUser) {
    throw new ApiError(400, "User creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createUser, "User created successfully", createUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
// get data from frontend
// check if user exists : email, password, username
//find the User in db
// check if password is correct 
// refresh token generation
// check for refresh token in db
// if not found, create new refresh token
// save refresh token in db
// send response to cokie
// send response to frontend


const {username, email, password} = req.body;

if (!username || !email) {
  throw new ApiError(400, "username or email is required");
  
}

const user = await User.findOne ({
     $or : [{username} , {email}]
})

if (!user) {
  throw new ApiError(400, "User not exists");
  
}

const ispasswordvalid = await user.ispasswordvalid(password);

if (!ispasswordvalid) {
  throw new ApiError(401, "User password invalid");
  
}

const {accessToken , refreshToken} = await genrateaccesandRefreshToken(user._id);
const loggedInuser = await user.findById(user._id).select("-password -refreshToken")

const options = {
  httpOnly : true,
  secure : true
}

return res 
.status(200)
.Cookie("accessToken", accessToken, options)
.refreshToken("refreshToken", refreshToken, options)
.json(
  200,
  {
    user : loggedInuser, accessToken, refreshToken,
  },
 "User logged in successfully"

)
});

const logoutUser = asyncHandler(async (req, res) => {
   User.findByIdAndUpdate(
    req.user._id,{
      $set : {
        refreshToken : undefined
      }
    }, 
    {
      new : true
    }
   )

   const options = {
    httpOnly : true,
    secure : true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "user logout successfully"))
})

const genrateaccesandRefreshToken = async(userId) =>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    user. refreshToken = refreshToken
    user.save({validateBeforeSave : false})

    return{accessToken, refreshToken};

  } catch (error) {
    throw new ApiError(500, "something went wrong");
    
  }
}




export { registerUser , loginUser, logoutUser };
