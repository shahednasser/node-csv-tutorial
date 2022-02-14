const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const stringify = require('csv-stringify').stringify
const parse = require('csv-parse').parse
const os = require('os')
const multer  = require('multer')
const upload = multer({ dest: os.tmpdir() })
const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(express.static('public'))

app.post('/create', (req, res) => {
  const data = req.body.data

  if (!data || !data.length) {
    return res.status(400).json({success: false, message: 'Please enter at least 1 row'})
  }

  stringify(data, {
    header: true
  }, function (err, str) {
    const path = './files/' + Date.now() + '.csv'
    //create the files directory if it doesn't exist
    if (!fs.existsSync('./files')) {
      fs.mkdirSync('./files')
    }
    fs.writeFile(path, str, function (err) {
      if (err) {
        console.error(err)
        return res.status(400).json({success: false, message: 'An error occurred'})
      }

      res.download(path, 'file.csv')
    })
  })
})

app.post('/read', upload.single('file'), (req, res) => {
  const file = req.file

  const data = fs.readFileSync(file.path)
  parse(data, (err, records) => {
    if (err) {
      console.error(err)
      return res.status(400).json({success: false, message: 'An error occurred'})
    }

    return res.json({data: records})
  })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})