import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

  const avatarlocalpath = req.files?.avatar?.[0]?.path;
  const imagelocalpath = req.files?.coverImage?.[0]?.path;
  console.log("avatarlocalpath : ", avatarlocalpath);
  console.log("imagelocalpath: ", imagelocalpath);

  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar is required");
  }
  if (!imagelocalpath) {
    throw new ApiError(400, "Cover image is required");
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
  const {username, email, password} = req.body;
  
  console.log("Login attempt with:", { username, email });
  
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // Build the query based on what was provided
  const query = {};
  if (username) query.username = username;
  if (email) query.email = email;
  
  const user = await User.findOne(query);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const {accessToken, refreshToken} = await genrateaccesandRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, 
          accessToken, 
          refreshToken
        },
        "User logged in successfully"
      )
    )
});

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken} = await genrateaccesandRefreshToken(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

});


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




export { registerUser , loginUser, logoutUser, refreshAccessToken };
