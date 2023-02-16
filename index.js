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
    const adminBalance = client.db("ashrafs").collection("adminBalance");
    const updateCollection = client.db("ashrafs").collection("update");
    const userCollection = client.db("ashrafs").collection("user");
    const allOrdersCollection = client.db("ashrafs").collection("allOrder");
    const dollarRate = client.db("ashrafs").collection("dollarRate");
    const designCollection = client.db("ashrafs").collection("graphicDesign");
    const reportCollection = client.db("ashrafs").collection("report");
    const supportCollection = client.db("ashrafs").collection("get-support");
    const allNotificationCollection = client
      .db("ashrafs")
      .collection("allNotification");
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

    // update user by admin
    app.put(
      "/admin/update-userInfo/:email",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const userInfo = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: userInfo,
        };
        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    );

    // update admin balance
    app.put(
      "/admin/update-balance",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const balance = req.body.balance;
        const id = req.body.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: { balance: balance },
        };
        const result = await adminBalance.updateOne(filter, updateDoc, options);
        res.send(result);
      }
    );

    // admin balance
    app.get("/admin-balance", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const balance = await adminBalance.find(query).toArray();
      res.send(balance);
    });

    // delete update
    app.delete(
      "/admin/delete-update",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body;
        const query = { _id: ObjectId(id) };
        const result = await updateCollection.deleteOne(query);
        res.send(result);
      }
    );

    // add front page update
    app.post("/admin/add-update", verifyJWT, verifyAdmin, async (req, res) => {
      const design = req.body;
      const order = await updateCollection.insertOne(design);
      res.send(order);
    });

    // add admin banner
    app.post("/admin/post-banner", verifyJWT, verifyAdmin, async (req, res) => {
      const design = req.body;
      const order = await bannerCollection.insertOne(design);
      res.send(order);
    });

    // add admin graphic
    app.post("/admin/post-design", verifyJWT, verifyAdmin, async (req, res) => {
      const design = req.body;
      const order = await designCollection.insertOne(design);
      res.send(order);
    });

    // update admin support
    app.put(
      "/admin/support-solve",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const solve = req.body.solve;
        const id = req.body.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: { solve: solve },
        };
        const result = await supportCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    );

    // admin get support
    app.get("/admin/allSupport", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const reports = await supportCollection.find(query).toArray();
      res.send(reports);
    });

    // update admin report
    app.put("/admin/report-solve", verifyJWT, verifyAdmin, async (req, res) => {
      const solve = req.body.solve;
      const id = req.body.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { solve: solve },
      };
      const result = await reportCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // admin get report
    app.get("/admin/allReport", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const reports = await reportCollection.find(query).toArray();
      res.send(reports);
    });

    // update notification
    app.put("/admin/updateNote", verifyJWT, verifyAdmin, async (req, res) => {
      const message = req.body.message;
      const id = req.body.id;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { p: message },
      };
      const result = await allNotificationCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // delete notification
    app.delete("/admin/deleteNot", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.body;
      const query = { _id: ObjectId(id) };
      const result = await allNotificationCollection.deleteOne(query);
      res.send(result);
    });

    // get all notification
    app.get("/get-notification", verifyJWT, verifyMember, async (req, res) => {
      const query = {};
      const notification = await allNotificationCollection
        .find(query)
        .toArray();
      res.send(notification);
    });

    // add notification by admin
    app.post(
      "/admin/add-notification",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const notification = req.body;
        const result = await allNotificationCollection.insertOne(notification);
        res.send(result);
      }
    );

    // update dollarRate
    app.put(
      "/admin/updateDollarRate",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body.id;
        const rate = req.body.rate;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: { dollarRate: rate },
        };
        const user = await dollarRate.updateOne(filter, updateDoc, options);
        res.send(user);
      }
    );

    // admin all order
    app.get("/admin/allOrder", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const allOrder = await allOrdersCollection.find(query).toArray();
      res.send(allOrder);
    });

    // get admin panel
    app.get("/admin/admin-panel", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const allUser = await userCollection.find(query).toArray();
      res.send(allUser);
    });

    // update to make member
    app.put("/admin/make-member", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { role: "member" },
      };
      const user = await userCollection.updateOne(filter, updateDoc, options);
      res.send(user);
    });

    // update to make member
    app.put("/admin/make-admin", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const user = await userCollection.updateOne(filter, updateDoc, options);
      res.send(user);
    });

    app.put(
      "/admin/orderStatus/:id",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const _id = req.params.id;
        const orderStatus = req.body;
        const filter = { _id: ObjectId(_id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: orderStatus,
        };
        const result = await allOrdersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    );

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
