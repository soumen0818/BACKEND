require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api', (req, res) => {
  res.send('Hello from API!')
})

app.get('/name', (req,res) => {
  res.send('soumen das')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})
