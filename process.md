# Getting started

## 4

`npm init`
`npm i express@4`

- keep all config in app.js

  ```js
  const express = require('express')
  const app = express()

  const statuscode = 200
  const port = 3000
  // route, callback
  // app.get/post/patch/delete
  app.get('/', (req, res) => {
    res.status(statuscode).
    //send('insert message here')
    .json({key:'value'});
  })

  app.listen(port, () => {
    //....
  })

  ```

## Rest architecture

- separate API for logical resources
- structured resource based URL
- HTTP methods(verb)
- stateless (handled by client)

## 6

good practice to use `api/v1/noun`
no blocking code inside event loop

```js
response.json({
  status: 'success'
  data: {
    //...
  }
})
```

## 07 - posting and reading request body

has to include middleware to read POST request. `app.use(express.json())` -- `req.body` (201-created) (204-no content)

## 08 - request parameters

`api/v1/.../:id` `?--optional` available at `req.params`

## 09 - Nicer way to show routes

`app.route(path) .get(func_name) .post(func_name) .patch(func_name) .delete(func_name)`

## Middleware

every process in between request is received and response is sent. All combined is called - Middleware stack (routes are middleware too)

`app.use((req, res, next))`- gets added to middleware stack
at the end of all requests- deligate to `next()` middleware

if some app needs some data- add it as a new req field.
`req.getTime = new Date().toISOString()`

## npm packages

morgan - gives intel about the request (route, response code, time taken)

## 15- Users

- getAllUsers
- CreateUser
  `for single users`
- getUser
- UpdateUser
- DeleteUser

## 16 - Separate Routers and mounting them

`const routerName = express.Router()` -- that is a middleware
route (HTTP method-defined method \[handlers\] attachment)
`app.use('route for family', routerName)` -- mounting the route

## 17 - Refactor the code

Make controller folder, for each schema/module to place handler- a new file.

- `exports.methodName`

Make router folder, for each schema- a new file.

- import necessary handlers functions (controllers)
- import express
- `const router = express.Router()`
- define routes and HTTP method
- `module.exports = router`
  mounted routers stay in `app.js` as of now. (have to import the )

## 18

check if data santization done in all stages...
if yes, use middleware to check sanitization of data. (place it in Route function) `router.param(id, (req, res, next, val) => ...)

## 19 - static files

`app.use(express.static('folder_path = `${\_\_dirname}/public`'))`

## 21 - environment variables

`app.get('env')`
`NODE_ENV= development npm server.js" `process.env` for all variables

use `config.env` to define variables
install dotenv `npm i dotenv`

- import dotenv
- `dotenv.config({path: './config.env'})` --- makes all variable from config.env available to `process.env.---`
  [NB: this should come on top, else reading variables would be problematic--- before loading app]

## 22 - formatting

`npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-config-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev`

```json
{
  "extends": ["airbnb", "prettier", "plugin:node/recommended"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-console": "warn",
    "consistent-return": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "req|res|next|val" }]
  }
}
```

# Database

Mongodb uses BSON- typed JSON- max 16Mb

## 07- create Local Database

MongoShell - cmd + mongo

`use db-name` -- if doesnt exist, create new

`database.collection.insertOne/Many({json})`
`show dbs`
`show collections`
`quit()`

### Create

`database.collection.insertOne/Many({json})`

### Query

`db.collections.find()`
`db.collections.find({key: "val"})`

- less than equals - `key:{$lte: val}`
- multiple values, speartated by comma
- or - `find({ $or: [{key: val}, {key, val}] })`
- specific fields `find({key:val}, {field: 1})`

### Update

-- 2 types : patch->update,

`db.collections.updateOne({what to update}, {$set: {key: val}})`
`db.collections.replace({what to update}, {$set: {key: val}})`

### delete

`db.collections.deleteMany({})`

## Mongoose

- define DATABASE to `config.env` , if local keep it on all the time
  `npm i mongoose`
- import mongoose to server

```js
const db = process.env.DATABASE.replace(<PASSWORD>, process.env.DATABASE_PASSWORDs)
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(con => )
```

### Models

- Schema

```js
const schema_name = new mongoose.Schema({
  name: {
    type: String,
    required: true // [true, 'error string'],
    default: "value",
    unique: true
  }
  no : Number,
})

const Modelname = mongoose.model('Modelname', schema_name)

module.exports = Modelname;
// const obj = new ModelName({key: val})

// obj.save()
//   .then(docThatisSaved =>{})
//   .catch(err => {})


// await Modelname.save({req.body/*data*/});
/// const data = await Modelname.find({})
// const data = await Modelname.findbyid(req.params.id)

// await Modelname.findByIdAndUpdate(req,param.id, req.body, { new :true })


```

catch error and send it to response

## MVC

Application logic(Controller)- about the implementation of application (eg- views/ managing request response)... bridge between model and views//

Business Logic (Model)- directly related to problem trying to solve (create data, check access, validate input)

- request - path defined in router
- router delicate the task to controller (consisting of handler fucntion)
- controller might need to retrieve document (from db with model) after performing necessary checks. Get the response and send back to client
- take view and inject the data (if we have a website)

# Query string

`req,query` gives us query string (stuff after ?)
exclude special ones like `page` or `sort`
key[gte]=val (for greater or less than operation)

