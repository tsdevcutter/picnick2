const router = require("express").Router();
const { iS3Uploadv1, iS3PureUpv1, iS3Uploadv2 , iS3Profilev1, iS3DeleteIMG} = require("../iS3Service");
const Picture = require("../models/Picture");
const Divergents = require("../models/Divergents");
const User = require("../models/User");
const Tag = require("../models/Tag");
const S3Bucket = require("../models/S3Bucket");
const Presentation = require("../models/Presentation");
const verify = require("../verifyToken");
const multer = require("multer");
const Ackermans = require("../models/Ackhermans");
const fs = require('fs');
const Athenaeum = require("../models/Athenaeum");
const Catalogue = require("../models/Catalogue");
var FileReader = require('filereader')
  , fileReader = new FileReader();


//////
///upload function
const storage = multer.memoryStorage();
const upload  = multer({storage});
/////////////////////////////
//CREATE
router.post("/", verify, async (req, res) => {

    const newPicture = new Picture(req.body);
    try {
      const savedPicture = await newPicture.save();
      res.status(201).json(savedPicture);
    } catch (err) {
      return res.status(500).json(err);
    }
 
});
/////////////////////////////
//GET SINGLE PHOTO
router.get("/photo/:id", verify, async (req, res) => {

  try {

    const Pictures = await Picture.findById(req.params.id);
    res.status(200).json(Pictures);
    
  } catch (err) {
    return res.status(500).json(err);
  }

});

/////////////////////////////
//DELETE 
router.delete("/terminate/:id", verify, async (req, res) => {
 
    try {
      await Picture.findByIdAndDelete(req.params.id);
      res.status(201).json("The Picture has been deleted...");
    } catch (err) {
      return res.status(500).json(err);
    }
 
});

