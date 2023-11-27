import jwt from "jsonwebtoken";
import { User, Admin } from "../models/index.js";

async function authenticate(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  console.log(token);
  if (token != "null") {
    try {
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return res
              .status(400)
              .send("there is a problem with the Access Token You provided");
          }
          if (decoded.type == "user") {
            try {
              const user = await User.findOne({ id: decoded.id });
              if (!user) res.status(404).send("User not found!");
              next();
            } catch (error) {
              res.stauts(500).send("server error");
            }
          } else if (decoded.type == "admin") {
            try {
              const admin = await Admin.findOne({ id: decoded.id });
              if (!admin) res.status(404).send("Admin not found!");
              next();
            } catch (error) {
              res.stauts(500).send("server error");
            }
          } else {
            res.status(401).send("Unauthorized!");
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(401).json({ message: "Couldn't Find Access token" });
  }
}

const authenticateUser = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  if (token != "null") {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        res.status(404).send(`couldn't authorise the Token!`);
      } else {
        try {
          const foundUser = await User.findOne({
            id: decoded.id,
          });
          if (!foundUser) res.status(404).send("User not found!");
          req.headers["id"] = foundUser.id;
          next();
        } catch (error) {
          console.log(error);
        }
      }
    });
  } else {
    res.status(401).json({ message: "Couldn't Find Access token" });
  }
};

const authenticateAdmin = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  if (token != "null") {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        res.status(404).send(`couldn't authorise the Token!`);
      }
      try {
        const foundAdmin = await Admin.findOne({
          id: decoded.id,
        });
        if (!foundAdmin) res.status(404).send("Admin not found!");
        req.headers["id"] = foundAdmin.id;
        next();
      } catch (error) {
        console.log(error);
      }
    });
  } else {
    res.status(401).json({ message: "Couldn't Find Access token" });
  }
};

export { authenticateUser, authenticateAdmin, authenticate };
