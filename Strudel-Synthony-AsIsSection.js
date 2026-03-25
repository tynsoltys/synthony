setCpm(92/4)

$kick: s("bd ~ bd ~, ~ ~ bd ~").bank("RolandTR808").gain(0.9)

$snare: s("~ sd ~ sd").bank("RolandTR808").gain(0.7).room(0.25)

$hats: s("hh*6").bank("RolandTR808")
  .gain(0.35)
  .pan(sine.range(0.3,0.7).slow(4))
  ._scope({ height: 120, scale: 0.5 })

$pad: note("<[c3,e3,g3] [a2,c3,e3] [f3,a3,c4]>")
  .s("supersaw")
  .detune(0.4)
  .lpf(perlin.slow(6).range(500,1500))
  .attack(0.4)
  .release(0.9)
  .room(0.7)
  .gain(0.28)

$swirl: note("<c4 e4 g4 b3>")
  .s("triangle")
  .lpf(sine.range(800,2000).slow(8))
  .pan(sine.range(0,1).slow(3))
  .gain(0.22)

$bass: note("c2 ~ g1 ~ a1 ~ f1 ~")
  .s("sawtooth")
  .lpf(320)
  .gain(0.55)
  ._pianoroll({ fold: 1 })

$beep: note("<c5 ~ ~ ~ e5 ~ g5 ~>?0.3")
  .s("sine")
  .attack(0.01)
  .release(0.2)
  .gain(0.2)
  .pan(perlin.range(0.2,0.8).slow(5))