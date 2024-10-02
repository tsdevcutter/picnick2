const router = require("express").Router();
const Supplier = require("../models/Supplier");
const Picture = require("../models/Picture");
const User = require("../models/User");
const Token = require("../models/Token");
const verify = require("../verifyToken");
const mongoose = require("mongoose");

/////////////////////////////
//CREATE
router.post("/", verify, async (req, res) => {

    const newSupllier = new Supplier(req.body);
  
    try {
      const savedSupplier = await newSupllier.save();
      res.status(201).json(savedSupplier);
  
    } catch (err) {
      res.status(500).json(err);
    }
  
});
////////////////////////
router.post("/addbulk", verify, async (req, res) => {

  try {
    const obSupplier = req.body;
      //console.log(obSupplier);    
     const options = { ordered: true };

     const result = await Supplier.insertMany(obSupplier, options);
     res.setHeader('Content-Type', 'application/json');
      //console.log(result)
    res.status(201).json({"status":"Success"});

  } catch (err) {
    return res.status(500).json(err);
  }
});
////////////////////////  ////////  ////////
//GET list of suppliers that you are authorised to get according to user type
router.get("/list", verify, async (req, res) => {
     // console.log(req.user);
 
   if(req.user.isAdmin){
       //console.log("Admin User");
       
        try {
          const Suppliers = await Supplier.find().sort( { "title": -1 } );
          res.status(200).json(Suppliers.reverse());
        } catch (err) {
          return res.status(500).json(err);
        }
    }else {
        //console.log("Standard User");
        //console.log(req.user);
        //skumane
        try {
            const usr =  req.user.id;
           //search for catalogues that you have been assigned to
            const Suppliers = await Supplier.find(
                      {
                      "$or":[
                          {userIds: {$regex:usr}}
                      ]
                      }
                  );
            res.status(200).json(Suppliers.reverse());
          } catch (err) {
            return res.status(500).json(err);
          }
  
    }
  });
/////////////////////
//ADD users to supplier
//router.post("/addcheck", async (req, res) => {
router.post("/addcheck", verify, async (req, res) => {
    const supplierId =  req.query.srcfcat;
    //console.log(supplierId);
    //console.log(req.body);
    const userIdOb =  { "userIds" :JSON.parse(req.body.userIds) };
    //console.log("user")
    //console.log(userIdOb);
    try {
      
      const updatedSupplierid = await Supplier.findByIdAndUpdate(
        supplierId,
        {
          $set: userIdOb,
        },
        { new: true }
      );
      //console.log("surrender");

      res.status(200).json(updatedSupplierid);
      
    } catch (err) {
      return res.status(500).json(err);
    }
});
 ///////////////////////

//fetch users of a supplier
router.get("/getsuppliers", verify, async (req, res) => {
  /*
  console.log("Supplier List innn")
  console.log("@RRRR@ Get Users for " + req.query.userssearch)
  */
  try {
  
    const supplierList =  JSON.parse(req.query.userssearch);

    //console.log("##############=======>");
 
    const Users = await User.find().where('_id').in(supplierList); 
    //console.log("##############=======>");
    //console.log(Users);
    res.status(200).json({"status":"success", Users});

  }catch(errUser){
    conosole.log("Fetch Users of Suppliers Error");
    console.log(errUser);
    return res.status(500).json(errUser);
  }

});

