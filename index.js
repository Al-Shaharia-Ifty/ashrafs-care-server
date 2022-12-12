const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `${process.env.DB_URI}`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// verify jwt token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const courseCollection = client.db("ashrafs").collection("viewCourse");
    const updateCollection = client.db("ashrafs").collection("update");
    const userCollection = client.db("ashrafs").collection("user");
    const allOrdersCollection = client.db("ashrafs").collection("allOrder");
    const boostCollection = client.db("ashrafs").collection("boost");
    const promoteCollection = client.db("ashrafs").collection("promote");
    const setupCollection = client.db("ashrafs").collection("pageSetup");
    const recoverCollection = client.db("ashrafs").collection("recover");

    //  get all course for display
    app.get("/course", async (req, res) => {
      const query = {};
      const course = await courseCollection.find(query).toArray();
      res.send(course);
    });

    // get all updates for display
    app.get("/update", async (req, res) => {
      const query = {};
      const update = await updateCollection.find(query).toArray();
      res.send(update);
    });

    // get one update for display
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const update = await updateCollection.findOne(query);
      res.send(update);
    });

    // Login user
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
      res.send({ result, token });
    });

    // login with google
    app.put("/googleUser/:email", async (req, res) => {
      const email = req.params.email;
      const memberInfo = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: memberInfo,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
      res.send({ result, token });
    });

    // get user
    app.get("/userInfo", verifyJWT, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    // update User
    app.put("/updateUser/:email", async (req, res) => {
      const email = req.params.email;
      const name = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: name,
      };
      const user = await userCollection.updateOne(filter, updateDoc, options);
      res.send(user);
    });

    // facebook boost post
    app.post("/facebookBoost", verifyJWT, async (req, res) => {
      const boost = req.body;
      const result = await boostCollection.insertOne(boost);
      const order = await allOrdersCollection.insertOne(boost);
      res.send(result);
    });

    // facebook basic promote
    app.post("/promote", verifyJWT, async (req, res) => {
      const basic = req.body;
      const result = await promoteCollection.insertOne(basic);
      const order = await allOrdersCollection.insertOne(setup);
      res.send(result);
    });

    // facebook page setup
    app.post("/pageSetup", verifyJWT, async (req, res) => {
      const setup = req.body;
      const result = await setupCollection.insertOne(setup);
      const order = await allOrdersCollection.insertOne(setup);
      res.send(result);
    });

    // facebook recover
    app.post("/recover", verifyJWT, async (req, res) => {
      const basic = req.body;
      const result = await recoverCollection.insertOne(basic);
      const order = await allOrdersCollection.insertOne(basic);
      res.send(result);
    });

    //get all order
    app.get("/all-orders", verifyJWT, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const allOrder = await allOrdersCollection.find(query).toArray();
      const boost = await boostCollection.find(query).toArray();
      const recover = await recoverCollection.find(query).toArray();
      const pageSetup = await setupCollection.find(query).toArray();
      const promote = await promoteCollection.find(query).toArray();
      res.send({ allOrder, boost, recover, pageSetup, promote });
    });

    //
  } finally {
  }
}
run();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
