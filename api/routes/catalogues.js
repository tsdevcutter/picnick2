const router = require("express").Router();
const Catalogue = require("../models/Catalogue");
const Ackhermans = require("../models/Ackhermans");
const Pipeline = require("../models/Pipeline");
const Picture = require("../models/Picture");
const User = require("../models/User");
const Token = require("../models/Token");
const verify = require("../verifyToken");
const axios = require('axios');

const mongoose = require("mongoose");
var cron = require('node-cron');

///////////////////////////////////////===>
//CRON JOB
const EMINUTE01 = "* * * * *";
const EMINUTE02 = "*/2 * * * *"
const EMINUTE05 = "*/5 * * * *";
const EMINUTE10 = "*/10 * * * *";
const EMINUTE1H = "0 * * * *";
const EMINUT1H30 = "30 * * * *";
const EMDAILY3AM = "0 03 * * *";

const EMINCON1 = "0 0 * * *"; //midnight
const EMINCON2 = "0 1 * * *"; //1am
const EMINCON3 = "0 2 * * *"; //2am

///////////////////////////////////////
cron.schedule(EMINCON1, async () => {
  const d = new Date();
  let time = d.getTime();
  let hms = msToHMS(time);
  
    //console.log('running LOOP at 3am');
    console.log('ACKERMENS COLLECTION HOUR ON THE 30 minutes MARK');
    console.log(hms);
    console.log(EMINCON1);

    try{
    
      //TEMPORARILY TAKE DOWN CODE
      let code = process.env.ACKERMANES_CODE;
     
      const getLoop = await axios.get("https://picnick.co.za/picnick.co.za/cjcobolstock/reactcron.php?pickyacker=" + code + "&client=fsfgdrtoi35");
      /*
        console.log("###########");
        console.log(getLoop.data[0]);
        console.log("###########");
        console.log(getLoop.data[0].content);
        */
        if(getLoop.data[0].status === '404'){
          emailFunctionTracking("No data to read");
        }else {
          emailFunctionTracking("Total Products added: " + getLoop.data[0].content);
        }
       

    }catch(erAcker){
      console.log("ERROR: SCHEDULE Ackermans FULL COLLECTION Err");
      console.log(erAcker);
    } 
});

///////////////////////////////////////
cron.schedule(EMINCON3, async () => {
  const d = new Date();
  let time = d.getTime();
  let hms = msToHMS(time);
  console.log(hms);

  try{

    //SECOND LOOP TO CHECK WHICH ARE THE ACKERMANS PRODUCTS THAT SHOULD APPEAR OR NOT
        //FETCH PRODUCTS
        const repObjectPics = await Picture.find();
        console.log(repObjectPics.length);
        //const totalPics = repObjectPics.length;
        //do for 200 products
        const totalPics = 50;
        const LETSTRADETOKEN = process.env.LTTOKEN;
        const URLLETSTRADE = process.env.LETSTRADE1;

        for (let i = 0; i < totalPics; i++) {
          //Check the picture if its listed in ackermans list
          console.log("(((****)))");
          console.log(repObjectPics[i].title);
           //....
           const ackerItem = await Ackhermans.findOne({"barcode": repObjectPics[i].barcode});
           //console.log("....");
           //console.log(ackerItem);
           if(ackerItem !== null){
                 //if found just check if its true
                 //it should be showings
                console.log("FOUND " );
           }else {
            //if not found then make it not available in letstrade
            //console.log("if not found then make it not available in letstrade");
            //console.log(repObjectPics[i].title);
            //console.log(repObjectPics[i].barcode);
            //LETSTRADE START
            const resPicTradeBarcode = await axios.get(URLLETSTRADE+'product/products?page=1&barcode=' + repObjectPics[i].barcode, {
              headers: {               
                      'Authorization': 'Bearer '+ LETSTRADETOKEN,
                  }
              });

              console.log("TURN TO NOT AVAILABLE");
                console.log(resPicTradeBarcode.data.content.product_list[0]._id);
                const pro_id = resPicTradeBarcode.data.content.product_list[0]._id;

                var tradeUpdate = {
                  "id": pro_id,
                  "status": "NOT AVAILABLE"
                }
                var dataTrade = JSON.stringify(tradeUpdate);
                /////              
                var configUpdate = {
                    method: 'put',
                    url: URLLETSTRADE + 'product/update_product',
                    headers: { 
                        'Authorization': 'Bearer '+ LETSTRADETOKEN, 
                        'Content-Type': 'application/json'
                    },
                    data : dataTrade
                };
                let execProd = await axios(configUpdate);
                //console.log(execProd.data);
                console.log(msToHMS(time));
                console.log("KINKIIIIII");
           }
           console.log(i + " TWLFTWLFTWLFTWLFTWLFTWLFTWLFTWLFTWLFTWLFTWLFTWLF");
           //....
        }
        emailFunctionTracking("SCHEDULE FOR Ensuring the Available products from ackermans");
  }catch(ers){
    console.log("ERROR: SCHEDULE AKA Ackermans AVAILABILITY SET UP Err");
  }
});
/////////////////////////////


