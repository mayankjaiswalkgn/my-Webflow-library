const express = require("express");
const Product = require("../models/product");
const { createWebflowItem, updateWebflowItem } = require("../services/webflowServices");

const router = express.Router();

/**
 * Get all products from MongoDB
 */
router.get("/", async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    const total = await Product.countDocuments();

    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching products:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
/**
 * Add a new product to MongoDB and Webflow
 */
router.post("https://api.webflow.com/v2/collections/580e63fc8c9a982ac9b8b745/fields/", async (req, res) => {
  try {
    // Validate request body
    if (!req.body.name || !req.body.price || !req.body.description || !req.body.stock) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { name, price, description, stock } = req.body;
    const newProduct = new Product({ name, price, description, stock });

    // Save to MongoDB
    const savedProduct = await newProduct.save();

    // Send data to Webflow
    const webflowResponse = await createWebflowItem(savedProduct);
    
    // Updated check for Webflow v2 API response
    if (!webflowResponse || !webflowResponse.id) {
      // Rollback MongoDB save if Webflow fails
      await Product.findByIdAndDelete(savedProduct._id);
      console.error("Webflow response issue:", webflowResponse);
      return res.status(500).json({ error: "Failed to create Webflow item" });
    }

    // Update MongoDB with Webflow item ID
    savedProduct.webflowItemId = webflowResponse.id;
    await savedProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to add product" });
  }
});

/**
 * Update a product in MongoDB and Webflow
 */
router.put("/:id", async (req, res) => {
  try {
    // Validate request body
    if (!req.body.name || !req.body.price || !req.body.description || !req.body.stock) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { name, price, description, stock } = req.body;

    // First check if product exists
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update MongoDB
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, stock },
      { new: true, runValidators: true }
    );

    // Update Webflow item if it exists
    if (updatedProduct.webflowItemId) {
      try {
        await updateWebflowItem(updatedProduct.webflowItemId, updatedProduct);
      } catch (webflowError) {
        console.error("Webflow update failed:", webflowError);
        // Continue with MongoDB update even if Webflow fails
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update product" });
  }
});

module.exports = router;
