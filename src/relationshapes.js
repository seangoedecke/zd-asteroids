import Matter from 'matter-js'
import semiCircle from './bodies-semicircle'
import { ZD_APPLE_GREEN,
  ZD_PELOROUS,
  ZD_YELLOW,
  ZD_ORANGE,
  ZD_MANDY,
  ZD_FLAMINGO,
  ZD_TEAL,
ZD_COLOUR_DARK } from './zd-colours'

const Common = Matter.Common
const Bodies = Matter.Bodies

export const getRandomColor = () => (
  Common.choose([ZD_APPLE_GREEN, ZD_PELOROUS, ZD_YELLOW, ZD_ORANGE, ZD_MANDY, ZD_FLAMINGO, ZD_TEAL])
)

const render = {  // EXTRACT INTO CONFIG FILE!
  options: {
    width: 600,
    height: 600
  }
}

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

// proper shapes

export const createLargeLShape = (x, y, color) => {
  const connectShape = Matter.Vertices.create([
    {x: 0, y: 0},
    {x: 30, y: 0},
    {x: 30, y: 30},
    {x: 0, y: 30},
    {x: 60, y: 30},
    {x: 60, y: 60},
    {x: 0, y: 60}
  ], Matter.Body)

  return {
    shape: Bodies.fromVertices(x, y, connectShape, 20, {
      render: {
        fillStyle: color,
        strokeStyle: 'transparent'
      },
      plugin,
      angularFriction: 0.98,
      friction: 0
    }),
    successors: [
      createSmallSquare(x, y, color),
      createSmallSquare(x, y, color)
    ]
  }
}

export const createLargeRectangle = (x, y, color) => {
  return {
    shape: Bodies.rectangle(x, y, 40, 80, { // rect
      render: {
        fillStyle: color,
        strokeStyle: 'transparent'
      },
      plugin,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0
    }),
    successors: [
      createSmallSquare(x, y, color),
      createSmallSquare(x, y, color)
    ]
  }
}

export const createLargeSquare = (x, y, color) => {
  return {
    shape: Bodies.rectangle(x, y, 40, 40, { // square
      render: {
        fillStyle: color,
        strokeStyle: 'transparent'
      },
      plugin,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0
    }),
    successors: [
      createSmallSquare(x, y, color),
      createSmallSquare(x, y, color)
    ]
  }
}

export const createLargeSemiCircle = (x, y, color) => {
  return {
    shape: semiCircle(x, y, 40, { // semicircle
      render: {
        fillStyle: color,
        strokeStyle: 'transparent'
      },
      plugin,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0
    }),
    successors: [
      createSmallSemiCircle(x, y, color),
      createSmallSemiCircle(x, y, color)
    ]}
}

export const createLargeCircle = (x, y, color) => {
  return {
    shape: Bodies.circle(x, y, 40, { // circle
      render: {
        fillStyle: color,
        strokeStyle: 'transparent'
      },
      plugin,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0
    }),
    successors: [
      createSmallSemiCircle(x, y, color),
      createSmallSemiCircle(x, y, color)
    ]}
}

export const createLargeTriangle = (x, y, color) => {
  return {
    shape: Bodies.polygon(x, y, 3, 40, { // triangle
      render: {
        fillStyle: color,
        strokeStyle: 'transparent'
      },
      plugin,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0
    }),
    successors: [
      createSmallTriangle(x, y, color),
      createSmallTriangle(x, y, color)
    ]}
}

// sub-shapes

export const createSmallSquare = (x, y, color) => (
  Bodies.rectangle(x, y, 20, 20, {  // square
    render: {
      fillStyle: color,
      strokeStyle: 'transparent'
    },
    plugin,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0
  })
)

export const createSmallTriangle = (x, y, color) => (
  Bodies.polygon(x, y, 3, 20, { // triangle
    render: {
      fillStyle: color,
      strokeStyle: 'transparent'
    },
    plugin,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0
  })
)

export const createSmallSemiCircle = (x, y, color) => (
  semiCircle(x, y, 20, { // semicircle
    render: {
      fillStyle: color,
      strokeStyle: 'transparent'
    },
    plugin,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0
  })
)

export const getRandomShape = (x, y, color) => {
  const shapeSchema = Common.choose([
    createLargeLShape(x, y, color),
    createLargeCircle(x, y, color),
    createLargeSquare(x, y, color),
    createLargeSemiCircle(x, y, color),
    createLargeRectangle(x, y, color),
    createLargeTriangle(x, y, color)
  ])

  const shape = shapeSchema.shape
  shape.successors = shapeSchema.successors

  return shape
}
