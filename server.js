/* eslint-disable */
var path = require('path')
var app = require('express')()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

var webpack = require('webpack')
var config = require('./webpack.config')
var compiler = webpack(config)

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

server.listen(3000, 'localhost', function (err) {
  if (err) {
    console.log(err)
    return
  }

  console.log('Listening at http://localhost:3000')
})

io.on('connection', function (socket) {
  console.log('user connected')
  socket.on('chat', function (msg) {

  })
  socket.on('disconnected', function () {
    console.log('user disconnected')
  })
})
