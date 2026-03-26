// Add your tracks here. Place .ogg files in /public/audio/
// Each album is a group with a name and a list of tracks.
// Tracks loop automatically.

const albums = [
  {
    id: "album-1",
    name: "Varmblixt Singularity",
    tracks: [
      { id: "v1", title: "As Is Section", file: "/audio/Synthony - As Is Section - 16c.ogg" },
      { id: "v2", title: "Staying Up", file: "/audio/Synthony - Staying Up - 16c.ogg" },
      { id: "v3", title: "Dip", file: "/audio/Synthony - Dip - 16c.ogg" },
      { id: "v5", title: "Kayak", file: "/audio/Synthony - Kayak - 16c.ogg" },
      { id: "v6", title: "Quebec", file: "/audio/Synthony - Quebec - 16c.ogg" },
    ],
  },
  {
    id: "album-2",
    name: "Coagula EP",
    tracks: [
      { id: "c1", title: "Coagula", file: "/audio/Synthony - Coagula - 16c.ogg" },
      { id: "c2", title: "Coagula (Dark Lane Jog Remix)", file: "/audio/Synthony - Coagula (Dark Lane Jog Remix) - 16c.ogg" },
      { id: "c3", title: "Coagula (Melting Air Edit)", file: "/audio/Synthony - Coagula (Melting Air Edit) - 16c.ogg" },
    ],
  },
  {
    id: "album-3",
    name: "Department of Dinosaurs",
    tracks: [
      { id: "d1", title: "Facility", file: "/audio/Synthony - Facility - 16c.ogg" },
      { id: "d2", title: "Crow Economics", file: "/audio/Synthony - Crow Economy - 16c.ogg" },
            { id: "d3", title: "Sandy Hands", file: "/audio/Synthony - Sandy Hands - 16c.ogg" },
      { id: "d4", title: "Coagula", file: "/audio/Synthony - Coagula - 16c.ogg" },
      { id: "d5", title: "Aurora Alone", file: "/audio/Synthony - Aurora Alone - 16c.ogg" },
    ],
  },
];

export default albums;
