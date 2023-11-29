const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cryptojs = require('crypto-js');
const passport = require('passport')
require("dotenv").config();



const User = require('../models/User')

// User.find({}).then((users)=>{
//   console.log(users)
// })

router.get("/", async (req, res) => {
  try {
    res.render("auth/login", {
      style: "auth",
      script: "auth"
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.post("/setPin", async (req, res) => {
  try {
    const { userId, pin} = req.body;

    const user = await User.findOne({_id:userId})
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.setPin(pin)
    await user.save()
    res.redirect("/")
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error " });
  }
});

router.get("/logout", async (req, res) => {
     // Destroy the session
     req.session.destroy(err => {
      if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send('Internal Server Error');
      }

      // Redirect to the home page or any other desired route after logout
      res.redirect('/');
  });
});

router.get("/login", async (req, res) => {
  try {
    res.render("auth/login.ejs", {
      style: "auth",
      script: "auth"
    });
  } catch (err) {
    console.error("Error :", err);
    res.status(500).json({ error: "Error " });
  }
});

router.get("/signup", async (req, res) => {
  try {
    res.render("auth/signup", {
      style: "auth",
      script: "auth"
    });
  } catch (err) {
    console.error("Error :", err);
    res.status(500).json({ error: "Error " });
  }
});

router.post("/signup", async (req, res, next) => {
  const { userName, phoneNumber,email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try{
  const user = await registerUser(
    userName,
    email,
    phoneNumber,
    hashedPassword
  );

  user.updateAccountBalance(10, process.env.MoneyKey)

  
  req.login(user, async (err) => {
    if (err) {
      console.error(`Error logging in after registration: ${err.message}`);
      return next(err);
    }
    
    console.log(`Username: ${userName}, Password: ${password}`);
    console.log(`Username: ${userName}, Password: ${user.password}`);
    
    return res.render("pages/home", {
      
      user,
      style: "home",
      script: "auth"
    });
  });
}
catch (error) {
  console.error(`Error registering user: ${error.message}`);
  // Handle registration error (e.g., display an error message)
  res.render("auth/signup", {
    message: "Registration failed. Please try again. account already exists",
    // Other template variables as needed
  });
}
});

router.get("/forgotPassword", async (req, res) => {
  try {
    res.render("auth/forgotPassword", {
      style: "auth",
    });
  } catch (err) {
    console.error("Error :", err);
    res.status(500).json({ error: "Error " });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
});



router.get("/verify/:token", async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({ verificationToken: token });

  if (user) {
    user.emailVerified = true;
    user.verificationToken = "";
    await user.save();
    res.send("Email verification successful!");
  } else {
    res.send("Invalid verification token");
  }
});


function generateTokenHTML(userName, email, token) {
  const emailHtml = `
  <div style="max-width: 400px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
  <h2 style="color: #333;">Shoottoo Email Verification</h2>
  <p style="color: #555; margin-bottom: 20px;">Thank you for creating an account. Please click the button below to verify your email:</p>

  <!-- Replace 'verificationToken' with the actual verification token -->
  <a href="http:localhost:3030/auth/verify/${token}" style="display: inline-block; text-decoration: none; background-color: #ffc107; color: #333; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
    Confirm Email
  </a>

  <p style="color: #555; margin-top: 20px;">If you didn't register with Shoottoo, please ignore this email.</p>
</div>
  `;
  return emailHtml;
}

function sendTokenEmail(userName, emailAddress, token) {
  apiInstance
    .sendTransacEmail({
      sender: { email: `${emailAddress}`, name: userName },
      subject: "Tayant Pay Transaction",
      htmlContent: `<html>
      <head></head>
      <body></body>
      </html>
      `,
      messageVersions: [
        //Definition for Message Version 1
        {
          to: [
            {
              email: emailAddress,
              name: name,
            },
          ],
          htmlContent: generateTokenHTML(userName, emailAddress, token),
          subject: "Account Created! ~ Please Verify",
        },
        {
          to: [
            {
              //"email":`sublilosichembe180@gmail.com`,
              email: `chisalecharles23@gmail.com`,
              name: userName,
            },
          ],
          htmlContent: generateTokenHTML(userName, emailAddress, token),
          subject: "Client Created Email! ~ Shoottoo",
        },
      ],
    })
    .then(
      function (data) {
        //console.log(data);
      },
      function (error) {
        console.error(error);
      }
    );
}


async function registerUser(
  userName,
  email,
  phoneNumber,
  password,
 
) {
  try {
    // Generate a salt to use for hashing the password
    const salt = await bcrypt.genSalt(10);

    const verificationToken = crypto.randomBytes(20).toString("hex");
    
    
    console.log(verificationToken);

    // Hash the password using the salt
    //const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If a user with the same email exists, throw an error
      throw new Error("Email already exists");
    }

    
    const { privateKey, publicKey } = generateKeys();
    const hashedPrivateKey = await encryptPrivateKey(privateKey, password);
  console.log("privateKey "+ privateKey)
  const seed = "randodm"+Math.random().toString()
  console.log("privateKey hashed"+ hashedPrivateKey)
    // Create a new user document with the hashed password
    const user = new User({
    userName,
      phoneNumber,
      email,
      password,
      emailVerified: false,
      verificationToken,
      imageUrl:`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
      privateKey:hashedPrivateKey,
publicKey
    });

    //sendTokenEmail(firstName, email, verificationToken)

    // Save the user document to the database
    await user.save();
    return user;
    console.log(`User ${userName} registered successfully`);
  } catch (error) {
    console.error(`Error registering user: ${error.message}`);
  }
}


const generateKeys = () => {
  const privateKey = cryptojs.lib.WordArray.random(32); // You can adjust the length as needed
  const publicKey = cryptojs.SHA256(privateKey).toString();
  return { privateKey, publicKey };
};

// Function to hash keys using bcrypt


// Function to encrypt private key with user's password
const encryptPrivateKey = (privateKey, password) => {
  const encryptedPrivateKey = cryptojs.AES.encrypt(privateKey.toString(), password).toString();
  return encryptedPrivateKey;
};

// Function to decrypt private key with user's password
const decryptPrivateKey = (encryptedPrivateKey, password) => {
  const decryptedBytes = cryptojs.AES.decrypt(encryptedPrivateKey, password);
  const decryptedPrivateKey = decryptedBytes.toString(crypto.enc.Utf8);
  return decryptedPrivateKey;
};
module.exports = router;
 