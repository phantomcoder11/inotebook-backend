const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const JWT_SECRET = "hellofuckboy";
const fetchUser=require('../middleware/fetchUser')
// post request is used because for so many data using post request is a much better option and is secured than get request
//ROUTE 1: Create a user using POST "/api/auth/createUser". No login Required
router.post(
  "/createUser",
  [
    body("name", "Min length of name should be 3").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Min length of password should be 5").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // if there are errors return bad requests and the errors
    let success=true;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success=false;
      return res.status(400).json({success, errors: errors.array() });
    }
    //Logic to check the entered email is unique or not
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success=false;
        return res
          .status(400)
          .json({ success,error: "Sorry another user exists with the same email" });
      }
      const salt = await bcrypt.genSaltSync(10);
      const secPass = await bcrypt.hashSync(req.body.password, salt);
      //Creating a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success,authToken});
    } catch (error) {
      success=false;
      //If any unknown error occurs in the try block, catch block will catch it and show it here
      console.log(error.message);
      res.status(500).json({success,error:"Some error occured"});
    }
  }
);

//ROUTE 2: Authenticate a user using POST "/api/auth/login". No login Required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can't be blank").exists(),
  ],
  async (req, res) => {
    let success=true;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user =  await User.findOne({ email });
      if (!user) {
        success=false;
        return res
          .status(400)
          .json({ success,errors: "Please try to login with correct credentials" });
      }
      const passwordComapre = await bcrypt.compare(password, user.password);
      if (!passwordComapre) {
        success=false;
        return res
          .status(400)
          .json({success, errors: "Please try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success,authToken});
    } catch (error) {
      success=false;
      //If any unknown error occurs in the try block, catch block will catch it and show it here
      console.log(error.message);
      res.status(500).json({success,error:"Internal Server Error"});
    }
  }
);

//ROUTE 3:Get logged in user details POST "/api/auth/getuser". Login Required
router.post(
  "/getUser", fetchUser ,async (req, res) => {
    try {
     userId= req.user.id;
     const user=await User.findById(userId).select("-password");
     res.send(user)
    } catch (error) {
      //If any unknown error occurs in the try block, catch block will catch it and show it here
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
