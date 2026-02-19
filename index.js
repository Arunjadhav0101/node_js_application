const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies and serve static files
app.use(express.static('public'));
app.use(express.json());

// In-memory data store for demonstration purposes
// NOTE: Data will be lost when the server restarts
const users = [];
const transactions = [];

// Helper function to simulate unique ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- API Routes ---

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const newUser = { id: generateId(), name, email, password }; // password stored as plain text for demo
  users.push(newUser);
  res.json({ message: 'Registration successful', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
});

// Get Transactions (Mocking user specific data by just returning all for demo simple auth)
// In a real app we'd filter by req.user.id from session/token
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// Add Transaction
app.post('/api/transactions', (req, res) => {
  const { description, amount, type, category } = req.body; // type: 'income' or 'expense'
  if (!description || !amount || !type) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const newTransaction = {
    id: generateId(),
    date: new Date(),
    description,
    amount: parseFloat(amount),
    type,
    category: category || 'General'
  };
  transactions.push(newTransaction);
  res.json(newTransaction);
});

// Dashboard Summary Stats
app.get('/api/stats', (req, res) => {
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;
  res.json({ income, expense, balance });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
