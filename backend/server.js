const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');


app.use(bodyParser.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const noteschema = new mongoose.Schema({
    data: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const Note = mongoose.model('Note', noteschema);
const User = mongoose.model('User', UserSchema);

app.use(express.json());

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.headers['x-access-token'];

    if (!token) return res.status(403).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.get('/notes',verifyToken, async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.post('/note', verifyToken, async (req, res) => {
  try {
    const note = new Note({
      data: req.body.data
    });
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  console.log("Testing...");
    try {
      const {email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({email, password: hashedPassword });
      await newUser.save();
      console.log("User registered successfully");
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ error: 'User registration failed' });
    }
  });
  
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token, email: user.email });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});