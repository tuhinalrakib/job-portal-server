require("dotenv").config()
const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
    res.send("Job Portal Home Page")
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster.gnlwsvv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// console.log(client)

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // jobs APIs
    const jobsCollection = client.db("jobsDb").collection("jobs")
    const applicationCollection = client.db("jobsDb").collection("application")

    // Job Related APIs
    app.get("/jobs/applications", async (req,res)=>{
        const email = req.query.email 
        const query = { hr_email : email}
        const jobs = await jobsCollection.find(query).toArray()

        for(const job of jobs){
          const applications_query ={jobId : job._id.toString()}
          const application_count = await applicationCollection.countDocuments(applications_query)
          job.application_count = application_count
        }
        res.send(jobs)
    })

    app.post("/jobs", async (req,res)=>{
        const newJob = req.body
        const result = await jobsCollection.insertOne(newJob)
        res.send(result)
    })

    app.get("/jobs", async(req,res)=>{
        const email = req.query.email 
        if(email){
          const query = { hrEmail : email }
          const result = await jobsCollection.find(query).toArray()
          res.send(result)
        }else{
          const result = await jobsCollection.find().toArray()
          res.send(result)
        }
    })

    app.get("/jobs/:id", async (req,res)=>{
        const id = req.params.id 
        const query = { _id : new ObjectId(id)}
        const result = await jobsCollection.findOne(query)
        res.send(result)
    })


    // coud be done but not should be done
    // app.get("/jobsByEmail", async(req,res)=>{
        
        
    //     const result = await jobsCollection.find(query)
    //     res.send(result)
    // })

    // Application APIs
    app.post("/applications", async (req,res)=>{
        const newApplication = req.body
        console.log(newApplication)
        const result = await applicationCollection.insertOne(newApplication)
        res.send(result)
    })

    app.get("/applications", async(req,res)=>{
        const email = req.query.email
        const query = {
          email : email
        }
        const result = await applicationCollection.find(query).toArray()

        // Bad way to aggregate Data
        for(const application of result){
            const id = application.jobId 
            const jobQuery = { _id : new ObjectId(id)}
            const job = await jobsCollection.findOne(jobQuery)
            application.company = job.company
            application.title = job.title
            application.location = job.location
            application.company_logo = job.company_logo
        }

        res.send(result)
    })

    app.get("/applications/job/:job_id", async(req,res)=>{
        const job_id = req.params.job_id
        const query = { jobId : job_id}
        const result = await applicationCollection.find(query).toArray()
        res.send(result)
    })

    app.patch("/applications/:id", async (req, res)=>{
        const id = req.params.id 
        const updated = req.body
        const filter = { _id : new ObjectId(id)}
        const updatedDoc = {
          $set : {
            status : updated.status
          }
        }
        const result = await applicationCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, ()=>{
    console.log(`App listening from: ${port}`)
})