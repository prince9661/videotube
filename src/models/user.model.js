import mongoose , {Schema}from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema({
    userName : {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email : {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email : {
        type: String,
        require: true,
        trim: true
    },
    avatar: {
        type: String,  //cloudinary url
        require: true,

    },
    coverImage: {
        type: String,  //cloudinary url
    },
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    password: {
        type: String,
        require: [true, "password is required"],
    },
    refreshToken: {
        type: String
    },


},{timestamps: true})

userSchema.pre("save", async function () {
    if(!this.isModified("password"))return ;
    this.password = await bcrypt.hash(this.password , 10);
})
userSchema.methods.isPasswordCorrect = async function name(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            
        }
        
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)