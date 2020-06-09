const HttpError = require("../models/http_errors");
const { validationResult } = require("express-validator");
const userModel = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await userModel.find({}, "-password").exec();
  } catch (err) {
    return next(new HttpError("cannot fetch users, refresh your page", 500));
  }
  if (users.length > 0) {
    res
      .status(200)
      .json({ users: users.map((list) => list.toObject({ getters: true })) });
  } else {
    res.status(200).json({ users: [] });
    // return next(new HttpError('no user exist',401));
  }
};
const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid details for signing up", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await userModel.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError("something went wrong,try again to sign in", 500)
    );
  }

  if (existingUser) {
    return next(new HttpError("already email exists,please login insted", 422));
  } else {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (e) {
      return next(new HttpError("failed to take password , try again", 422));
    }
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      image: req.file.path,
      places: [],
    });

    try {
      await user.save();
    } catch (err) {
      return next(new HttpError("user cannot be created , try again", 500));
    }
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
    } catch (err) {
      return next(new HttpError("user cannot be created , try again", 500));
    }

    res.status(201).json({ userId: user.id, email: user.email, token: token });
  }
};
const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await userModel.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Logging in failed, try again logging in", 500));
  }
  //const user=
  if (!existingUser) {
    return next(new HttpError("email doesnt exist,Please sign up", 401));
  }
  let isValidPassowrd;
  try {
    isValidPassowrd = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Internal server error", 500));
  }
  if (isValidPassowrd) {
    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
    } catch (e) {
      new HttpError("Something went wrong, Please try again", 500)
    }

    res.status(200).json({
      userId:existingUser.id,
      email:existingUser.email,
      token:token
    });
  } else {
    return next(
      new HttpError("Invalid Credentials, could not log you in", 401)
    );
  }
};
module.exports = { getUsers, signUp, logIn };
