require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});


const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    
    const database = client.db('hireLoop_db');
    const jobCollection = database.collection('jobs');

    app.get('/api/jobs', async(req,res) => {
      const query = {};
      if(req.query.companyId){
        query.companyId = req.query.companyId;
      }
      if(req.query.status){
        query.status = req.query.status;
      }

      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    
    app.post('/api/jobs', async(req,res) => {
        const job = req.body;
        const result = await jobCollection.insertOne(job);
        res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );


  } catch(error) {
    console.log(error)
  }
}
run().catch(console.dir);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
