import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fname: {
      type: String,
      required: true,     
    },
    lname:{
      type:String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.UserData || mongoose.model("UserData", userSchema);
