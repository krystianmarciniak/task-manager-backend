// zarządza relacją zadanie ↔ etykieta, która etykieta jest przypisana do którego zadania
const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /tasks/:id/labels
router.post("/tasks/:id/labels", async (req, res) => {
  try {
    const { id } = req.params;
    const { label_id } = req.body;

    if (!label_id) {
      return res.status(400).json({
        error: "label_id jest wymagane",
      });
    }

    await pool.query(
      `INSERT INTO task_labels (task_id, label_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, label_id]
    );

    res.status(201).json({
      task_id: id,
      label_id,
      message: "Etykieta przypisana",
    });
  } catch (error) {
    console.error(
      "Błąd przypisywania etykiety:",
      error.message
    );

    res.status(500).json({
      error: "Błąd serwera",
    });
  }
});

// DELETE /tasks/:id/labels/:labelId
router.delete("/tasks/:id/labels/:labelId", async (req, res) => {
  try {
    const { id, labelId } = req.params;

    await pool.query(
      `DELETE FROM task_labels
       WHERE task_id = $1
       AND label_id = $2`,
      [id, labelId]
    );

    res.json({
      message: "Etykieta została odpięta",
    });
  } catch (error) {
    console.error(
      "Błąd odpinania etykiety:",
      error.message
    );

    res.status(500).json({
      error: "Błąd serwera",
    });
  }
});

module.exports = router;