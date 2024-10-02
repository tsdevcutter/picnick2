const router = require("express").Router();
const SalesLayer = require("../models/SalesLayer");
const SalesCat = require("../models/SalesCat");
const Category = require("../models/Category");
const verify = require("../verifyToken");
const mongoose = require("mongoose");

////////////////////////////
router.get("/catalist", verify, async (req, res) => {

    try{
        const Categories = await Category.find();

        res.status(200).json(Categories);
    }catch(err){
        return res.status(500).json(err);
    }
});    
//////////////////////////////
router.post("/create", verify, async (req, res) => {

    try{

        const newCategory = req.body;
        const options = { ordered: true };
        const savedCat = await Category.insertMany(newCategory, options);

        //console.log(savedCat);
        res.status(200).json({"status":"Success", savedCat});
    }catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
});
///////////////////////////////
router.get("/picturelist", verify, async (req, res) => {

    try{
        const SalesLayers = await SalesLayer.find();

        res.status(200).json(SalesLayers);
    }catch(err){
        return res.status(500).json(err);
    }
});
///////////////////////////////   
router.post("/addpictures", verify, async (req, res) => {

    try{

        const newSalesLayer = req.body;
        const options = { ordered: true };
        const salesPictures = await SalesLayer.insertMany(newSalesLayer, options);      

        res.status(200).json({"status":"Success", salesPictures});
    }catch(err){
        return res.status(500).json(err);
    }
});
///////////////////////////////   
//x1 salelayer category that retains its normal structure
//SalesLayer Category 
router.get("/salescatx1", verify, async (req, res) => {

    try{

        const salesCats = await SalesCat.find(); 

        res.status(200).json(salesCats);
    }catch(err){
        return res.status(500).json(err);
    }
});
/////////////////////////////
//CREATE STREAM
router.post("/streamcatsx1", verify, async (req, res) => {
  
    const obCategories = req.body;

    try {
        const options = { ordered: true };
        const result = await SalesCat.insertMany(obCategories, options);
        res.json({status: "success"});
    } catch (err) {
        console.log("streamcatsx1");
      return res.status(500).json(err);
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////   
module.exports = router;