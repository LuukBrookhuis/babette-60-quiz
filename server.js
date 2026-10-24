const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const questions = [
['Dancing Queen','Babette mag één persoon kiezen die een week lang alles voor haar moet regelen. Wie kiest ze?',['Ronald','Luuk','Loes','Petra']],
['Dancing Queen','Babette moet een maand op vakantie, maar Ronald mag niet mee. Wie neemt ze mee?',['Luuk','Loes','Haar vriendinnen','Ronald']],
['Dancing Queen','Babette krijgt onverwacht €10.000 cadeau. Wat doet ze ermee?',['Een vakantie met de familie','Een luxe aankoop voor zichzelf','Een groot feest voor iedereen','Spaarpot voor Sammie sambo']],
['Dancing Queen','Babette mag één dag volledig onzichtbaar zijn. Wat gaat ze doen?',['Stiekem gesprekken afluisteren','Rondneuzen in de huizen van anderen','Ongezien ergens gratis naar binnen','Iedereen voor de gek houden']],
['Knowing Me, Knowing You','Babette staat midden in de nacht met autopech langs de snelweg. Wie belt ze als eerste?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Babette moet met één van de drie een week op roadtrip zonder navigatie. Wie kiest ze?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Wie van de drie zou volgens Babette het meest moeite hebben om 24 uur lang zijn of haar mond te houden?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Wie van de drie zou volgens Babette het langst een geheim kunnen bewaren?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Babette moet een maand op een onbewoond eiland overleven. Wie neemt ze mee?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Van wie denkt Babette dat die het beste kan liegen zonder dat zij het doorheeft?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Wie mag van Babette een week lang haar bankpas beheren, zonder dat ze mag meekijken?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Babette moet met één van de drie een duo vormen bij een televisiequiz. Wie vertrouwt ze het meest?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Babette moet iemand aanwijzen die namens haar een belangrijke beslissing neemt. Wie vertrouwt ze?',['Ronald','Luuk','Loes']],
['Knowing Me, Knowing You','Wie van de drie kent Babette volgens haarzelf écht het allerbeste?',['Ronald','Luuk','Loes']],
['Money, Money, Money','Babette wint €1 miljoen in de loterij. Wat doet ze als allereerste?',['Alles naar Sam en misschien een klein beetje voor Luuk, Loes en Ronald','Ronald verrassen met iets groots','Een wereldreis boeken','Het nieuws voorlopig geheimhouden']],
['Money, Money, Money','Babette krijgt een volledig verzorgde vakantie, maar weet pas op het vliegveld waarheen. Wat hoopt ze?',['Een tropisch eiland','Een luxe cruise','Een stedentrip naar New York','Scandinavië']],
['Money, Money, Money','Babette mag één keer iets doen zonder dat Ronald er ooit achter komt. Wat kiest ze?',['Een peperdure aankoop doen','Een vriendinnenweekend boeken','Een hele dag niets uitvoeren','Stiekem een grote verrassing regelen']],
['Money, Money, Money','Babette mag één huishoudelijke taak voorgoed uit haar leven schrappen. Welke?',['Koken','Schoonmaken','Boodschappen doen','De was']],
['Mamma Mia!','Welk ABBA-nummer is het lievelingsnummer van Babette?',['Waterloo','Eagle','Gimme! Gimme! Gimme!','Voulez-Vous']],
['Mamma Mia!',"Wat zingt Babette na het woord 'Waterloo' in het gelijknamige ABBA-nummer?",["Could'st escaped if I wanted to","Couldn't escaped if wannadoo","Couldn't escaped if todeloo","Of dat andere"]],
['Mamma Mia!','Babette mag één muziekdecennium opnieuw beleven. Welke kiest ze?',['De jaren 70','De jaren 80','De jaren 90','De jaren 00']],
['Mamma Mia!','Wie vindt Babette het leukste ABBA-lid?',['Agnetha','Anni-Frid','Björn','Benny']],
['The Winner Takes It All','Babette mag één van deze dingen veranderen aan Ronald. Wat kiest ze?',['Hij moet beter luisteren','Hij moet romantischer worden','Hij moet meer huishoudelijk werk doen','Helemaal niets, hij is perfect']],
['The Winner Takes It All','Wat zou Babette het moeilijkst vinden om eerlijk toe te geven?',['Dat Ronald soms gelijk heeft','Dat ze weleens jaloers is','Dat ze iets vergeten is','Dat ze ergens helemaal niets van snapt']],
['The Winner Takes It All','Babette krijgt de kans om één ding over haar toekomst te weten. Wat kiest ze?',['Hoe oud ze wordt','Waar ze over 10 jaar woont','Hoe haar familie er over 20 jaar uitziet','Hoeveel kleinkinderen ze krijgt']],
['The Winner Takes It All','Als Babette baalt van zichzelf omdat ze iets heeft laten vallen of zich ergens tegenaan stoot, welk woord roept ze dan heel hard?',['Godverdomme!','Kutzooi!','Shitzooi!','WIEEEENK!']]
].map(([round,text,options])=>({round,text,options}));
const rooms = new Map();
const letters = ['A','B','C','D'];
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
function body(req){return new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>12000){reject(new Error('Verzoek te groot'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'));}catch(e){reject(e);}});req.on('error',reject);});}
function publicState(r){const q=questions[r.index];return {pin:r.pin,index:r.index,total:questions.length,phase:r.phase,question:q||null,teams:[...r.teams.values()].map(t=>({id:t.id,name:t.name,score:t.score,answered:r.answers.has(t.id),answer:r.phase==='revealed'?r.answers.get(t.id)??null:null})),correct:r.phase==='revealed'?r.correct:null,rounds:[...new Set(questions.map(q=>q.round))]};}
function publish(r){const payload='data: '+JSON.stringify(publicState(r))+'\n\n';for(const res of r.listeners){try{res.write(payload);}catch(e){r.listeners.delete(res);}}}
function auth(r,token){return r.hostToken===token;}
function handle(req,res){const u=new URL(req.url,'http://localhost');if(u.pathname==='/api/create'&&req.method==='POST'){let pin;do{pin=String(100000+crypto.randomInt(900000));}while(rooms.has(pin));const token=crypto.randomBytes(24).toString('hex');const r={pin,hostToken:token,index:0,phase:'lobby',teams:new Map(),answers:new Map(),correct:null,listeners:new Set()};rooms.set(pin,r);return send(res,200,{pin,token});}
if(u.pathname==='/api/events'&&req.method==='GET'){const r=rooms.get(u.searchParams.get('pin'));if(!r)return send(res,404,{error:'Quiz niet gevonden'});res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});res.write('data: '+JSON.stringify(publicState(r))+'\n\n');r.listeners.add(res);const beat=setInterval(()=>{try{res.write(': keepalive\n\n');}catch(e){}},20000);req.on('close',()=>{clearInterval(beat);r.listeners.delete(res);});return;}
if(u.pathname.startsWith('/api/')&&req.method==='POST'){body(req).then(b=>{const r=rooms.get(String(b.pin||''));if(!r)return send(res,404,{error:'Quizcode niet gevonden'});
if(u.pathname==='/api/join'){const name=String(b.name||'').trim().slice(0,35);if(!name)return send(res,400,{error:'Vul een teamnaam in'});if(r.phase==='finished')return send(res,400,{error:'De quiz is afgelopen'});if([...r.teams.values()].some(t=>t.name.toLowerCase()===name.toLowerCase()))return send(res,400,{error:'Deze teamnaam is al bezet'});const id=crypto.randomBytes(16).toString('hex');r.teams.set(id,{id,name,score:0});publish(r);return send(res,200,{id,name});}
if(u.pathname==='/api/answer'){const t=r.teams.get(b.id);if(!t)return send(res,403,{error:'Team niet gevonden. Doe opnieuw mee.'});if(r.phase!=='voting')return send(res,400,{error:'Stemmen is nu gesloten'});if(!Number.isInteger(b.answer)||b.answer<0||b.answer>=questions[r.index].options.length)return send(res,400,{error:'Ongeldig antwoord'});r.answers.set(t.id,b.answer);publish(r);return send(res,200,{ok:true});}
if(!auth(r,b.token))return send(res,403,{error:'Alleen de quizmaster mag dit doen'});
if(u.pathname==='/api/start'){if(r.phase!=='lobby')return send(res,400,{error:'De quiz is al begonnen'});r.phase='voting';}
else if(u.pathname==='/api/close'){if(r.phase!=='voting')return send(res,400,{error:'Er wordt niet gestemd'});r.phase='closed';}
else if(u.pathname==='/api/reveal'){if(r.phase!=='closed'&&r.phase!=='voting')return send(res,400,{error:'Sluit eerst de stemming'});if(!Number.isInteger(b.correct)||b.correct<0||b.correct>=questions[r.index].options.length)return send(res,400,{error:'Kies het antwoord van Babette'});r.correct=b.correct;r.phase='revealed';for(const [id,a] of r.answers){if(a===r.correct){const t=r.teams.get(id);if(t)t.score++;}}}
else if(u.pathname==='/api/next'){if(r.phase!=='revealed')return send(res,400,{error:'Onthul eerst het antwoord'});r.index++;r.answers.clear();r.correct=null;r.phase=r.index>=questions.length?'finished':'voting';}
else if(u.pathname==='/api/reset'){r.index=0;r.phase='lobby';r.answers.clear();r.correct=null;for(const t of r.teams.values())t.score=0;}
else return send(res,404,{error:'Onbekende actie'});publish(r);return send(res,200,{ok:true});}).catch(e=>send(res,400,{error:e.message}));return;}
let file=u.pathname==='/'?'/index.html':u.pathname;if(file.includes('..'))return res.writeHead(403).end();const f=path.join(__dirname,'public',file);if(!f.startsWith(path.join(__dirname,'public')))return res.writeHead(403).end();fs.readFile(f,(err,data)=>{if(err)return res.writeHead(404).end('Niet gevonden');const ext=path.extname(f);res.writeHead(200,{'Content-Type':ext==='.html'?'text/html; charset=utf-8':ext==='.js'?'text/javascript; charset=utf-8':'text/plain; charset=utf-8'});res.end(data);});}
http.createServer(handle).listen(PORT,()=>console.log('Babette quiz op poort '+PORT));
