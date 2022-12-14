const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { body, validationResult } = require("express-validator");
// post request is used because for so many data using post request is a much better option and is secured than get request
router.post(
  "/createUser",
  [
    body("name", "Min length of name should be 3").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Min length of password should be 5").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // if there are errors return bad requests and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Logic to check the entered email is unique or not
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry another user exists with the same email" });
      }
      const salt = await bcrypt.genSaltSync(10);
      const secPass= await bcrypt.hashSync(req.body.password, salt);
      //Creating a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      res.json({ sign: req.body.name });
    } catch (error) {
      //If any unknown error occurs in the try block, catch block will catch it and show it here
      console.log(error.message);
      res.status(500).send("Some error occured");
    }
  }
);
module.exports = router;
