const router = require("express").Router();
const Token = require("../models/Token");
const verify = require("../verifyToken");
const { generateApiKey } = require('generate-api-key');
const CryptoJS = require("crypto-js");

/////////////////////////////

//CREATE
router.post("/", verify, async (req, res) => {


    //if (req.user.isAdmin) {
        
        const newToken = new Token({
            token: generateApiKey({
                method: 'uuidv4',
            }),
            catalogueId: req.body.catalogueId,
        });

        try {
    
            const savedToken = await newToken.save();
            res.status(200).json(savedToken);
        } catch (err) {
            console.log("X ERROR CATCH ");
            return res.status(500).json(err);
        }
   /* }else{
        res.status(403).json("You are not allowed!");
    }
*/
});

//CREATE
router.put("/tokenupdate", verify, async (req, res) => {
 
    const newToken = {"token":generateApiKey({method: 'uuidv4' })};
 
        try {
            const updatedToken = await Token.findByIdAndUpdate(
                    req.body.tokenId,
                    {
                        $set: newToken,
                    },
                    { new: true }
                );
    
            //res.status(200).json(savedToken);
            res.status(200).json({"status":"Update Token", updatedToken});
        } catch (err) {
            return res.status(500).json(err);
        }
  
});
/////////////////
//GET
router.get("/list", verify, async (req, res) => {
    
    
    if (req.user.isAdmin) {
        try {
        //    aggregate with catalogue
            const tokens = await Token.aggregate([
                {
                    $lookup: {
                        from: "catalogues",
                        localField: "catalogueId",
                        foreignField: "_id",
                        as: "catalogue"
                    }
                }

            ]);
            res.status(200).json(tokens);
        } catch (err) {
            return res.status(500).json(err);
        }
    }else{
        res.status(403).json("You are not allowed!");
    }
});

////////////////
// delete
router.delete("/terminate/:id", verify, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            await Token.findByIdAndDelete(req.params.id);
            res.status(200).json("Token has been deleted...");
        } catch (err) {
            return res.status(500).json(err);
        }
    }else{
        
        res.status(403).json("You are not allowed!");
    }
});

///////////////////////
router.get("/catalogue/:id", verify, async (req, res) => {
   // console.log("<<<<<<<#############>>>>>>>>>>>>>");
   // console.log(req.user);
    try{
        
        const catid = req.params.id;
        
        const tokensObs = await Token.find({"catalogueId":catid});
        
          res.status(200).json(tokensObs);
    }catch(erTok){
        return res.status(500).json(erTok);
    }
    
});
/////////////////////////////////////////////////////////////////////
module.exports = router;


        