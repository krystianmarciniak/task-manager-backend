// zarządza relacją zadanie ↔ etykieta, która etykieta jest przypisana do którego zadania
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 5 | POST /tasks/:id/labels
router.post("/tasks/:id/labels", async (req, res) => {  
  // endpoint przypisuje etykietę do konkretnego zadania | relacja many-to-many: | tasks ↔ labels
  try {
    const { id } = req.params;// ID zadania pobrane z adresu URL | np. /tasks/5/labels → id = 5
    const { label_id } = req.body;// ID etykiety pobrane z BODY requestu | np. {"label_id": 3}
    if (!label_id) { // walidacja: przypisanie etykiety wymaga podania label_id
      return res.status(400).json({
        error: "label_id jest wymagane",});
    }
    await pool.query(
      // $1 = task_id | $2 = label_id
      // task_labels tabela pośrednia relacji many-to-many 
      // czyli: jedno zadanie → wiele etykiet | jedna etykieta → wiele zadań
      `INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,// jeśli relacja już istnieje, | PostgreSQL ignoruje INSERT i nie zgłosi błędu i nie doda duplikatu
      [id, label_id]
      // przekazanie parametrów do placeholderów SQL | parametryzacja chroni przed SQL Injection
    );
    res.status(201).json({// HTTP 201 Created | relacja task ↔ label została utworzona
      task_id: id, // ID zadania
      label_id, // ID przypisanej etykiety
      message: "Etykieta przypisana",
    });
  } catch (error) {
    console.error(
      "Błąd przypisywania etykiety:",
      error.message
    );  // obsługa błędu po stronie backendu lub PostgreSQL
    res.status(500).json({
      error: "Błąd serwera",});
  }
});
// task_labels

// DELETE /tasks/:id/labels/:labelId
router.delete("/tasks/:id/labels/:labelId", async (req, res) => {// endpoint odpina etykietę od konkretnego zadania
  // usuwa relację many-to-many: | task ↔ label
  try {
    const { id, labelId } = req.params;   // pobranie parametrów z adresu URL
    // /tasks/5/labels/3
    // id = 5      → ID zadania
    // labelId = 3 → ID etykiety
    await pool.query(
      // usunięcie relacji z tabeli pośredniej task_labels
      // NIE usuwa:
      // - samego taska
      // - samej etykiety
      // usuwa wyłącznie powiązanie między nimi
      `DELETE FROM task_labels WHERE task_id = $1 AND label_id = $2`,
      [id, labelId]
      // przekazanie parametrów do placeholderów SQL
      // $1 = task_id
      // $2 = label_id
      // parametryzacja chroni przed SQL Injection
    );
    res.json({ message: "Etykieta została odpięta", });// odpowiedź sukcesu | relacja task ↔ label została usunięta
  } catch (error) {
    console.error( "Błąd odpinania etykiety:", error.message
    );
    res.status(500).json({ error: "Błąd serwera", });
  }
});

module.exports = router;