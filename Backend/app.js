require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const buyerRoutes = require('./routes/buyerRoutes');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const webhookController = require('./controllers/webhookController');

// Passport config
require('./config/passport')(passport);

// Initialize app
const app = express();

// Security Middleware (Early)
// Security Middleware (Early)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Set security HTTP headers with cross-origin allowed for static assets

// Logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Stripe Webhook (Must be before express.json)
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Prevent NoSQL injection (custom wrapper for Express 5 compatibility)
app.use((req, res, next) => {
  ['body', 'params', 'headers', 'query'].forEach((k) => {
    if (req[k]) mongoSanitize.sanitize(req[k]);
  });
  next();
});
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cookieParser());

// Session store configuration
const sessionStore = (MongoStore.create || MongoStore.default.create)({
  mongoUrl: process.env.MONGO_URI,
  collectionName: 'sessions',
  ttl: 7 * 24 * 60 * 60, // 7 days
  autoRemove: 'native'
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'marbofinal_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Dynamic Rate Limiting (Applied after user is identified)
const dynamicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Admins get 2000 requests per 15 mins, others get 300
    if (req.user && req.user.role === 'admin') return 2000;
    return 300;
  },
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', dynamicLimiter);

// Serve uploaded files as static assets (production-safe absolute path)
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/buyer', buyerRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Basic route
app.get('/', (req, res) => res.send('Triple Portion Backend API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
