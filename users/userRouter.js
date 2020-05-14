const express = require("express");

const router = express.Router();

const db = require("./userDb");
router.use(validateUserId, validateUser);

router.post("/", (req, res) => {
  const userInfo = req.body;

  db.insert(userInfo)
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      res.status(500).json({
        message: "There was an error saving the user to the database",
      });
    });
});

router.post("/:id/posts", (req, res) => {});

router.get("/", (req, res) => {
  db.get(req.query)
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ message: "The information can not be retreived" });
    });
});

router.get("/:id", (req, res) => {
  db.getById(req.params.id)
    .then((user) => {
      if (user) {
        res.status(200).json(user);
      } else {
        res
          .status(404)
          .json({ message: " The post with the specified ID does not exist." });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "The post information could not be retrieved",
      });
    });
});

router.get("/:id/posts", (req, res) => {
  db.getUserPosts(req.params.id)
    .then((post) => {
      if (post) {
        res.status(201).json(post);
      } else {
        res.status(404).json({ message: "not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "error on the request" });
    });
});

router.delete("/:id", (req, res) => {
  // do your magic!
  db.remove(req.params.id)
    .then((user) => {
      if (user > 0) {
        res.status(201).json({ message: "the user was deleted" });
      } else {
        res.status(404).json({ message: "not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: " there was an error" });
    });
});

router.put("/:id", (req, res) => {
  // do your magic!
  db.update(req.params.id, req.body)
    .then((resp) => {
      console.log("user has been updated");
      db.getById(req.params.id)
        .then((updatedUser) => {
          res.status(200).json(updatedUser);
        })
        .catch((err) => {
          res.status(500).json({
            message: "Error retrieving data after update",
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "error updating user",
      });
    });
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;
  const find = db.getById(id);
  if (find) {
    next();
  } else {
    res.status(400).json({ message: "invalid user id" });
  }
}

//SAME POST AND USER VALIDATION IN ONE FUNCTION
function validateUser(req, res, next) {
  if (req.method === "POST" || req.method === "PUT") {
    if (req.body.name) {
      next();
    } else if (req.body.text) {
      req.body.user_id = req.params.id;
      next();
    } else {
      res
        .status(400)
        .json({
          message: "the body of your post request is invalid or undefined",
        });
    }
  } else {
    next();
  }
}

module.exports = router;
