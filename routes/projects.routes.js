const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /projects
router.get("/", async (req, res) => { // pobierz wszystkie projekty
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id ASC");
    res.json(result.rows); // wszystkie rekordy znalezione przez: SELECT ...
  } catch (error) {
    console.error("Błąd podczas pobierania projektów:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});
// POST /projects
router.post("/", async (req, res) => { // dodanie nowego projektu
  try {
    const { name, description } = req.body; // oznacza pobranie danych z BODY requestu
    // { "name": "System Kanban", "description": "Projekt aplikacji" } = req.body 
    if (!name || !String(name).trim()) { // pole name trim() usuwa: spacje z początku tekstu, spacje z końca
      return res.status(400).json({ error: "Nazwa listy jest wymagana." });
    }
    if (String(name).trim().length > 80) { // pole name trim() usuwa: spacje z początku tekstu, spacje z końca
      return res.status(400).json({ error: "Nazwa listy może mieć maksymalnie 80 znaków." }); // 400 Błąd walidacji
    }
    if (description && String(description).trim().length > 300) {
      return res.status(400).json({
        error: "Opis listy może mieć maksymalnie 300 znaków."
      });
    }
    // zarządzanie wieloma połączeniami do bazy
    const result = await pool.query( // wykonanie zapytania, połączenie z PostgreSQL, connection pool
      `INSERT INTO projects (name, description) VALUES ($1, $2)
       RETURNING *`,
      [String(name).trim(), description
        ? String(description).trim()
        : "Lista zadań utworzona z poziomu aplikacji"]
    );
    res.status(201).json(result.rows[0]); // HTTP Status Code = 201 => zasób został poprawnie utworzony
    // Jeśli użytkownik został dodany: to backend odpowiada: res.status(201) czyli mówi frontendowi: obiekt został utworzony poprawnie
    // 201 stosuje się głównie przy: POST / create
  } catch (error) {
    console.error("Błąd podczas dodawania projektu:", error.message);
    res.status(500).json({ error: "Nie udało się utworzyć listy." });
  }
});

// PUT /projects/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        error: "Nazwa listy jest wymagana."
      });
    }

    if (String(name).trim().length > 80) {
      return res.status(400).json({
        error: "Nazwa listy może mieć maksymalnie 80 znaków."
      });
    }

    if (description && String(description).trim().length > 300) {
      return res.status(400).json({
        error: "Opis listy może mieć maksymalnie 300 znaków."
      });
    }

    const result = await pool.query(
      `UPDATE projects
       SET name = $1,
           description = $2
       WHERE id = $3
       RETURNING *`,
      [
        String(name).trim(),
        description
          ? String(description).trim()
          : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Nie znaleziono projektu."
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Błąd podczas edycji projektu:", error.message);
    res.status(500).json({
      error: "Nie udało się zaktualizować projektu."
    });
  }
});

// GET /projects/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    // URL → req → SQL → PostgreSQL → result → response
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    // wykonanie zapytania, połączenie z PostgreSQL, connection pool
    if (result.rows.length === 0) { // PostgreSQL zwraca: rows = [] czyli pustą tablicę. Wtedy: rows.length wynosi: 0
      return res.status(404).json({ error: "Nie znaleziono projektu" }); // 404 Nie znaleziono
    }
    res.json(result.rows[0]); // To zwraca: rezultat całego zapytania SQL czyli wszystkie rekordy znalezione przez: SELECT ...,  res.json(result.rows) wysyła wynik do frontendu
  } catch (error) {
    console.error("Błąd podczas pobierania projektu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// DELETE /projects/:id
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    if (Number(id) <= 3) {
      return res.status(403).json({
        error: "Nie można usunąć bazowej listy projektu."
      });
    }

    await client.query("BEGIN");

    const projectResult = await client.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (projectResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Nie znaleziono listy." });
    }

    await client.query("DELETE FROM tasks WHERE project_id = $1", [id]);

    const deleteResult = await client.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Lista i powiązane zadania zostały usunięte.",
      deleted: deleteResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Błąd podczas usuwania projektu:", error.message);
    res.status(500).json({ error: "Nie udało się usunąć listy." });
  } finally {
    client.release();
  }
});

// GET /projects/:id/tasks
router.get("/:id/tasks", async (req, res) => { // pobierz dla konkretnego projektu wszystkie zadania 'pobierz wszystkie taski projektu o id = 3'
  try {
    const { id } = req.params;  // parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    // URL → req → SQL → PostgreSQL → result → response
    const projectCheck = await pool.query(  // wykonanie zapytania, połączenie z PostgreSQL, connection pool
      "SELECT * FROM projects WHERE id = $1", [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono projektu" });
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
      WHERE tasks.project_id = $1
      GROUP BY tasks.id, users.name, projects.name
      ORDER BY tasks.id ASC
    `,
      [id] // parametry przekazywane do SQL, posiada placeholder $1
      // pool.query("SELECT ... WHERE id = $1", [id]) PostgreSQL widzi: WHERE id = $1 ale jeszcze: nie zna wartości $1 Dopiero: [id] przekazuje: jaką wartość ma dostać $1
      // Czyli: pool.query("SELECT * FROM users WHERE id = $1", [id]); oznacza: „podstaw zmienną id w miejsce $1”
      // zabezpiecza przed SQL Injection
    );
    res.json(result.rows); // To zwraca: rezultat całego zapytania SQL czyli wszystkie rekordy znalezione przez: SELECT ...,  res.json(result.rows) wysyła wynik do frontendu
  } catch (error) {
    console.error("Błąd podczas pobierania zadań projektu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});


module.exports = router;