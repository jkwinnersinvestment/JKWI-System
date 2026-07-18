const express = require("express");
const router = express.Router();

const database = require("../config/database");




// GET ALL PROJECTS

router.get("/", (req,res)=>{


database.query(

"SELECT * FROM projects WHERE status='Active'",


(error,result)=>{


if(error){

return res.status(500).json(error);

}


res.json(result);


}


);


});







// CREATE NEW INVESTMENT


router.post("/invest",(req,res)=>{


const {

investor_id,
project_id,
amount

}=req.body;




const sql = `

INSERT INTO investments

(investor_id,project_id,amount)

VALUES (?,?,?)

`;



database.query(

sql,

[
investor_id,
project_id,
amount
],


(error)=>{


if(error){

return res.status(500).json(error);

}



res.json({

message:"Investment request submitted"

});


}



);



});







// VIEW INVESTOR INVESTMENTS


router.get("/investments/:id",(req,res)=>{


const investorId=req.params.id;



const sql=`

SELECT

projects.project_name,

investments.amount,

investments.investment_status,

investments.created_at


FROM investments


JOIN projects

ON investments.project_id = projects.id


WHERE investor_id=?

`;



database.query(

sql,

[investorId],


(error,result)=>{


if(error){

return res.status(500).json(error);

}



res.json(result);


}


);



});



module.exports = router;