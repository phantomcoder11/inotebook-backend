// mongodb://localhost:27017
// const mongoose = require('mongoose')
// const mongoURI = process.env.MONGOURL;
// const connectToMongo = () =>{
//     mongoose.connect(mongoURI, ()=>{
//         console.log("Connected to mongo successfully");
       
//     })
// }
// module.exports = connectToMongo

const mongoose = require('mongoose');

const mongoURI = process.env.MONGOURL;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (error) => {
  console.error(`Error connecting to MongoDB: ${error}`);
});

db.once('open', () => {
  console.log('Connected to MongoDB successfully');
});

module.exports = db;