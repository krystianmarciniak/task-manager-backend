const express = require("express");
const router = express.Router();
const pool = require("../db");

// 6 | GET /tasks/:id/time-logs
router.get("/tasks/:id/time-logs", async (req, res) => {
  // endpoint pobiera historię logów czasu | przypisanych do konkretnego zadania
  try {
    const { id } = req.params;// pobranie ID zadania z adresu URL |
    // np. /tasks/5/time-logs → id = 5
    const result = await pool.query( // pobranie wszystkich wpisów czasu pracy | przypisanych do konkretnego taska
      // przekazanie wartości id do placeholdera $1 | parametryzacja chroni przed SQL Injection
      "SELECT * FROM time_logs WHERE task_id = $1 ORDER BY created_at DESC",
      [id]
      // ORDER BY created_at DESC | najnowsze wpisy czasu pojawią się jako pierwsze
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania logów czasu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// POST /tasks/:id/time-logs
// time_logs przechowuje historię wpisów
router.post("/tasks/:id/time-logs", async (req, res) => {
  // endpoint dodaje nowy wpis czasu pracy | dla konkretnego zadania
  try {
    const { id } = req.params;// ID taska pobrane z URL | np. /tasks/5/time-logs
    const { hours, comment } = req.body; // dane przesłane w BODY requestu 
    // np.{ "hours": 2, "comment": "Naprawa API" }
    if (!hours || isNaN(hours)) {
      // walidacja: | pole hours jest wymagane oraz musi być liczbą
      return res
        .status(400)
        .json({ error: "Pole hours jest wymagane i musi być liczbą" });
    }
    const result = await pool.query( // zapis nowego logu czasu do tabeli time_logs
      `INSERT INTO time_logs (task_id, hours, comment) VALUES ($1, $2, $3) RETURNING *`,
      [
        id,          // ID zadania 
        hours,       // liczba przepracowanych godzin 
        comment || ""// jeśli komentarz nie został podany,  ustaw pusty string
      ]
    );
    await pool.query(// aktualizacja pola logged_hours w tabeli tasks | po dodaniu nowego wpisu czasu
      `UPDATE tasks SET logged_hours = COALESCE(logged_hours, 0) + $1 WHERE id = $2`,
      [
        hours, // liczba godzin do dodania 
        id     // ID zadania aktualizowanego w tasks
      ]
      // COALESCE(logged_hours, 0) | jeśli logged_hours = NULL → użyj 0 następnie dodaj nową wartość hours
      //Po dodaniu wpisu czasu backend automatycznie aktualizuje sumę przepracowanych godzin w tabeli tasks.
    );
    res.status(201).json(result.rows[0]); // HTTP 201 Created | result.rows[0] = nowo utworzony wpis czasu pracy
  } catch (error) {
    console.error("Błąd podczas dodawania logu czasu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});
// DELETE /time-logs/:id
router.delete("/time-logs/:id", async (req, res) => {// endpoint usuwa wpis czasu pracy | przypisany do konkretnego zadania
  try {
    const { id } = req.params;// pobranie ID wpisu czasu z adresu URL | np. /time-logs/5 → id = 5
    const logCheck = await pool.query( // sprawdzenie czy wpis czasu istnieje w bazie danych
      "SELECT * FROM time_logs WHERE id = $1",
      [id]
      // przekazanie id do placeholdera SQL | parametryzacja chroni przed SQL Injection
    );
    if (logCheck.rows.length === 0) { // jeśli wpis nie istnieje → zwróć 404
      return res.status(404).json({ error: "Nie znaleziono wpisu" });
    }
    const log = logCheck.rows[0]; // pobranie danych istniejącego wpisu czasu | potrzebne do odjęcia godzin od taska
    const result = await pool.query(
      // aktualizacja pola logged_hours w tabeli tasks | po usunięciu wpisu czasu
      `DELETE FROM time_logs WHERE id = $1 RETURNING *`, // RETURNING * zwraca usunięty rekord
      [id]
    );
    await pool.query(
      // aktualizacja pola logged_hours w tabeli tasks | po usunięciu wpisu czasu
      // COALESCE(logged_hours, 0) | jeśli logged_hours = NULL → użyj 0
      // następnie odejmij wartość usuwanego logu
      `UPDATE tasks SET logged_hours = COALESCE(logged_hours, 0) - $1 WHERE id = $2`,
      [
        log.hours,  // przechowuje historię wpisów | liczba godzin do odjęcia
        log.task_id // ID zadania powiązanego z wpisem czasu
      ]
    );
    //Po usunięciu wpisu czasu backend automatycznie odejmuje liczbę godzin od sumy logged_hours w tabeli tasks.
    res.json({
      message: "Wpis został usunięty", // odpowiedź sukcesu
      deletedLog: result.rows[0],  // deletedLog zawiera usunięty wpis czasu
    });
  } catch (error) {
    console.error("Błąd podczas usuwania logu czasu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;