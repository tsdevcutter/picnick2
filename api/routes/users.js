const router = require("express").Router();
const User = require("../models/User");
const UserStandard = require("../models/UserStandard");
const verify = require("../verifyToken");
const CryptoJS = require("crypto-js");
const { find } = require("../models/User");
/////////////////////////////


/////////////////////////////
//GET ALL USERS
router.get("/", verify, async (req, res) => {
   
    const Users = await User.find();
    try {
        res.status(200).json(Users.reverse());

    } catch (err) {
      return res.status(500).json(err);
    }
 
});
//////////////////////////////////////////////
router.get("/search", async (req, res) => {

  try {
    
    const sfield = req.query.searchfield
    //console.log("search: "+ sfield);
    //Search and exclude the admins

    const Users = await User.find({
      "$or":[
        {name: {$regex: sfield}},
        {surname: {$regex: sfield}},
        {email: {$regex: sfield}},        
      ],
      "$and":[
        {roles: {$regex: "standard"}},
      ]
    })

    //console.log(Users);
    res.status(200).json(Users);
  } catch (err) {
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////
router.get("/searchsup", async (req, res) => {

  try {
    
    const sfield = req.query.searchfield
    //console.log("search: "+ sfield);
    //Search and exclude the admins

    const Users = await User.find({
      "$or":[
        {name: {$regex: sfield}},
        {surname: {$regex: sfield}},
        {email: {$regex: sfield}},        
      ],
      "$and":[
        {roles: {$regex: "supplier"}},
      ]
    })

    //console.log(Users);
    res.status(200).json(Users);
  } catch (err) {
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////
// ///////////UPDATE User
router.put("/updateuser", verify, async (req, res) => {

  try {
    //console.log(req.body);
    const userId = req.body.userId;
    //console.log(userId);
    const userContent = {
      "name": req.body.name, 
      "surname": req.body.surname, 
      "email": req.body.email, 
      "isAdmin": req.body.isAdmin, 
      "roles": req.body.roles, 
      "bio": req.body.bio, 
      "profession": req.body.profession, 
      "phonenumber": req.body.phonenumber, 
      "approve": req.body.approve, 
      "extras": req.body.extras
    }
 
    const updateUser = await User.findByIdAndUpdate(
       userId,
      {
        $set: userContent,
      },
      { new: true }
    );
   
    res.status(200).json(updateUser);
   // res.status(200).json({"status":"success"});
  } catch (err) {
    return res.status(500).json(err);
  }

});

///////////////////////
// ///////////UPDATE User Password
router.put("/passreset", verify, async (req, res) => {
  //console.log("########################");

  try {
    const postedUser = req.body;
   
    const Newpassword = CryptoJS.AES.encrypt( postedUser.password, process.env.SECRET_KEY).toString();
    const userId = postedUser.id;
    //console.log(userId);
    const userContent = {
      "password": Newpassword, 
    }
    //console.log(userContent);
 
    const updateUser = await User.findByIdAndUpdate(
       userId,
      {
        $set: userContent,
      },
      { new: true }
    );
    //console.log(updateUser);
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

///////////////////////
//DELETE 
router.delete("/terminate/:id", verify, async (req, res) => {
 
  try {
    const userId = req.params.id;
   
    console.log("User ID " + userId);
    await User.findByIdAndDelete(userId);

    res.status(201).json("The User has been deleted...");
    
  } catch (err) {
    return res.status(500).json(err);
  }

});
//////////////////////////////////////////////
router.get("/supusers", verify, async (req, res) => {
    try{
     
      const supID = req.query.supplierid;
      const userList = await User.find({
        extras:{ $elemMatch :{supplierId :supID}}
      });
 
      res.status(201).json(userList);
    } catch(err){
      return res.status(500).json(err);
    }
});
/////////////////////////////////////
router.post("/verifystandard", verify, async (req, res) => {

  try{

       const emailCheck = req.body.email;

       const emCode = {
        "email"  : emailCheck, 
        "code"  : req.body.codereset, 
       }
       const UserCode = await UserStandard.findOne({ email : emailCheck});
 
       if(UserCode){
         //console.log("We found something.")
         await UserStandard.findByIdAndDelete(UserCode._id);
       }

       const newStcode   = new UserStandard(emCode);
       const savedStcode = await newStcode.save();
   
      res.status(200).json(savedStcode);
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////////////
router.get("/vericheckstandard", verify, async (req, res) => {

  try{
  
       const UserCode = await UserStandard.findOne({ email : req.query.myemail});
       const userContent = {
          "approve": true, 
        }

      let updated = {};
    
       if(UserCode.code == req.query.code){
           const updatedUser = await User.findByIdAndUpdate(
                 req.query.userid,
              {
                $set: userContent,
              },
              { new: true }
            );

            updated = {
                "alert" : "success", updatedUser                
            }

       }else {
        updated = {
            "message" : "Invalid code. Please try again.",
            "alert" : "failed"             
          }
       }

 
      res.status(200).json(updated);
  } catch (err) {
    console.log("POWER NOT DETECTED")
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////////////////////////////////
router.put("/updateuser_supplier", verify, async (req, res) => {
  try{
    
    const userSelUpdateID   = req.body.selupdateid;
    const userSupplierID    = req.body.supplierId;
    const userSelUpdateName = req.body.selupdatename;

    const supExtra = {
      "supplierId"   :  userSupplierID,
      "supplierName" :  userSelUpdateName
    }
    
    let updatedUser = await User.updateOne(
        { _id: userSelUpdateID},
        {
          $set: {"extras": supExtra},
        },
        { new: true }
      );
      
    res.status(200).json(updatedUser);
  } catch (err) {
    console.log("BOBYLON");
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////////////////////////////////
/*
Taking a user and assigning a catalogue. I already take a catalogue and assign a user
router.put("/update/v1/catalogues", verify, async (req, res) => {
  try{
    
    const userID            = req.body.userid;
    const catalogueid       = req.body.catalogueid;

    const user            = await User.findById(userID);
    var updatedUser       = null;
    var deleter           = "";

    if (user) {
      let update;
        if (user.catalogues.includes(catalogueid)) {
            //If catalogueid exists, remove it
            update   = { $pull: { catalogues: catalogueid } };
            deleter  = "Removed";//delete remove
        } else {
            //If catalogueid doesn't exist, add it
            update   = { $addToSet: { catalogues: catalogueid } };
            deleter  = "Added";//added
        }
    
        updatedUser = await User.updateOne({ _id: userID }, update, { new: true });    
    }else {
      return res.status(401).json("User not found!");
    }

      const content = {
        "update" : updatedUser,
        "type" : deleter
      }
    res.status(200).json(content);
  } catch (err) {
    return res.status(500).json(err);
  }
});
*
/////
///TEST BULK SMS
router.put("/bulksms/send", verify, async (req, res) => {
  try{
    

     res.status(200).json(content);
  } catch (err) {
    return res.status(500).json(err);
  }
});
*/
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;