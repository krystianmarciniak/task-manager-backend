const express = require("express");
const router = express.Router();
const pool = require("../db");

// 2 ENDPOINTY ZADAŃ - TASKS Obsługa pobierania, dodawania, edycji i usuwania zadań.
function isValidTaskStatus(status) { // => Walidacja statusu zadania
  return ["todo", "in_progress", "done"].includes(status);
}
// funkcja normalizująca / oczyszczająca datę zadania
function normalizeDueDate(dueDate) { //=> Walidacja daty
  if (!dueDate) return null;// jeśli dueDate nie istnieje → zwróć NULL, brak daty nie powoduje błędu walidacji
  const date = new Date(dueDate);// próba konwersji tekstu na obiekt Date JavaScript
  if (Number.isNaN(date.getTime())) { // // getTime() zwraca liczbę milisekund
    return null;//  // jeśli wynik = NaN → data jest niepoprawna
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
    //GROUP BY tasks.id, users.name, projects.name =>wymagane, ponieważ zapytanie używa JSON_AGG dla etykiet grupuje rekordy tak, aby jedno zadanie miało jedną tablicę labels
    // COALESCE(..., '[]') AS labels => jeśli zadanie nie ma etykiet, zwróć pustą tablicę [] zamiast null => To jest ważne dla frontend
    res.json(result.rows); // zwraca wynik z tabeli zadania
  } catch (error) {
    console.error("Błąd podczas pobierania zadań:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});
// FUNKCJE POMOCNICZE Walidacja statusu zadania, daty oraz sprawdzanie istnienia użytkownika/projektu.
router.get("/:id", async (req, res) => { // pobranie jednego konkretnego zadania
  try {
    const { id } = req.params;// parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
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
      }
    }

    const normalizedStatus = status || "todo"; // użyj status, a jeśli go nie ma → ustaw 'todo'”
    const normalizedDueDate = normalizeDueDate(due_date); // oczyszczona / poprawiona wersja daty”
    // WALIDACJA DANYCH WEJSCIOWYCH zanim wykona INSERT lub UPDATE
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
      return res.status(400).json({
        error: "Nieprawidłowy status zadania. Dozwolone: todo, in_progress, done."
      });
    }

    if (assigned_user_id) { //wykonaj sprawdzenie tylko wtedy, gdy użytkownik przesłał assigned_user_id
      const userCheck = await pool.query(  // sprawdzenie czy istnieje użytkownik o podanym ID w tabeli users
        "SELECT id FROM users WHERE id = $1", // parametr przekazywany do zapytania SQL 
        [assigned_user_id]); // wartość assigned_user_id zostanie podstawiona w miejsce $1[assigned_user_id] => To tablica parametrów przekazywana do zapytania.
      if (userCheck.rows.length === 0) { // jeśli zapytanie nie zwróciło żadnego rekordu,
        return res.status(400).json({  // użytkownik o podanym ID nie istnieje
          error: "Nie istnieje użytkownik o podanym assigned_user_id."
        });
      }
    }
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
      RETURNING *`, // zwraca tablicę rekordów
      //[...] warstwa mapowania danych JavaScript → SQL, pobiera dane z req.body, wykonuje INSERT
      [
        String(title).trim(), // zamiana title na tekst + usunięcie spacji z początku i końca
        description ? String(description).trim() : null, // jeśli description istnieje → oczyść tekst
        normalizedStatus, // znormalizowany status zadania jeśli status nie został podany → ustaw domyślnie "todo"
        normalizedDueDate, // oczyszczona / poprawiona data, jeśli data jest błędna lub pusta → NULL
        assigned_user_id || null, // Jeśli: assigned_user_id = undefined → wynik: null
        project_id || null, // jeśli project_id nie istnieje → ustaw NULL, FOREIGN KEY do tabeli projects
        estimated_hours || 0, // jeśli estimated_hours nie istnieje → ustaw 0
      ]
    );
    res.status(201).json(result.rows[0]);// zwrócenie nowo utworzonego zadania (1 rekord INSERT),  HTTP 201 Created
  } catch (error) {
    console.error("Błąd podczas dodawania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// PUT /tasks/:id
router.put("/:id", async (req, res) => { // edycja jednego konkretnego zadania
  try {
    const { id } = req.params; // parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
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
      return res.status(400).json({ error: "Tytuł zadania może mieć maksymalnie 100 znaków." });
    }
    if (description && String(description).trim().length > 500) {
      return res.status(400).json({ error: "Opis zadania może mieć maksymalnie 500 znaków." });
    }
    if (due_date) {// wykonaj walidację tylko wtedy, gdy użytkownik przesłał due_date
      const parsedDate = new Date(due_date); //  próba zamiany tekstu na obiekt daty JavaScript  np. "2026-05-25" → poprawna data, JavaScript przechowuje datę wewnętrznie jako: liczbę milisekund od 1 stycznia 1970 roku (Unix Time)
      if (isNaN(parsedDate.getTime())) { // parsedDate.getTime() zwraca liczbę milisekund jeśli wynik = NaN → data jest niepoprawna
        return res.status(400).json({ error: "Nieprawidłowy format daty." });
        //  HTTP 400 Bad Request użytkownik przesłał błędny format daty
      }
    }
    const normalizedStatus = status || "todo"; // użyj status, a jeśli go nie ma → ustaw 'todo'”
    const normalizedDueDate = normalizeDueDate(due_date); // oczyszczona / poprawiona wersja daty”
    // WALIDACJA DANYCH WEJSCIOWYCH zanim wykona INSERT lub UPDATE
    // jeśli NIE istnieje użytkownik o podanym assigned_user_id

    if (!(await userExists(assigned_user_id))) {
      return res.status(400).json({ error: "Nie istnieje użytkownik o podanym assigned_user_id." });
    }
    if (!(await projectExists(project_id))) {
      return res.status(400).json({ error: "Nie istnieje lista o podanym project_id." });
    }
    if (!isValidTaskStatus(normalizedStatus)) {
      return res.status(400).json({
        error: "Nieprawidłowy status zadania. Dozwolone: todo, in_progress, done."
      });
    }

    if (assigned_user_id) {//wykonaj sprawdzenie tylko wtedy, gdy użytkownik przesłał assigned_user_id
      const userCheck = await pool.query(// sprawdzenie czy istnieje użytkownik o podanym ID w tabeli 
        // Ten drugi blok jest redundantny, ponieważ funkcja userExists() wykonuje już to samo sprawdzenie. Można go usunąć w ramach refaktoryzacji.
        
        "SELECT id FROM users WHERE id = $1",// parametr przekazywany do zapytania SQL 
        [assigned_user_id]);// wartość assigned_user_id zostanie podstawiona w miejsce $1[assigned_user_id] => To tablica parametrów przekazywana do zapytania.
      if (userCheck.rows.length === 0) {// jeśli zapytanie nie zwróciło żadnego rekordu,
        return res.status(400).json({ // użytkownik o podanym ID nie istnieje
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
        String(title).trim(),//zamiana title na tekst, usunięcie spacji z początku i końca
        description ? String(description).trim() : null, // jeśli description istnieje → oczyść tekst, jeśli nie istnieje → ustaw NULL w PostgreSQL
        normalizedStatus, // znormalizowany status zadania, np. domyślna wartość "todo"
        due_date || null,// jeśli due_date nie istnieje → ustaw NULL, brak terminu wykonania zadania
        assigned_user_id || null,// jeśli assigned_user_id nie istnieje → ustaw NULL, FOREIGN KEY do tabeli users
        project_id || null, // jeśli project_id nie istnieje → ustaw NULL, FOREIGN KEY do tabeli projects
        id,// ID zadania używane w WHERE id = $7, określa który rekord ma zostać zaktualizowany
        estimated_hours !== undefined ? estimated_hours : null, // jeśli estimated_hours zostało przesłane →, zaktualizuj wartość
        // w przeciwnym razie ustaw NULL, COALESCE w SQL zachowa poprzednią wartość
        logged_hours !== undefined ? logged_hours : null, // jeśli logged_hours zostało przesłane →, zaktualizuj wartość
        // w przeciwnym razie ustaw NULL, COALESCE zachowa istniejące dane w bazie
      ]);
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
    const { id } = req.params;// parametry z adresu URL czyli /users/5 destrukturyzacja obiektu w JavaScript.
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING *`, [id] );
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