//TASKS

const Task = require("./models/task");

//API
const express = require("express");
const app = express();
const port = 2019;
//cors
const cors = require("cors");

app.use(cors());

app.use(express.json());

//Bcrypt
const bcrypt = require("bcrypt");

//MULTER
const multer = require("multer");
const sharp = require("sharp");

const upload = multer({
  limits: {
    fileSize: 10000000
  },
  fileFilter(req, file, cb) {
    var ava = file.originalname.match(/\.(jpg|png|jpeg)$/);
    if (!ava) {
      cb(new Error("Please upload file ext jpg,jpeg,png"));
    }
    cb(null, true);
  }
});

//CREATE AVATAR
app.post("/User/:id/avatar", upload.single("Avatar"), (req, res) => {
  const dataid = req.params.id;

  sharp(req.file.buffer)
    .resize({ width: 250 })
    .png()
    .toBuffer()
    .then(result => {
      User.findById(dataid).then(user => {
        user.avatar = result;

        user.save().then(() => {
          res.send("upload berhasil");
        });
      });
    });
});

//getavatar
app.get("/User/avatar/:id", (req, res) => {
  const id = req.params.id;
  User.findById(id).then(gambar => {
    res.send(gambar.avatar);
  });
});

//MONGOOSE
var mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://zuhri:planetbekasi@clusterkomplek-v1cur.mongodb.net/zuhridatabase?retryWrites=true&w=majority",
  {
    // Parser string URL
    useNewUrlParser: true,

    // ensureIndex(), usang
    // createIndex(), baru
    useCreateIndex: true
  }
);

//MODEL
const User = require("./models/user");

app.get("/", (req, res) => {
  res.send("Berhasil Connect");
});
//ADD ONE USER
app.post("/User/input", (req, res) => {
  const { name, email, password, age } = req.body;

  const data_name = name;
  const data_email = email;
  const data_password = password;
  const data_age = age;

  const person = new User({
    name: data_name,
    age: data_age,
    email: data_email,
    password: data_password
  });
  person
    .save()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

//READ USER BY ID

app.get("/User/:id", (req, res) => {
  const data_id = req.params.id;

  User.findById(data_id).then(result => {
    res.send(result);
  });
});

//READ USER BY ALL
app.get("/User", (req, res) => {
  User.find().then(result => {
    res.send(result);
  });
});

//Update Data
app.patch("/User/:id", (req, res) => {
  const userid = req.params.id;
  const newname = req.body.namedit;

  User.findById(userid).then(val => {
    val.name = newname;
    val
      .save()
      .then(result => {
        res.send("Berhasil");
      })
      .catch(err => {
        res.send(err);
      });
  });
});

//Update User Photo
app.patch("/User/:id", (req, res) => {
  const userid = req.params.id;
  const newname = req.body.namedit;

  User.findById(userid).then(val => {
    val.name = newname;
    val
      .save()
      .then(result => {
        res.send("Berhasil");
      })
      .catch(err => {
        res.send(err);
      });
  });
});

//update task kosong
app.patch("/User/task/:id", (req, res) => {
  User.findById(req.params.id).then(result => {
    result.tasks = [];
    result.save().then(() => {
      res.send("update");
    });
  });
});

//Delete

app.delete("/User/:id", (req, res) => {
  const iduser = req.params.id;

  User.findByIdAndDelete(iduser).then(result => {
    if (!result) {
      return res.send(`data id ${iduser} tidak ada`);
    }

    res.send(`data dengan id ${iduser} Berhasil dihapus`);
  });
});

// const User = mongoose.model("User", {
//   name: String,
//   age: Number
// });

// const person = new User({ name: "zurex", age: 17 });

// CREATE ONE TASK
app.post("/tasks/:userid", (req, res) => {
  const data_desc = req.body.description;
  const user_id = req.params.userid;

  User.findById(user_id).then(user => {
    if (!user) {
      res.send("User Not Avail");
    }
    const task = new Task({
      description: data_desc,
      owner: user_id
    });
    // console.log(task);
    user.tasks.push(task._id);
    user.save().then(() => {
      task.save().then(() => {
        res.send(task);
      });
    });
  });
});

// LOGIN USER
app.post("/users/login", async (req, res) => {
  const data_email = req.body.email;
  const data_pass = req.body.password;

  try {
    const hasil = await User.loginWithEmail(data_email, data_pass);
    res.send(hasil);
  } catch (error) {
    // Berasal dari throw di function loginWithEmail
    res.send(error.message);
  }
});

// UPDATE ONE TASK BY ID
// app.patch("/tasks/:id", (req, res) => {
//   const data_id = req.params.id;

//   Task.findById(data_id).then(task => {
//     //task: {description, completed}
//     task.completed = true;

//     task.save().then(task => {
//       res.send(task);
//     });
//   });
// });

//update

app.patch("/Task/:id", (req, res) => {
  const edit_des = req.body.description;
  const des_id = req.params.id;

  Task.findByIdAndUpdate(des_id).then(task => {
    if (!task) {
      res.send("tidak ada id");
    }
    task.description = edit_des;
    task.save().then(() => {
      res.send("update");
    });
  });
});

// DELETE ONE TASK BY ID
app.delete("/tasks/:id", (req, res) => {
  const data_id = req.params.id;

  Task.findByIdAndDelete(data_id).then(task => {
    res.send(task);
  });
});

// UPDATE TASK BY USERID AND TASKID
app.patch("/tasks/:userid/:taskid", (req, res) => {
  const data_userid = req.params.userid;
  const data_taskid = req.params.taskid;
  // Menemukan user by id
  User.findById(data_userid).then(user => {
    if (!user) {
      return res.send("User tidak ditemukan");
    }

    // Menemukan task by id
    Task.findOne({ _id: data_taskid }).then(task => {
      if (!task) {
        return res.send("Task tidak ditemukan");
      } else if (task.completed == false) {
        task.completed = true;
      } else {
        task.completed = false;
      }
      task.save().then(() => {
        res.send("Selesai dikerjakan");
      });
    });
  });
});

//Read task
app.get("/tasks/", (req, res) => {
  Task.find().then(result => {
    res.send(result);
  });
});

// app.get("/tasks/:userid", (req, res) => {
//   arr = [];

//   User.findById(req.params.userid).then(val => {
//     for (i = 0; i < val.tasks.length; i++) {
//       Task.findById(val.tasks[i])
//     }
//   });
// });

//Task di User
app.get("/tasks/:userid", (req, res) => {
  // Mencari user berdasarkan Id
  User.findById(req.params.userid)
    .populate({
      path: "tasks",
      options: {
        // sorting data secara descending berdasarkan field completed
        // 1 = Ascending : false -> true
        // -1 = Descending : true -> false
        sort: {
          completed: 1
        }
      }
    })
    .exec() // Mencari data ke tasks berdasarkan task id untuk kemudian di kirim sebagai respon
    .then(user => {
      // Jika user tidak ditemukan
      if (!user) {
        res.send("Unable to read tasks");
      }

      // Kirim respon hanya untuk field (kolom) tasks
      res.send(user.tasks);
    });
});

app.listen(port, () => {
  console.log("Berjalan di port " + port);
});
