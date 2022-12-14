const express= require('express')
const router=express.Router()

router.get('/', (req,res)=>{
res.send('Hello Word from router notes')
})
module.exports=router;