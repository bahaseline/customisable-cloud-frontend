const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const filesRoutes = require('./routes/files');
const listsRoutes = require('./routes/lists');
const tagsRoutes = require('./routes/tags');
const itemsRoutes = require('./routes/items');
const { requireAuth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authLimiter, authRoutes);

app.use('/api', apiLimiter);

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.use('/api/files', filesRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/items', itemsRoutes);

app.use(errorHandler);

module.exports = app;
