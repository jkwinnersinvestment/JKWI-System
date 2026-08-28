const express = require("express");
const router = express.Router();

const database = require("../config/database");





// CREATE PAYMENT RECORD


router.post("/create",(req,res)=>{


const {

investor_id,

investment_id,

amount,

payment_method

}=req.body;



const reference =

"JKWI-" + Date.now();




const sql = `

INSERT INTO payments

(
investor_id,
investment_id,
amount,
payment_method,
payment_reference,
payment_status
)

VALUES (?,?,?,?,?,?)

`;



database.query(

sql,

[

investor_id,

investment_id,

amount,

payment_method,

reference,

"Pending"

],


(error)=>{


if(error){

return res.status(500).json(error);

}



res.json({

message:"Payment created",

reference:reference

});


}


);



});








// UPDATE PAYMENT STATUS


router.put("/status/:id",(req,res)=>{


const paymentId=req.params.id;


const {

status

}=req.body;



database.query(

`

UPDATE payments

SET payment_status=?

WHERE id=?

`,

[

status,

paymentId

],


(error)=>{


if(error){

return res.status(500).json(error);

}



res.json({

message:"Payment status updated"

});


}


);



});







// VIEW INVESTOR PAYMENTS


router.get("/:id",(req,res)=>{


const investorId=req.params.id;



database.query(

`

SELECT *

FROM payments

WHERE investor_id=?

`,

[

investorId

],


(error,result)=>{


if(error){

return res.status(500).json(error);

}



res.json(result);


}


);



});




module.exports = router;