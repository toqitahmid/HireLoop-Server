require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    const database = client.db("hireLoop_db");
    const jobCollection = database.collection("jobs");
    const companyCollection = database.collection("companies");
    const applicationCollection = database.collection("applications");

    // create job api
    app.post("/api/jobs", async (req, res) => {
      try {
        const jobData = req.body;

        // Optional: Add a timestamp when the job is created
        const newJob = {
          ...jobData,
          createdAt: new Date(),
        };

        const result = await jobCollection.insertOne(newJob);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).send({ error: "Failed to create job" });
      }
    });
    // find jobs depending on companyId and status
    app.get("/api/jobs", async (req, res) => {
      const query = {};
      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }

      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // find all jobs for job seeker
    app.get('/api/jobs/all', async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/api/jobs/:id', async(req,res) => {
      const {id} = req.params;
      const result = await jobCollection.findOne({
        _id : new ObjectId(id)
      })
      res.send(result);
    })

    // applications api
    app.post("/api/applications", async (req, res) => {
      const application = req.body;
      const newApplication = {
        ...application,
        createdAt: new Date(),
      }
      const result = await applicationCollection.insertOne(newApplication);
      res.send(result);
    });

    app.get('/api/applications', async (req,res) => {
      const query = {};
      if(req.query.applicantId){
        query.applicantId = req.query.applicantId;
      }
      if(req.query.jobId){
        query.jobId = req.query.jobId;
      }

      const cursor = applicationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //companies api
    app.post("/api/companies", async (req, res) => {
      const company = req.body;
      const result = await companyCollection.insertOne(company);
      res.send(result);
    });


    app.get("/api/my/companies/:id", async (req, res) => {
      const { id } = req.params;
      const result = await companyCollection.findOne({
        recruiterId: id,
      });
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
