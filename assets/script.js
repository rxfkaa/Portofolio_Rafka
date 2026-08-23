const html=document.documentElement;
const themeToggle=document.getElementById("themeToggle");
const themeIcon=themeToggle ? themeToggle.querySelector(".theme-icon") : null;
const menuBtn=document.getElementById("menuBtn");
const nav=document.getElementById("nav");
const topBtn=document.getElementById("topBtn");

function setTheme(theme){
  html.dataset.theme=theme;
  localStorage.setItem("portfolio-theme",theme);
  localStorage.setItem("cv-theme",theme);
  if(themeIcon) themeIcon.textContent=theme==="light"?"☀":"☾";
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta) themeMeta.setAttribute("content",theme==="light"?"#f5f8fc":"#030711");
}
const saved=localStorage.getItem("portfolio-theme") || localStorage.getItem("cv-theme") || "dark";
setTheme(saved === "light" ? "light" : "dark");

if(themeToggle) themeToggle.addEventListener("click",()=>setTheme(html.dataset.theme==="light"?"dark":"light"));
if(menuBtn && nav) menuBtn.addEventListener("click",()=>nav.classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>nav && nav.classList.remove("open")));

/* Smooth sliding navbar indicator.
   The indicator is a single element that physically travels between
   navigation items instead of appearing/disappearing on each scroll. */
const links=[...document.querySelectorAll(".nav a")];
const navIndicator=document.querySelector(".nav-indicator");

/* Achievements remains in the page, but its navbar label is intentionally
   hidden. Keep the active state on the nearest visible nav destination. */
const sections=links.map(link=>{
  const id=link.getAttribute("href").slice(1);
  return document.getElementById(id);
}).filter(Boolean);

function moveIndicator(link, immediate=false){
  if(!navIndicator || !link || window.innerWidth <= 900){
    if(navIndicator) navIndicator.style.opacity="0";
    return;
  }
  const navRect=nav.getBoundingClientRect();
  const rect=link.getBoundingClientRect();
  navIndicator.style.width=`${rect.width}px`;
  navIndicator.style.transform=`translateX(${rect.left-navRect.left}px)`;
  navIndicator.style.opacity="1";
  if(immediate){
    navIndicator.style.transition="none";
    navIndicator.offsetHeight;
    navIndicator.style.transition="";
  }
}

function updateActive(){
  const scrollPosition=window.scrollY + Math.min(190, window.innerHeight * .28);
  let current="home";

  /* Only destinations that actually have a navbar link participate in
     scrollspy. This means the hidden Achievements heading won't create
     an empty active state between Experience and Contact. */
  sections.forEach(section=>{
    if(section.offsetTop <= scrollPosition) current=section.id;
  });

  /* At the very bottom, activate the last visible navbar destination. */
  if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8 && sections.length){
    current=sections[sections.length-1].id;
  }

  const activeLink=links.find(link=>link.getAttribute("href")==="#"+current) || links[0];
  links.forEach(link=>{
    const isActive=link===activeLink;
    link.classList.toggle("active",isActive);
    link.setAttribute("aria-current",isActive?"page":"false");
  });
  moveIndicator(activeLink);

  if(topBtn){
    topBtn.style.opacity=window.scrollY>450?"1":"0";
    topBtn.style.pointerEvents=window.scrollY>450?"auto":"none";
  }
}

links.forEach(link=>{
  link.addEventListener("click",()=>{
    setTimeout(()=>moveIndicator(link),20);
    if(nav) nav.classList.remove("open");
  });
});
window.addEventListener("scroll",updateActive,{passive:true});
window.addEventListener("resize",updateActive);
window.addEventListener("load",()=>updateActive());
updateActive();

if(topBtn) topBtn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add("show")});
},{threshold:.08});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
setTimeout(()=>document.querySelectorAll(".reveal").forEach(el=>el.classList.add("show")),1200);

// Project cards: clicking anywhere inside a card opens its detail page.
document.querySelectorAll(".project-card[data-project]").forEach(card=>{
  card.setAttribute("role","link");
  card.setAttribute("tabindex","0");
  card.addEventListener("click", e=>{
    if(e.target.closest("a")) return;
    window.location.href=card.dataset.project;
  });
  card.addEventListener("keydown", e=>{
    if(e.key==="Enter" || e.key===" "){
      e.preventDefault();
      window.location.href=card.dataset.project;
    }
  });
});

/* RAFKA_THEME_STORAGE_SYNC */
window.addEventListener("storage", (e)=>{
  if(e.key === "portfolio-theme" || e.key === "cv-theme"){
    const t = e.newValue === "light" ? "light" : "dark";
    setTheme(t);
  }
});
