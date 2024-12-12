const express = require('express');
const router = express.Router();
const User = require('../model/User')
const { body, validationResult } = require('express-validator');

router.post('/createuser', [
    body('name', 'Name Should be minimum 3 character').isLength({min : 3}),
    body('email', 'It should be Email').isEmail(),
    body('password', 'Password must be atleast 5 character').isLength({min : 5}),
] ,async (req, res) => {
  const error = validationResult(req);
  if(!error.isEmpty()){
    return res.status(400).json({error: error.array()});
  }    
  try{
    const {name, email, password} = req.body;
    const newUser = new User ({name,email,password});
    
    await newUser.save();

    res.status(201).json({message : 'User Created Successfully' , user:newUser}) 
  }
  catch (err) {
    console.log(err.message);
    res.status(500).json({error : 'Server Error'})
  }
})

module.exports = router;