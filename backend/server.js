const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnify')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err.message));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/courses',      require('./routes/courses'));
app.use('/api/enrollments',  require('./routes/enrollments'));
app.use('/api/progress',     require('./routes/progress'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/quizzes',      require('./routes/quizzes'));
app.use('/api/leaderboard',  require('./routes/leaderboard'));

app.get('/api/health', (req, res) => res.json({ status: 'Learnify API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