///////////////////////
//GET ALL Pictures with auth and no pagination
router.get("/assembly", verify, async (req, res) => {
    try{

      const repObject = await Picture.find();
      res.status(200).json(repObject);
    }catch(asem){
      return res.status(500).json(asem);
    }
});
//GET all auth
router.get("/arquire", async (req, res) => {
  try{
    const limitNumber = req.query.limitator || 50;
 
    const repObject = await Picture.find().limit(limitNumber);
    res.status(200).json(repObject);
  }catch(asem){
    return res.status(500).json(asem);
  }
});
/////////////////////////////////////////////////////////////////////
//GET ALL Pictures no Auth
router.get("/free", async (req, res) => {
  console.log("Free Collect");
  try {
    const page = parseInt(req.query.page) || 1;
    const limiter = parseInt(req.query.limit) || 30;

    const startIndex = (page - 1) * limiter;
    const endIndex = page * limiter;

    const PicsCount = await Picture.countDocuments();
    console.log(PicsCount);
    const totalItems = PicsCount;
    const Pictures = await Picture.find().sort({ createdAt: -1 }).skip(startIndex).limit(limiter);
 
    let previousOption = {
      "navi":"off"
    }
    let nextOption = {
      "navi":"off"
    }
    

  if(endIndex < totalItems){   
      const add = page + 1;
      nextOption = {     
        "navi":"on",
        'page': add,
        'limit':limiter    
    }  
  }

  if(startIndex > 0){
        previousOption = {
            "navi":"on",
            "page": page - 1,
            'limit':limiter
      }
    }

    const repObject = {
      'total': totalItems,
      'next':nextOption,
      'prev': previousOption,
      'pictures':Pictures.reverse()
     }

   
    res.status(200).json(repObject);
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////////////////////
//GET ALL Pictures with pagination
router.get("/compile/v2/list", verify, async (req, res) => {
  console.log("Bastare Collect");
  try {
    const page = parseInt(req.query.page) || 1;
    const limiter = parseInt(req.query.limit) || 30;

    const startIndex = (page - 1) * limiter;
    const endIndex = page * limiter;

    const PicsCount = await Picture.countDocuments();
    console.log(PicsCount);
    const totalItems = PicsCount;
    const Pictures = await Picture.find().sort({ createdAt: -1 }).skip(startIndex).limit(limiter);
 
    let previousOption = {
      "navi":"off"
    }
    let nextOption = {
      "navi":"off"
    }
    

  if(endIndex < totalItems){   
      const add = page + 1;
      nextOption = {     
        "navi":"on",
        'page': add,
        'limit':limiter    
    }  
  }

  if(startIndex > 0){
        previousOption = {
            "navi":"on",
            "page": page - 1,
            'limit':limiter
      }
    }

    const repObject = {
      'total': totalItems,
      'next':nextOption,
      'prev': previousOption,
      'pictures':Pictures.reverse()
     }

   
    res.status(200).json(repObject);
  } catch (err) {
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////////////////////
router.get("/emancipate", async (req, res) => {
  //Used in backend to collect specific pictures
  try
  {
    const arrList = JSON.parse(req.body.arrstring);

    const Pics = await Picture.find({
                        barcode  :{
                          $in : arrList
                        }  
                      });

    res.status(200).json(Pics);
  } catch (err) {
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////
// ///////////UPDATE Picture suppliers
router.put("/updatepicturesup", verify, async (req, res) => {

  try {

    const photoId = req.body.photoid;

    const userContent = {
      "supplierid": req.body.supplierid, 
    }
   
    const updatePhoto = await Picture.findByIdAndUpdate(
      photoId,
      {
        $set: userContent,
      },
      { new: true }
    );
    //const getSupply = await Supplier.findById(req.body.supplierid);
    res.status(200).json({"status":"Success",updatePhoto});
    // res.status(200).json({"status":"success photo"});
  } catch (err) {
    return res.status(500).json(err);
  }
});
////////////////////////////////////////////////////////////////////
/////////////UPDATE Picture details
router.put("/updatepic", verify, async (req, res) => {
  //update according to object sent

  try {

    const photoId = req.body.id;
    var picUpdate = req.body;

    delete picUpdate.id;
       
    const updatePhoto = await Picture.findByIdAndUpdate(
      photoId,
      {
        $set: picUpdate,
      },
      { new: true }
    );
  
    res.status(200).json(updatePhoto);

  }catch(er){
  
    return res.status(500).json(err);
  }
});
// ///////////UPDATE by barcode
router.put("/updateprice", verify, async (req, res) => {

  try {

    const picbarcode = req.body.barcode;;
  
    const userContent = {
      "price": req.body.price
    }
   
    const updatePrice = await Picture.findOneAndUpdate(
      {"barcode": picbarcode},
      {
        $set: userContent,
      },
      { new: true }
    );
  
    res.status(200).json(updatePrice);
    // res.status(200).json({"status":"success photo"});
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////
/////////////UPDATE SpecificPicture details
router.put("/updatepicture", verify, async (req, res) => {

  try {

    const photoId = req.body.photoid;
    const userContent = {
      "title": req.body.title, 
      "onlineDesc": req.body.onlineDesc, 
      "description": req.body.description, 
      "size": req.body.size, 
      "unit": req.body.unit, 
      "presentation": req.body.presentation, 
      "price": req.body.price, 
      "draftmode": req.body.draftmode, 
    }
 
    const updatePhoto = await Picture.findByIdAndUpdate(
      photoId,
      {
        $set: userContent,
      },
      { new: true }
    );
  
    res.status(200).json(updatePhoto);
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////////////
//GET ALL TOTAL Pictures
router.get("/totalproducts", async (req, res) => {

    try{
      const Pics = await Picture.find();
       const totalItems = Pics.length;
       const amount = {
        "status": "success",
        "type":"Pictures",
        "total": totalItems
       }

       res.status(200).json(amount);
    } catch (err) {

      return res.status(500).json(err);
    }
});

///////////////////////
//GET ALL TOTAL Pictures
router.get("/totals3buckss", async (req, res) => {

  try{
    const S3Bucks = await S3Bucket.find();
     const totalItems = S3Bucks.length;
     const amount = {
      "status": "success",
      "type":"S3Bucks",
      "total": totalItems
     }

     res.status(200).json(amount);
  } catch (err) {

    return res.status(500).json(err);
  }
});
//////////////////////////////
//Search top 30
router.get("/search", async (req, res) => {
 
  try {
    const sfield = req.query.searchfield;
  
//Case insensestive
    const Pictures = await Picture.find(
      {
        "$or": [
          {barcode: {$regex: sfield}},
          {title: {$regex: sfield, $options: "i"}},
          {onlineDesc: {$regex: sfield, $options: "i"}},
        ]
    });

    res.status(200).json(Pictures);
  } catch (err) {
    return res.status(500).json(err);
  }
  
});
////////////////////////////////
//GET Un Assigned images
router.get("/pureimages", async (req, res) => {
  try {
    const Images = await S3Bucket.find();
    res.status(200).json(Images.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////
//GET Assign Un Assigned images
router.post("/puretopictures", async (req, res) => {

  try {
    
    const obProductImage = req.body;
 
    const options = { ordered: true };
    const result = await Picture.insertMany(obProductImage, options);

    res.setHeader('Content-Type', 'application/json');
    res.json({status: "success"});

  } catch (err) {
 
    return res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////
//GET Delete Un Assigned images
router.post("/puretopicturesdelete", async (req, res) => {

  try {
    const obDeleteImagesmage = req.body;
    const query = { title: { $regex: obDeleteImagesmage } };
   // console.log(obProductImage);    
   const result = await S3Bucket.deleteMany(query);
  

    res.setHeader('Content-Type', 'application/json');
    res.json({status: "successfully deleted."});

  } catch (err) {
    console.log("Errors DELETING");
    return res.status(500).json(err);
  }
});

//////////////////////////
//GET
router.get("/", verify, async (req, res) => {
  try {
    const Pictures = await Picture.find();
    res.status(200).json(Pictures.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Delete the side image
router.post("/removeside", verify, async (req, res) => {

    try {
      
      
      const picUpdate = await Picture.findByIdAndUpdate(
        req.body.photoid,
        {
            $set: req.body.objecturl.obImage
        },
          {new:true}
        );

      const del = await iS3DeleteIMG(req.body.deletfile);
    
      res.status(200).json({"status": "success", picUpdate})
    } catch (err) {

      return res.status(500).json(err);
    }
});
///////////////

////////////////
router.get("/presentations", async (req, res) => {
  
  try{ 

    const Presents = await Presentation.find().sort( { "title": -1 } );
    res.status(200).json(Presents.reverse());

  }catch(erbos){
    return res.status(500).json(err);
  }
});
////////////////
////////////////
router.put("/present", async (req, res) => {
  
  try{ 

    const newPresent = new Presentation(req.body);
    const savedPresent = await newPresent.save();

    res.json({status: "Presentation added successfully.", savedPresent});

  }catch(erbos){
    return res.status(500).json(err);
  }
});
////////////////
////////////////
router.delete("/presdelete/:id", async (req, res) => {
  
  try{ 

      await Presentation.findByIdAndDelete(req.params.id);
    
      res.status(201).json("The Presentation has been deleted...");
  }catch(erbos){
    return res.status(500).json(err);
  }
});
////////////////////
router.put("/setcaegory", verify, async (req, res) => {
  //#
    try{

      const photoID = req.body.photoid;
  
      const photoCat = await Picture.updateOne(
        {"_id": photoID},
        {$set:{ "category" : req.body.category }}
      )
      res.status(201).json({photoCat});
    }catch(err){
      return res.status(500).json(err);
    }
});
////////////////////
router.post("/salespics", async (req, res) => {
  
  try{

    const obProductImage = req.body;
    const options = { ordered: true };
    const results = await Picture.insertMany(obProductImage, options);

    res.setHeader('Content-Type', 'application/json');
    res.json({status: "Pictures have been transferred successfully."});
  }catch(erbos){
    return res.status(500).json(err);
  }
});
//CREATE
router.post("/salespic", async (req, res) => {

  const newPicture = new Picture(req.body);
  try {

    const savedPicture = await newPicture.save();
 
    res.status(201).json(savedPicture);
  } catch (err) {
    return res.status(500).json(err);
  }

});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Multer Single profile
router.put("/profile", verify, upload.array("profilepic"), async (req, res) => {

  try{
 
    const file = req.files[0];

    const result = await iS3Profilev1(file);

    const updatedUser = await User.findByIdAndUpdate(req.body.identity,
      {
        $set: {"profilePic":result.Location}
      },
      {new:true}
      );

   //AWS
   //res.json({status: "success", result, savedData});
   res.json({status: "success", updatedUser});
  }catch(err){
    return res.status(500).json(err);
  }
  
});
/////////////////////////////////////////////////////////////////
//Multer Single upload
router.post("/upload", upload.array("imgurl"), async(req, res) => {

  try{
     const Pic = await Picture.findOne({ barcode:req.body.barcode});
 
     if(Pic){
      return   res.json({status: "401", message: "Duplicate data error."});
     }
     
    const file       = req.files[0];
    const result     = await iS3Uploadv1(file);

    const conWrk     = req.body.tagupdate;
    const arrAddTags = conWrk.split(',');

    /////
    if(arrAddTags.length > 0) {        
        let obTagImage = [];
        /////
        for (let i = 0; i < arrAddTags.length; i++) { 
          if(arrAddTags[i].length > 0){
            const ob = {
              "tagName" : arrAddTags[i].toLowerCase(),
              "tagDescription" : '',
              "img_url" : ''
            }
            obTagImage.push(ob);
          }          
        }
        const options = { ordered: true };
        const tagResult = await Tag.insertMany(obTagImage, options);
        //console.log("flesh ###");
    }
    ////
    let tagArr = [];
    if(req.body.tagslist.length > 0){
      tagArr = req.body.tagslist.split(',')
    }

      const variablePic =  {
        "barcode": req.body.barcode,
        "title": req.body.title,
        "key":result.Key,
        "imgurl":result.Location,
        "imgLeft":"",
        "imgRight":"",
        "imgUnpack":"",
        "onlineDesc": req.body.onlineDesc,
        "description": req.body.description,
        "supplierid": req.body.supplierid,
        "brand": req.body.brand, 
        "presentation": req.body.presentation, 
        "size": req.body.size,
        "unit": req.body.unit,  
        "cost_price": req.body.cost_price,  
        "price": req.body.price,  
        "taxonomy" : tagArr,
        "extra_fields": []
      }
      const newPicture = new Picture(variablePic);
      const savedData = await newPicture.save();
      
    //AWS
    //res.json({status: "success", result, savedData});
    res.json({status: "success", savedData});

  }catch(err){
    return res.status(500).json(err);
  }
  
});
////////////////////////////////////////////////////////////////
//Multer Single Side Image  , verify, async (req, res) => {
router.post("/mainurlupdate", upload.array("mainpicurlupdate"), async(req, res) => {

  try{

    const file = req.files[0];
    const result = await iS3Uploadv1(file);
    const variablePic =  {
      "imgurl":result.Location
    }

    //result.Location
    console.log("variablePic");
    console.log(variablePic);
    
    const updatedImage = await Picture.findByIdAndUpdate(req.body.picid,
        {
          $set: variablePic
        },
        {new:true}
      );
     //delete url
     //const del = await iS3DeleteIMG(req.body.deleturl);
   // console.log("updatedImage");
   // console.log(updatedImage);
   // res.json({status: "success", updatedImage});
   //res.json({status: "success"});
   res.status(200).json(updatedImage);
  }catch(err){

    return res.status(500).json(err);
  }
  
});

/////////////////////////////////////////////////////////////////
//Multer Single Side Image
router.post("/sideimage", upload.array("sideimageurl"), async(req, res) => {
 
  try{

    const file = req.files[0];
    const basicPick   = await Picture.findById(req.body.picid);
    const currentType = req.body.imgtype;
    //console.log(currentType);
    
    //console.log(basicPick);
    //console.log(basicPick[currentType])
    const deleteFieldLabel = basicPick[currentType];


    if(deleteFieldLabel.length > 0){
      
      const repUrl = deleteFieldLabel.replace("https://cjmpicknick2.s3.amazonaws.com/" + process.env.MONGO_FOLDER + "/", "");
      ///console.log(repUrl);
      const del = await iS3DeleteIMG(repUrl);
      //console.log("Deleting is done.");
      //console.log(del);
    }


    const result = await iS3Uploadv1(file);

    let variablePic = {}

    switch(req.body.imgtype) {
      case "imgLeft":
        variablePic =  {
          "imgLeft":result.Location
        }
        break;
      case "imgRight":
        variablePic =  {
          "imgRight":result.Location
        }
        break;
      default:
        variablePic =  {
          "imgUnpack":result.Location
        }
    }

    const updatedImage = await Picture.findByIdAndUpdate(req.body.picid,
        {
          $set: variablePic
        },
        {new:true}
      );
      
      res.status(200).json(updatedImage);
      //res.json({status: "shocker"})
  }catch(err){
    console.log("*()*")
    console.log(err)
    return res.status(500).json(err);
  }
  
});
////////////////////////////////////////////////////////////////////////////////
//Multer Single S3 data upload
router.post("/pureupload", verify, upload.array("singlebulk"), async(req, res) => {

  try{

    const file = req.files[0];
    const result = await iS3Uploadv1(file);
    
    const variablePic =  {
      "ETag": result.ETag,
      "Location": result.Location,
      "key":result.key,
      "Key":result.Key,
      "Bucket": result.Bucket,
      "barcode": req.body.barcode,
    }
    const newTempBucket = new S3Bucket(variablePic);
    const resData = await newTempBucket.save();

   //AWS
   //res.json({status: "success", savedData});
   res.json({status: "success", resData});

  }catch(err){
    return res.status(500).json(err);
  }  
});
////////////////////////////////////////////////
//Multer Multiple upload
router.post("/uploads", verify, upload.array("imageuploads"), async(req, res) => {
  //Upload many images at one time and save them as Anthaem to be transfered with an excellsheet
  try{

    const results  = await iS3Uploadv2(req.files);
    var inserts    = 0;
    var found      = 0;

    for (const result of results) {
     
      const barcode = result.key.split('-').pop().replace(/\.[^/.]+$/, '');

        //check if picture already exists 
        const pictCheck = await Picture.findOne({"barcode": barcode})
       if(pictCheck){
        found++;
       }else {
            // Create a new Athenaeum document
            const newAthenaeum = new Athenaeum({
              barcode: barcode,
              imgurl: result.Location,
              key: result.key,
              imgLeft: req.body.imgLeft,
              imgRight: req.body.imgRight,
              imgUnpack: req.body.imgUnpack,
            });

            // Save the new Athenaeum document to the database
            await newAthenaeum.save();
            inserts++;    
       }
  
    }

      const dataFeedback = {
        "counts": inserts, 
        "found": found, 
        results
      }
      console.log(dataFeedback);

    res.status(200).json(dataFeedback);
  }catch(err){
    console.log("|||||||||");
    console.log(err);
    return res.status(500).json(err);
  }  
});
////////////////////////////////////////////////////////////////////////////////////////////////
//Multer Single upload for divergent
router.post("/transfer/divergent", upload.array("divimurl"), async(req, res) => {
//Upload a list of images that have picture objects that were added during a check of products from the ackermans 
//list. This will add the picture even in the catalogue.
  try{
    var catItem = null;
     const Pic = await Picture.findOne({ barcode:req.body.barcode});
 
     if(Pic){   
      return res.status(202).json({"message": "Duplicate picture, already exists."});
     }
     

     //Check Divergent List
     const Diverg = await Divergents.findOne({ barcode:req.body.barcode});
     if(!Diverg){
        return res.status(202).json({"message": "Not found in the divergent list."});
     }
     

     if(req.body.catalogueid.length > 5){

        catItem = await Catalogue.findByIdAndUpdate(
          { "_id": req.body.catalogueid },
          { $addToSet: { 
              "barcodeIds": req.body.barcode
              } 
          }
        );
    
     }

     
    const file       = req.files[0];
    const result     = await iS3Uploadv1(file);

      const variablePic =  {
        "barcode": req.body.barcode,
        "title": Diverg.title,
        "key":result.Key,
        "imgurl":result.Location,
        "imgLeft":"",
        "imgRight":"",
        "imgUnpack":"",
        "onlineDesc": Diverg.title,
        "description": Diverg.title,
        "supplierid": "64da3c7a5f20ed516ba1c04f",
        "brand": "", 
        "presentation": "", 
        "size": "",
        "unit": Diverg.stockcode,  
        "cost_price": Diverg.price,  
        "price": Diverg.price,  
        "taxonomy" : [],
        "extra_fields": []
      }
      const newPicture = new Picture(variablePic);
      const savedData = await newPicture.save();
      
      //Delete current divergent
      const delData = await Divergents.findByIdAndDelete(Diverg._id);

      const dtFeedback = {
        "delete" : delData,
        "picture" : savedData,
        "catalogue": catItem
      }

   res.status(200).json(dtFeedback);
  // res.status(200).json(Diverg);
  }catch(err){
    console.log("EISH DIVERGENT")
    console.log(err);
    return res.status(500).json(err);
  }
  
});
///////////////////////////////////////////////////////////
router.put("/keyupdate", async (req, res) => {

  try{

    const photoID = req.query.barid;
    
    const keyWP = {
      "key_wp" : makeid(16)
    }
    const pictures = await Picture.findByIdAndUpdate(
      photoID,
      {
        $set: keyWP,
      },
      { new: true }
    );
    // console.log(results);
    res.json(pictures);
  }catch(err){
    console.log(err);
    return res.status(500).json(err);
  }
  
});
////////////////////////////////
//Image percentages
router.get("/imgratecounts", async (req, res) => {
  try{
    const picMain = await Picture.find();
    const mainCount = picMain.length;

    var leftImgCount    = 0;
    var rightImgCount   = 0;
    var unPackImgCount  = 0;

    for (let i = 0; i < mainCount; i++) {
      if(picMain[i].imgLeft === ""){
        leftImgCount++;
      }

      if(picMain[i].imgRight === ""){
        rightImgCount++;
      }

      if(picMain[i].imgUnpack === ""){
        unPackImgCount++;
      }
    }

    const amount = {
      "total": mainCount,
      "left": leftImgCount,
      "right": rightImgCount,
      "unpack": unPackImgCount,
    }
    res.status(200).json(amount);
  }catch(er){
    return res.status(500).json(err);
  }
});
////////////////////////////////
//Pictures with no suppliers
router.get("/nosuppliers", async (req, res) => { 

  try{
     
     const noSuppliers = await Picture.find({"supplierid": ""});
     const lengthNoneSups = noSuppliers.length;
     const amount = {
      "total": lengthNoneSups,
      "data": noSuppliers
    }
     res.status(200).json(amount);
  }catch(er){
      return res.status(500).json(err);
  }
});
////////////////////////////////
//AUTOCOMPLETE SEARCH
router.get("/autosearch", async (req, res) => { 
    try {
      
      const { searchString } = req.query;

      const agg = [
        {
          $search: {
            index: "defaultpicture",
            autocomplete: {
              query: searchString,
              path: "barcode"
            }
          }          
        }, {
            $limit: 10
        }, {
           $project : {
             _id             : 0,
             barcode         : 1,
             title           : 1,
             imgurl          : 1,
             supplierid      : 1,
             imgLeft         : 1,
             imgRight        : 1,
             imgUnpack       : 1,
             onlineDesc      : 1,
             size            : 1,
             unit            : 1,
             price           : 1,
             category        : 1,

           }
        }

      ];

      const picRep = await Picture.aggregate(agg);
      res.status(200).json(picRep);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
});

////////////////////////////////////////////////
//PICUTRES AGGREGATION AUTOCOMPLETE
router.get("/autocomplete/product", async (req, res) => {
  try{

    const { searchString } = req.query;
    const ackermfeed = await Picture.aggregate(
      [
        {
          '$search': {
            'index': 'defaultpicture', 
            'autocomplete': {
              'query': searchString, 
              'path': 'title'
            }
          }
        }, {
          '$limit': 50
        }
      ]
    );
   
    res.status(200).json(ackermfeed);
   
  }catch(er){
    return res.status(500).json(err);
  }
});
////////////////////////////////////////////////
//ACKERMANS AGGREGATION SEARCH AUTOCOMPLETE.
router.get("/autoackerm", async (req, res) => {
  try{

    const { searchString } = req.query;
    const ackermfeed = await Ackermans.aggregate(
      [
        {
          '$search': {
            'index': 'autocomplete_acker', 
            'autocomplete': {
              'query': searchString, 
              'path': 'title'
            }
          }
        }, {
          '$limit': 50
        }
      ]
    );
   
    res.status(200).json(ackermfeed);
   
  }catch(er){
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////////////////////////////////
// Remove All category class [Not on the front end] 
router.put("/removeall/cat/classifications", verify, async (req, res) => {
  try {

    const updateCat = await Picture.updateMany({},{
      categoryclass: []
    });

    res.status(200).json(updateCat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
////////////////
//Create the back up pictures post
router.post("/athenaem/creation", async(req, res) => {

  try{

    const newAthenaeum = new Athenaeum({
      barcode: req.body.barcode,
      imgurl: req.body.imgurl,
      key: req.body.key,
      imgLeft: req.body.imgLeft,
      imgRight: req.body.imgRight,
      imgUnpack: req.body.imgUnpack,
    });
  
    const picUpdate = await newAthenaeum.save();
    res.status(200).json(picUpdate);
  }catch(err){
    console.log(err);
    return res.status(500).json(err);
  }  
});
////////////////////////////////////////////////
//
router.post("/transfer/fromathenaeum/withexcel", verify, async(req, res) => {

  try{

     const fileData       = req.body.fileData;
     var anthFound        = 0;
     var notanthFound     = 0;
     var picExist         = 0;
     const pushPictures   = [];
   
     for (const result of fileData) {
          //look for it in the 
          const anthPicture = await Athenaeum.findOne({"barcode": result.barcode});

          if(anthPicture){
            console.log("PICTURE Thotsi IN THE ATHENAEUM");
            anthFound++;

            //Check picture existance
            const pokePicture = await Picture.findOne({"barcode": result.barcode});
            if(pokePicture){
              console.log("PICTURE Already Exists " + pokePicture.barcode);
              picExist++;
            }else {
                 //Transfer picture by creating it
                 const newPicture = new Picture({
                  "barcode": anthPicture.barcode,
                  "imgurl": anthPicture.imgurl,
                  "key": anthPicture.key,
                  "imgLeft": anthPicture.imgLeft,
                  "imgRight": anthPicture.imgRight,
                  "imgUnpack": anthPicture.imgUnpack,
                  "supplierid":"64da3c7a5f20ed516ba1c04f",
                  "title": result.title,
                  "onlineDesc": result.description
                });

                  const savedPicture = await newPicture.save();
                  pushPictures.push(savedPicture);
            }             

            //delete the anthaeum copy
            await Athenaeum.findByIdAndDelete(anthPicture._id);
          }else {
            console.log("PICTURE NOT FOUND IN THE ATHENAEUM :||||||||||||||||}" );
            notanthFound++;
          }
     }

     const backUpData = {
        "found" : anthFound,
        "not_found" : notanthFound,
        "exist": picExist,
        "passed_pictures" : pushPictures
     }

     
    res.status(200).json(backUpData);

  }catch(err){
    console.log(err);
    return res.status(500).json(err);
  }  
});
////////////////////////////////////////////////
//Collect Divergents
router.get("/divergent/list", async (req, res) => {

  try{

      const listDivergents = await Divergents.find();
    res.status(200).json(listDivergents);
  }catch(err){
    console.log(err);
    return res.status(500).json(err);
  }  
});
////////////////////////////////////////////////
//Ackermans total pictures
router.get("/totalackermans", async (req, res) => {
  try{

    const totoalCount = await Ackermans.find().count();

    const totFigure = {
      "total" : totoalCount
    }
    res.status(200).json(totFigure);   
  }catch(er){
    return res.status(500).json(err);
  }
});
////////////////////////////////////////////////
//Get the total amount of athenaeums
router.get("/count/athenaeum/total", verify, async(req, res) => {

  try{

    const count = await Athenaeum.countDocuments();
    const total = {
      "label" : "athenaeum",
      "total" : count
    }
    res.status(200).json(total);

  }catch(err){
    console.log(err);
    return res.status(500).json(err);
  }  
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Update the schedule products 
router.put("/set/schedule/product", verify, async (req, res) => {

  try {
    
    const picUpdate = await Picture.findOneAndUpdate({
        "barcode" : req.body.barcode
      },      
      {
          $set: {
            scheduleProductsUrl : req.body.stringUrl
          }
      },
        {new:true}
      );

  
    res.status(200).json(picUpdate);
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////
//set up schedules
router.put("/add/col/schedule/", verify, async (req, res) => {
  try {
       //console.log(req.body);
       //const picCont = await Picture.find({"barcode" : req.body.barcode});
       console.log("->->->->->->->->->");

       
        const picUpdate = await Picture.findOneAndUpdate({
            "barcode" : req.body.barcode
          },      
          {
              $set: {
                schedule : req.body.schedule,
                discontinue : req.body.discontinue
              }
          },
            {new:true}
          );
       
          console.log(picUpdate);
          console.log("&&&&&&&&&&&&&&");
          
    res.status(200).json(picUpdate);
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////
//set up schedules divergent
router.put("/v1/diverge/col/schedule/", verify, async (req, res) => {
  try {

       //const picCont = await Picture.find({"barcode" : req.body.barcode});
       
        const picUpdate = await Divergents.findOneAndUpdate({
            "barcode" : req.body.barcode
          },      
          {
              $set: {
                schedule : req.body.schedule
              }
          },
            {new:true}
          );
       
          
    res.status(200).json(picUpdate);
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////
//Collect Schedule items
router.put("/collect/schedule/count", verify, async (req, res) => {
  try {       

            const result = await Picture.aggregate([
              {
                  $match: {
                      schedule: { $in: ["0", "1", "2", "3", "4", "5", "6"] }
                  }
              },
              {
                  $group: {
                      _id: "$schedule",
                      count: { $sum: 1 }
                  }
              },
              {
                  $project: {
                      schedule: {
                          $concat: ["S", "$_id"]
                      },
                      count: 1,
                      _id: 0
                  }
              }
          ]);

         const scheduleCounts = {
            S0: 0,
            S1: 0,
            S2: 0,
            S3: 0,
            S4: 0,
            S5: 0,
            S6: 0
         };
    
        result.forEach(item => {
            scheduleCounts[item.schedule] = item.count;
        });
          
    res.status(200).json(scheduleCounts);
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////
//Collect Schedule items missing
router.put("/collect/schedule/missing", verify, async (req, res) => {
  try {       

            const result = await Picture.aggregate([
              {
                  $match: {
                      $or: [
                          { schedule: { $exists: false } },
                          { schedule: "" }
                      ]
                  }
              },
              {
                  $count: "count"
              }
          ]);

         const scheduleCounts = {
              count: result.length > 0 ? result[0].count : 0
          };
          
    res.status(200).json(scheduleCounts);
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////
//V2 add Catalogue Id to pictures
router.put("/add/catalogue/v2/", verify, async (req, res) => {
  try {       
      const catelogueId = req.body.catalogueid;
      const barcodesArr = req.body.listing;
           
   // Update all documents where the barcode is in the barcodes array
    const result = await Picture.updateMany(
      { barcode: { $in: barcodesArr } }, // Match documents with barcodes in the array
      { $addToSet: { catalogues: catelogueId } } // Add the catalogue ID to the catalogues array if not already present
    );

    res.status(200).json({"message" : "Products have been added.", modifiedCount: result.nModified });
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////////////////////////
router.put("/remove/catalogue/v2/", verify, async (req, res) => {
  try {
    const catalogueId = req.body.catalogueid;
    const barcodesArr = req.body.listing;

       // Update all documents where the barcode is in the barcodes array
       const result = await Picture.updateMany(
        { barcode: { $in: barcodesArr } }, // Match documents with barcodes in the array
        { $pull: { catalogues: catalogueId } } // Remove the catalogue ID from the catalogues array
      );
  
      res.status(200).json({"message" : "Catalogue IDs removed successfully", modifiedCount: result.nModified });
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////////////////////////
//List of pictures with a specific catalogue ID
router.put("/accumulate/catalogue/v2/pics", verify, async (req, res) => {
  try {
    const catelogueId  = req.body.catalogueid;
    const currentPage  = req.body.page;
    const currentLimit = req.body.limit;


    if(!catelogueId){
      console.log(catelogueId + " Catalogue is null");
      const phase = {
        'total': 0,
        'next':"off",
        'prev': "off",
        'pictures': []
       }
      return res.status(200).json(phase);
    }
    const page = parseInt(currentPage) || 1;
    const limiter = parseInt(currentLimit) || 30;

    const startIndex = (page - 1) * limiter;
    const endIndex = page * limiter;

    const PicsCount = await Picture.countDocuments();
    //console.log(PicsCount);
    const totalItems = PicsCount;
    console.log("Catalogue ID");
    console.log(catelogueId);
    //const Pictures = await Picture.find({"catalogues" : catelogueId}).sort({ createdAt: -1 }).skip(startIndex).limit(limiter);
    const pictureList = await Picture.find({"catalogues" : catelogueId});

    console.log("Enough is enough");
    //console.log(pictureList.length);

    let previousOption = {
      "navi":"off"
    }
    let nextOption = {
      "navi":"off"
    }
    
  if(endIndex < totalItems){   
      const add = page + 1;
      nextOption = {     
        "navi":"on",
        'page': add,
        'limit':limiter    
    }  
  }

  if(startIndex > 0){
        previousOption = {
            "navi":"on",
            "page": page - 1,
            'limit':limiter
      }
    }

    const repObject = {
      'total': totalItems,
      'next':nextOption,
      'prev': previousOption,
      'pictures':pictureList.reverse()
     }

   // const results = await Picture.find({"catalogues" : catelogueId});
   //console.log(repObject);

    res.status(200).json(repObject);
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////////////////////////
//Set Assign medicine false
router.put("/assign/medicine/v2/", async (req, res) => {
  try {
      // Update all pictures where 'schedule' is empty or null
      await Picture.updateMany({}, 
        { $set: { medicine: false } 
      });

    res.status(200).json({"message" : "Update was successful."});
  } catch (err) {
    
    return res.status(500).json(err);
  }
});
/////////////////////////////////////////////////////////////////////////
//Set medical v2 Schedule 4
router.put("/set/medical/v2/", async (req, res) => {
  try {

    /*
      // Update all pictures where 'schedule' is empty or null
      await Picture.updateMany(
        { $or: [{ schedule: { $exists: false } }, { schedule: null }, { schedule: "" }] },
        { $set: { medicine: false } }
      );
    */

    /*
    // Update all pictures where 'schedule' has a value
    await Picture.updateMany(
      { schedule: { $ne: null, $ne: "" } },
      { $set: { medicine: true } }
    );
    */

     // Update all pictures where 'schedule' has a value
     await Picture.updateMany(
        { schedule: "4"},
        { $set: { medicine: true } }
      );

    res.status(200).json({"message" : "Update was successful."});
  } catch (err) {
    
    return res.status(500).json(err);
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////##########---->
/////////////////##########---->
/////////////////##########---->
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;