///////////////////////////////////////
//millisecondstoHMS
function msToHMS( duration ) {

  var milliseconds = parseInt((duration % 1000) / 100),
     seconds = parseInt((duration / 1000) % 60),
     minutes = parseInt((duration / (1000 * 60)) % 60),
     hours = parseInt((duration / (1000 * 60 * 60)) % 24) +2;

   hours = (hours < 10) ? "0" + hours : hours;
   minutes = (minutes < 10) ? "0" + minutes : minutes;
   seconds = (seconds < 10) ? "0" + seconds : seconds;

   return hours + ":" + minutes + ":" + seconds ;
}
///////////////////////////////////////

///////////////////////////////////////
async function ackerMansSchedule() {
  try{

    const pipeData = await Pipeline.find();
    console.log(pipeData);
    console.log(pipeData[0].catalogueid);
    console.log("BBBBBBBB <#######");
    if(pipeData){  
      //console.log("1");
      const ackerList = await Ackhermans.find();

      console.log(ackerList.length);
      let picList = [];
      
      for (let i = 0; i < ackerList.length; i++) {
      
        const barcoding = { barcode: ackerList[i].barcode };
        const pic = await Picture.findOne(barcoding);

        if(pic){
          picList.push(pic.barcode);          
        }
      }
    
      let barCos = {barcodeIds: picList}
      const updatedCatalogue = await Catalogue.findByIdAndUpdate(
        pipeData[0].catalogueid,
        {
          $set: barCos,
        },
        { new: true }
      );

    }
  }catch(erSchedule){
    console.log(erSchedule);
    console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
  }
}
///////////
 async function emailFunctionTracking(content){
  const getemailFeedback = await axios.get("https://api.picnick.co.za/emailing/email.php?email_schedule=picnickCutterX&content=" + content);
  console.log(getemailFeedback);
  //emailForTracking();
 }

/////////////////////////////
//CREATE
router.post("/", verify, async (req, res) => {

  const newCatalogue = new Catalogue(req.body);

  try {
    const savedCatalogue = await newCatalogue.save();
    res.status(201).json(savedCatalogue);

  } catch (err) {
    return res.status(500).json(err);
  }

});
/////////////////////////////
//UPDATE CATALOGUE
router.put("/:id", verify, async (req, res) => {
  /*
  console.log("vovovovo");
  console.log(req.params.id);
  console.log(req.body);
  */
  try {
    const updatedCatalogue = await Catalogue.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCatalogue);
  } catch (err) {
    return res.status(500).json(err);
  }

});
///////////////////////
//ADD PIPELINE
///////////////////////
router.post('/pipes', verify, async (req, res) => {
   try{
  //  console.log(req.body)
    const pipWork = {
      "title": req.body.title,
      "catalogue": req.body.catalogue,
      "catalogueid" : req.body.catalogueid
    }
    
    const newPipe = new Pipeline(pipWork);

     const savePipe = await newPipe.save();
     res.status(201).json(savePipe);
   }catch(err){
    console.log("Pipeline post Error");
    return res.status(500).json(err);
   }
});
//////////////////////////
//COLLECT ALL PIPELINES
//////////////////////////
router.get("/pipelines", verify, async (req, res) => {
  //console.log("should only be admins who can make this call");
  ///should only be admins who can make this call
    try{
    
       const pipes = await Pipeline.find();
       res.status(200).json(pipes);
    }catch(ers){
      console.log(ers);
      return res.status(500).json(err);
    }
});

