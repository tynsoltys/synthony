setCpm(60/4)

$wind: s("white").lpf(perlin.slow(4).range(200, 2000)).gain(slider(0.35,0,1,0.01))._scope({ height: 120, scale: 0.5 })

$creak: s("rim(3,8)").coarse(4).lpf(800).gain(0.25)

$gulls: s("gm_bird_tweet*2").slow(2).pan(perlin.slow(6).range(0,1)).gain(0.3)

$pad: note("<c3 g3 a3 e3>").s("supersaw").lpf(sine.range(400,1500).slow(8)).attack(2).release(3).gain(0.25)

$bridge: s("brown").lpf(300).gain(0.2).slow(4)