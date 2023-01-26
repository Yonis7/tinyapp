const express = require("express");
const app = express();
const PORT = 8080; // default port 3000
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}))

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  urlDatabase[shortUrl] = newLongUrl;
  res.redirect('/urls')
});

app.post('/login', (req, res) => {
  const username = req.body.username
  res.cookie("username", username);
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(7)
}
