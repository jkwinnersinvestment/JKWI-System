const express = require("express");
const router = express.Router();

const database = require("../config/database");

const bcrypt = require("bcrypt");




// ADMIN LOGIN

router.post("/login",(req,res)=>{


const {

username,
password

}=req.body;



database.query(

"SELECT * FROM admins WHERE username=?",

[username],


async(error,result)=>{


if(error){

return res.status(500).json(error);

}



if(result.length===0){

return res.status(401).json({

message:"Admin not found"

});

}



const admin=result[0];



const match = await bcrypt.compare(

password,

admin.password

);



if(!match){

return res.status(401).json({

message:"Wrong password"

});

}



res.json({

message:"Admin login successful",

admin:{

id:admin.id,

role:admin.role

}

});


}


);


});







// VIEW ALL INVESTORS


router.get("/investors",(req,res)=>{


database.query(

"SELECT * FROM investors",

(error,result)=>{


if(error){

return res.status(500).json(error);

}


res.json(result);


}


);



});







// APPROVE INVESTOR


router.put("/approve/:id",(req,res)=>{


const id=req.params.id;



database.query(

`

UPDATE investors

SET account_status='Approved'

WHERE id=?

`,

[id],


(error)=>{


if(error){

return res.status(500).json(error);

}



res.json({

message:"Investor approved"

});


}


);



});




module.exports = router;