import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import userModel from "./models/User.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URI; 


const users = [

  // Farmers
  {
    name: "Farmer 01",
    email: "farmer01@gmail.com",
    password: "123456",
    role: "farmer",
    village: "Akluj",
    city: "Solapur",
    district: "Solapur"
  },
  {
    name: "Farmer 02",
    email: "farmer02@gmail.com",
    password: "123456",
    role: "farmer",
    village: "Barshi",
    city: "Solapur",
    district: "Solapur"
  },
  {
    name: "Farmer 03",
    email: "farmer03@gmail.com",
    password: "123456",
    role: "farmer",
    village: "Karad",
    city: "Karad",
    district: "Satara"
  },
  {
    name: "Farmer 04",
    email: "farmer04@gmail.com",
    password: "123456",
    role: "farmer",
    village: "Islampur",
    city: "Sangli",
    district: "Sangli"
  },
  {
    name: "Farmer 05",
    email: "farmer05@gmail.com",
    password: "123456",
    role: "farmer",
    village: "Indapur",
    city: "Pune",
    district: "Pune"
  },

  // Doctors near Farmer 1 locality (Akluj, Solapur)
// Doctors near Farmer 1 locality (Akluj, Solapur)
{
  name: "Doctor 01",
  email: "doctor01@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Akluj",
  city: "Solapur",
  district: "Solapur",
  specialization: "Veterinary Medicine",
  contactNumber: "9876543201"
},
{
  name: "Doctor 02",
  email: "doctor02@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Akluj",
  city: "Solapur",
  district: "Solapur",
  specialization: "Animal Surgery",
  contactNumber: "9876543202"
},
{
  name: "Doctor 03",
  email: "doctor03@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Akluj",
  city: "Solapur",
  district: "Solapur",
  specialization: "Animal Skin Specialist",
  contactNumber: "9876543203"
},
{
  name: "Doctor 04",
  email: "doctor04@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Akluj",
  city: "Solapur",
  district: "Solapur",
  specialization: "Animal Infection Specialist",
  contactNumber: "9876543204"
},
{
  name: "Doctor 05",
  email: "doctor05@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Akluj",
  city: "Solapur",
  district: "Solapur",
  specialization: "Veterinary Consultant",
  contactNumber: "9876543205"
},

// Doctors near Farmer 2 locality
{
  name: "Doctor 06",
  email: "doctor06@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Barshi",
  city: "Solapur",
  district: "Solapur",
  specialization: "Animal Surgery",
  contactNumber: "9876543206"
},
{
  name: "Doctor 07",
  email: "doctor07@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Barshi",
  city: "Solapur",
  district: "Solapur",
  specialization: "Veterinary Medicine",
  contactNumber: "9876543207"
},
{
  name: "Doctor 08",
  email: "doctor08@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Barshi",
  city: "Solapur",
  district: "Solapur",
  specialization: "Animal Specialist",
  contactNumber: "9876543208"
},
{
  name: "Doctor 09",
  email: "doctor09@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Barshi",
  city: "Solapur",
  district: "Solapur",
  specialization: "Animal Infection Specialist",
  contactNumber: "9876543209"
},
{
  name: "Doctor 10",
  email: "doctor10@gmail.com",
  password: "123456",
  role: "doctor",
  village: "Barshi",
  city: "Solapur",
  district: "Solapur",
  specialization: "Veterinary Consultant",
  contactNumber: "9876543210"
}

];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected");

    await userModel.deleteMany({});

    for (let user of users) {
      const newUser = new userModel(user);
      await newUser.save(); // triggers password hashing
    }

    console.log("Users inserted successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();