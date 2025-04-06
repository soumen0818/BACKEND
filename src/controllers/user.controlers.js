import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
