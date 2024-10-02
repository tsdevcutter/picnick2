const router = require("express").Router();
const Token = require("../models/Token");
const verify = require("../verifyToken");
const axios = require('axios');
const mongoose = require("mongoose");
const Broadsheet = require("../models/Broadsheet");

/////////////////////////////////////////////////////////////////
router.get("/list/v2", verify, async (req, res) => {
    try{

      const listing = await Broadsheet.find();
      res.status(200).json(listing);

    }catch(ers){
      return res.status(500).json(err);
    }

 });

/////////////////////////////////////////////////////////////////
router.put("/histograph/count/v2", verify, async (req, res) => {

    try{

      const result = await Broadsheet.aggregate([
        {

          $group: {
            _id: "$reform.count",
            totalCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            countNumber: "$_id",
            totalCount: 1
          }
        },
        {
          $sort: { countNumber: 1 } // 1 for ascending order
        }
      ]);

      res.status(200).json(result);
    }catch(err){
      return res.status(500).json(err)
    }

});

//////////////////////////////////////////////////////////////
////////////
router.put("/include/docs/products", verify, async (req, res) => {

  try {

        const result = await Broadsheet.aggregate([
          {

              $lookup: {
                  from: 'pictures', // The collection to join
                  localField: 'barcode', // Field from Broadsheet
                  foreignField: 'barcode', // Field from Picture
                  as: 'pictureDetails' // Alias for the joined field
              }
          },
          {
              $match: { 'pictureDetails': { $ne: [] } } // Only include documents where a match was found
          }

      ]);

    res.status(200).json(result);
    // res.status(200).json({"status":"success photo"});
  } catch (err) {

    return res.status(500).json(err);
  }

});

//////////////////////////////////////////////////////////////
/////////////

router.put("/excluded/docs/products", verify, async (req, res) => {

  try {

        const result = await Broadsheet.aggregate([

          {

              $lookup: {
                  from: 'pictures', // The collection to join
                  localField: 'barcode', // Field from Broadsheet
                  foreignField: 'barcode', // Field from Picture
                  as: 'pictureDetails' // Alias for the joined field
              }
          },
          {

            $match: { 'pictureDetails': { $eq: [] } } // Only include documents where no match was found

          }
      ]);

    res.status(200).json(result);

    // res.status(200).json({"status":"success photo"});
  } catch (err) {
    return res.status(500).json(err);
  }
});
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
module.exports = router;