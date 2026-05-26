// zarządza słownikiem etykiet, co istnieje jako etykieta
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /labels
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM labels ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Błąd pobierania etykiet:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// POST /labels
router.post("/", async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Nazwa etykiety jest wymagana" });
    }

    const result = await pool.query(
      "INSERT INTO labels (name, color, icon) VALUES ($1, $2, $3) RETURNING *",
      [String(name).trim(), color || "blue", icon || "tag"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd dodawania etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// PUT /labels/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Nazwa etykiety jest wymagana" });
    }

    const result = await pool.query(
      "UPDATE labels SET name = $1, color = $2, icon = $3 WHERE id = $4 RETURNING *",
      [String(name).trim(), color || "blue", icon || "tag", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono etykiety" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd edycji etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// DELETE /labels/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM labels WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono etykiety" });
    }

    res.json({
      message: "Etykieta została usunięta",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("Błąd usuwania etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

  module.exports = router;