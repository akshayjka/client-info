require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
    attendance: {
      type: String,
      enum: ["Attended", "Not Attended"],
      default: "Not Attended"
    },
    interest: {
      type: String,
      enum: ["Interested", "Not Interested"],
      default: "Not Interested"
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

function cleanClient(body) {
  return {
    name: String(body.name || "").trim(),
    phone: String(body.phone || "").trim(),
    attendance:
      body.attendance === "Attended" ? "Attended" : "Not Attended",
    interest:
      body.interest === "Interested" ? "Interested" : "Not Interested",
    remarks: String(body.remarks || "").trim()
  };
}

// Check MongoDB connection status
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database:
      mongoose.connection.readyState === 1
        ? "MongoDB connected"
        : "MongoDB not connected"
  });
});

// Get all clients
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await Client.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(clients);
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error);
    res.status(500).json({
      error: "Unable to load client records."
    });
  }
});

// Add client
app.post("/api/clients", async (req, res) => {
  try {
    const clientData = cleanClient(req.body);

    if (!clientData.name || !clientData.phone) {
      return res.status(400).json({
        error: "Client name and phone number are required."
      });
    }

    const client = await Client.create(clientData);

    res.status(201).json(client);
  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid client data."
      });
    }

    res.status(500).json({
      error: "Unable to save client."
    });
  }
});

// Update client
app.put("/api/clients/:id", async (req, res) => {
  try {
    const clientData = cleanClient(req.body);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid client ID."
      });
    }

    if (!clientData.name || !clientData.phone) {
      return res.status(400).json({
        error: "Client name and phone number are required."
      });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      clientData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!client) {
      return res.status(404).json({
        error: "Client not found."
      });
    }

    res.json(client);
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid client data."
      });
    }

    res.status(500).json({
      error: "Unable to update client."
    });
  }
});

// Delete client
app.delete("/api/clients/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid client ID."
      });
    }

    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: "Client not found."
      });
    }

    res.json({
      success: true,
      message: "Client deleted successfully."
    });
  } catch (error) {
    console.error("DELETE CLIENT ERROR:", error);

    res.status(500).json({
      error: "Unable to delete client."
    });
  }
});

// Frontend fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI environment variable is missing.");
      console.error(
        "Create a .env/environment variable named MONGODB_URI before starting."
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`Client Tracker running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();