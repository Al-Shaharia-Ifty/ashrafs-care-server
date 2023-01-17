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
    const dollarRate = client.db("ashrafs").collection("dollarRate");
    const designCollection = client.db("ashrafs").collection("graphicDesign");
    const reportCollection = client.db("ashrafs").collection("report");
    const supportCollection = client.db("ashrafs").collection("get-support");
    const bannerCollection = client
      .db("ashrafs")
      .collection("dashboard-banner");

    // verifyMember check
    const verifyMember = async (req, res, next) => {
      const email = req.decoded.email;
      const user = await userCollection.findOne({ email: email });
      if (user.role === "member") {
        next();
      } else if (user.role === "admin") {
        next();
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    };

    // verifyAdmin check
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const user = await userCollection.findOne({ email: email });
      if (user.role === "admin") {
        next();
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    };

    // admin all order
    app.get("/admin/allOrder", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const allOrder = await allOrdersCollection.find(query).toArray();
      res.send(allOrder);
    });

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

    app.get("/banner", async (req, res) => {
      const query = {};
      const banner = await bannerCollection.find(query).toArray();
      res.send(banner);
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
    app.get("/userInfo", verifyJWT, verifyMember, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    // get user
    app.put("/userInfo", verifyJWT, verifyMember, async (req, res) => {
      const email = req.decoded.email;
      const body = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: body,
      };
      const user = await userCollection.updateOne(filter, updateDoc, options);
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
    app.post("/facebookBoost", verifyJWT, verifyMember, async (req, res) => {
      const boost = req.body;
      const order = await allOrdersCollection.insertOne(boost);
      res.send(order);
    });

    // facebook basic promote
    app.post("/promote", verifyJWT, verifyMember, async (req, res) => {
      const basic = req.body;
      const order = await allOrdersCollection.insertOne(basic);
      res.send(order);
    });

    // facebook page setup
    app.post("/pageSetup", verifyJWT, verifyMember, async (req, res) => {
      const setup = req.body;
      const order = await allOrdersCollection.insertOne(setup);
      res.send(order);
    });

    // facebook recover
    app.post("/recover", verifyJWT, verifyMember, async (req, res) => {
      const basic = req.body;
      const order = await allOrdersCollection.insertOne(basic);
      res.send(order);
    });

    // get all order
    app.get("/all-orders", verifyJWT, verifyMember, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const allOrder = await allOrdersCollection.find(query).toArray();
      res.send({ allOrder });
    });

    // get order details
    app.get("/order-details/:id", verifyJWT, verifyMember, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const details = await allOrdersCollection.findOne(query);
      res.send(details);
    });

    // dollar Rate
    app.get("/dollarRate", async (req, res) => {
      const dollar = await dollarRate.find({}).toArray();
      res.send(dollar);
    });

    // get graphic design
    app.get("/design", verifyJWT, verifyMember, async (req, res) => {
      const design = await designCollection.find({}).toArray();
      res.send(design);
    });

    // post graphic order
    app.post("/design", verifyJWT, verifyMember, async (req, res) => {
      const design = req.body;
      const order = await allOrdersCollection.insertOne(design);
      res.send(order);
    });

    // post support
    app.post("/report", verifyJWT, verifyMember, async (req, res) => {
      const support = req.body;
      const result = await reportCollection.insertOne(support);
      res.send(result);
    });

    // add order balance
    app.put("/balance", verifyJWT, verifyMember, async (req, res) => {
      const email = req.decoded.email;
      const balanceInfo = req.body;
      const filter = { email: email };
      // get user info
      const user = await userCollection.findOne(filter);
      const userBalance = user.balance;
      const options = { upsert: true };

      if (!userBalance) {
        const updateDoc = {
          $set: balanceInfo,
        };
        const balance = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(balance);
      } else {
        const totalBalance = userBalance + balanceInfo.balance;
        const balance = { balance: totalBalance };

        const updateDoc = {
          $set: balance,
        };
        const user = await userCollection.updateOne(filter, updateDoc, options);
        res.send(user);
      }
    });

    // get support
    app.post("/get-support", verifyJWT, verifyMember, async (req, res) => {
      const supportInfo = req.body;
      const result = await supportCollection.insertOne(supportInfo);
      res.send(result);
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
