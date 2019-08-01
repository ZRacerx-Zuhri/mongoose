const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    validate(val) {
      var hasil = validator.isEmail(val);
      var biji = validator.isEmpty(val);

      if (biji) {
        throw new Error("Eh Ko G ada kosong");
      } else if (!hasil) {
        throw new Error("Eh harus email");
      }
    },
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(val) {
      var pass = validator.contains(val, "password");
      if (pass) {
        throw new Error("bukan password");
      }
    }
  },
  age: {
    type: Number,
    validate(val) {
      if (val == null) {
        throw new Error("umur kamu berapa ");
      }
    },
    min: 17
  },
  avatar: {
    type: Buffer
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  ]
});

userSchema.statics.loginWithEmail = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    // user tidak di temukan
    throw new Error("User not found");
  }

  // da_password: satuduatiga
  // user.password: $2b$08$efjBzkL
  // match: true or false
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Wrong password");
  }

  return user;
  /*
    {
        email: alvin@gmail.com,
        password: 2$sdTy^7gdsesd
    }
    email: alvin@gmail.com
    password: satuduatiga
    */
};

userSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