///////////////////////////////////////////////////////////////////////
//too large so it times out
/*
router.get("/pipearcker", verify, async (req, res) => {
    ///should only be admins who can make this call
      try{
       console.log("!!!!!!!!!!!!!!!!!!")
       console.log("Collect full Ackermans")
         const ackerData = await Ackhermans.find();
         console.log(ackerData.length);
         //console.log(ackerData);
         console.log("The problem is sending it back")
         res.status(200).json(ackerData);
      }catch(ers){
        console.log(ers);
        return res.status(500).json(err);
      }
});
*/
////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////
//UPDATE PIPELINE ITEM WITH THE CATALOGUE IT SHOULD LINK TO
//////////////////////////
router.post('/pipeupdate', verify, async (req, res) => {

  try{
   const pipeReq ={
      "catalogue" :req.body.cattitle,
      "catalogueid" :req.body.catid,
    };

   const pipeID = req.body.pipeid;
   
   const updatedPipe = await Pipeline.findByIdAndUpdate(
      pipeID,
      {
        $set: pipeReq,
      },
      { new: true }
    );

    res.status(201).json({"status":"success", "message" : "Pipeline updated successfully.", updatedPipe});
  }catch(err){
   console.log("Pipeline post Error");
   return res.status(500).json(err);
  }
});
//////////////////////////
//GET ALL PICTURES BELONGING TO A PIPELINE
///////////////////////
router.post("/pipepics", verify, async (req, res) => {
    ///should only be admins who can make this call
      try{
       
        const fullList = req.body;       
        let picList = [];
      
      for (let i = 0; i < fullList.length; i++) {
      
        const barcoding = { barcode: fullList[i].barcode };
        const pic = await Picture.findOne(barcoding);

          if(pic){
            picList.push(pic);          
          }
      }

        // console.log(picList);
         res.status(200).json(picList);
       
       //  res.status(200).json({"status":"success"});
      }catch(ers){
        console.log(ers);
        console.log("@@@@@@@@@@@@@@@@@@@@@@@");
        return res.status(500).json(err);
      }
  });
///////////////////////
router.get("/ackerbacode/:id", async (req, res) => {

  try {

    const barcode = req.params.id;
    console.log(barcode);
    const ackerItem = await Ackhermans.findOne({"barcode": barcode});

    res.status(200).json({"status":"success", "ackermens_single" : ackerItem});

  } catch (err) {
    //res.status(500).json(err);
    return res.status(500).json(err);
  }
});

