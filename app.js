// For local!!
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}



const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session'); 
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
// sanitizes against query selector injection
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const userRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews');
const dbUrl = process.env.DB_URL
// const dbUrl = 'mongodb://localhost:27017/yelp-camp'

const MongoDBStore = require("connect-mongo")
async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(result => {
    console.log('MongoDB Connected')
  })
  .catch((err) => {
    console.log('MongoDB Not Connected')
    console.log('error',err)
})

const app = express();

app.engine('ejs',ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(mongoSanitize())
// in order to get infos from post req.body 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
// show which HTTP request executed in console
// app.use(morgan('tiny'));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'
const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret:secret
  }
})

store.on("error", function (e) {
  console.log("SESSION STORE ERROR",e)
})

const sessionConfig = {
  store,
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    httpOnly: false,
    // secure: true,
    // HTTPS!!
    // // secure true ==> should only work over https

    // sameSite: 'None',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

// give cookie to a client
app.use(session(sessionConfig))
app.use(flash());

// Helmet
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://*.yoonthedeveloper.com/"
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://*.yoonthedeveloper.com/"
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://*.yoonthedeveloper.com/"
];
const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        // "https://yelp-camp-bucket.s3.eu-central-1.amazonaws.com/b66aaac00aa677a004b0939cecb045b2",
        // 'https://yelp-camp-bucket.s3.eu-central-1.amazonaws.com/1b6b3fb03b4ce0bbbe734a2da5f10f4e', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        // "https://images.unsplash.com/",
        "https://*"
      ],
          fontSrc    : [ "'self'", ...fontSrcUrls ],
          mediaSrc   : [ "https://res.cloudinary.com/dv5vm4sqh/" ],
          childSrc   : [ "blob:" ]
      }
  })
);
// helmet end


app.use(passport.initialize());
// for persistent login session, passport.session() must come AFTER session()
app.use(passport.session());
// authenticate from passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  console.log(res.locals.currentUser,'hello');
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// serving static asset
app.use(express.static( path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('home')
})

app.use('/',userRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)



app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found',404))
})

app.use((err, req, res, next) => {
  // // 500, somthing is wrong are default Values
  // const { statusCode = 500, message = "Something is wrong"} = err;
  const { statusCode = 500 } = err;
  if(!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error',{err})
})

// // FOR HTTP
// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Serving on port ${port}`)
// })

// FOR HTTPS!!
// const fs = require('fs')

// const https = require('https')
// const options = { // letsencrypt로 받은 인증서 경로를 입력
//   ca: fs.readFileSync('/etc/letsencrypt/live/a.yoonthedeveloper.com/fullchain.pem'),
//   key: fs.readFileSync('/etc/letsencrypt/live/a.yoonthedeveloper.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/a.yoonthedeveloper.com/cert.pem')
//   };

  // https.createServer(options, app).listen(443);
  const http = require('http')
  http.createServer(app).listen(3030);