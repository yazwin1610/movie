const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const axios = require('axios');
const path = require('path');

const app = express();

// Firebase configuration
const serviceAccount = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Signup Route
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { email, password, location, phone } = req.body;
  try {
    await db.collection('users').add({ email, password, location, phone });
    res.redirect('/login');
  } catch (error) {
    res.send('Error creating account');
  }
});

// Login Route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const snapshot = await db.collection('users').where('email', '==', email).where('password', '==', password).get();
    if (!snapshot.empty) {
      res.redirect('/dashboard');
    } else {
      res.send('Invalid credentials');
    }
  } catch (error) {
    res.send('Error logging in');
  }
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Search Route
app.post('/search', async (req, res) => {
  const { movieName } = req.body;
  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=d5ecf965&t=${movieName}`);
    res.render('result', { movie: response.data });
  } catch (error) {
    res.send('Error fetching movie details');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