///////////////////////
router.delete("/removeuser", verify, async (req, res) => {

    try {
      const supplierId =  req.query.srcdcat;

      const updatedSupplier = await Supplier.findByIdAndUpdate(
        supplierId,
        {
          $set: req.body,
        },
        { new: true }
      );
 
      res.status(201).json("The Supplier User has been deleted...");
    } catch (err) {
    
      //console.log("Yrrrrrrrrrr");
      return res.status(500).json(err);
    }
});
///////////////////////////////////
//GET SPECIFIC SUPPLIER PICTURES
router.get("/summon/:id", verify, async (req, res) => {
  try {
   
    const supplierId = req.params.id;
    //console.log(supplierId);
    const Pictures = await Picture.find({ supplierid:supplierId});

    res.json({status: "success", Pictures});
  }catch(err){
    return res.status(500).json(err);
  }

});
///////////////////////////////////
//GET SPECIFIC SUPPLIER PICTURE BY NAME
router.put("/summonname", verify, async (req, res) => {
  try {
  
    const supplierName = req.body.name;
  
    const Sup = await Supplier.find({ "title":supplierName});
    //console.log(Sup);

    res.json({status: "success", Sup});
  }catch(err){
    return res.status(500).json(err);
  }

});
///////////////////////////////////
//GET SPECIFIC SUPPLIER PICTURE BY NAME NO AUTH
router.post("/summonnamefree", async (req, res) => {
  try {
 
    const supplierName = req.body.name;
  
    const Sup = await Supplier.find({ "title":supplierName});
    //console.log(Sup);

    res.json({status: "success", Sup});

    //res.json({status: "success"});
  }catch(err){
    return res.status(500).json(err);
  }

});
//////////////////
// get detail catalog
router.get("/details/:id", verify, async (req, res) => {
  
  try {

    const userList = await Supplier.aggregate([
      { $match: {
          _id: mongoose.Types.ObjectId(req.params.id) } 
      },        
      {
        $lookup: {
          from: "users",
          localField: "userIds",
          foreignField: "_id",
          as: "members",
        },
      },
     
    ]);
   
    //console.log(userList);
    res.status(200).json(userList);

  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }

});
//////////////////
// get detail Supplier
router.get("/single/:id", verify, async (req, res) => {

   try{
 
    const currentSupplier = await Supplier.findById(req.params.id);
     //console.log("[][][][][][][][][]");
     //console.log(currentSupplier);

    res.status(200).json({"status": "success", currentSupplier});
   }catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }

});
///////////////////////
//SUPPLIER SEARCH FILTER
router.get("/supfilter", verify, async (req, res) => {
  //console.log("gooo here")
    try{
        const searchItem = req.query.searchfield;
        let supData = await Supplier.find(
          {
            "$or":[
               {title: {$regex: searchItem}},
               {information: {$regex: searchItem}}
            ]
          }
        )
        //console.log(searchItem);
        //console.log(supData)
        res.status(200).json({status: "successful results", supData});
        //res.status(200).json({status: "This thing was said", currentSupplier});
    }catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

///////////////////////
//GET ALL TOTAL Supplier
///////////////////////
router.get("/totalsuppliers", async (req, res) => {

  try{
    const sups = await Supplier.find();
     const totalItems = sups.length;
     const amount = {
      "status": "success",
      "type":"Suppliers",
      "total": totalItems
     }

     res.status(200).json(amount);
  } catch (err) {

    return res.status(500).json(err);
  }
});
///////////////////////
//DELETE 
router.delete("/terminate/:id", verify, async (req, res) => {

  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.status(201).json("The Supplier has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }

});
///////////////////////////
//Add Approve Code
router.put("/aprovecode", verify, async (req, res) => {

   try{
    const bodyApprove = req.body;
    console.log(bodyApprove);
    const supApprove = await Supplier.findByIdAndUpdate( 
      bodyApprove.supplierid,
      {
        $set: {"approvalCode" : bodyApprove.code},
      },
      { new: true }
    );

    
    res.status(201).json({"status":"success", "supplier": supApprove});
   }catch(err){
    return res.status(500).json(err);
   }
});
////////////////////////////
//Verify approve code
router.put("/verifyapprove", verify, async (req, res) => {
    try{
      const supplierId = req.body.supplierid;
      const supplierName = req.body.suppliernm;
      const userId = req.body.userid;
      const verifycode = req.body.code;
      const supObject = await Supplier.findById(supplierId);
      

      if(!supObject){
        res.status(200).json({"status": "401", "message": "Code is Incorrect. Supplier unable to validate"});
      }

      if(supObject.approvalCode === verifycode){
      
        const userIdOb = {"approve" : true}
        
        const updateUser = await User.findByIdAndUpdate(userId,
          {
            $set: userIdOb,
          },
          { new: true }
        );
      
        res.status(200).json({"status":"200", updateUser});
      }else {
       
        res.status(200).json({"status": "401", "message": "Code is Incorrect"});
      }

    }catch(err){
      return res.status(500).json(err);
     }
});
///////////////////////////
router.put("/eliminate", verify, async (req, res) => {
  try {
    var obDele = req.body;

    
    const supRem = await Supplier.updateOne(
      {"_id" : obDele.supplier},
      {$pull:{ "userIds" : {              
          "$in": [req.body.user]   
      } }}
    );
    
    res.status(201).json({"status":"success", "message": "User was removed"});
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////////

//////////////////////////////////////////////////////////////////////////
module.exports = router;