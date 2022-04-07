import { User } from "../models/index.js";
import { getToken } from "../securityConfig/jwt.js";
import { Op } from "sequelize";

export const signupUser = async (req, res) => {
  // check if admin is trying to create a new user
  if (!req.user || req.user.level !== 0) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  const { user_id, email, password, level } = req.body;
  const user = await User.create({
    user_id,
    email,
    password,
    level,
  });

  return res.status(201).json({
    message: "User created",
    user,
  });
};

export const updateUser = async (req, res) => {
  // check if admin is trying to update a user
  if (!req.user || req.user.level !== 0) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  const { id, password, level } = req.body;
  const user = await User.findOne({ where: { id } });

  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  user.update({
    password: password ? password : user.password,
    level: level ? level : user.level,
  });

  return res.status(200).json({
    message: "User updated",
    user,
  });
};
// auth controllers
// login user
export const login = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  const user = await User.findOne({
    where: {
      password: password,
      [Op.or]: [{ user_id: { [Op.eq]: username || "" } }, { email: { [Op.eq]: username || "" } }],
    },
  });
  if (!user) {
    return res.status(404).send({
      message: "Invalid credentials",
    });
  }
  const token = await getToken({
    id: user.id,
    user_id: user.user_id,
    email: user.email,
    level: user.level,
  });
  return res.json({
    message: "User logged in",
    user: {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      level: user.level,
      token,
    },
  });
};