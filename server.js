const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { uploader } = require("./cloudinary");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/candidature", upload.array("photos", 5), async (req, res) => {
  try {
    const files = req.files;
    const urls = [];

    for (const file of files) {
      const result = await uploader.upload(file.path); // Upload dans dossier "nuit-des-tresses"
      urls.push(result.secure_url);
      fs.unlinkSync(file.path); // Supprime localement
    }

    // Récupérer autres champs formulaire
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

app.listen(3000, () => console.log("Serveur en écoute sur http://localhost:3000"));
