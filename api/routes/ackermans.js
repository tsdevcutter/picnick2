const router = require("express").Router();
const Divergents = require("../models/Divergents");
const Picture = require("../models/Picture");
const verify = require("../verifyToken");
const Ackermans = require("../models/Ackhermans");
const Token = require("../models/Token");
const Catalogue = require("../models/Catalogue");
const Broadsheet = require("../models/Broadsheet");

//////////////////////////////////////////////
//Get Ackermans product
router.put("/collect/single", async (req, res) => {
    try{

        const BarcodeNumber = req.body.barcode;
        //get token from header
        const catToken = req.headers.api_key;
 
        //check if token exists
        const tokenData = await Token.find({"token": catToken});

         if(tokenData.length  === 0){
            return  res.status(401).json("Token is invalid!");
         }

         const ackerProduct = await Ackermans.find({"barcode": req.body.barcode });
 
         if(ackerProduct.length === 0){
            console.log("0 THE API DONE 0");

            const object = {
              "barcode" : BarcodeNumber,
              "status" : 204,
              "condition" : "Not Found"
            }
            return res.status(200).json(object);    
        }
        /*
        console.log("_0_        _0_");
        console.log(ackerProduct);
        console.log("_0_        _0_");
        console.log(tokenData);
        const catalogueItem = await Catalogue.findById(tokenData[0].catalogueId);
        console.log(catalogueItem);
        */

        const catalogueItem = await Catalogue.findById(tokenData[0].catalogueId);
        var found = catalogueItem.barcodeIds.includes(BarcodeNumber);

        if (found) {
            console.log("__####___####____")
            console.log("Barcode found in the list.");
            console.log("__####___####____")
        } else {
           console.log("__----___---____")
           console.log("Barcode not found in the list.");
           console.log("__----___---____")
            //Check if the barcode exists in the database
            const Pic = await Picture.findOne({"barcode": BarcodeNumber});
            
            if(Pic){
              //if it does add this barcode to this catalogue 
            
                const pickAckerAdd = await Catalogue.findByIdAndUpdate(
                  { _id: catalogueItem._id},
                  {
                    $addToSet: {
                      barcodeIds: BarcodeNumber
                    }
                  },
                  { new: true }
                );
                console.log(pickAckerAdd);
            }else {
              // If not add to divergent list.
              const divItem = await Divergents.findOne({"barcode": BarcodeNumber});

                if(!divItem){
                  const newDivergent = new Divergents({
                    "barcode"   : ackerProduct[0].barcode,
                    "title"     : ackerProduct[0].title,
                    "stockcode" : ackerProduct[0].stockcode,            
                    "price"    : ackerProduct[0].price,
                    "qty"      : ackerProduct[0].qty,
                    "promotion" : ackerProduct[0].promotion,
                    "digit"    : ackerProduct[0].digit,
                    });
      
                    const savedDivergent = await newDivergent.save();               
                    console.log(savedDivergent);
                }             
            }            
        }

       /*
         Return the required product from the Ackermans collection
       */
       const productItem = {
          "stockcode" : ackerProduct[0].stockcode,
          "barcode" : ackerProduct[0].barcode,
          "title" : ackerProduct[0].title,
          "price" : ackerProduct[0].price,
          "qty" : ackerProduct[0].qty,
          "promotion" : ackerProduct[0].promotion,
          "digit" : ackerProduct[0].digit,
          "schedule" : ackerProduct[0].schedule,
       }

       //Send the productItem to broadsheetAssessment
       const broadSheetLog = AssesBroadSheet(productItem);
       console.log(broadSheetLog);

      res.status(200).json(productItem);
    }catch(asem){
      console.log("Error")
      console.log(asem);
      console.log("************")
      return res.status(500).json(asem);
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////
async function AssesBroadSheet(product){

  var optionPlace = false;

  const checkBroad = await Broadsheet.find({"barcode":product.barcode})

  if (checkBroad.length > 0) {
      
    //console.log("If the document exists, increment reform.count by 1 and update the reform.update date");
    await Broadsheet.findOneAndUpdate(
      { barcode: product.barcode }, // Filter by barcode
      {
        $inc: { "reform.count": 1 }, // Increment reform.count by 1
        $set: { "reform.update": new Date() }, // Set reform.update to current date
        $setOnInsert: { ...product } // Set all other fields on insert
      },
      { new: true, upsert: true } // Return the new document, create if it doesn't exist
    );
      
    optionPlace = true;
  }else {

    const newBroadsheet = new Broadsheet({
      "barcode"   : product.barcode,
      "title"     : product.title,
      "stockcode" : product.stockcode,            
      "price"     : product.price,
      "qty"       : product.qty,
      "promotion" : product.promotion,
      "digit"    : product.digit,
      "schedule" : product.schedule,
      "reform"   : {
          "count" : 1,
          "update" : new Date()
        }
      });

      await newBroadsheet.save();
      optionPlace = true;
  }
  return optionPlace;
}
///////////////////////////////////////////////////////////////////////////////////////
// Update all products where medicine is true and schedule is empty or doesn't exist
router.put("/update/medicine/schedule/v2/", async (req, res) => {
  try {
    // Find all products where medicine is true and schedule is either empty or does not exist
    const products = await Picture.find({
      medicine: true,
      $or: [{ schedule: { $exists: false } }, { schedule: "" }]
    });
    res.status(200).json(products);
    /*
    // If no products are found, respond with a message
    if (!products.length) {
      return res.status(404).json({ message: "No products found for update" });
    }

    // Update the schedule field to "S0" for all matching products
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        product.schedule = "S0";
        return await product.save();
      })
    );

    // Respond with the list of updated products
    res.status(200).json(updatedProducts);
    */
  } catch (error) {
    // Handle any errors
    return res.status(500).json({ message: error.message });
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;