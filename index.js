const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./controllers/analytics');
const { mongoURI } = require('./config');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(morgan('dev')); // Logging middleware
app.use(express.json());

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', analyticsRoutes); // Analytics route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.get( '/' , (req,res) => {
    res.send("<h1>This is our homepage</h1>");
});
