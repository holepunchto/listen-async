const listen = require('./')
const test = require('brittle')
const net = require('net')

test('basic', async function (t) {
  const port = await getFreePort()
  const server = net.createServer()

  await listen(server, port, '127.0.0.1')

  t.is(server.address().port, port)

  await close(server)
})

test('classic pattern', async function (t) {
  const port = await getFreePort()
  const server = net.createServer()

  await listen(server, port, '127.0.0.1')

  const server2 = net.createServer()
  let fallback = false

  try {
    await listen(server2, port, '127.0.0.1')
  } catch {
    await listen(server2, 0, '127.0.0.1')
    fallback = true
  }

  t.ok(fallback)
  t.not(server2.address().port, port)

  await close(server)
  await close(server2)
})

function close (server) {
  return new Promise((resolve) => {
    server.close(resolve)
  })
}

function getFreePort () {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('listening', onlistening)
    server.listen(0, '127.0.0.1')

    function onlistening () {
      const port = server.address().port
      server.close(() => resolve(port))
    }
  })
}
