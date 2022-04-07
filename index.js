import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import morgan from "morgan";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import formRoutes from "./routes/form.routes.js";
import db from "./utils/database.js";
import { User } from "./models/index.js";
dotenv.config();
console.log(process.env.NODE_ENV);
db.sync({
  force: process.env.FORCE_SYNC === "true" ? true : false,
})
  .then(() => {
    User.findOne({ where: { email: process.env.ADMIN_EMAIL } }).then(async (user) => {
      if (!user) {
        const defaultUser = await User.create({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          user_id: process.env.ADMIN_USER_ID,
          level: 0,
        });
        console.log("Default user created", defaultUser);
      }
    });
  })
  .catch((err) => console.log(err));
const app = express();
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cors());
app.use(morgan("dev"));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});



app.get("/", (req, res) => {
  return res.json({
    message: "Hello World",
  });
});

app.use("/api/user", userRoutes);
app.use("/api/form", formRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server started on port ${process.env.PORT || 5000}`);
});