///////////////////////
//GET ALL CATALOGUES
router.get("/list", verify, async (req, res) => {
  //console.log("##########");
  //console.log("listing CATALOGUE");
  //console.log(req.api_key);
  //console.log(req.user);

  if (req.api_key) {

    try {
      const clientCatalogue = await Catalogue.findById(req.api_key.catalogueId);
      // update token count
      const updatedToken = await Token.findByIdAndUpdate(req.api_key._id, {
        $inc: { count: 1 },
      });

      res.status(200).json(clientCatalogue);
    } catch (err) {   
      return res.status(500).json(err);
    }
  } else if(req.user.isAdmin === true){
     //console.log("Administrator User");
     //console.log(req.user);
      try {
        const Catalogues = await Catalogue.find();
        res.status(200).json(Catalogues.reverse());
      } catch (err) {
        //res.status(500).json(err);
        return res.status(500).json(err);
      }

  } else {
      //console.log("Standard User");
      //console.log(req.user);
      //skumane
      try {
        const usr =  req.user.id;
       //search for catalogues that you have been assigned to
        const Catalogues = await Catalogue.find(
          {
            "$or":[
              {userIds: {$regex:usr}}
            ]
          }
        );
        res.status(200).json(Catalogues.reverse());
      } catch (err) {      
        return res.status(500).json(err);
      }
  }
});
////////////////////////////
// get detail catalog admin
router.get("/piclist/:id", verify, async (req, res) => {
  console.log("Admin");
  console.log("piclist -> DETAILS CATALOGUE ID");

  if(req.user.isAdmin) {
      try {
        const clientCatalogue = await Catalogue.findById(req.api_key.catalogueId);

        var picsCat = [];
    
        for (const catii of clientCatalogue.barcodeIds) {
              
              const pic = await Picture.findOne({"barcode":catii});
              picsCat.push(pic);
        }

        res.status(200).json(picsCat);
      }catch(err){
        console.log("Eish")
        return res.status(500).json(err);
      }
  }else{
      res.status(403).json("You are not allowed!");
  }
});
////////////////////////////
// get detail catalog admin
router.get("/picturelist/:id", verify, async (req, res) => {
  console.log("External");
  console.log("picturelist -> DETAILS CATALOGUE ID");
  //Only lists pictures who's draft status status is false
  //So if the picture is been set to true, it won't be displayed
  try {
    const clientCatalogue = await Catalogue.findById(req.api_key.catalogueId);

    var picsCat = [];
 
    for (const catii of clientCatalogue.barcodeIds) {          
          const pic = await Picture.findOne({"barcode":catii});
          if(!pic.draftmode){
            picsCat.push(pic);
          }
         
    }

    res.status(200).json(picsCat);
  }catch(err){
    console.log("Eish")
    return res.status(500).json(err);
  }
});

//////////////////
// get detail catalog
router.get("/details/:id", verify, async (req, res) => {
 
  
    try {
      /*
      console.log("###############################")
      console.log("DETAILS CATALOGUE ID");
      console.log(req.params.id);
    
      console.log("API key Id");
      console.log(req.api_key);

      console.log("User Details");
      console.log(req.user._id);
      console.log("###############################")
      */
      const catalog = await Catalogue.aggregate([
        { $match: {
            _id: mongoose.Types.ObjectId(req.params.id) } 
        },        
        {
          $lookup: {
            from: "pictures",
            localField: "barcodeIds",
            foreignField: "barcode",
            as: "pics",
          },
        },
       
      ]);
      
      if (req.api_key) {
        // update token count
        const updatedToken = await Token.findByIdAndUpdate(req.api_key._id, {
          $inc: { count: 1 },
        });
      }
     // console.log("[][][][][][][][][][]")
      //console.log(catalog);
      res.status(200).json(catalog);

    } catch (err) {
      console.log(err);
      
      return res.status(500).json(err);
    }

});

///////////////////////
//GET ALL TOTAL Catalogues
router.get("/totalcatalogues", async (req, res) => {

  try {
    const Cats = await Catalogue.find();
    const totalItems = Cats.length;
    const amount = {
      "status": "success",
      "type": "Catalogues",
      "total": totalItems
    }

    res.status(200).json(amount);
  } catch (err) {

    return res.status(500).json(err);
  }
});
///////////////////////////////


