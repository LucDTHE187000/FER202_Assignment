const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const apiRoutes = require('./src/routes/api');

app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
