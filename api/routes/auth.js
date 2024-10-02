const router = require("express").Router();
const User = require("../models/User");
const Supplier = require("../models/Supplier");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {

  const newUser = new User({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
    isAdmin: req.body.isAdmin,
    roles: req.body.roles,
    bio: req.body.bio,
    profilePic: "-",
    phonenumber: req.body.phonenumber,
    profession: req.body.profession,
    extras: req.body.extras,
    approve: req.body.approve,
  });

  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////////////////
//LOGIN
router.post("/login", async (req, res) => {
  try {

    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong password or email!");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);

    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    
    if(originalPassword !== req.body.password ){
      return  res.status(401).json("Wrong password or email!");
    }
      
    //the adminn field is invalid
    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );

    const { password, ...info } = user._doc;

    res.status(200).json({ ...info, accessToken });
  } catch (err) {
    return res.status(500).json(err);
  }
});
////////////////////////////////////////////////////////////////////
//FORGOT PASSWORD
router.put("/forgot", async (req, res) => {
  try {

    const user = await User.findOne({ email: req.body.email });

    var message= {};
    if(user){
      console.log("Try to loggin");
      message = {
        "status":"success",
        "code":200,
        "message":"Email was found."
      }
    }else {
      //console.log("Incorrent email")
      message = {
        "status":"failed",
        "code":404,
        "message":"No such email exists."
      }
    }
    
    res.status(200).json(message);
  }catch(err){
    return res.status(500).json(err);
  }
});
// ///////////UPDATE User Password
router.put("/passreset", async (req, res) => {
  //console.log("########################");

  try {
    const user = await User.findOne({ email: req.body.email });
    const postedUser = req.body;
   
    const Newpassword = CryptoJS.AES.encrypt( postedUser.password, process.env.SECRET_KEY).toString();
    const userId = user._id;
 
    const userContent = {
      "password": Newpassword, 
    }
 
    const updateUser = await User.findByIdAndUpdate(
       userId,
      {
        $set: userContent,
      },
      { new: true }
    );

    const passReset = {
      "status": "success",
      "message": "Your new password has been updated",
      "alert": "alert-success", 
      "pass": updateUser
    }
    //res.status(200).json(updateUser);
    res.status(200).json(passReset);
  } catch (err) {
    return res.status(500).json(err);
  }
});
////////////////////////  ////////  ////////
//GET list of suppliers that you are authorised to get according to user type
router.get("/supplies", async (req, res) => {

     try {
       const Suppliers = await Supplier.find().sort( { "title": -1 } );
       res.status(200).json(Suppliers.reverse());
     } catch (err) {
       return res.status(500).json(err);
     }
});
////////////////////////  ////////  ////////
router.put("/addusertosup", async (req, res) => {
  
  try {
  
    const supplierId =  req.body.supid;
    const supplieName =  req.body.supname;

    const userIdOb =  { "userIds" : req.body.id };
    const updatedSupplierid = await Supplier.findByIdAndUpdate(
      {_id:  supplierId},
      {
        $push: userIdOb,
      },
      { new: true }
    );

    const userItem =  { "extras" : {"supplierId" :supplierId, "supplierName": supplieName}};
    const upUser = await User.findByIdAndUpdate(
      {_id:  req.body.id},
      {
        $push: userItem,
      },
      { new: true }
    );
    
    res.status(200).json(updatedSupplierid);
    
  } catch (err) {
    return res.status(500).json(err);
  }
});
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
module.exports = router;