//fetch users of the catalogue
router.get("/getusers", verify, async (req, res) => {
  //console.log("Go innn")
 //console.log("@RRRR@ Get Users for catalogue")
  try {
  
    const userslist =  JSON.parse(req.query.userssearch);
   // console.log(userslist);
 
    const Users = await User.find().where('_id').in(userslist); 
  
    res.status(200).json({"status":"success", Users});

  }catch(errUser){
    conosole.log("Fetch Users of catalogue Error");
    console.log(errUser);
    return res.status(500).json(errUser);
  }

});

//PHP ACKERMANS
router.get("/sqlackermends", async (req, res) => {
  
  try{
    const phpCode = process.env.ACCESS_CODE_PHP;
    console.log(phpCode);
    const res = await fetch('http://api.picnick.co.za/v1xcalls.php?allackermans=crds4y6y7hu8hw');
    const jsObject = await res.json();
    console.log(jsObject);
    console.log("Guuup guuup");
    res.status(200).json({"status":"success", jsObject});
  }catch(err){
    console.log(err);
    console.log("ACKERMENS GET");
    return res.status(500).json(err);
  }

});

//ADD Ackermans
router.post("/ackeradd/:id", verify, async (req, res) => {

  try{

    const countNum =  req.params.id;
    console.log("ACkermans Adding ID: " + countNum);

    if(countNum == "1"){
      console.log("It is actually a string");
      const resDon = await Ackhermans.deleteMany();
    }
  
    const options = { ordered: false }; 
     const newAckhermans = await Ackhermans.insertMany(req.body, options);
 
    res.status(200).json({"status":"Success", "total":req.body.length})
  }catch(err){
    console.log(err);
    console.log("ACKERMENS");
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////
//router.post("/addcheck", async (req, res) => {
router.post("/addcheck", verify, async (req, res) => {
  const catalogueId =  req.query.srcfcat;
  try {
    
    const updatedCatalogue = await Catalogue.findByIdAndUpdate(
      catalogueId,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCatalogue);
    
  } catch (err) {
    return res.status(500).json(err);
  }
});
///////////////////////
router.delete("/removeuser", verify, async (req, res) => {
  /*
  console.log("Brri Brri - addcheck ###### ");
  console.log("!!!!!!!!!!!!!!!!!!!!SSSSS");
  console.log("!!!!!!!!!!!!!!!!!!!!SSSSS");
  */
    try {
      const catalogueId =  req.query.srcdcat;
      /*
      console.log("Catalog");
      console.log(catalogueId);
      console.log("Body");
      console.log(req.body);
      */
      const updatedCatalogue = await Catalogue.findByIdAndUpdate(
        catalogueId,
        {
          $set: req.body,
        },
        { new: true }
      );
      console.log(updatedCatalogue);
      res.status(201).json("The Catalogue User has been deleted...");
    } catch (err) {
    
      console.log("Yrrrrrrrrrr");
      return res.status(500).json(err);
    }
});

///////////////////////
//DELETE 
router.delete("/terminate/:id", verify, async (req, res) => {

  try {
    await Catalogue.findByIdAndDelete(req.params.id);
    res.status(201).json("The Catalogue has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }

});

//////
//assing barcodes
router.put("/assignexcel/:id", verify, async (req, res) => {
    console.log("assignexcel");
     // console.log(req.params.id)
    //console.log(req.body);
    var stringList = [];

    try{
      //with all the barcodes that have been sent through we need a function that 
      //extract all the ids from the picture model then save those id's in the barcodeIds as a list
      for (let i = 0; i < req.body.dataJson.length; i++) {
       // console.log(i + " =====>>>>")
        stringList.push(req.body.dataJson[i].barcodes);

      }
    
      console.log(stringList);
      /*
      const updatedCatalogue = await Catalogue.findByIdAndUpdate(
        req.params.id,
        {
          $set: {"barcodeIds":stringList},
        },
        { new: true }
      );
      */
      res.status(201).json("papa e reg...");
    }catch(erexcel){
      return res.status(500).json(erexcel);
    }
});
///////////////////////////////
module.exports = router;