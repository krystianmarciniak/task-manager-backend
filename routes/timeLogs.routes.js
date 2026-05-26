const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /tasks/:id/time-logs
router.get("/tasks/:id/time-logs", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM time_logs WHERE task_id = $1 ORDER BY created_at DESC",
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania logów czasu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// POST /tasks/:id/time-logs
router.post("/tasks/:id/time-logs", async (req, res) => {
  try {
    const { id } = req.params;
    const { hours, comment } = req.body;

    if (!hours || isNaN(hours)) {
      return res
        .status(400)
        .json({ error: "Pole hours jest wymagane i musi być liczbą" });
    }

    const result = await pool.query(
      `INSERT INTO time_logs (task_id, hours, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, hours, comment || ""]
    );

    await pool.query(
      `UPDATE tasks
       SET logged_hours = COALESCE(logged_hours, 0) + $1
       WHERE id = $2`,
      [hours, id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas dodawania logu czasu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// DELETE /time-logs/:id
router.delete("/time-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const logCheck = await pool.query(
      "SELECT * FROM time_logs WHERE id = $1",
      [id]
    );

    if (logCheck.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono wpisu" });
    }

    const log = logCheck.rows[0];

    const result = await pool.query(
      `DELETE FROM time_logs
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    await pool.query(
      `UPDATE tasks
       SET logged_hours = COALESCE(logged_hours, 0) - $1
       WHERE id = $2`,
      [log.hours, log.task_id]
    );

    res.json({
      message: "Wpis został usunięty",
      deletedLog: result.rows[0],
    });
  } catch (error) {
    console.error("Błąd podczas usuwania logu czasu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;