```js
// building query
const queryObj =  {...req.query}
const exclueded = = [] // page sort limit fields
// additional operation
excluded.foreach(el => delete queryObj[el])
// const data = await Model.find(queryObj)
// filter - pagination, limit on page  , fields -- should be last step
let querystr = JSON.stringify(queryObj)
querystr = querystr.replace(regex, match => `$${match}`)


//const query = Model.find(queryObj)
const query = Model.find(JSON.parse(queryStr))
// sort by
if(req.query.sort)
  // if more than one, make the attributes split by space
  query = query.sort(req.query.sort)
else
  query = query.sort(req.query.sort)
// limit fields
if (req.query.fields)
  query = query.select(req.param.fields)
// pagination pageNo + limit_per_page
query = query.skip().limit( )

// execute query
const data = await query;
const data = await Model.find().where('key').equals('val')
```

- add alias (custom path for regular query)
  use midlleware to set custoom values for path

# Error Handing

`npm i ndb --save-dev`
on `package.json` - `"debug": "ndb server.js"`

## undefined path

catch it after all routes

```js
app.all('*', (req, res, next) => {
  const err = new Error('message');
  //err.statusCode =
  //err.status =
  res.status().json({});
  next(err); // skip all other middleware and straight to error
});
```

- global handler (Create a separate class for error Handling/controlling)

```js
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // define separate error message for production and development mode
  // use isOperational property for production mode, non operational errors shouldnt be sent- just mark it as "500"
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack, // for dev
    error: err, // for dev mode
  });
});
```

move all to a utils.error class

- AppError class to create new Error

```js
class AppError extends Erorr{
  constructor(message, statusCode) {
    super(message)
  }
  this.statusCode = statusCode;
  this.status = ${statusCode}.startsWith('4') ? 'fail' : 'error';
  this.isOperational = true; // errors created by us

  Error.captureStackTrace(this, this.constructor);
}

module.exports = AppError;
```

Time to modify error class for unhandled route

```js
app.all('*', (req, res, next) => {
  next(new AppError('message: unaccessible route', 404));
  // skip all other middleware and straight to error
});
```

## Async error handler

- goal is to aviod `try-catch` for async db operations
- make sure `catchAsync` returns another function, not the result of calling that function

```js
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //(err => next(err))
  };
};
```

## DB errors as operational

- no record found ('CastError')
- duplicate entry (error. code == 11000)
- validation error ('ValidatorError')
- Database Connection (outside application)
- illegal webtoken (jsonWebTokenError) - 401
- timer expired token (TokenExpiredError) - 401

## Unhandled rejection

- at the end of app

```js
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  // unhandled rejection- shut down
  server.close(() => {
    process.exit(1);
  });
});
```

```js
process.on('uncaughtException', (err) => {
  // same thing
});
```

# Authentication

- design user schema

## Users

- name
- email (unique, lowercase) // use validator
- username (unique, lowercase)
- photo (path)
- password (min char/length)
- password confirm (maybe in webpage)
- password changed at
- role
- password reset token
- password reset expires

## signup

- save the req.body -- filter input too
- return user

### manage passwords

```js
schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, n);
  this.passwordConfirm = undefined;
  next();
});
```

### JWT

- create if successful login/signup with some predefined key
- send to client
- jwt.io... token = `header(metadata) + payload(actual data)` (encoded) + `signature` (encrypted- by using data + secret key)

`npm i jsonwebtoken`
`jwt.sign(payload, secretKey, [options, callback])`

- just id is enough on send back to user on signup
- secret key is 32keys
- options- { expiresIn: process.env.ExpiresIn}
  `jwt.verify(token, secretKey, [options, callback])`

### login

```js
exports.login = (req, res, next) {
  const {email, password} = req.body;
  // check if theres any empty entry
  // await User.findOne({email}).select('+password')
  // match user pass to input password (user.methodName)
  // if ok, send response with token
  // Bearer token
}
```

- instance method: available in all documents of a collection  
  `schemaName.methods.methodName = async function(password, inputPass) {
  return await bcrypt.compare(password, inputpass);
}`

### Protect Route

- chain the middleware (to check authentication/authorization) for each route

```js
// check the token
if (req.headers.authorization && req.headers.authorization.startswith('Bearer'))
  token = req.headers.authorization.split(' ')[1];
// validate token
//if (!token) return error
const decoded = await promisify(jwt.verify)('token', secret_key);
// -- promisify from java utils
// check if user exists
const user = User.findbyId(decoded.id);
// if(!user) return Error
// check password change after token issue
if (user.passChanged(deconded.iat)) return next(error);

next();
```

```js
schemaName.methods.passChanged = async function(jwtTime) {
  if(this.passwordChangedAt)
    const changedTime = parseInt(this.passwordChangedAt.getTime()/1000, 10) // 10 at the end is base
   return jwTtime < changedTime;
}
```

### Permission

- check if logged in
- then restrict (default- user)

```js
// arguement is array of permitted users
exports.restrict = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role))
      // return next(error)
  }
}
```

#### forget password

- find user by unique identifier (email/username)

---

- generate random token (instance method at user)
  `resettoken = crypto.randombytes(#bytes).toString('hex')` -
- encrypt token with built in crypto module `crypto.createHash('sha256').update(resetToken).digest('hex')`
- set it to model field the encrypted entry
- set expires time
- `resettoken` unencrypted is to

---

- `await user.save({validateBeforeSave: false})`

## Data Modeling

- one to one (person-name)
- one to many
  - **one to few**: movie-award
  - **one to many**: movie review
  - **one to ton**: logging info
- many to many: (actor-movie)
  ways to represent (relationship type, query type)
- embedded - one to few - mostly read, not written (less change) - connected data
- normalized/referenced
  - child references (child id is stored)
  - parent refernce (parent is mentioned at child)
  - two way (child + parent)
    - (many to ton/many to many)
    - frequent updates
    - both data is queried separately

I want to act as a web developer. I have build an API with nestjs for basic support for a bug tracker system. The goal for you will be to build a frontend for the system, that supports the api I built. The prisma file for the system is
