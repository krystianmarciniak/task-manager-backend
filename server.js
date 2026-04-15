const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API działa poprawnie");
});

app.get("/tasks", async (req, res) => {
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
        users.name AS assigned_user_name,
        projects.name AS project_name
      FROM tasks
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      LEFT JOIN projects ON tasks.project_id = projects.id
      ORDER BY tasks.id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania zadań:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono zadania" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas pobierania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania użytkowników:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas pobierania użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/users/:id/tasks", async (req, res) => {
  try {
    const { id } = req.params;

    const userCheck = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

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
        users.name AS assigned_user_name,
        projects.name AS project_name
      FROM tasks
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      LEFT JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.assigned_user_id = $1
      ORDER BY tasks.id ASC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania zadań użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania projektów:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono projektu" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas pobierania projektu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/projects/:id/tasks", async (req, res) => {
  try {
    const { id } = req.params;

    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono projektu" });
    }

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
        users.name AS assigned_user_name,
        projects.name AS project_name
      FROM tasks
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      LEFT JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.project_id = $1
      ORDER BY tasks.id ASC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania zadań projektu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      due_date,
      assigned_user_id,
      project_id
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Pole title jest wymagane" });
    }

    const result = await pool.query(
      `INSERT INTO tasks (
        title,
        description,
        status,
        due_date,
        assigned_user_id,
        project_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        title,
        description || null,
        status || "todo",
        due_date || null,
        assigned_user_id || null,
        project_id || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas dodawania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      due_date,
      assigned_user_id,
      project_id
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Pole title jest wymagane" });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           due_date = $4,
           assigned_user_id = $5,
           project_id = $6
       WHERE id = $7
       RETURNING *`,
      [
        title,
        description || null,
        status || "todo",
        due_date || null,
        assigned_user_id || null,
        project_id || null,
        id
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

app.delete("/tasks/:id", async (req, res) => {
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
      deletedTask: result.rows[0]
    });
  } catch (error) {
    console.error("Błąd podczas usuwania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});