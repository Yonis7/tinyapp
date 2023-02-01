const express = require("express");
var session = require("express-session");
const app = express();
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 3000
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
};

function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(7);
}

// const urlDatabase = {

//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

const urlsForUser = (userId) => {
  let newObj = {};

  for (shortUrl in urlDatabase) {
    if (userId === urlDatabase[shortUrl].userID) {
      
      newObj[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return newObj;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  console.log(req.session.user_id);
  const templateVars = { urls: urlDatabase, user: user };
  console.log(`Cookies ${req.session.user_id}`);
  console.log(`User id if signed in: ${req.session.user_id}`);

  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send(`Login to create a new URL`);
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { urls: urlDatabase, user: user };

  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
  };
  const url = urlDatabase[req.params.id];
  const userURLS = urlsForUser(templateVars.user.id);

  if (!templateVars.user) {
    res.status(404).send("Please log in");
  
  } else if(!url ) {
    res.status(404).send("URL not found");
  
  } else if (!userURLS[req.params.id]) {
    res.status(404).send("Unable to access this URL");
  
  } else {
    res.render("urls_show", templateVars);
  }
    
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userIdValue = req.session.user_id;
  const key = generateRandomString();
  urlDatabase[key] = {
    longURL,
    userID: userIdValue,
  };
  // console.log(req.body); // Log the POST request body to the console
  // console.log('Updated urlDatabase-->', urlDatabase)
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };

  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/:id/edit", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  const id = req.params.id;
  const user = users[req.session.user_id];
  const templateVars = {
    id,
    longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  // console.log('Route is /urls/:id')
  // console.log(req.body);
  // console.log(req.params);
  const newLongUrl = req.body.longURL;
  const shortUrl = req.params.id;

  if (!urlDatabase[shortUrl]) {
    res.status(404).send("URL not found");
  } else {
    urlDatabase[shortUrl].longURL = newLongUrl;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10); 
  let user = getUserByEmail(email);
  console.log(user);

  if (!user) {
    return res.status(403).send("Invalid username or password inputed");
    // res.send('Not a user')
  }

  // if (password !== user.password) {
  //   return res.status(403).send("Invalid username or password inputed");
  // }
  //Check if passwords match
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  console.log(isPasswordCorrect);
  if (!isPasswordCorrect) {
    return res.status(403).send({ error: "Invalid username or password inputed" });
  }
  req.session.user_id = user.id;

  //Res.cookie is an object that has key-value pair of { username: 'Client Username' }
  // console.log(req.cookies);
  res.redirect("/urls");
});

//When logout button is clicked
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//When regisgter is clicked
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration");
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let randomUserID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword)

  //If email or password feilds are empty

  if (!email || !password) {
    return res
      .status(400)
      .send({ error: "Please fill out Email or password." });
  }

  //If Email already exsists.
  const existingUser = getUserByEmail(email);

  if (existingUser) {
    return res.status(400).send({ error: "This email already exsists" });
  }
  
  //create new user object with the user's id, email and password
  let newUser = {
    id: randomUserID,
    email: req.body.email,
    password: req.body.password,
  };
  //add the new user object to the global users object
  users[randomUserID] = newUser;

  //set a user_id cookie containing the user's newly generated ID
  req.session.user_id = randomUserID;


  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




