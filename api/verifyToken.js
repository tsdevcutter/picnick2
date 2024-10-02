const jwt = require("jsonwebtoken");
const Token = require("./models/Token");

 async function verify (req, res, next) {
  const authHeader = req.headers.token;
  const API_KEY = req.headers.api_key;

/*
  console.log("XXXXXXXXXXXX");
  console.log(authHeader);
  console.log("XXXXXXXXXXXX");
*/

  if (authHeader) {   
    const token = authHeader.split(" ")[1];   
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
          //console.log("VERIFICATION TOKEN NO LONGER VALID");
          return res.status(403).json("Token is not valid!");
      }
      
      req.user = user;
      next();
    });

  } else if (API_KEY) {
    console.log(") verifyToken (");
    console.log(API_KEY);

    try {
      const token = await Token.findOne({ token: API_KEY });
      if (token) {
        req.api_key = token;
        next();

      } else {
      res.status(403).json("API_KEY is not valid!");
    }
    } catch (err) {
      res.status(500).json(err);
    }
  }else{
    res.status(401).json("You are not authenticated!");
  }
}

module.exports = verify;