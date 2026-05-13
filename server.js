const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API działa poprawnie");
});

function isValidTaskStatus(status) {
  return ["todo", "in_progress", "done"].includes(status);
}

function normalizeDueDate(dueDate) {
  if (!dueDate) return null;

  const date = new Date(dueDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return dueDate;
}

async function userExists(userId) {
  if (!userId) return true;

  const result = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [userId]
  );

  return result.rows.length > 0;
}

async function projectExists(projectId) {
  if (!projectId) return true;

  const result = await pool.query(
    "SELECT id FROM projects WHERE id = $1",
    [projectId]
  );

  return result.rows.length > 0;
}

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
    console.error("Błąd podczas pobierania zadań:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

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

// POST /users
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Pole name jest wymagane" });
    }
    if (!email || !String(email).trim()) {
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
      `INSERT INTO users (name, email)
       VALUES ($1, $2)
       RETURNING *`,
      [String(name).trim(), normalizedEmail]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "Użytkownik o tym adresie e-mail już istnieje" });
    }
    console.error("Błąd podczas dodawania użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas pobierania użytkownika:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// PUT /users/:id
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Pole name jest wymagane" });
    }
    if (!email || !String(email).trim()) {
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
      `UPDATE users
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING *`,
      [String(name).trim(), normalizedEmail, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    res.json(result.rows[0]);
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

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING *`,
      [id]
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

app.get("/users/:id/tasks", async (req, res) => {
  try {
    const { id } = req.params;

    const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    const result = await pool.query(
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
      [id]
    );

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

// POST /projects
app.post("/projects", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Nazwa listy jest wymagana." });
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
      `INSERT INTO projects (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [
        String(name).trim(),
        description
          ? String(description).trim()
        : "Lista zadań utworzona z poziomu aplikacji"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas dodawania projektu:", error.message);
    res.status(500).json({ error: "Nie udało się utworzyć listy." });
  }
});

app.get("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);

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

    const result = await pool.query(
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
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Błąd podczas pobierania zadań projektu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// POST /tasks
app.post("/tasks", async (req, res) => {
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

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        error: "Pole title jest wymagane"
      });
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
app.put("/tasks/:id", async (req, res) => {
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
      deletedTask: result.rows[0],
    });
  } catch (error) {
    console.error("Błąd podczas usuwania zadania:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.delete("/projects/:id", async (req, res) => {
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

app.get("/tasks/:id/time-logs", async (req, res) => {
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

app.post("/tasks/:id/time-logs", async (req, res) => {
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
      `UPDATE tasks SET logged_hours = COALESCE(logged_hours, 0) + $1 WHERE id = $2`,
      [hours, id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd podczas dodawania logu czasu:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.delete("/time-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const logCheck = await pool.query("SELECT * FROM time_logs WHERE id = $1", [id]);

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
      `UPDATE tasks SET logged_hours = COALESCE(logged_hours, 0) - $1 WHERE id = $2`,
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

app.get("/labels", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM labels ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Błąd pobierania etykiet:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/labels", async (req, res) => {
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

app.put("/labels/:id", async (req, res) => {
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

app.delete("/labels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM labels WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono etykiety" });
    }
    res.json({ message: "Etykieta została usunięta", deleted: result.rows[0] });
  } catch (error) {
    console.error("Błąd usuwania etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/tasks/:id/labels", async (req, res) => {
  try {
    const { id } = req.params;
    const { label_id } = req.body;
    await pool.query(
      "INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, label_id]
    );
    res.status(201).json({ task_id: id, label_id });
  } catch (error) {
    console.error("Błąd przypisania etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.delete("/tasks/:id/labels/:labelId", async (req, res) => {
  try {
    const { id, labelId } = req.params;
    await pool.query(
      "DELETE FROM task_labels WHERE task_id = $1 AND label_id = $2",
      [id, labelId]
    );
    res.json({ message: "Etykieta odpięta" });
  } catch (error) {
    console.error("Błąd odpinania etykiety:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
