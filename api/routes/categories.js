const router = require("express").Router();
const Category = require("../models/Category");
const verify = require("../verifyToken");

/////////////////////////////
//CREATE
router.post("/", verify, async (req, res) => {

    const newCategory = new Category(req.body);
    try {
      const savedCategory = await newCategory.save();
      res.status(201).json(savedCategory);
    } catch (err) {
      return res.status(500).json(err);
    }
});
/////////////////////////////
/////////////////////////////
//CREATE
router.put("/createsub", verify, async (req, res) => {

  //const newCategory = new Category(req.body);
  try {

    const idCat = req.body.parentCatId;
    //console.log("ID: " + idCat);

    const updatedSub = await Category.updateOne(
        {"catId" : idCat},
          {$push:{ "sub_categories" :  req.body}}
        );

    //res.status(201).json(updatedSub);
    res.status(201).json({"status":"Sub category has been created"});
  } catch (err) {
    return res.status(500).json(err);
  }
});
/////////////////////////////
/////////////////////////////
//GET SINGLE CATEGORY
router.get("/getcat/:id", verify, async (req, res) => {

  try {

    const Categories = await Category.find({"catId":req.params.id});
    res.status(200).json(Categories);
    
  } catch (err) {
    return res.status(500).json(err);
  }

});

/////////////////////////////
//CREATE STREAM
router.post("/streamer", verify, async (req, res) => {
  
    const obCategories = req.body;

    try {
        const options = { ordered: true };
        const result = await Category.insertMany(obCategories, options);
        res.json({status: "success"});
    } catch (err) {
        console.log("streamer");
      return res.status(500).json(err);
    }
});

/////////////////////////////
//GET UNSTRUCTURED LIST OF CATEGORIES
router.get("/list", verify, async (req, res) => {
    
  try {
      //console.log("papppa")
      //GET ALL THE                              Order alphabetically
      const data =  await Category.find().sort( { "categoryName": 1 } );     
      res.json({data});
  } catch (err) {
      console.log("list");
    return res.status(500).json(err);
  }
});

/////////////////////////////
//GET STRUCTURED LIST OF CATEGORIES
//NO LONGER VAlid
/*
router.get("/catalist", verify, async (req, res) => {
    
    try {
        //GET ALL THE 
        const allCats =  await Category.find();
        let rootCat = allCats.filter(cat => {
          return cat.parentCatId === "0"
        });
        const data = formTreeCategories2(rootCat, allCats) 
         
        res.json({data});
    } catch (err) {
        console.log("catalist");
      return res.status(500).json(err);
    }
});
*/
/////////////////////////////
function formTreeCategories1(categories, allCategories) {
  categories.forEach(element => {
    //()()()()()()()()()()
    let subCategories = allCategories.filter(subCat => {
      return element.catId === subCat.parentCatId
    });
   // console.log("Brrrr Brrrrrrr");
    categories[0].children.push(subCategories);
    
    //UP FUNCTION WORKS    
    //categories
    /*
    console.log(categories[0]._id);
    console.log(categories[0].categoryName);
    console.log(categories[0].children.length);
    console.log(categories[0].children[0].length);
 */
    if(subCategories.length > 0){
      formTreeCategories1(subCategories, allCategories)
    }
  });
  return categories;
}
/////////////////////////////
function formTreeCategories2(categories, allCategories) {
  categories.forEach(element => {
   // console.log("()()()()()()()()()()")
    let subCategories = allCategories.filter(subCat => {
      return element.catId === subCat.parentCatId
    });
   // console.log("Brrrr Brrrrrrr");
    categories[0].children.push(subCategories);
   
  });
  return categories;
}
/////
/////////////////////////////
//DELETE 
router.delete("/terminate/:id", verify, async (req, res) => {
 
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(201).json("The Category has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }

});
////////
/////////////////////////////
//DELETE sub category
router.put("/terminatesub/:id", verify, async (req, res) => {
 
  try {
    const idCat = req.params.id;
  
    const updatedSub = await Category.updateOne(
        {"_id" : idCat},
        {$pull:{ "sub_categories" : {
          "catId": {            
            "$in": [req.body.catId]
          }
        } }}
      );

    res.status(201).json("The Sub Category has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }

});
/////////////////////////////
//UPDATE CATEGORIES
router.put("/updatesubcat", verify, async (req, res) => {
/*
  console.log("vovovovo");
  console.log(req.body);
  console.log("zozozozozozoz");
  console.log(req.body.sub_categories);
  console.log("mapara authi yeooo");
  //console.log(req.body.sub_categories); 
  console.log("The id: " + idCatId);
  */
  try {
    const idCatId = req.body.id;

    
    const updatedCategory = await Category.updateOne(
      {"_id" : idCatId},
      {
        $push: {"sub_categories": req.body.sub_categories[0]},
      }
    );
   
    res.status(200).json({"status":"success", updatedCategory});

  } catch (err) {
    return res.status(500).json(err);
  }

});
/////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;