const express = require("express");
const router = express.Router();
const pool = require("../db");

// ENDPOINTY UŻYTKOWNIKÓW - USERS
// CRUD użytkowników Create-POST Read-GET Update-PUT Delete-DELETE/PATCH oraz pobieranie zadań przypisanych do użytkownika.

//GET /users
router.get("/", async (req, res) => { // Pobranie wszystkich użytkowników
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC"); // wszystkie rekordy z tabeli users
    res.json(result.rows); // Zwrócenie całej tablicy użytkowników
  } catch (error) {
    console.error("Błąd podczas pobierania użytkowników:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// GET /users/:id
router.get("/:id", async (req, res) => { // Pobranie jednego użytkownika [:id] To parametr URL. GET /users/5
  try {
    const { id } = req.params; // parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }
    res.json(result.rows[0]); // zwraca wynik jednego użytkownika 
  } catch (error) {
    console.error("Błąd podczas pobierania użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// POST /users
router.post("/", async (req, res) => { // dodawanie uzytkownika 
  try {
    const { name, email } = req.body;
    if (!name || !String(name).trim()) { // pole name trim() usuwa: spacje z początku tekstu, spacje z końca tekstu.
      return res.status(400).json({ error: "Pole name jest wymagane" });
    }
    if (!email || !String(email).trim()) { // pole email
      return res.status(400).json({ error: "Pole email jest wymagane" });
    }
    const normalizedEmail = String(email).trim().toLowerCase(); // jest zabezpieczeniem przed: SQL Injection bo jest używane '$1, $2'
    if (!normalizedEmail.includes("@")) { // wymagany znak malpa
      return res.status(400).json({
        error: "Adres e-mail musi zawierać znak @."
      });
    }
    if (String(name).trim().length > 80) { // dla imie dlugosc do 79 znakow
      return res.status(400).json({
        error: "Nazwa użytkownika może mieć maksymalnie 80 znaków."
      });
    }
    if (normalizedEmail.length > 120) { // dla email dlugosc do 119 znakow
      return res.status(400).json({
        error: "Adres e-mail może mieć maksymalnie 120 znaków."
      });
    }
    const result = await pool.query( // PostgreSQL po INSERT zwraca nowo dodanego użytkownika.
      `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`,
      [String(name).trim(), normalizedEmail]
    );
    res.status(201).json(result.rows[0]); // zwraca rezultat dodania użytkownika result.rows[0] pierwszy rekord zwrócony przez PostgreSQL
    // użytkownik został dodany poprawnie, oto dane nowo utworzonego użytkownika
  } catch (error) {
    if (error.code === "23505") { // 23505 to specjalny kod błędu PostgreSQL, naruszenie unikalności danych nie można dodać: krystian@gmail.com  drugi raz.
      return res
        .status(409)
        .json({ error: "Użytkownik o tym adresie e-mail już istnieje" });
    }
    console.error("Błąd podczas dodawania użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// PUT /users/:id
router.put("/:id", async (req, res) => { // edycja zadania
  try {
    const { id } = req.params; // parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    const { name, email } = req.body; // dane wysłane w BODY requestu: znaczenie pobiera name = "Krystian" email = "krystian@gmail.com"
    if (!name || !String(name).trim()) { // pole name trim() usuwa: spacje z początku tekstu, spacje z końca
      return res.status(400).json({ error: "Pole name jest wymagane" });
    }
    if (!email || !String(email).trim()) { // pole name trim() usuwa: spacje z początku tekstu, spacje z końca
      return res.status(400).json({ error: "Pole email jest wymagane" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({
        error: "Adres e-mail musi zawierać znak @."
      });
    }
    if (String(name).trim().length > 80) {
      return res.status(400).json({
        error: "Nazwa użytkownika może mieć maksymalnie 80 znaków."
      });
    }
    if (normalizedEmail.length > 120) {
      return res.status(400).json({
        error: "Adres e-mail może mieć maksymalnie 120 znaków."
      });
    }
    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`,
      // Mapowanie wygląda tak '$1 String(name).trim()', '$2 normalizedEmail', '$3 id'
      // Dlaczego $1, $2 PostgreSQL sam bezpiecznie podstawia dane
      [String(name).trim(), normalizedEmail, id] // przekazanie wartości.
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }
    res.json(result.rows[0]); // zwraca wynik dla PUT /users/:id
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "Użytkownik o tym adresie e-mail już istnieje" });
    }
    console.error("Błąd podczas edycji użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// DELETE /users/:id
router.delete("/:id", async (req, res) => { // usunięcie urzytkownika 
  try {
    const { id } = req.params;// parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`, [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }
    res.json({
      message: "Użytkownik został usunięty",
      deletedUser: result.rows[0],
    });
  } catch (error) {
    console.error("Błąd podczas usuwania użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.get("/:id/tasks", async (req, res) => { // pobierz wszystkie zadania konkretnego użytkownika
  try {
    const { id } = req.params;// parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    // userCheck.rows tablica rekordów zwróconych z PostgreSQL
    // Jeśli użytkownik istnieje: rows = [{id: 5, name: "Krystian"}] Wtedy: rows.length wynosi:1
    if (userCheck.rows.length === 0) { // jeśli nie znaleziono użytkownika
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }
    const result = await pool.query(
      // użytkownik: id = 5 backend: szuka wszystkich tasków: assigned_user_id = 5
      // Jeśli w zapytaniu są też projekty LEFT JOIN projects ... to backend dodatkowo: dołącza informacje o projekcie
      `
      SELECT
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.status,
        tasks.due_date,
        tasks.created_at,
        tasks.assigned_user_id, 
        tasks.project_id,
        tasks.estimated_hours,
        tasks.logged_hours,
        users.name AS assigned_user_name,
        projects.name AS project_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', l.id, 'name', l.name, 'color', l.color, 'icon', l.icon)
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) AS labels
      FROM tasks
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      LEFT JOIN projects ON tasks.project_id = projects.id
      LEFT JOIN task_labels tl ON tasks.id = tl.task_id
      LEFT JOIN labels l ON tl.label_id = l.id
      WHERE tasks.assigned_user_id = $1
      GROUP BY tasks.id, users.name, projects.name
      ORDER BY tasks.id ASC
    `,
      [id] // parametry przekazywane do SQL, posiada placeholder $1
      // pool.query("SELECT ... WHERE id = $1", [id]) PostgreSQL widzi: WHERE id = $1 ale jeszcze: nie zna wartości $1 Dopiero: [id] przekazuje: jaką wartość ma dostać $1
      // Czyli: pool.query("SELECT * FROM users WHERE id = $1", [id]); oznacza: „podstaw zmienną id w miejsce $1”
      // zabezpiecza przed SQL Injection
    );
    // wynik trafia do result.rows
    res.json(result.rows); // To zwraca: rezultat całego zapytania SQL czyli wszystkie rekordy znalezione przez: SELECT ...,  res.json(result.rows) wysyła wynik do frontendu
  } catch (error) {
    console.error("Błąd podczas pobierania zadań użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;