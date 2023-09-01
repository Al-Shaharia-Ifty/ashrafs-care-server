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
    const userRattingCollection = client
      .db("ashrafs")
      .collection("userRatting");
    const adminBalance = client.db("ashrafs").collection("adminBalance");
    const adminAllPaymentsCollection = client
      .db("ashrafs")
      .collection("adminPayments");
    const updateCollection = client.db("ashrafs").collection("update");
    const userCollection = client.db("ashrafs").collection("user");
    const allOrdersCollection = client.db("ashrafs").collection("allOrder");
    const dollarRate = client.db("ashrafs").collection("dollarRate");
    const designCollection = client.db("ashrafs").collection("graphicDesign");
    const facebookContentDesignCollection = client
      .db("ashrafs")
      .collection("faceBookContentDesign");
    const webDesignCollection = client.db("ashrafs").collection("webDesign");
    const videoEditDesignCollection = client
      .db("ashrafs")
      .collection("videoEditDesign");
    const whatsAppDesignCollection = client
      .db("ashrafs")
      .collection("whatsAppDesign");
    const smsMarketingDesignCollection = client
      .db("ashrafs")
      .collection("smsMarketingDesign");
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

    /*---- get ----*/

    // get all updates for display
    app.get("/update", async (req, res) => {
      const query = {};
      const update = await updateCollection.find(query).toArray();
      res.send(update);
    });

    //  get all course for display
    app.get("/course", async (req, res) => {
      const query = {};
      const course = await courseCollection.find(query).toArray();
      res.send(course);
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

    // dollar Rate
    app.get("/dollarRate", async (req, res) => {
      const dollar = await dollarRate.find({}).toArray();
      res.send(dollar);
    });

    app.get("/ratting", async (req, res) => {
      const ratting = await userRattingCollection.find({}).toArray();
      res.send(ratting);
    });

    // ---- Member ---- //

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

    // get all notification
    app.get("/get-notification", verifyJWT, verifyMember, async (req, res) => {
      const query = {};
      const notification = await allNotificationCollection
        .find(query)
        .toArray();
      res.send(notification);
    });

    // get member reports
    app.get("/user/reports", verifyJWT, verifyMember, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const result = await reportCollection.find(query).toArray();
      res.send(result);
    });

    // get member support
    app.get("/user/support", verifyJWT, verifyMember, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const result = await supportCollection.find(query).toArray();
      res.send(result);
    });

    // get user
    app.get("/userInfo", verifyJWT, verifyMember, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    // get graphic design
    app.get("/design", verifyJWT, verifyMember, async (req, res) => {
      const design = await designCollection.find({}).toArray();
      res.send(design);
    });

    // get Content design
    app.get("/content-design", verifyJWT, verifyMember, async (req, res) => {
      const design = await facebookContentDesignCollection.find({}).toArray();
      res.send(design);
    });

    // get web design
    app.get("/web-design", verifyJWT, verifyMember, async (req, res) => {
      const design = await webDesignCollection.find({}).toArray();
      res.send(design);
    });

    // get videoEdit- design
    app.get("/videoEdit-design", verifyJWT, verifyMember, async (req, res) => {
      const design = await videoEditDesignCollection.find({}).toArray();
      res.send(design);
    });

    // get whatsApp design
    app.get("/whatsApp-design", verifyJWT, verifyMember, async (req, res) => {
      const design = await whatsAppDesignCollection.find({}).toArray();
      res.send(design);
    });

    // get smsMarketing- design
    app.get(
      "/smsMarketing-design",
      verifyJWT,
      verifyMember,
      async (req, res) => {
        const design = await smsMarketingDesignCollection.find({}).toArray();
        res.send(design);
      }
    );

    // ---- Only Admin ---- //

    // admin get report
    app.get("/admin/allReport", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const reports = await reportCollection.find(query).toArray();
      res.send(reports);
    });

    // admin get support
    app.get("/admin/allSupport", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const reports = await supportCollection.find(query).toArray();
      res.send(reports);
    });

    // admin balance
    app.get("/admin-balance", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const balance = await adminBalance.find(query).toArray();
      res.send(balance);
    });

    // admin all payments
    app.get("/admin/payments", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const result = await adminAllPaymentsCollection.find(query).toArray();
      res.send(result);
    });

    // get admin payments
    app.get("/admin-payments", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const result = await adminAllPaymentsCollection.find({}).toArray();
      res.send(result);
    });

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

    //---- put ---- //

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

    // ---- Member ---- //

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

    // ---- Only Admin ---- //

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

    // admin order status by id
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

    // update admin order details
    app.put(
      "/admin/edit-details/:id",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const editInfo = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: editInfo,
        };
        const result = await allOrdersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    );

    //---- post ----//

    // ---- Member ---- //

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

    // get support
    app.post("/get-support", verifyJWT, verifyMember, async (req, res) => {
      const supportInfo = req.body;
      const result = await supportCollection.insertOne(supportInfo);
      res.send(result);
    });

    // ---- Only Admin ---- //

    // add admin payments
    app.post("/admin/add-payment", verifyJWT, verifyAdmin, async (req, res) => {
      const info = req.body;
      const result = await adminAllPaymentsCollection.insertOne(info);
      res.send(result);
    });

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

    // ---- add designs ----//
    // add admin graphic design
    app.post("/admin/post-design", verifyJWT, verifyAdmin, async (req, res) => {
      const design = req.body;
      const order = await designCollection.insertOne(design);
      res.send(order);
    });

    // add facebook content design
    app.post(
      "/admin/post-facebook-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const design = req.body;
        const order = await facebookContentDesignCollection.insertOne(design);
        res.send(order);
      }
    );

    // add web design
    app.post(
      "/admin/post-web-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const design = req.body;
        const order = await webDesignCollection.insertOne(design);
        res.send(order);
      }
    );

    // add video edit design
    app.post(
      "/admin/post-video-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const design = req.body;
        const order = await videoEditDesignCollection.insertOne(design);
        res.send(order);
      }
    );

    // add whatsApp marketing design
    app.post(
      "/admin/post-whatsApp-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const design = req.body;
        const order = await whatsAppDesignCollection.insertOne(design);
        res.send(order);
      }
    );

    // add sms marketing design
    app.post(
      "/admin/post-smsMarketing-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const design = req.body;
        const order = await smsMarketingDesignCollection.insertOne(design);
        res.send(order);
      }
    );

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

    // add rating by admin
    app.post("/admin/add-ratting", verifyJWT, verifyAdmin, async (req, res) => {
      const ratting = req.body;
      const result = await userRattingCollection.insertOne(ratting);
      res.send(result);
    });

    //---- delete ----//

    // ---- Member ---- //

    // ---- Only Admin ---- //

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

    // delete notification
    app.delete("/admin/deleteNot", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.body;
      const query = { _id: ObjectId(id) };
      const result = await allNotificationCollection.deleteOne(query);
      res.send(result);
    });

    // delete Order
    app.delete(
      "/admin/delete-order",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const result = await allOrdersCollection.deleteOne(query);
        res.send(result);
      }
    );

    // delete graphic design
    app.delete(
      "/admin/delete-graphic-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const result = await designCollection.deleteOne(query);
        res.send(result);
      }
    );

    // delete content design
    app.delete(
      "/admin/delete-content-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const result = await facebookContentDesignCollection.deleteOne(query);
        res.send(result);
      }
    );

    // delete web design
    app.delete(
      "/admin/delete-website-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const result = await webDesignCollection.deleteOne(query);
        res.send(result);
      }
    );

    // delete video edit design
    app.delete(
      "/admin/delete-videoEdit-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const result = await videoEditDesignCollection.deleteOne(query);
        res.send(result);
      }
    );

    // delete whatsapp design
    app.delete(
      "/admin/delete-whatsapp-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const result = await whatsAppDesignCollection.deleteOne(query);
        res.send(result);
      }
    );

    // delete SMS design
    app.delete(
      "/admin/delete-sms-design",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const result = await smsMarketingDesignCollection.deleteOne(query);
        res.send(result);
      }
    );

    // ---- End ---- //
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
