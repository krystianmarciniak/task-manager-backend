// IMPORTY I KONFIGURACJA PODSTAWOWA
// Express, CORS, Swagger, dotenv oraz połączenie z PostgreSQL.
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();
const usersRoutes = require("./routes/users.routes");
const projectsRoutes = require("./routes/projects.routes");
const tasksRoutes = require("./routes/tasks.routes");
const timeLogsRoutes = require("./routes/timeLogs.routes");
const labelsRoutes = require("./routes/labels.routes");
const taskLabelsRoutes = require("./routes/taskLabels.routes");

const pool = require("./db");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/users", usersRoutes);
app.use("/projects", projectsRoutes);
app.use("/tasks", tasksRoutes);
app.use("/", timeLogsRoutes);
app.use("/labels", labelsRoutes);
app.use("/", taskLabelsRoutes);

app.get("/", (req, res) => {
  res.send("API działa poprawnie");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
