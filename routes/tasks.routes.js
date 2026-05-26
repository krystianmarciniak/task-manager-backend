const express = require("express");
const router = express.Router();
const pool = require("../db");

// ENDPOINTY ZADAŃ - TASKS Obsługa pobierania, dodawania, edycji i usuwania zadań.
function isValidTaskStatus(status) { // => Walidacja statusu zadania
  return ["todo", "in_progress", "done"].includes(status);
}
function normalizeDueDate(dueDate) { //=> Walidacja daty
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return dueDate;
}
async function userExists(userId) { //=> Sprawdzanie istnienia użytkownika.
  if (!userId) return true;
  const result = await pool.query(
    "SELECT id FROM users WHERE id = $1", [userId]
  );
  return result.rows.length > 0;
}
async function projectExists(projectId) { //=> Sprawdzanie istnienia projektu.
  if (!projectId) return true;
  const result = await pool.query(
    "SELECT id FROM projects WHERE id = $1",
    [projectId]
  ); return result.rows.length > 0;
}
// ENDPOINTY PROJEKTÓW / LIST ZADAŃ - PROJECTS
// Obsługa list zadań oraz pobieranie zadań przypisanych do listy.

// GET /tasks
router.get("/", async (req, res) => { // pobieranie wszystkich zadań
  try {
    const result = await pool.query(`
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
      GROUP BY tasks.id, users.name, projects.name
      ORDER BY tasks.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania zadań:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});
// FUNKCJE POMOCNICZE Walidacja statusu zadania, daty oraz sprawdzanie istnienia użytkownika/projektu.
router.get("/:id", async (req, res) => { // pobranie jednego konkretnego zadania
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (result.rows.length === 0) {  // Obsługa sytuacji, gdy zadanie nie istnieje
      return res.status(404).json({ error: "Nie znaleziono zadania" });
    }
    res.json(result.rows[0]); // Zwrócenie znalezionego zadania
  } catch (error) {
    console.error("Błąd podczas pobierania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// POST /tasks
router.post("/", async (req, res) => { // Dodawanie zadania , POST w REST API zwykle oznacza: CREATE czyli tworzenie nowego rekordu.
  try {
    const {
      title,
      description,
      status,
      due_date,
      assigned_user_id,
      project_id,
      estimated_hours,
    } = req.body;
    if (!title || !String(title).trim()) { // jeśli undefined, null, "", String(title) zamienia wartość na tekst. 
      // jeśli title:- nie istnieje LUB - zawiera tylko spacje "      "
      // String(title)-zamienia wartość na tekst. 123→"123" , .trim() usuwa: spacje z początku i końca 
      return res.status(400).json({ error: "Pole title jest wymagane" });
    }
    if (String(title).trim().length > 100) {
      return res.status(400).json({ error: "Tytuł zadania może mieć maksymalnie 100 znaków." });
    }
    if (description && String(description).trim().length > 500) {
      return res.status(400).json({ error: "Opis zadania może mieć maksymalnie 500 znaków." });
    }
    if (due_date) { // jeśli użytkownik podał datę
      const parsedDate = new Date(due_date);
      // jeśli new Date("2026-05-25") to: new Date(due_date) tworzy poprawną datę
      // To zamienia datę na: liczbę milisekund od 1 stycznia 1970 może zwrócić: 1779667200000
      if (isNaN(parsedDate.getTime())) { // spróbuj zamienić tekst na datę
        return res.status(400).json({ error: "Nieprawidłowy format daty." }); // jeśli data jest niepoprawna → zwróć błąd
      }}

    const normalizedStatus = status || "todo"; // użyj status, a jeśli go nie ma → ustaw 'todo'”
    const normalizedDueDate = normalizeDueDate(due_date); // oczyszczona / poprawiona wersja daty”
    // jeśli NIE istnieje użytkownik o podanym assigned_user_id
    if (!(await userExists(assigned_user_id))) { // (assigned_user_id => ID użytkownika przypisanego do zadania
    // assigned_user_id: NIE przechowuje nazwy użytkownika tylko: ID użytkownika czyli klucz obcy: FOREIGN KEY
    // Czyli: tasks.assigned_user_id  → wskazuje na users.id
      return res.status(400).json({ error: "Nie istnieje użytkownik o podanym assigned_user_id." });
    }
    if (!(await projectExists(project_id))) {
      return res.status(400).json({ error: "Nie istnieje lista o podanym project_id." });
    }
    if (!isValidTaskStatus(normalizedStatus)) {
      return res.status(400).json({ error: "Nieprawidłowy status zadania. Dozwolone: todo, in_progress, done."
      });
    }

    if (assigned_user_id) { // jeśli assigned_user_id zostało podane
      const userCheck = await pool.query( // czy użytkownik istnieje w tabeli users
        "SELECT id FROM users WHERE id = $1", // znajdź użytkownika o konkretnym ID
        [assigned_user_id] );
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ error: "Nie istnieje użytkownik o podanym assigned_user_id."
        });
      }}

    const result = await pool.query(
      `INSERT INTO tasks (
        title,
        description,
        status,
        due_date,
        assigned_user_id,
        project_id,
        estimated_hours
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        String(title).trim(),
        description ? String(description).trim() : null,
        normalizedStatus,
        normalizedDueDate,
        assigned_user_id || null,
        project_id || null,
        estimated_hours || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas dodawania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// PUT /tasks/:id
router.put("/:id", async (req, res) => { // edycja jednego konkretnego zadania
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      due_date,
      assigned_user_id,
      project_id,
      estimated_hours,
      logged_hours,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Pole title jest wymagane" });
    }

    if (String(title).trim().length > 100) {
      return res.status(400).json({
        error: "Tytuł zadania może mieć maksymalnie 100 znaków."
      });
    }
    if (description && String(description).trim().length > 500) {
      return res.status(400).json({
        error: "Opis zadania może mieć maksymalnie 500 znaków."
      });
    }

    if (due_date) {
      const parsedDate = new Date(due_date);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          error: "Nieprawidłowy format daty."
        });
      }
    }

    const normalizedStatus = status || "todo";
    const normalizedDueDate = normalizeDueDate(due_date);

    if (!(await userExists(assigned_user_id))) {
      return res.status(400).json({
        error: "Nie istnieje użytkownik o podanym assigned_user_id."
      });
    }

    if (!(await projectExists(project_id))) {
      return res.status(400).json({
        error: "Nie istnieje lista o podanym project_id."
      });
    }

    if (!isValidTaskStatus(normalizedStatus)) {
      return res.status(400).json({
        error: "Nieprawidłowy status zadania. Dozwolone: todo, in_progress, done."
      });
    }

    if (assigned_user_id) {
      const userCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [assigned_user_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({
          error: "Nie istnieje użytkownik o podanym assigned_user_id."
        });
      }
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           due_date = $4,
           assigned_user_id = $5,
           project_id = $6,
           estimated_hours = COALESCE($8, estimated_hours),
           logged_hours = COALESCE($9, logged_hours)
       WHERE id = $7
       RETURNING *`,
      [
        String(title).trim(),
        description ? String(description).trim() : null,
        normalizedStatus,
        due_date || null,
        assigned_user_id || null,
        project_id || null,
        id,
        estimated_hours !== undefined ? estimated_hours : null,
        logged_hours !== undefined ? logged_hours : null,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono zadania" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas edycji zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.delete("/:id", async (req, res) => { // usuwanie zadania
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono zadania" });
    }

    res.json({
      message: "Zadanie zostało usunięte",
      deletedTask: result.rows[0],
    });
  } catch (error) {
    console.error("Błąd podczas usuwania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;