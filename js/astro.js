/* AstroVeda calculation engine.
   Astronomy Engine supplies the astronomical positions. The Vedic layer applies
   a Lahiri-style sidereal offset and uses whole-sign houses.
*/
const ZODIAC=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrischika","Dhanu","Makara","Kumbha","Meena"];
const ZODIAC_EN=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const NAKSHATRAS=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const NAK_SYMBOLS=["Horse head","Yoni","Razor / fire","Chariot","Deer head","Teardrop","Bow","Flower","Serpent","Royal throne","Front legs","Back legs","Hand","Pearl","Coral","Triumphal arch","Lotus","Circular earring","Roots","Fan","Elephant tusk","Ear","Drum","Empty circle","Sword","Twin fish","Fish"];
const PLANETS=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Rahu","Ketu"];
function norm(x){x%=360;if(x<0)x+=360;return x}
function signOf(lon){return Math.floor(norm(lon)/30)}
function degInSign(lon){return norm(lon)%30}
function ayanamsa(date){
  // Lahiri-style approximation, close to the modern epoch and adequate for a browser tool.
  const y=date.getUTCFullYear()+((date.getUTCMonth()+0.5)/12);
  return 23.85 + (y-2000)*0.01396;
}
function sidereal(tropical,date){return norm(tropical-ayanamsa(date))}
function nakshatra(lon){let x=norm(lon);let idx=Math.floor(x/(360/27));let within=x-idx*(360/27);let pada=Math.floor(within/((360/27)/4))+1;return {name:NAKSHATRAS[idx],symbol:NAK_SYMBOLS[idx],index:idx,pada}}
function parseBirth(form){
  const dt=form.querySelector('[name="birthDate"]').value;
  const time=form.querySelector('[name="birthTime"]').value;
  const lat=parseFloat(form.querySelector('[name="lat"]').value);
  const lon=parseFloat(form.querySelector('[name="lon"]').value);
  const tz=parseFloat(form.querySelector('[name="tz"]').value);
  if(!dt||!time||Number.isNaN(lat)||Number.isNaN(lon)||Number.isNaN(tz)) throw new Error("Please enter date, time, location and UTC offset.");
  const local=new Date(`${dt}T${time}:00`);
  const utc=new Date(local.getTime()-tz*3600000);
  return {local,utc,lat,lon,tz};
}
function jd(date){return date.getTime()/86400000+2440587.5}
function sunLonApprox(date){
  const d=jd(date)-2451543.5,g=norm(357.529+0.98560028*d),q=norm(280.459+0.98564736*d);
  return norm(q+1.915*Math.sin(g*Math.PI/180)+0.020*Math.sin(2*g*Math.PI/180));
}
function gmst(date){
  const D=jd(date)-2451545.0;
  return norm(280.46061837+360.98564736629*D);
}
function obliquity(date){
  const T=(jd(date)-2451545)/36525;
  return 23.439291-0.0130042*T;
}
function ascendant(date,lat,lon){
  const lst=norm(gmst(date)+lon)*Math.PI/180;
  const phi=lat*Math.PI/180, eps=obliquity(date)*Math.PI/180;
  const y=-Math.cos(lst), x=Math.sin(lst)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps);
  return norm(Math.atan2(y,x)*180/Math.PI);
}
function getPlanets(date){
  if(typeof Astronomy==="undefined") throw new Error("Astronomy library is still loading. Please try again.");
  const bodies=[["Sun",Astronomy.Body.Sun],["Moon",Astronomy.Body.Moon],["Mercury",Astronomy.Body.Mercury],["Venus",Astronomy.Body.Venus],["Mars",Astronomy.Body.Mars],["Jupiter",Astronomy.Body.Jupiter],["Saturn",Astronomy.Body.Saturn]];
  return bodies.map(([name,body])=>{
    const lon=Astronomy.EclipticLongitude(body,date);
    return {name,lon:sidereal(lon,date)};
  });
}
function birthChart(data){
  const tropicalSun=sunLonApprox(data.utc);
  let planets=getPlanets(data.utc);
  // Astronomy Engine geocentric vector longitude is used above; replace Sun with a high-quality solar approximation.
  planets[0].lon=sidereal(tropicalSun,data.utc);
  const moon=planets.find(p=>p.name==="Moon");
  const lagna=sidereal(ascendant(data.utc,data.lat,data.lon),data.utc);
  planets.push({name:"Rahu",lon:norm(moon.lon+180)});
  planets.push({name:"Ketu",lon:norm(moon.lon)});
  // Ketu is opposite Rahu; correct the node representation below.
  planets[8].lon=norm(planets[7].lon+180);
  return {data,lagna,lagnaSign:signOf(lagna),planets,moonNak:nakshatra(moon.lon),ayan:ayanamsa(data.utc)};
}
function fmtDeg(x){return `${Math.floor(x)}° ${Math.floor((x-Math.floor(x))*60)}′`}
function planetRows(chart){
  return chart.planets.map(p=>({name:p.name,lon:p.lon,sign:ZODIAC[signOf(p.lon)],signEn:ZODIAC_EN[signOf(p.lon)],degree:fmtDeg(degInSign(p.lon)),nak:nakshatra(p.lon)}));
}
function tithiSunMoon(sun,moon){return Math.floor(norm(moon-sun)/12)+1}
function yoga(sun,moon){return Math.floor(norm(sun+moon)/(360/27))+1}
function panchangFor(date){
  const sun=sidereal(sunLonApprox(date),date);
  const ps=getPlanets(date); const moon=ps.find(x=>x.name==="Moon").lon;
  const t=tithiSunMoon(sun,moon); const n=nakshatra(moon); const y=yoga(sun,moon);
  return {sun,moon,tithi:t,nakshatra:n,yoga:y};
}
function rashiText(sign){
 const texts=[
 "Focus on initiative and clear action. Avoid rushing important conversations.",
 "Prioritise stability, practical routines and steady progress.",
 "Keep communication simple; finish one important task before starting another.",
 "Protect your energy and give family matters the attention they need.",
 "Use creativity confidently, while leaving room for other viewpoints.",
 "Small improvements to routine can make the day feel more manageable.",
 "Balance matters today; clarify expectations before making commitments.",
 "Pause before reacting. Quiet observation can reveal useful information.",
 "Learning, travel or a new perspective may refresh your routine.",
 "Structure helps. Break a large responsibility into smaller steps.",
 "Try a different approach if a familiar method is not working.",
 "Make time for rest and reflection before taking on another obligation."
 ];
 return texts[sign];
}
