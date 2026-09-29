require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


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

    gymName: {
      type: String,
      default: "",
      trim: true
    },

    attendance: {
      type: String,

      enum: [
        "None",
        "Attended",
        "Not Attended"
      ],

      default: "None"
    },

    interest: {
      type: String,

      enum: [
        "None",
        "Interested",
        "Not Interested"
      ],

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


const Client =
  mongoose.model(
    "Client",
    clientSchema
  );


// ======================================================
// CLEAN CLIENT DATA
// ======================================================

function cleanClient(body) {

  const attendanceValues = [
    "None",
    "Attended",
    "Not Attended"
  ];

  const interestValues = [
    "None",
    "Interested",
    "Not Interested"
  ];


  return {

    name:
      String(body.name || "")
        .trim(),

    phone:
      String(body.phone || "")
        .trim(),

    gymName:
      String(body.gymName || "")
        .trim(),

    attendance:
      attendanceValues.includes(
        body.attendance
      )
        ? body.attendance
        : "None",

    interest:
      interestValues.includes(
        body.interest
      )
        ? body.interest
        : "None",

    remarks:
      String(body.remarks || "")
        .trim()

  };
}


// ======================================================
// DATABASE HEALTH
// ======================================================

app.get(
  "/api/health",
  (req, res) => {

    const connected =
      mongoose.connection.readyState === 1;


    res.json({

      success: true,

      database:
        connected
          ? "MongoDB connected"
          : "MongoDB not connected"

    });

  }
);


// ======================================================
// GET ALL CLIENTS
// ======================================================

app.get(
  "/api/clients",
  async (req, res) => {

    try {

      const clients =
        await Client.find()

          .sort({
            createdAt: -1
          })

          .lean();


      res.json(clients);

    }

    catch (error) {

      console.error(
        "GET CLIENTS ERROR:",
        error
      );


      res.status(500).json({

        error:
          "Unable to load client records."

      });

    }

  }
);


// ======================================================
// ADD CLIENT
// ======================================================

app.post(
  "/api/clients",
  async (req, res) => {

    try {

      const clientData =
        cleanClient(req.body);


      if (!clientData.name) {

        return res.status(400).json({

          error:
            "Client name is required."

        });

      }


      if (!clientData.phone) {

        return res.status(400).json({

          error:
            "Phone number is required."

        });

      }


      const client =
        await Client.create(
          clientData
        );


      res.status(201).json(
        client
      );

    }

    catch (error) {

      console.error(
        "CREATE CLIENT ERROR:",
        error
      );


      if (
        error.name ===
        "ValidationError"
      ) {

        return res.status(400).json({

          error:
            "Invalid client data."

        });

      }


      res.status(500).json({

        error:
          "Unable to save client."

      });

    }

  }
);


// ======================================================
// UPDATE CLIENT
// ======================================================

app.put(
  "/api/clients/:id",
  async (req, res) => {

    try {

      const id =
        req.params.id;


      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {

        return res.status(400).json({

          error:
            "Invalid client ID."

        });

      }


      const clientData =
        cleanClient(req.body);


      if (!clientData.name) {

        return res.status(400).json({

          error:
            "Client name is required."

        });

      }


      if (!clientData.phone) {

        return res.status(400).json({

          error:
            "Phone number is required."

        });

      }


      const client =
        await Client.findByIdAndUpdate(

          id,

          clientData,

          {
            new: true,
            runValidators: true
          }

        );


      if (!client) {

        return res.status(404).json({

          error:
            "Client not found."

        });

      }


      res.json(client);

    }

    catch (error) {

      console.error(
        "UPDATE CLIENT ERROR:",
        error
      );


      if (
        error.name ===
        "ValidationError"
      ) {

        return res.status(400).json({

          error:
            "Invalid client data."

        });

      }


      res.status(500).json({

        error:
          "Unable to update client."

      });

    }

  }
);


// ======================================================
// DELETE CLIENT
// ======================================================

app.delete(
  "/api/clients/:id",
  async (req, res) => {

    try {

      const id =
        req.params.id;


      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {

        return res.status(400).json({

          error:
            "Invalid client ID."

        });

      }


      const client =
        await Client.findByIdAndDelete(
          id
        );


      if (!client) {

        return res.status(404).json({

          error:
            "Client not found."

        });

      }


      res.json({

        success: true,

        message:
          "Client deleted successfully."

      });

    }

    catch (error) {

      console.error(
        "DELETE CLIENT ERROR:",
        error
      );


      res.status(500).json({

        error:
          "Unable to delete client."

      });

    }

  }
);


// ======================================================
// FRONTEND FALLBACK
// ======================================================

app.get(
  "*",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );

  }
);


// ======================================================
// START SERVER
// ======================================================

async function startServer() {

  try {

    if (
      !process.env.MONGODB_URI
    ) {

      console.error(
        "MONGODB_URI environment variable is missing."
      );

      console.error(
        "Create a .env file with your MongoDB connection string."
      );

      process.exit(1);

    }


    await mongoose.connect(
      process.env.MONGODB_URI
    );


    console.log(
      "MongoDB connected successfully."
    );


    app.listen(
      PORT,
      () => {

        console.log(
          `Client Tracker running on http://localhost:${PORT}`
        );

      }
    );

  }

  catch (error) {

    console.error(
      "MongoDB connection failed:"
    );

    console.error(
      error.message
    );

    process.exit(1);

  }

}


startServer();