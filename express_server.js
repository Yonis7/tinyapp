const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 3000; // default port 3000
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended: true}))

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

  const user = users[req.cookies['user_id']]

  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
 
})

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies['user_id']]

  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const key =  generateRandomString()
  urlDatabase[key] = longURL;
  // console.log(req.body); // Log the POST request body to the console
  // console.log('Updated urlDatabase-->', urlDatabase)
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})


app.get('/urls/:id/edit', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars)
})

app.post('/urls/:id', (req, res) => {

  // console.log('Route is /urls/:id')
  // console.log(req.body);
  // console.log(req.params);
  const newLongUrl  = req.body.longURL
  const shortUrl = req.params.id
  newLongUrl = urlDatabase[shortUrl] ;
  res.redirect('/urls')
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = getUserByEmail(email)

  if(!user) {
    return res.status(403).send('Invalid username or password inputed')
  }

  if (password !== user.password) {
    return res.status(403).send('Invalid username or password inputed')
  }
  res.cookie("user_id", user.id);
  //Res.cookie is an object that has key-value pair of { username: 'Client Username' }
  // console.log(req.cookies);
  res.redirect('/urls');
});

//When logout button is clicked
app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login')
})

//When regisgter is clicked
app.get('/register', (req, res) => {
res.render('urls_registration')
});

app.post('/register', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  let randomUserID = generateRandomString();
  
  
  //If email or password feilds are empty

  if (!email || !password) {
    return res.status(400).send({error: 'Please fill out Email or password.'});
  }

  //If Email already exsists.
  const existingUser = getUserByEmail(email)
  if(existingUser) {
    return res.status(400).send({error: 'This email already exsists'});
  }
  //create new user object with the user's id, email and password
  let newUser = {
    id: randomUserID,
    email: req.body.email,
    password: req.body.password
  };
  //add the new user object to the global users object
  users[randomUserID] = newUser;
  
  //set a user_id cookie containing the user's newly generated ID
  res.cookie("user_id", randomUserID);
  

  res.redirect('/urls');

  

});

app.get('/login', (req, res) => {
  res.render('urls_login');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(7)
}

const getUserByEmail = (email) => {

  for (const userId in users) {

    if(users[userId].email === email) {
      return users[userId]
    }
  }
}