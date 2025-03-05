require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "*", // Or specify Webflow domain
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(bodyParser.json());

// Routes
app.use("/products", productRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Check Webflow API connection
const checkWebflowConnection = async () => {
  try {
    const response = await axios.get(
      `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`,
          "accept-version": "2.0.0",
        },
      }
    );
    console.log("✅ Webflow API connected, fetched items:", response.data.items.length);
    console.log("✅ Webflow API connected, fetched items:", response.data);
    console.log("✅ Webflow API connected, fetched items:", response.data._id);


  } catch (error) {
    console.error("❌ Webflow API connection error:", error.response?.data || error.message);
  }
};

// Call the function to check Webflow connection on startup
checkWebflowConnection();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
