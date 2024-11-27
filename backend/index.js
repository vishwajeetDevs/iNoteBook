const connectToMongo = require('./database');
connectToMongo();
const express = require('express')
const app = express()
const port = 3000

// app.get('/', (req, res) => {
//   res.send('Hello Vishwajeet Zee!');
// })
// app.get('/api/v1/signup', (req, res) => {
//   res.send('Signup!');
// })
// app.get('/api/v1/login', (req, res) => {
//   res.send('Login!');
// })


// Avaliable routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})