setCpm(88/4)

$drums: s("bd ~ bd ~, rim(3,8)")
  .gain(0.65)
  .lpf(600)
  .room(0.25)

$hats: s("hh*4").gain(0.18).lpf(400)

$bass: note("[~ ~ c2]  [ [c2/2 ~] ~ bb1] bb1 g1 ~").s("sawtooth")
  .lpf(220)
  .distort(0.25)
  .attack(0.1)
  .gain(0.9)

$guitars: s("supersaw").note("<c3 g3 c4>")
  .detune(0.8)
  .lpf(500)
  .gain(0.22)
  .attack(0.05)
  .release(0.4)
  .pan(perlin.slow(5).range(0.25,0.75))

$percussion: s("cp(3,8)").gain(0.15).room(0.3)
  ._pianoroll({ fold: 2 })
  ._scope({ height: 120, scale: 0.5 })
