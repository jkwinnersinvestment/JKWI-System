const express = require("express");
const router = express.Router();

const database = require("../config/database");

const bcrypt = require("bcrypt");




// REGISTER INVESTOR

router.post("/register", async (req,res)=>{


const {

full_name,
id_number,
email,
phone,
country,
investor_type,
password

} = req.body;



const encryptedPassword = await bcrypt.hash(password,10);



const sql = `

INSERT INTO investors

(full_name,id_number,email,phone,country,investor_type,password)

VALUES (?,?,?,?,?,?,?)

`;



database.query(

sql,

[
full_name,
id_number,
email,
phone,
country,
investor_type,
encryptedPassword
],


(error,result)=>{


if(error){

return res.status(500).json({

message:"Registration failed",

error:error

});

}



res.json({

message:"Investor account created successfully"

});


}



);



});







// LOGIN INVESTOR


router.post("/login",(req,res)=>{


const {

email,
password

}=req.body;



database.query(

"SELECT * FROM investors WHERE email=?",

[email],


async(error,result)=>{


if(error){

return res.status(500).json(error);

}



if(result.length===0){

return res.status(401).json({

message:"Account not found"

});

}



const investor=result[0];



const match=await bcrypt.compare(

password,

investor.password

);



if(!match){

return res.status(401).json({

message:"Incorrect password"

});

}



res.json({

message:"Login successful",

investor:{

id:investor.id,

name:investor.full_name,

status:investor.account_status

}


});


}



);



});



module.exports = router
