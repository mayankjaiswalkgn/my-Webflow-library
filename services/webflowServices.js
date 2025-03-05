const axios = require("axios");
require("dotenv").config();

const WEBFLOW_API_URL = `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`; // Ensure this is set in .env
const WEBFLOW_API_KEY = process.env.WEBFLOW_API_KEY;

const headers = {
  "Authorization": `Bearer ${WEBFLOW_API_KEY}`,
  "accept-version": "1.0.0",
  "Content-Type": "application/json",
};


async function createWebflowItem(product) {
  try {
    const payload = {
      fields: {
        name: product.name,
        price: product.price,
        description: product.description,
        stock: product.stock,
        _archived: false,
        _draft: false
      }
    };

    console.log("Sending payload to Webflow:", payload);

    const response = await axios.post(WEBFLOW_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${WEBFLOW_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    console.log("✅ Webflow Item Created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating Webflow item:", error.response?.data || error);
    throw new Error(`Webflow validation error: ${JSON.stringify(error.response?.data || error)}`);
  }
}

async function updateWebflowItem(itemId, product) {
  try {
    const payload = {
      fields: {
        name: product.name,
        price: product.price,
        description: product.description,
        stock: product.stock,
        _archived: false,
        _draft: false,
      }
    };

    const response = await axios.put(`${WEBFLOW_API_URL}/${itemId}`, payload, { headers });
    return response.data;
  } catch (error) {
    console.error("Error updating Webflow item:", error.response?.data || error.message);
    throw new Error("Failed to update Webflow item");
  }
}


async function getWebflowItems() {
  try {
    const response = await axios.get(WEBFLOW_API_URL, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching Webflow items:", error.response?.data || error.message);
    throw new Error("Failed to fetch Webflow items");
  }
}


async function getWebflowItemById(itemId) {
  try {
    const response = await axios.get(`${WEBFLOW_API_URL}/${itemId}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching Webflow item:", error.response?.data || error.message);
    throw new Error("Failed to fetch Webflow item");
  }
}

module.exports = {
  createWebflowItem,
  updateWebflowItem,
  getWebflowItems,
  getWebflowItemById
};
