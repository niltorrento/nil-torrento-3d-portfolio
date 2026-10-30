// All projects live here. The carousels on the home page are generated from this list.
//
// To add a project: copy one block, change the fields, and put its images in its own folder.
//   featured: true   -> also shown in "Featured Projects" (set to false to remove it from there)
//   thumb: ""        -> no image: a colored placeholder is shown
//   video: ""        -> optional muted, looping project video; the thumbnail remains the fallback
//   href: ""         -> not clickable (shows as "coming soon")
//   titleColor       -> title color for this project, as a hex value (for example "#f0c75e")
// The order here is the order in the carousels.
window.PROJECTS = [
  {
    title: "Museum",
    meta: "Project",
    summary: "Project description.",
    description: "Project description.",
    thumb: "images/museum/museum_thumbnail.jpg",
    video: "images/museum/museum_reel.mp4",
    href: "museum.html",
    featured: true,
    titleColor: "#fde246",
    roles: [],
    projectsPageOrder: 2
  },
  {
    title: "La Monja Gitana",
    meta: "3D short film · 2026 – present",
    summary: "Modeling, CFX and FX.",
    description: "3D modeling, CFX and FX. Highly detailed assets and environments with production-ready retopology, plus Vellum simulations of cloth and hair, in an 8-person team on a USD pipeline.",
    thumb: "images/la_monja_gitana/lmg_thumbnail.png",
    href: "la-monja-gitana.html",
    featured: true,
    titleColor: "#bb5a22",
    roles: ["Modeling", "CFX", "FX"],
    projectsPageOrder: 1
  },
  {
    title: "Animation",
    meta: "Animation and technical animation",
    summary: "Animation projects.",
    thumb: "",
    href: "animacio.html",
    featured: false,
    titleColor: "#f0c75e",
    roles: ["Animation", "Technical animation"],
    projectsPageOrder: 3
  },
  {
    title: "FX",
    meta: "Houdini · Flip · Pyro · RBD · Vellum",
    summary: "Simulations and visual effects.",
    thumb: "",
    href: "fx.html",
    featured: false,
    titleColor: "#ff6b4a",
    roles: ["Houdini FX"],
    projectsPageOrder: 4
  }
];
