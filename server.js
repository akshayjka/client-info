require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ======================================================
// MONGODB SCHEMA
// ======================================================

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    // NEW FIELD
    clientCategory: {
      type: String,
      enum: ["Hotel", "Gym"],
      required: true,
      default: "Gym"
    },

    gymName: {
      type: String,
      default: "",
      trim: true
    },

    attendance: {
      type: String,
      enum: ["None", "Attended", "Not Attended"],
      default: "None"
    },

    interest: {
      type: String,
      enum: ["None", "Interested", "Not Interested"],
      default: "None"
    },

    remarks: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Client = mongoose.model("Client", clientSchema);

// ======================================================
// CLEAN CLIENT DATA
// ======================================================

function cleanClient(body) {
  return {
    name: String(body.name || "").trim(),

    phone: String(body.phone || "").trim(),

    clientCategory:
      body.clientCategory === "Hotel" ? "Hotel" : "Gym",

    gymName: String(body.gymName || "").trim(),

    attendance: [
      "None",
      "Attended",
      "Not Attended"
    ].includes(body.attendance)
      ? body.attendance
      : "None",

    interest: [
      "None",
      "Interested",
      "Not Interested"
    ].includes(body.interest)
      ? body.interest
      : "None",

    remarks: String(body.remarks || "").trim()
  };
}

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;

    res.json({
      success: true,
      database:
        dbState === 1
          ? "connected"
          : "disconnected"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ======================================================
// GET ALL CLIENTS
// ======================================================

app.get("/api/clients", async (req, res) => {
  try {
    const clients = await Client.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(clients);
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to load clients"
    });
  }
});

// ======================================================
// ADD CLIENT
// ======================================================

app.post("/api/clients", async (req, res) => {
  try {
    const clientData = cleanClient(req.body);

    if (!clientData.name) {
      return res.status(400).json({
        message: "Client name is required"
      });
    }

    if (!clientData.phone) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    const client = await Client.create(clientData);

    res.status(201).json(client);
  } catch (error) {
    console.error("ADD CLIENT ERROR:", error);

    res.status(500).json({
      message: "Failed to add client",
      error: error.message
    });
  }
});

// ======================================================
// UPDATE CLIENT
// ======================================================

app.put("/api/clients/:id", async (req, res) => {
  try {
    const clientData = cleanClient(req.body);

    if (!clientData.name) {
      return res.status(400).json({
        message: "Client name is required"
      });
    }

    if (!clientData.phone) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    const updatedClient =
      await Client.findByIdAndUpdate(
        req.params.id,
        clientData,
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedClient) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    res.json(updatedClient);
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error);

    res.status(500).json({
      message: "Failed to update client",
      error: error.message
    });
  }
});

// ======================================================
// DELETE CLIENT
// ======================================================

app.delete("/api/clients/:id", async (req, res) => {
  try {
    const deletedClient =
      await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    res.json({
      success: true,
      message: "Client deleted successfully"
    });
  } catch (error) {
    console.error("DELETE CLIENT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete client",
      error: error.message
    });
  }
});

// ======================================================
// FRONTEND ROUTE
// ======================================================

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// ======================================================
// START SERVER
// ======================================================

async function startServer() {
  try {
    if (!MONGODB_URI) {
      console.error(
        "MONGODB_URI environment variable is missing."
      );

      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();