const express = require("express");
const router = express.Router();

const database = require("../config/database");





// GET INVESTOR PROFILE

router.get("/:id",(req,res)=>{


const investorId = req.params.id;



const sql = `

SELECT 
id,
full_name,
email,
phone,
country,
investor_type,
account_status,
created_at

FROM investors

WHERE id=?

`;



database.query(

sql,

[investorId],

(error,result)=>{


if(error){

return res.status(500).json(error);

}



if(result.length===0){

return res.status(404).json({

message:"Investor not found"

});

}



res.json(result[0]);


}


);



});








// UPDATE INVESTOR INFORMATION


router.put("/:id",(req,res)=>{


const investorId=req.params.id;


const {

phone,
country

}=req.body;



const sql=`

UPDATE investors

SET phone=?,
country=?

WHERE id=?

`;



database.query(

sql,

[
phone,
country,
investorId
],


(error)=>{


if(error){

return res.status(500).json(error);

}



res.json({

message:"Investor profile updated"

});


}


);



});



module.exports = router;