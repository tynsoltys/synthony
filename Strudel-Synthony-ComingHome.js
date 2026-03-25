setCpm(105/4)

$kick: s("bd*4").bank("RolandTR909").gain(0.9)

$snare: s("~ sd ~ sd").bank("RolandTR909").gain(0.75)

$hats: s("hh*8").bank("RolandTR909").gain(0.35).pan(sine.range(0.3,0.7))

$bass: n("0 5 7 9 7 5 3 2")
  .scale("D:major")
  .s("sawtooth")
  .lpf(perlin.slow(6).range(200,1200))
  .gain(0.65)
  .attack(0.02)
  .release(0.15)
  .distort(0.1)
  ._pianoroll({ fold: 1 })

$pad: note("<[d4,f#4,a4] [g3,b3,d4] [e4,g4,b4] [f#3,a3,c#4]>")
  .s("supersaw")
  .lpf(sine.range(800,2000).slow(8))
  .gain(0.25)
  .attack(0.3)
  .release(0.6)
  .room(0.6)

$pulse: note("d5 ~ ~ d5 ~ ~ d5 ~")
  .s("square")
  .lpf(1500)
  .gain(0.28)
  .delay(0.25)
  .delaytime(1/4)
  .delayfeedback(0.3)
  ._scope({ height: 120, scale: 0.5 })