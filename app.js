import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Admin, Course, User } from "./models/index.js";
import { signUp, login, createCourse } from "./middlewares/validators/index.js";
import {
  authenticateUser,
  authenticateAdmin,
  authenticate,
} from "./middlewares/authenticateJwt.js";
import cors from "cors";

const app = express();

//Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

//Home
app.get("/", (req, res) => {
  res.send("hello there!");
});

//Sign Up
const signUpUser = async (req, res) => {
  const userData = req.body;
  const newUser = new User(userData);
  try {
    const savedUser = await newUser.save();
    const authorizationToken = await savedUser.generateAccessToken();
    res.status(200).json({ authorizationToken });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001) {
      // Duplicate key error, handle it appropriately
      res
        .status(409)
        .json({ error: "Duplicate key error. User already exists." });
    } else {
      // Handle other errors
      console.error("Error saving user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

const signUpAdmin = async (req, res) => {
  const adminData = req.body;
  const newAdmin = new Admin(adminData);
  try {
    const savedAdmin = await newAdmin.save();
    const authorizationToken = await savedAdmin.generateAccessToken();
    res.status(200).json({ authorizationToken });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001) {
      // Duplicate key error, handle it appropriately
      res
        .status(409)
        .json({ error: "Duplicate key error. User already exists." });
    } else {
      // Handle other errors
      console.error("Error saving user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

app.post("/user/signup", signUp, signUpUser);
app.post("/admin/signup", signUp, signUpAdmin);

const userLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  const foundUser = await User.findOne({ username: username });
  console.log(foundUser);
  if (foundUser == null) {
    res.status(404).send("User Not Found!");
  } else {
    const isPasswordCorrect = await foundUser.isPasswordCorrect(password);
    if (isPasswordCorrect) {
      const authorizationToken = await foundUser.generateAccessToken();
      res
        .status(200)
        .json({ authorizationToken, message: "authentication succesful!" });
    } else {
      res.status(404).json({ message: "wrong Credentials" });
    }
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const foundAdmin = await Admin.findOne({ username: username });
  if (!foundAdmin) {
    return res.status(404).send("User Not Found!");
  }
  const isPasswordCorrect = await foundAdmin.isPasswordCorrect(password);
  if (isPasswordCorrect) {
    const authorizationToken = await foundAdmin.generateAccessToken();
    res
      .status(200)
      .json({ authorizationToken, message: "authentication succesful!" });
  } else {
    res.status(404).json({ message: "wrong Credentials" });
  }
};

//Login
app.post("/user/login", login, userLogin);
app.post("/admin/login", login, adminLogin);

//Create Course

const addCourse = async (req, res) => {
  const createCourseData = req.body;
  console.log(createCourseData);
  const newCourse = new Course(createCourseData);
  try {
    const savedCourse = await newCourse.save();
    if (savedCourse)
      res.status(404).send({ message: "course Created Successfuly!!" });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

app.post("/courses/create", createCourse, authenticateAdmin, addCourse);

const getAllcourse = async (req, res) => {
  try {
    const allCourses = await Course.find({}).populate("instructor students");
    res.json(allCourses);
  } catch (err) {
    console.log(err);
    res.send("couldn't get all courses");
  }
};

app.get("/courses", authenticate, getAllcourse);
export default app;

const editCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    await Course.findByIdAndUpdate(courseId, req.body);
    res.send({ message: "updated the Course Details succesfully" });
  } catch (error) {
    res.send("error while updating course");
  }
};

app.put("/admin/courses/:courseId", authenticateAdmin, editCourse);

const purchaseCourse = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.headers.id;
  try {
    const user = await User.findByIdAndUpdate(userId, {
      $push: { coursesPurchased: courseId },
    });

    console.log(user);
    await Course.findByIdAndUpdate(courseId, { $push: { students: userId } });
    res.send({ message: "Course purchased succesfully!", courseId, userId });
  } catch (error) {
    res.send({ message: "Error while purchasing the course" });
  }
};
app.post("/user/courses/:courseId", authenticateUser, purchaseCourse);

app.get("/user/purchasedCourses", authenticateUser, async (req, res) => {
  const userId = req.headers.id;
  console.log(userId);
  try {
    const user = await User.findById(userId).populate("coursesPurchased");
    if (!user) {
      res.send({ message: "user not found!!" });
    }
    const purchasedCourse = user.coursesPurchased;
    res.json(purchasedCourse);
  } catch (error) {
    console.log(error);
    res.send({ message: "internal error!", err });
  }
});

app.get("/courses/:courseId", authenticate, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    console.log(courseId);
    const course = await Course.findById(courseId).populate("students");
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: "Course not found in database!" });
    }
  } catch (error) {}
});
