import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true,
        index : true

    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true,

    },
    fullName : {
        type : String,
        required : true,
        trim : true,
        index : true

    },
    avature : {
        type : String,
        required : true
    },
    coverImage :{
        type: String,
    },
    watchHistry :[
        {
            type : Schema.Types.ObjectId,
            ref : "video"
        }
    ],
    password :{
        type: String,
        required : [true , 'password is required']
    },
    refreshToken : {
        type: String,
    },
    
},{timestamps : true},
);

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.ispasswordCorrect = async function (password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
    jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET ,{
            expiresIn :  process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function (){
    jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET ,{
            expiresIn :  process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
