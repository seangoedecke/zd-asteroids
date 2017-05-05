const render = {  // EXTRACT INTO CONFIG FILE!
  options: {
    width: 600,
    height: 600
  }
}

export const plugin = {
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
