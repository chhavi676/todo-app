# Todo App – Backend API

Ye ek **Node.js + Express + MongoDB** backend hai jisme user signup/login kar sakta hai (JWT token ke saath) aur apne todos create, read, update, delete kar sakta hai.

Is README me pehle poora **request flow** samjhaya gaya hai, phir **har layer aur har file ka code**, phir **DB schema** aur last me **poori API documentation**.

> Abhi role-based kaam (admin/user permissions) baaki hai. Jo abhi tak bana hai, sirf wahi yahan documented hai.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Setup & Run](#2-setup--run)
3. [Folder Structure](#3-folder-structure)
4. [Request Flow – Ek request kaise travel karti hai](#4-request-flow--ek-request-kaise-travel-karti-hai)
5. [Har Layer ka Code Explanation](#5-har-layer-ka-code-explanation)
6. [Database Schema](#6-database-schema)
7. [API Documentation](#7-api-documentation)
8. [Known Issues / Bugs](#8-known-issues--bugs)
9. [Aage ka kaam (Roadmap)](#9-aage-ka-kaam-roadmap)

---

## 1. Tech Stack

| Package | Kaam kya hai |
|---|---|
| `express` (v5) | HTTP server aur routing |
| `mongoose` | MongoDB se baat karne ke liye ODM (schema, model, queries) |
| `jsonwebtoken` | Login ke baad JWT access token banana aur verify karna |
| `bcrypt` | Password ko hash karna (one-way), taaki DB me plain password na jaye |
| `zod` | Request body / params / query ka validation |
| `cors` | Dusre domain (jaise frontend) se API call allow karna |
| `dotenv` | `.env` file se environment variables load karna |
| `nodemon` (dev) | File change hone par server auto-restart |

---

## 2. Setup & Run

**Step 1 – Dependencies install karo**

```bash
npm install
```

**Step 2 – Project root me `.env` file banao**

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=koi-lambi-random-secret-string
```

| Variable | Matlab |
|---|---|
| `PORT` | Server kis port pe chalega (default `3000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT token sign/verify karne ki secret key. Ise kabhi git pe push mat karna |

**Step 3 – Server chalao**

```bash
npm run dev     # development (nodemon, auto-restart)
npm start       # normal node
```

Console me ye dikhega:

```
Server is listening on 3000 : http://localhost:3000
DB connected successfully!
```

---

## 3. Folder Structure

```
todo-app/
├── server.js                      # Entry point: app banta hai, middlewares + routes lagte hain
├── .env                           # Secrets (git me nahi jata)
├── test.js                        # JWT sign/verify try karne ki scratch file (app ka part nahi)
└── src/
    ├── config/
    │   └── db.config.js           # MongoDB connection
    ├── routes/
    │   ├── user.routes.js         # /users ke endpoints
    │   └── todo.routes.js         # /todos ke endpoints
    ├── middlewares/
    │   ├── logger.middleware.js   # Har request ko console me log karta hai
    │   ├── auth.middleware.js     # JWT token check karta hai
    │   └── validation.middleware.js # Zod schema se request validate karta hai
    ├── validations/
    │   ├── user.validation.js     # User APIs ke Zod schemas
    │   └── todo.validation.js     # Todo APIs ke Zod schemas
    ├── controllers/
    │   ├── user.controller.js     # req/res handle karta hai, service ko call karta hai
    │   └── todo.controller.js
    ├── services/
    │   ├── user.service.js        # Business logic + DB queries
    │   └── todo.services.js
    ├── models/
    │   ├── user.model.js          # User schema + pre-save hook + comparePassword method
    │   └── todo.model.js          # Todo schema
    └── helpers/
        ├── auth.helper.js         # JWT generate / verify
        └── response.helper.js     # Sab APIs ka same response format
```

**Har layer ki ek hi zimmedari hai:**

| Layer | Zimmedari | Kya NAHI karta |
|---|---|---|
| **Route** | URL + HTTP method ko middlewares aur controller se jodta hai | Koi logic nahi |
| **Middleware** | Controller se pehle ka kaam: log, auth, validation | DB ka kaam nahi |
| **Controller** | `req` se data nikalta hai, service call karta hai, response bhejta hai | DB query nahi likhta |
| **Service** | Asli business logic + DB queries | `req`/`res` ko touch nahi karta |
| **Model** | Data ka shape, rules, hooks, methods | HTTP ke baare me kuch nahi jaanta |
| **Helper** | Chhote reusable utility functions | — |

Is separation ka fayda: kal ko agar same logic kisi cron job ya dusri jagah se chahiye, to service directly use ho sakti hai, kyunki usme `req`/`res` ki dependency nahi hai.

---

## 4. Request Flow – Ek request kaise travel karti hai

### 4.1 Overall flow

```
Client (Postman / Frontend)
   │
   ▼
server.js
   │
   ├─ 1. express.json()      → body ka JSON parse karke req.body me daalta hai
   ├─ 2. cors()              → cross-origin headers lagata hai
   ├─ 3. logger              → request ka time note karta hai (response ke baad log karega)
   │
   ├─ 4. Route match         → /users/*  ya  /todos/*
   │        │
   │        ▼
   │     Route-level middlewares (route file me jo order likha hai, usi order me):
   │        ├─ authMiddleware        → token check, req.userId + req.role set
   │        ├─ validate(…, 'params') → URL ka :id check
   │        └─ validate(…)           → body / query check
   │        │
   │        ▼
   │     Controller              → req se data nikala, service call kiya
   │        │
   │        ▼
   │     Service                 → business logic + Mongoose query
   │        │
   │        ▼
   │     Model (Mongoose)        → schema validation, pre hooks, methods → MongoDB
   │        │
   │        ▼
   │     Service result return → Controller → response.helper → JSON response
   │
   ▼
logger console me print karta hai:  POST /users -> 201 34ms
```

Kisi bhi step pe agar problem hui (token galat, validation fail), to wahi middleware response bhej deta hai aur `next()` call nahi hota, yani request aage nahi jaati.

### 4.2 Example 1 – Signup (`POST /users`)

```
POST /users  { name, email, password }
  → express.json()                      body parse hua
  → logger                              timer start
  → validate(userValidation.createUser) name/email/password check (Zod)
        ✗ fail → 400 { success:false, message:<zod error tree> }
  → userController.createUser
  → userService.createUser(req.body)
  → User.create(body)
        → pre('save') hook → password bcrypt se hash hua
        → MongoDB me save
  → AuthHelper.genAcessToken(user)      JWT bana
  → service return { id, token }
  → handleSuccess(res, data)            201 { success:true, message:'Success', payload:{ id, token } }
```

### 4.3 Example 2 – Protected API (`PATCH /todos/:id`)

```
PATCH /todos/65f...  Header: Authorization: Bearer <token>
  → authMiddleware
        token nahi / galat / expire → 401
        sahi → req.userId, req.role set
  → validate(todoValidation.todoId, 'params')  :id 24-char hex hai?   ✗ → 400
  → validate(todoValidation.updateTodo)        body me kam se kam ek field?   ✗ → 400
  → todoController.updateTodo
  → todoServices.updateTodo(req.userId, req.params.id, req.body)
  → Todo.findOneAndUpdate({ _id, userId }, payload, { new:true, runValidators:true })
        mila nahi → throw 'Todo not Found!' → controller ka catch → handleError → 500
  → handleSuccess(res, { id })
```

`{ _id, userId }` dono se query karne ka matlab: **ek user dusre user ka todo update nahi kar sakta**, kyunki `userId` token se aa raha hai, client se nahi.

---

## 5. Har Layer ka Code Explanation

### 5.1 `server.js` – Entry point

```js
require('dotenv').config();
```
Sabse pehli line. `.env` file padh ke `process.env` me daal deta hai. Isko sabse upar hona chahiye, warna baaki files ko `process.env.JWT_SECRET` etc. nahi milega.

```js
const app = express();
const PORT = process.env.PORT || 3000;
```
Express app bana. `.env` me PORT nahi hai to 3000.

```js
app.use(express.json());
app.use(cors());
app.use(logger)
```
**Global middlewares.** Har request pe, isi order me chalte hain:
- `express.json()` – request body ka JSON parse karke `req.body` me daalta hai. Iske bina `req.body` `undefined` hoga.
- `cors()` – sab origins ko allow karta hai (frontend alag port pe ho to bhi call kar sake).
- `logger` – hamara custom logger (neeche explain kiya hai).

```js
app.use('/todos', todoRoutes);
app.use('/users', userRoutes);
```
**Route mounting.** `/todos` se shuru hone wali har request `todo.routes.js` me jaati hai. Route file ke andar `/` likha hai to actual URL `/todos/` banega, `/:id` likha hai to `/todos/:id`.

```js
app.listen(PORT, () => {
    connectDB();
    console.log(...);
});
```
Server start hota hai, aur start hone ke baad DB connect hota hai.

---

### 5.2 `src/config/db.config.js` – Database connection

```js
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB connected successfully!');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
```
- `mongoose.connect()` MongoDB se connection banata hai. Ye connection poori app me shared rehta hai, isliye models ko alag se connect nahi karna padta.
- Connection fail hua to `process.exit(1)`, yani server band. Bina DB ke server chalane ka koi matlab nahi.

---

### 5.3 Routes

Route file sirf **wiring** karti hai: kaunsa method + URL → kaunse middlewares → kaunsa controller. Middlewares left se right chalte hain.

#### `src/routes/user.routes.js`

```js
router.post('/', validate(userValidation.createUser), userController.createUser);
router.post('/login', validate(userValidation.loginUser), userController.loginUser);
```
Signup aur login **public** hain, yani `authMiddleware` nahi laga. Logical hai, kyunki login se pehle token hota hi nahi.

```js
router.patch('/update/:id', authMiddleware, validate(userValidation.userId, 'params'),
              validate(userValidation.updateUser), userController.updateUser);
router.delete('/delete/:id', authMiddleware, validate(userValidation.userId, 'params'),
              userController.deleteUser);
```
Update aur delete **protected** hain. Pehle token check hota hai, phir `:id` ka format, phir body.

> Note: controller `req.params.id` use nahi karta, `req.userId` (token wala) use karta hai. Matlab user hamesha **sirf khud ko** update/delete kar sakta hai, URL me kuch bhi id ho. Details [Known Issues](#8-known-issues--bugs) me.

#### `src/routes/todo.routes.js`

```js
Router.get("/hello", authMiddleware, todoController.getTodo);
Router.post("/", authMiddleware, validate(todoValidation.createTodo), todoController.createTodo);
Router.get("/:id", authMiddleware, validate(todoValidation.todoId, "params"), todoController.getTodoById);
Router.patch("/:id", authMiddleware, validate(todoValidation.todoId, "params"),
             validate(todoValidation.updateTodo), todoController.updateTodo);
Router.delete("/:id", authMiddleware, validate(todoValidation.todoId, "params"), todoController.deleteTodo);
Router.get("/", authMiddleware, validate(todoValidation.getTodos, "query"), todoController.getTodos);
```
Saare todo routes **protected** hain.

**Route order kyun matter karta hai:** `/hello` ko `/:id` se **pehle** likhna zaroori hai. Agar `/:id` pehle hota, to `GET /todos/hello` me Express `hello` ko `id` samajh leta.

---

### 5.4 Middlewares

Middleware ek function hai `(req, res, next)`. Ye ya to:
- `next()` call karke request aage bhejta hai, ya
- khud `res.status(...).json(...)` bhej ke request wahi khatam kar deta hai.

#### `logger.middleware.js`

```js
const logger = async(req, res, next) =>{
    const start = Date.now();
    res.on("finish", () => {
        const ms = Date.now()-start
        console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${ms}ms`);
    })
    next();
}
```
- Request aate hi `start` time note hota hai.
- `res.on("finish")` ek event listener hai. Ye **response client ko chale jaane ke baad** chalta hai. Isliye isko final `statusCode` aur total time pata hota hai.
- `next()` turant call hota hai, logger request ko rokta nahi.

Output: `GET /todos/65f1... -> 201 12ms`

#### `auth.middleware.js`

```js
const authHeader = req.headers.authorization;
if(!authHeader || !authHeader.startsWith('Bearer ')){
    return res.status(401).json({ success: false, message: 'Access Token is Missing!' })
}
```
Header ka format hona chahiye `Authorization: Bearer <token>`. "Bearer" ka matlab: jiske paas ye token hai (bearer), wahi authorized hai.

```js
const token = authHeader.split(' ')[1]
```
`"Bearer abc.def.ghi"` ko space se tod ke dusra hissa, yani actual token.

```js
try {
    const decodedToken = AuthHelper.verifyAcessToken(token)
    if(decodedToken){
        req.userId = decodedToken.userId,
        req.role = decodedToken.role
    }
    next()
} catch (error) {
    return res.status(401).json({ success: false, message: error.message })
}
```
- Token verify hua to uske andar ka `userId` aur `role` **`req` pe chipka diya**. Ab aage ke saare middlewares/controllers `req.userId` use kar sakte hain.
- Token expire / galat signature / galat issuer hua to `jwt.verify` error throw karta hai, aur 401 jaata hai (jaise `jwt expired`, `invalid signature`).

**Security point:** `userId` hamesha token se aata hai, client ki body se nahi. Isliye koi bhi user apna `userId` change karke dusre ka data access nahi kar sakta.

#### `validation.middleware.js`

```js
const validate = (schema, source = "body") => {
  return (req, res, next) => { ... };
};
```
Ye **middleware factory** hai, yani ek function jo middleware return karta hai. Isse ek hi code se kisi bhi schema aur kisi bhi source (`body` / `params` / `query`) ko validate kar sakte hain:
```js
validate(todoValidation.createTodo)          // req.body check
validate(todoValidation.todoId, "params")    // req.params check
validate(todoValidation.getTodos, "query")   // req.query check
```

```js
const result = schema.safeParse(req[source]);
if (!result.success) {
  return res.status(400).json({ success: false, message: z.treeifyError(result.error) });
}
```
`safeParse` error throw nahi karta, `{ success, data, error }` return karta hai. Fail hua to 400, aur `z.treeifyError` errors ko field-wise tree me convert kar deta hai.

```js
Object.defineProperty(req, source, { value: result.data, writable: true, enumerable: true, configurable: true });
next();
```
Validation pass hone par `req.body` (ya params/query) ko **Zod ke parsed data se replace** kar dete hain. Iske fayde:
- **Extra fields hat jaate hain.** Zod object by default unknown keys strip karta hai. Koi signup me `"role": "admin"` bheje, to wo yahi hat jaayega aur DB tak nahi pahunchega.
- **Trim, defaults aur type conversion apply ho jaate hain.** Jaise query ka `"5"` string → `5` number (`z.coerce`).

`req.body = ...` seedha kyun nahi likha? Express 5 me `req.query` ek **getter** hai, usme direct assign nahi hota. `defineProperty` teeno sources pe kaam karta hai.

---

### 5.5 Validations (Zod schemas)

#### `user.validation.js`

```js
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
```
MongoDB ka `_id` 24 hex characters ka hota hai. Galat id DB tak jaaye to Mongoose `CastError` deta hai, isliye pehle hi 400 de dete hain.

| Schema | Fields | Rules |
|---|---|---|
| `createUser` | `name`, `email`, `password` | name 1–100 chars (trim), valid email max 100, password min 8 |
| `loginUser` | `email`, `password` | valid email, password khaali nahi |
| `updateUser` | `name?`, `email?` | dono optional (`.partial()`), lekin `.refine` se **kam se kam ek** chahiye. `password` aur `role` yahan allowed hi nahi, to update se change nahi ho sakte |
| `userId` | `id` | valid ObjectId |

#### `todo.validation.js`

| Schema | Fields | Rules |
|---|---|---|
| `createTodo` | `title`, `description` | title 3–50, description 3–2000 (dono trim) |
| `updateTodo` | `title?`, `description?` | `createTodo.partial()`, kam se kam ek field zaroori |
| `todoId` | `id` | valid ObjectId |
| `getTodos` | `page`, `limit` | `z.coerce.number()` (query string → number), page ≥ 1 default 1, limit 1–100 default 10 |

`updateTodo = createTodo.partial()` likhne ka fayda: rules ek hi jagah hain. Kal title ki max length badli to update me automatically apply ho jaayegi.

---

### 5.6 Controllers

Controller ka kaam bas itna hai:
1. `req` se zaroori cheezein nikalo (`req.body`, `req.params.id`, `req.userId`, `req.query`)
2. Service call karo
3. Success hua to `handleSuccess` / `handleOk`, error aaya to `handleError`

Har controller ek hi pattern follow karta hai:
```js
const updateTodo = async (req, res) => {
    try {
      const data = await todoServices.updateTodo(req.userId, req.params.id, req.body);
      return handleSuccess(res, data);
    } catch (error) {
      return handleError(res, error);
    }
};
```
Service me kahin bhi `throw new Error('...')` hua, to wo yahan `catch` me aata hai aur `handleError` se 500 response jaata hai.

#### `user.controller.js`

| Function | Service call | Success response |
|---|---|---|
| `createUser` | `userService.createUser(req.body)` | `handleSuccess` → 201 |
| `loginUser` | `userService.loginUser(req.body)` | `handleOk` → 200 |
| `updateUser` | `userService.updateUser(req.userId, req.body)` | `handleOk` → 200 |
| `deleteUser` | `userService.deleteUser(req.userId)` | `handleOk` → 200 |

#### `todo.controller.js`

| Function | Service call | Success response |
|---|---|---|
| `getTodo` | `todoServices.getTodo(req.userId)` | `handleSuccess` → 201 |
| `createTodo` | `todoServices.createTodo(req.userId, req.body)` | `handleSuccess` → 201 |
| `getTodoById` | `todoServices.getTodoById(req.userId, req.params.id)` | `handleSuccess` → 201 |
| `updateTodo` | `todoServices.updateTodo(req.userId, req.params.id, req.body)` | `handleSuccess` → 201 |
| `deleteTodo` | `todoServices.deleteTodo(req.userId, req.params.id)` | `handleOk` → 200 |
| `getTodos` | `todoServices.getTodos(req.userId, req.query)` | `handleSuccess` → 201 |

---

### 5.7 Services

Yahan asli kaam hota hai: DB queries aur business rules. Service ko `req`/`res` ka kuch pata nahi, sirf plain arguments leti hai aur plain data return karti hai (ya error throw karti hai).

#### `user.service.js`

**`createUser(body)`**
```js
const user = await User.create(body);          // pre('save') hook yahan chalega → password hash
const token = AuthHelper.genAcessToken(user)   // signup ke saath hi login, token mil gaya
return { id: user._id, token }
```
Password ya poora user object return nahi karte, sirf `id` aur `token`.

**`updateUser(userId, payload)`**
```js
const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })
if (!user) throw new Error('User Not Found!');
return user
```
- `new: true` → update ke **baad** wala document return karo (default purana deta hai).
- `runValidators: true` → update pe bhi schema rules (maxLength etc.) check karo. Default me Mongoose update pe validators nahi chalata.
- Return hone wale user me password nahi hota, kyunki schema me `select: false` hai.

**`deleteUser(userId)`**
```js
const user = await User.findByIdAndDelete(userId);
if (!user) throw new Error('User Not Found!');
return { message: 'User Removed Successfully!' }
```

**`loginUser(body)`**
```js
const user = await User.findOne(
    { email: String(body.email).toLowerCase() },
    { _id: 1, password: 1, role: 1 }
)
```
- Email lowercase karke dhoondte hain, kyunki DB me bhi lowercase save hota hai (schema me `lowercase: true`).
- Dusra argument **projection** hai, yani sirf ye fields lao. `password` schema me `select: false` hai, isliye yahan explicitly `password: 1` maangna padta hai, warna `user.password` undefined hoga.

```js
if (!user || !user.password) throw new Error("User doesn't Exists!");
const isMatch = user.comparePassword(body.password)
if (!isMatch) throw new Error('Invalid credentails!');
const token = AuthHelper.genAcessToken(user)
return { id: user._id, token }
```
`comparePassword` model ka custom method hai (neeche explain kiya hai). Password match hua to token generate hota hai.

> ⚠️ Yahan `await` missing hai, jiski wajah se **koi bhi password chal jaata hai.** [Known Issues](#8-known-issues--bugs) dekho.

#### `todo.services.js`

Har query me `userId` diya jaata hai, isliye har user sirf apne todos dekh/badal sakta hai.

| Function | Query | Return |
|---|---|---|
| `getTodo(userId)` | `Todo.find({ userId })` | User ke saare todos (array) |
| `createTodo(userId, payload)` | `Todo.create({ userId, ...payload })` | `{ id }` |
| `getTodoById(userId, todoId)` | `Todo.findOne({ _id: todoId, userId })` | `{ id, title, description }` |
| `updateTodo(userId, todoId, payload)` | `Todo.findOneAndUpdate({ _id, userId }, payload, { new, runValidators })` | `{ id }`, na mile to `'Todo not Found!'` |
| `deleteTodo(userId, todoId)` | `Todo.findOneAndDelete({ _id, userId })` | `{ message }`, na mile to `'Todo not Found!'` |
| `getTodos(query)` | `Todo.find().skip(...).limit(...)` + `countDocuments` | `{ todos, currentPage, limit, totalRecords, totalPage }` |

`createTodo` me `{ userId, ...payload }`: `userId` token se aata hai aur `payload` validated body se. Body me koi `userId` bheje bhi to Zod use pehle hi strip kar deta hai.

---

### 5.8 Models

#### `user.model.js`

**Schema** ([DB Schema](#6-database-schema) section me poori table hai). Kuch khaas options:
- `email: { unique: true, lowercase: true }` → MongoDB me unique index banta hai, aur save se pehle email lowercase ho jaata hai.
- `password: { select: false }` → koi bhi `find` query by default password **nahi** laayegi. Galti se bhi API response me password leak nahi hoga.
- `role: { enum: ['user', 'admin'], default: 'user' }` → sirf ye do values allowed, naya user hamesha `user`.
- `{ timestamps: true }` → Mongoose khud `createdAt` aur `updatedAt` add/update karta hai.
- `{ versionKey: false }` → `__v` field nahi banegi.

**Pre-save hook** (middleware jo DB me save hone se **pehle** chalta hai):
```js
user.pre('save', async function() {
    if(!this.isModified('password') || !this.password){
         return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})
```
- `function()` (arrow function nahi) isliye use kiya, kyunki `this` = jo document save ho raha hai. Arrow function me `this` nahi milta.
- `this.isModified('password')` → password badla hai tabhi hash karo. Warna user ka naam update karke `save()` karne par already-hashed password dobara hash ho jaata aur login toot jaata.
- `bcrypt.hash(password, 10)` → `10` salt rounds hain, yani hashing kitni slow/strong ho. Hash one-way hai, wapas plain password nahi nikal sakte.
- Mongoose 9 me async hook me `next()` ki zaroorat nahi. Promise resolve hua = aage badho.

> Dhyan do: ye hook sirf `save()` / `create()` pe chalta hai. `findByIdAndUpdate` pe **nahi** chalta. Isliye password update ka feature banana ho to `findById` → `user.password = ...` → `user.save()` karna hoga.

**Instance method:**
```js
user.methods.comparePassword = async function (userPassword){
    return bcrypt.compare(userPassword, this.password)
}
```
`schema.methods` me jo function daalo, wo har user document pe available hota hai: `user.comparePassword('abc')`. `bcrypt.compare` plain password ko usi salt se hash karke DB wale hash se match karta hai. Ye **Promise** return karta hai, isliye isko `await` ke saath call karna zaroori hai.

```js
const User = mongoose.model('User', user)
```
Schema se model bana. MongoDB me collection ka naam `users` hoga (Mongoose lowercase + plural kar deta hai).

#### `todo.model.js`

- `userId: { type: ObjectId, ref: "User", required: true, index: true }`
  - `ref: "User"` → baad me `.populate('userId')` karke poora user nikal sakte hain.
  - `index: true` → `userId` pe index, kyunki har query `userId` se filter hoti hai, to index se fast rahegi.
- `title: { unique: true, ... }` → **poore collection me** unique (sirf ek user ke andar nahi). Known issues me details hain.
- Collection ka naam: `todos`.

---

### 5.9 Helpers

#### `auth.helper.js`

```js
static genAcessToken(user) {
    const payload = { userId: user._id.toString(), role: user.role };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m", issuer: "chhavi" });
}
```
- **Payload** = token ke andar ka data. Ye encrypted **nahi** hota, sirf base64 hota hai, koi bhi decode karke padh sakta hai. Isliye password ya koi secret isme kabhi mat daalna.
- `JWT_SECRET` se **signature** banta hai. Koi payload badle (jaise role `admin` kar de) to signature match nahi karega aur verify fail ho jaayega.
- `expiresIn: "15m"` → token 15 minute me expire. Uske baad dobara login karna padega (abhi refresh token nahi hai).
- `issuer: "chhavi"` → token kisne banaya (`iss` claim).

```js
static verifyAcessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "chhavi" })
}
```
- Signature, expiry aur issuer teeno check hote hain. Kuch bhi galat ho to error throw hota hai.
- `algorithms: ["HS256"]` fix karna ek security best practice hai. Isse attacker `alg: none` jaisa trick use nahi kar sakta.

**JWT ke standard claims (reference ke liye):**

| Claim | Full form | Matlab |
|---|---|---|
| `sub` | Subject | Token kiske baare me hai (user) |
| `iat` | Issued At | Kab bana (unix seconds), `jwt.sign` khud daalta hai |
| `exp` | Expiry | Kab expire hoga |
| `nbf` | Not Before | Isse pehle valid nahi |
| `iss` | Issuer | Kisne banaya (hamare case me `chhavi`) |
| `aud` | Audience | Kis app/service ke liye bana |
| `jti` | JWT ID | Token ki unique id |

Hamare token ka decoded payload aisa dikhta hai:
```json
{ "userId": "65f1c2...", "role": "user", "iat": 1791310100, "exp": 1791311000, "iss": "chhavi" }
```

#### `response.helper.js`

Sab APIs ka response ek jaisa dikhe, isliye ye helper hai. Frontend ko hamesha pata hota hai ki `success`, `message`, `payload` milenge.

| Function | Status | Response |
|---|---|---|
| `handleSuccess(res, data, statusCode = 201)` | default 201 | `{ success: true, message: "Success", payload: data }` |
| `handleOk(res, payload = null)` | 200 | `{ success: true, message: "OK", payload }` |
| `handleError(res, error, statusCode = 500)` | default 500 | `{ success: false, message: error.message \|\| "Something went wrong", payload: null }` |

`error?.message` me optional chaining hai, yani `error` undefined ho to bhi crash nahi hoga.

---

## 6. Database Schema

**Database:** MongoDB · **Collections:** `users`, `todos`

### 6.1 `users`

| Field | Type | Required | Default | Constraints / Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `name` | String | ✅ | — | trim, max 100 |
| `email` | String | ✅ | — | **unique**, lowercase, trim, max 100 |
| `password` | String | ✅ | — | min 8, **bcrypt hash** store hota hai, `select: false` |
| `role` | String | — | `"user"` | enum: `user`, `admin` |
| `createdAt` | Date | auto | — | `timestamps: true` |
| `updatedAt` | Date | auto | — | `timestamps: true` |

**Indexes:** `_id`, `email` (unique)
**Hooks:** `pre('save')` → password hash
**Methods:** `comparePassword(plainPassword) → Promise<boolean>`

### 6.2 `todos`

| Field | Type | Required | Default | Constraints / Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `userId` | ObjectId → `User` | ✅ | — | index, todo ka owner |
| `title` | String | ✅ | — | **unique (global)**, trim, 3–50 |
| `description` | String | — | — | trim, 3–2000 |

**Indexes:** `_id`, `userId`, `title` (unique)
**Timestamps:** nahi hain

### 6.3 Relationship

```
users (1) ───────< (many) todos
  _id   ◄────────── userId
```
Ek user ke bahut saare todos ho sakte hain. Har todo ka exactly ek owner hai.

---

## 7. API Documentation

**Base URL:** `http://localhost:3000`

### 7.1 Common rules

**Authentication.** 🔒 wali APIs me ye header bhejna zaroori hai:
```
Authorization: Bearer <token>
```
Token signup ya login ke response me `payload.token` me milta hai. Validity: **15 minute**.

**Success response format**
```json
{ "success": true, "message": "Success" | "OK", "payload": <data> }
```

**Error responses**

| Status | Kab | Body |
|---|---|---|
| `400` | Zod validation fail | `{ "success": false, "message": { "errors": [...], "properties": { "<field>": { "errors": ["..."] } } } }` |
| `401` | Token missing | `{ "success": false, "message": "Access Token is Missing!" }` |
| `401` | Token invalid/expired | `{ "success": false, "message": "jwt expired" }` (jwt ka error message) |
| `500` | Service me error (not found, duplicate, galat password etc.) | `{ "success": false, "message": "<error message>", "payload": null }` |

Validation error example (`POST /todos` me `title: "ab"` bheja):
```json
{
  "success": false,
  "message": {
    "errors": [],
    "properties": {
      "title": { "errors": ["Too small: expected string to have >=3 characters"] }
    }
  }
}
```

### 7.2 Endpoints – Summary

| # | Method | Endpoint | Auth | Kaam |
|---|---|---|---|---|
| 1 | POST | `/users` | — | Signup |
| 2 | POST | `/users/login` | — | Login |
| 3 | PATCH | `/users/update/:id` | 🔒 | Apna profile update |
| 4 | DELETE | `/users/delete/:id` | 🔒 | Apna account delete |
| 5 | POST | `/todos` | 🔒 | Todo create |
| 6 | GET | `/todos/hello` | 🔒 | Apne saare todos |
| 7 | GET | `/todos` | 🔒 | Todos with pagination |
| 8 | GET | `/todos/:id` | 🔒 | Ek todo |
| 9 | PATCH | `/todos/:id` | 🔒 | Todo update |
| 10 | DELETE | `/todos/:id` | 🔒 | Todo delete |

---

### 7.3 User APIs

#### 1. Signup – `POST /users`

**Flow:** `validate(createUser)` → `createUser` controller → `userService.createUser` → `User.create` (pre-save hash) → token

**Body**

| Field | Type | Required | Rule |
|---|---|---|---|
| `name` | string | ✅ | 1–100 chars |
| `email` | string | ✅ | valid email, max 100 |
| `password` | string | ✅ | min 8 |

```json
{ "name": "Mohit", "email": "mohit@example.com", "password": "secret123" }
```

**Response `201`**
```json
{
  "success": true,
  "message": "Success",
  "payload": { "id": "65f1c2a9e4b0a1b2c3d4e5f6", "token": "eyJhbGciOiJIUzI1NiIs..." }
}
```

**Errors:** `400` validation · `500` email already exists (`E11000 duplicate key error ...`)

---

#### 2. Login – `POST /users/login`

**Flow:** `validate(loginUser)` → `loginUser` controller → `userService.loginUser` → `findOne` by email → `comparePassword` → token

**Body**

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

```json
{ "email": "mohit@example.com", "password": "secret123" }
```

**Response `200`**
```json
{
  "success": true,
  "message": "OK",
  "payload": { "id": "65f1c2a9e4b0a1b2c3d4e5f6", "token": "eyJhbGciOiJIUzI1NiIs..." }
}
```

**Errors:** `400` validation · `500` `"User doesn't Exists!"` · `500` `"Invalid credentails!"`

---

#### 3. Update User – `PATCH /users/update/:id` 🔒

**Flow:** `auth` → `validate(userId, params)` → `validate(updateUser)` → `updateUser` controller → `User.findByIdAndUpdate(req.userId)`

**Params:** `id` (ObjectId). Format check hota hai, lekin update hamesha **token wale user** ka hota hai.

**Body** (kam se kam ek field)

| Field | Type | Rule |
|---|---|---|
| `name` | string | 1–100 |
| `email` | string | valid email, max 100 |

```json
{ "name": "Mohit Uchit" }
```

**Response `200`** (updated user, bina password)
```json
{
  "success": true,
  "message": "OK",
  "payload": {
    "_id": "65f1c2a9e4b0a1b2c3d4e5f6",
    "name": "Mohit Uchit",
    "email": "mohit@example.com",
    "role": "user",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-10T12:00:00.000Z"
  }
}
```

**Errors:** `400` · `401` · `500` `"User Not Found!"`

---

#### 4. Delete User – `DELETE /users/delete/:id` 🔒

**Flow:** `auth` → `validate(userId, params)` → `deleteUser` controller → `User.findByIdAndDelete(req.userId)`

**Response `200`**
```json
{ "success": true, "message": "OK", "payload": { "message": "User Removed Successfully!" } }
```

**Errors:** `400` · `401` · `500` `"User Not Found!"`

---

### 7.4 Todo APIs

#### 5. Create Todo – `POST /todos` 🔒

**Flow:** `auth` → `validate(createTodo)` → `createTodo` controller → `Todo.create({ userId, ...body })`

**Body**

| Field | Type | Required | Rule |
|---|---|---|---|
| `title` | string | ✅ | 3–50 |
| `description` | string | ✅ | 3–2000 |

```json
{ "title": "Buy milk", "description": "2 litre full cream" }
```

**Response `201`**
```json
{ "success": true, "message": "Success", "payload": { "id": "65f1d0..." } }
```

**Errors:** `400` · `401` · `500` duplicate title

---

#### 6. Get All My Todos – `GET /todos/hello` 🔒

**Flow:** `auth` → `getTodo` controller → `Todo.find({ userId })`

**Response `201`**
```json
{
  "success": true,
  "message": "Success",
  "payload": [
    { "_id": "65f1d0...", "userId": "65f1c2...", "title": "Buy milk", "description": "2 litre full cream" }
  ]
}
```

---

#### 7. Get Todos (Paginated) – `GET /todos?page=1&limit=10` 🔒

**Flow:** `auth` → `validate(getTodos, query)` → `getTodos` controller → `todoServices.getTodos`

**Query**

| Param | Type | Default | Rule |
|---|---|---|---|
| `page` | number | 1 | ≥ 1 |
| `limit` | number | 10 | 1–100 |

**Expected response `201`**
```json
{
  "success": true,
  "message": "Success",
  "payload": { "todos": [ ... ], "currentPage": 1, "limit": 10, "totalRecords": 42, "totalPage": 5 }
}
```

> ⚠️ Ye API abhi sahi kaam nahi karti. [Known Issues #2](#8-known-issues--bugs) dekho.

---

#### 8. Get Todo by ID – `GET /todos/:id` 🔒

**Flow:** `auth` → `validate(todoId, params)` → `getTodoById` controller → `Todo.findOne({ _id, userId })`

**Response `201`**
```json
{
  "success": true,
  "message": "Success",
  "payload": { "id": "65f1d0...", "title": "Buy milk", "description": "2 litre full cream" }
}
```

**Errors:** `400` invalid id · `401` · `500` (todo na mile to bhi, [Known Issues #3](#8-known-issues--bugs))

---

#### 9. Update Todo – `PATCH /todos/:id` 🔒

**Flow:** `auth` → `validate(todoId, params)` → `validate(updateTodo)` → `updateTodo` controller → `Todo.findOneAndUpdate({ _id, userId })`

**Body** (kam se kam ek field)

| Field | Type | Rule |
|---|---|---|
| `title` | string | 3–50 |
| `description` | string | 3–2000 |

```json
{ "title": "Buy bread" }
```

**Response `201`**
```json
{ "success": true, "message": "Success", "payload": { "id": "65f1d0..." } }
```

**Errors:** `400` · `401` · `500` `"Todo not Found!"`

---

#### 10. Delete Todo – `DELETE /todos/:id` 🔒

**Flow:** `auth` → `validate(todoId, params)` → `deleteTodo` controller → `Todo.findOneAndDelete({ _id, userId })`

**Response `200`**
```json
{ "success": true, "message": "OK", "payload": { "message": "Todo Deleted Successfully!" } }
```

**Errors:** `400` · `401` · `500` `"Todo not Found!"`

---

## 8. Known Issues / Bugs

Code padhte waqt ye cheezein mili hain. Inko fix karna baaki hai:

| # | Kahan | Problem | Fix |
|---|---|---|---|
| 1 | `user.service.js` → `loginUser` | 🔴 `user.comparePassword(...)` ke aage `await` nahi hai. Promise hamesha truthy hota hai, isliye **koi bhi password daalo, login ho jaata hai.** | `const isMatch = await user.comparePassword(body.password)` |
| 2 | `todo.controller.js` + `todo.services.js` → `getTodos` | Controller `getTodos(req.userId, req.query)` call karta hai, lekin service sirf `getTodos(query)` leti hai, to `query` me userId string aa jaati hai. Skip ka formula bhi galat hai (`limit - (page - 1)`), aur query me `userId` filter nahi hai, yani sab users ke todos aayenge. | Service: `getTodos(userId, query)`, `skip = (page - 1) * limit`, `find({ userId })` aur `countDocuments({ userId })` |
| 3 | `todo.services.js` → `getTodoById` | Todo na mile to `todo._id` pe crash hota hai (`Cannot read properties of null`). | `if (!todo) throw new Error('Todo not Found!')` |
| 4 | `todo.model.js` → `title` | `unique: true` global hai, to do alag users same title ka todo nahi bana sakte. | Field se `unique` hatao, compound index lagao: `todoSchema.index({ userId: 1, title: 1 }, { unique: true })` |
| 5 | Saari services | Not found, duplicate, galat password sab **500** dete hain. | Custom error class with `statusCode` (404, 401, 409) aur `handleError(res, error, error.statusCode)` |
| 6 | `todo.controller.js` | GET aur PATCH bhi `handleSuccess` use karte hain, jo default **201** deta hai. 201 sirf create ke liye hona chahiye. | GET/PATCH me `handleOk` |
| 7 | `user.routes.js` | `/update/:id` aur `/delete/:id` me `:id` validate hota hai, lekin use nahi hota (controller `req.userId` use karta hai). | Ya to `:id` hata ke `/users/me` banao, ya role ka kaam aane par admin ke liye `:id` use karo |
| 8 | `todo.routes.js` | Saare todos ka route `/todos/hello` hai. Naam meaningful nahi, aur `GET /todos` se kaam overlap karta hai. | Ek hi `GET /todos` (pagination ke saath) rakho |
| 9 | `auth` / `validation` middleware | Error response me `payload` field nahi hai, baaki APIs se shape alag hai. | Wahan bhi `handleError` use karo |
| 10 | `server.js` | DB `listen` ke **baad** connect hota hai, to shuru ke kuch ms me aayi request fail ho sakti hai. | Pehle `await connectDB()`, phir `app.listen` |
| 11 | `test.js` | Hardcoded secret key hai, aur ye app ka part nahi hai. | Delete karo ya `.gitignore` me daalo |
| 12 | `.gitIgnore` | File ka naam `.gitIgnore` hai (capital I). Case-sensitive systems (Linux/CI) pe git ise ignore file nahi maanega, aur `.env` push ho sakta hai. | Rename karke `.gitignore` karo |

---

## 9. Aage ka kaam (Roadmap)

- **Role-based access.** Token me `role` already aa raha hai aur `authMiddleware` `req.role` set kar deta hai. Ab ek `authorize('admin')` middleware banana hai jo `req.role` check kare, aur admin-only routes pe lagana hai (jaise kisi bhi user ko `:id` se update/delete karna, ya sab users ke todos dekhna).
- Upar ke Known Issues fix karna (khaas karke #1 login bug).
- Centralized error-handling middleware (`app.use((err, req, res, next) => ...)`).
- Refresh token, taaki 15 min baad dobara login na karna pade.
- Todo model me `timestamps` aur `completed` / status field.
