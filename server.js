const express = require("express");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const { uploader } = require("./cloudinary");
const fs = require("fs");
const path = require("path");

const app = express();

// Sécurité minimale
app.use(helmet());

// CORS : accepte uniquement ton frontend
app.use(cors({
  origin: "https://bibianeazokpota.github.io", 
  credentials: true,
}));

app.use(express.json());

// Politique CSP pour éviter les blocages de contenu
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src * data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'");
  next();
});

app.get("/", (req, res) => {
  res.send("API Nuit des Tresses en ligne ✨");
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Route de soumission
app.post("/api/candidature", upload.array("photos", 5), async (req, res) => {
  try {
    const files = req.files;
    const urls = [];

    for (const file of files) {
      const result = await uploader.upload(file.path);
      urls.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    const data = {
      nom: req.body.nom,
      salon: req.body.salon,
      telephone: req.body.telephone,
      email: req.body.email,
      ville: req.body.ville,
      experience: req.body.experience,
      specialites: req.body.specialites,
      evenement: req.body.evenement,
      details_evenement: req.body.details_evenement,
      portfolio: req.body.portfolio,
      motivation: req.body.motivation,
      photos: urls,
    };

    console.log("✅ Nouvelle candidature :", data);
    res.status(200).json({ message: "Dossier reçu", data });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur en écoute sur http://localhost:${PORT}`));

