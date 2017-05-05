import Matter from 'matter-js'
import MatterWrap from 'matter-wrap'   // Monkey-patched! Do not upgrade!
import {
  ZD_COLOUR_DARK,
  ZD_COLOUR_LIGHT } from './zd-colours'
import { getRandomColor, getRandomShape, createConnectRelationshape } from './relationshapes'

Matter.use('matter-wrap') // Monkey-patched! Do not upgrade!
// try `use(MatterWrap)` ?

// module aliases
const Engine = Matter.Engine
const Render = Matter.Render
const World = Matter.World
const Events = Matter.Events
const Bodies = Matter.Bodies
const Bounds = Matter.Bounds
const Composite = Matter.Composite
const Runner = Matter.Runner
const Body = Matter.Body
// const Svg = Matte r.Svg

let tick  // game tick counter
let runner // game runner

const bullets = [] // array of live bullets

let isRunning
let score = 0

let keys = [] // array of pressed keys

const resultMessage = document.getElementById('message')
const results = document.getElementById('results')
const canvas = document.getElementById('canvas')

// create an engine
const engine = Engine.create()
engine.world.gravity.y = 0

// create a renderer
const render = Render.create({
  element: canvas,
  engine: engine,
  options: {
    width: 600,
    height: 600,
    wireframes: false,
    background: ZD_COLOUR_LIGHT
  }
})

const plugin = {
  wrap: {
    min: {
      x: 0,
      y: 0
    },
    max: {
      x: render.options.width,
      y: render.options.height
    }
  }
}

const playerShape = Matter.Vertices.create([{x: 0, y: 15}, {x: -10, y: -15}, {x: 10, y: -15}], Body)

const createPlayer = () => {
  const player = Bodies.fromVertices(render.options.width / 2, render.options.height / 2, playerShape, 20, { // triangle
    render: {
      strokeStyle: 'transparent'
    },
    angularFriction: 0.98,
    friction: 0
  })
  player.render.fillStyle = ZD_COLOUR_DARK
  player.plugin = plugin
  player.isPlayer = true
  return player
}

let player = createPlayer()

const generateBlock = () => {
  let x = 0
  let y = 0

  const distanceFromCenter = () => (
    Math.sqrt(
      Math.pow(x - (render.options.width / 2), 2) + Math.pow(y - (render.options.height / 2), 2)
    )
  )

  while (x < 30 || x > render.options.width - 30) {
    x = render.options.width * Math.random()
  }

  while (y < 30 || y > render.options.height - 30) {
    y = render.options.width * Math.random()
  }

  let color = getRandomColor()

  if (distanceFromCenter() < 100) {
    return generateBlock() // recurse until block isn't too close to center
  }
  const block = getRandomShape(x, y, color)
  Body.setAngularVelocity(block, (Math.random() - 0.5) * 0.1)
  Body.setVelocity(block, Matter.Vector.create((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2))
  return block
}

const generateAsteroids = () => {
  const numAsteroids = 10
  const asteroids = []
  for (let i = 0; i < numAsteroids; i++) {
    asteroids.push(generateBlock())
  }
  return asteroids
}

const fireBullet = () => {
  const bullet = Bodies.circle(player.vertices[2].x, player.vertices[2].y, 3, { // circle
    render: {
      fillStyle: ZD_COLOUR_DARK,
      strokeStyle: 'transparent'
    },
    plugin,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0
  })
  bullet.isBullet = true
  World.add(engine.world, [bullet])
  let angle = player.angle + Math.PI * 0.5
  let speed = 9
  Body.setVelocity(bullet, Matter.Vector.create(player.velocity.x + speed * Math.cos(angle), player.velocity.y + speed * Math.sin(angle)))
  bullets.push(bullet)
}

// listen for keys
document.onkeydown = (key) => {
  if (!isRunning) { return }

  if (key.code === 'Space') {
    fireBullet()
  }

  if (keys.indexOf(key.code) == -1) {
    keys.push(key.code)
  }
}

document.onkeyup = (key) => {
  if (isRunning) {
    if (key.code === 'KeyA' || key.code === 'KeyD') {
      Body.setAngularVelocity(player, 0)
    }
    const i = keys.indexOf(key.code)
    if (i != -1) {
      keys.splice(i, 1)
    }
  } else {
    if (key.code === 'Space') {
      // new game!
      hideEndGameScreen()
      initGame()
    }
  }
}

// game loop
// Do we need this??
Events.on(engine, 'beforeTick', () => {
  tick = tick + 1

  // artificially limit key events
  if (tick % 5 == 0) {
    // handle movement keys
    keys.forEach((code) => {
      switch (code) {
        case 'KeyA': // left arrow
        // apply leftwards spin
          Body.setAngularVelocity(player, -0.15)
          break
        case 'KeyD': // right arrow
        // apply rightwards spin
          Body.setAngularVelocity(player, 0.15)
          break
        case 'KeyW': // up arrow
        // increase accel
          player.force.x += 0.001 * Math.cos(player.angle + Math.PI * 0.5)
          player.force.y += 0.001 * Math.sin(player.angle + Math.PI * 0.5)
          break
        case 'KeyS': // down arrow
        // decrease accel
          player.force.x -= 0.001 * Math.cos(player.angle + Math.PI * 0.5)
          player.force.y -= 0.001 * Math.sin(player.angle + Math.PI * 0.5)
          break
      }
    })
  }

  // are there any asteroids left?

  if (Composite.allBodies(engine.world).length == bullets.length + 1) {
    // if it's just you and your bullets
    renderEndGameScreen(true)
    isRunning = false
  }

  // iterate over asteroids
  Composite.allBodies(engine.world).forEach((body) => {
    if (!body.isBullet && !body.isPlayer) {
      // did it hit the player?
      if (Bounds.overlaps(player.bounds, body.bounds)) {
        renderEndGameScreen(false)
        isRunning = false
      }
      // did it hit a bullet?
      bullets.forEach((bullet) => {
        if (Bounds.overlaps(body.bounds, bullet.bounds)) {
          World.remove(engine.world, body) // TODO: split into children
          World.remove(engine.world, bullet)
          bullets.splice(bullets.indexOf(bullet), 1)
          score += 1

          if (body.successors) {
            body.successors.forEach((successor) => {
              World.add(engine.world, successor)
              Body.setPosition(successor, body.position)
              Body.setVelocity(successor, Matter.Vector.rotate(body.velocity, (Math.random() - 0.5)))
            })
          }
        }
      })
    }
  })

  if (tick === 500) {
    tick = 0
  }; // make sure tick never gets too big
})

const renderEndGameScreen = (victory) => {
  if (victory) {
    resultMessage.innerHTML = 'Congratulations! You defeated all the relationshapes. Now drift forever in the void.'
  } else {
    resultMessage.innerHTML = `You scored ${score} ${score == 1 ? 'point' : 'points'} before losing.`
  }
  results.className = 'results'
  runner.enabled = false
}

const hideEndGameScreen = () => {
  results.className = 'hidden'
  runner.enabled = true
}

const initGame = () => {
  tick = 0
  score = 0
  keys = []

  World.clear(engine.world) // clear world (if the game is restarting)
  player = createPlayer()
  // add all of the bodies to the world
  World.add(engine.world, [player, ...generateAsteroids()])
  isRunning = true
}
// run the engine and renderer
runner = Engine.run(engine)
Render.run(render)

initGame()
