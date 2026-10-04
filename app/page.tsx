"use client";
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, Crown, Heart, MousePointer2, Pause, Play, Plus, Sparkles, Volume2, VolumeX, X, PawPrint, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { facts, type Fact } from './facts';
import { breeds, ranking, type Breed } from './breeds';
import { useDiscoAudio } from './use-disco-audio';
import { SceneTooltip, type SceneHint } from './scene-tooltip';

console.log('HELLO NEKO DISKO!');

const sceneProps = [
  {id:'night',x:49,y:11,w:23,h:23},
  {id:'height',x:24,y:46,w:13,h:17},
  {id:'box',x:6,y:61,w:6,h:8},
  {id:'scratch',x:89,y:60,w:8,h:22},
  {id:'water',x:88,y:35,w:10,h:15},
];
const periods = [
  {time:'06:00',label:'あさ',headline:'朝いちばんの、わくわく。',text:'空が明るくなるころ、猫のハンター気分もスイッチオン。起きたら少しだけ、おもちゃで遊ぼう。',breed:1,mood:'PLAY TIME'},
  {time:'12:00',label:'ひる',headline:'おひるねも、全力です。',text:'静かな場所で、のびのびお昼寝。次の冒険に備えて、しっかりエネルギーをためる時間。',breed:8,mood:'NAP TIME'},
  {time:'18:00',label:'ゆうがた',headline:'そろそろ、ねこの時間。',text:'夕暮れは、猫が活発になりやすい時間帯。追いかけて、飛びついて。遊びのリズムに付き合ってみよう。',breed:11,mood:'GOLDEN HOUR'},
  {time:'00:00',label:'よる',headline:'夜ふかしも、マイペース。',text:'夜に活動する子も、ぐっすり眠る子も。人との暮らしや年齢に合わせて、生活のリズムは変わります。',breed:6,mood:'MY OWN PACE'},
];
function getCurrentJstPeriod(){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 const hour=Number(parts.find(part=>part.type==='hour')?.value??0);
 const minute=Number(parts.find(part=>part.type==='minute')?.value??0);
 const time=hour+minute/60;
 if(time<3||time>=21)return 3;
 if(time<9)return 0;
 if(time<15)return 1;
 return 2;
}
const quizzes=[
  {q:'青い目が特徴の、ふわふわな猫は？',choices:['アメリカンショートヘア','ラグドール','ロシアンブルー'],answer:1,explain:'ラグドールは青い目とセミロングの毛、大きな体が特徴。名前には「ぬいぐるみ」という意味があります。',breed:2},
  {q:'ミヌエットのルーツとなった組み合わせは？',choices:['ペルシャ系 × マンチカン','ベンガル × ロシアンブルー','メインクーン × ラグドール'],answer:0,explain:'ミヌエットは、ペルシャ系の猫とマンチカンをもとに生まれた猫種。丸い顔と大きな目もチャームポイント。',breed:3},
  {q:'ベンガルの「ロゼット」って、どんな模様？',choices:['まっすぐなしま模様','全身まっしろ','輪のような斑点模様'],answer:2,explain:'ロゼットは、ヒョウを思わせる輪のような斑点模様。ベンガルにはマーブル模様の子もいます。',breed:11},
];
function Cat({index,className=''}:{index:number;className?:string}){
 const breed=breeds[index];
 return <span aria-hidden="true" className={`cat-sprite breed-sprite ${className}`}><img src={breed.image} alt="" draggable="false" width="512" height="512"/></span>;
}
function BreedName({name}:{name:string}){
 return <>{name.split(/(フォールド|ショートヘア|フォレストキャット)/).filter(Boolean).map((part,i)=><span key={i}>{part}</span>)}</>;
}
export default function Home(){
 const {soundState,toggleSound}=useDiscoAudio();const sound=soundState==='playing'||soundState==='loading';
 const [sceneHint,setSceneHint]=useState<SceneHint|null>(null);const [motion,setMotion]=useState(true);const [selected,setSelected]=useState<Breed|Fact|null>(null);
 const [found,setFound]=useState<string[]>([]);const [burst,setBurst]=useState<{x:number;y:number;id:number}|null>(null);
 const [period,setPeriod]=useState(getCurrentJstPeriod);const [question,setQuestion]=useState(0);const [answer,setAnswer]=useState<number|null>(null);const [score,setScore]=useState(0);const [finished,setFinished]=useState(false);
 const lastTrigger=useRef<HTMLElement|null>(null);const burstTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{const mq=window.matchMedia('(prefers-reduced-motion: reduce)');if(mq.matches)setMotion(false);const change=()=>setMotion(!mq.matches);mq.addEventListener('change',change);return()=>{mq.removeEventListener('change',change);if(burstTimer.current)clearTimeout(burstTimer.current)}},[]);
 useEffect(()=>{document.documentElement.dataset.motion=motion?'on':'off'},[motion]);
 const discover=(fact:Breed|Fact,e?:React.MouseEvent<HTMLElement>)=>{
  setSceneHint(null);
  lastTrigger.current=(e?.currentTarget as HTMLElement)??null;
  if('name' in fact)setFound(prev=>prev.includes(fact.id)?prev:[...prev,fact.id]);
  if(e&&motion){const r=e.currentTarget.getBoundingClientRect();setBurst({x:e.clientX||r.x+r.width/2,y:e.clientY||r.y+r.height/2,id:Date.now()});if(burstTimer.current)clearTimeout(burstTimer.current);burstTimer.current=setTimeout(()=>setBurst(null),900)}
  setSelected(fact);
 };
 const sceneHintEvents=(id:string,label:string,detail:string)=>{
  const show=(e:React.MouseEvent<HTMLButtonElement>|React.FocusEvent<HTMLButtonElement>)=>setSceneHint({id,label,detail,anchor:e.currentTarget});
  const hide=()=>setSceneHint(previous=>previous?.id===id?null:previous);
  return {
   onMouseEnter:show,
   onMouseLeave:(e:React.MouseEvent<HTMLButtonElement>)=>{if(document.activeElement!==e.currentTarget)hide()},
   onFocus:show,
   onBlur:(e:React.FocusEvent<HTMLButtonElement>)=>{if(!e.currentTarget.matches(':hover'))hide()},
   'aria-describedby':sceneHint?.id===id&&!selected?'scene-tooltip':undefined,
  };
 };
 const answerQuiz=(i:number)=>{if(answer!==null)return;setAnswer(i);if(i===quizzes[question].answer)setScore(s=>s+1)};
 const goFloor=()=>document.getElementById('dance-floor')?.scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});
 const p=periods[period];
 return <main id="top" className={`site ${motion?'':'still'}`}>
  <a className="skip-link" href="#dance-floor">ダンスフロアへスキップ</a>
  <div className="disco-reflections" aria-hidden="true">{Array.from({length:30},(_,i)=><i key={i} style={{'--x':`${(i*37+9)%100}%`,'--y':`${(i*23+7)%100}%`,'--delay':`${-i*.83}s`,'--r':`${i*31}deg`,'--tone':['#ffa6e6','#d5ff62','#8be9ee'][i%3]} as CSSProperties}/>)}</div>
  <header className="header">
   <a href="#top" className="brand" aria-label="NEKO DISCO トップ"><PawPrint size={25} fill="currentColor"/><span>NEKO<span className="brand-light">DISCO</span><small>夜のねこ研究所</small></span></a>
   <nav aria-label="メインメニュー"><a href="#dance-floor">フロアであそぶ</a><a href="#residents">12猫種に会う</a><a href="#quiz">ねこクイズ</a></nav>
   <div className="header-controls"><button className={`control sound ${sound?'active':''}`} aria-pressed={sound} aria-busy={soundState==='loading'} aria-label={soundState==='loading'?'音楽の読み込みを中止':sound?'音楽をオフにする':soundState==='error'?'音楽を再試行する':'STAR POP EXPRESSを再生する'} title={soundState==='error'?'音楽を読み込めませんでした。もう一度クリックしてお試しください。':'STAR POP EXPRESS · イントロ＋ループ'} onClick={toggleSound}>{sound?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{soundState==='loading'?'LOADING…':`SOUND ${soundState==='error'?'RETRY':sound?'ON':'OFF'}`}</span></button><span className="sr-only" role="status">{soundState==='loading'?'音楽を読み込んでいます':soundState==='error'?'音楽を読み込めませんでした。SOUNDボタンで再試行できます。':''}</span><button className="control motion" aria-pressed={!motion} aria-label={motion?'アニメーションを止める':'アニメーションを再生する'} onClick={()=>setMotion(!motion)}>{motion?<Pause size={16}/>:<Play size={16}/>}</button></div>
  </header>

  <section className="hero" aria-labelledby="hero-title">
   <div className="hero-heading"><p className="eyebrow"><span/> ALL CATS WELCOME. ALL NIGHT LONG.</p>
    <button className="hero-cat hero-cat-left" aria-label={`${breeds[0].name}を知る`} onClick={e=>discover(breeds[0],e)}><Cat index={0}/><span className="tiny-bubble">にゃんと、開店。</span></button>
    <h1 id="hero-title">NEKO <span>DISCO</span><i aria-hidden="true">✳</i></h1>
    <button className="hero-cat hero-cat-right" aria-label={`${breeds[1].name}を知る`} onClick={e=>discover(breeds[1],e)}><Cat index={1}/><span className="tiny-bubble">きみも踊る？</span></button>
    <div className="hero-subline"><h2>踊る。ねむる。<br className="mobile-break"/>ときどき、ねこを知る。</h2><p>ここは、ねこたちの夜のひみつ基地。<br/>気になるあの子に、ちょっとさわってみよう。</p><button className="primary-button" onClick={goFloor}><PawPrint size={19}/> フロアにあそびに行く</button></div>
   </div>
   <div id="dance-floor" className="floor-section">
    <div className="floor-topline"><span><i className="live-dot"/> THE DANCE FLOOR</span><span className="floor-hint"><MousePointer2 size={14}/> 猫もグッズも、タップしてみて</span><span className="floor-count"><Sparkles size={15}/> <b>{found.length.toString().padStart(2,'0')}</b> / 12 猫種</span></div>
    <div className="scene">
     <img className="scene-image" src="/images/disco-room.webp" alt="中央のミラーボールが輝くディスコ。キャットタワーや段ボール、爪とぎが並ぶ部屋に、12猫種が集まっています。" fetchPriority="high" width="1536" height="1024"/>
     <div className="scene-glow" aria-hidden="true"/>
     {sceneProps.map(s=>{const f=facts.find(f=>f.id===s.id)!;return <button key={s.id} className={`hotspot prop-hotspot spot-${s.id}`} style={{left:`${s.x}%`,top:`${s.y}%`,width:`${s.w}%`,height:`${s.h}%`}} aria-label={`${f.label}：猫の生態を知る`} {...sceneHintEvents(`prop-${s.id}`,f.label,'猫の生態を知る')} onClick={e=>discover(f,e)}><span className="prop-mark"><Sparkles size={13}/></span></button>})}
     {breeds.map((breed,i)=><button key={breed.id} data-breed={breed.id} className={`hotspot scene-cat ${found.includes(breed.id)?'discovered':''}`} style={{left:`${breed.scene.x}%`,top:`${breed.scene.y}%`,width:`${breed.scene.size}%`,zIndex:Math.round(breed.scene.y),'--i':i} as CSSProperties} aria-label={`${breed.name}を知る${found.includes(breed.id)?'（発見済み）':''}`} {...sceneHintEvents(`breed-${breed.id}`,breed.name,`猫種別${breed.rank}位 · タップで会いにいく`)} onClick={e=>discover(breed,e)}><Cat index={i}/><span className="hotspot-mark">{found.includes(breed.id)?<Check size={14}/>:<Plus size={15}/>}</span></button>)}
     <div className="floor-sticker" aria-hidden="true">NO RULES.<br/>JUST <b>MEOW.</b><span>好きなペースで、どうぞ。</span></div>
    </div>
    <div className="floor-bottom"><span>踊らなくても、寝ちゃっても。ねこだもの。</span><button onClick={e=>discover(breeds.find(f=>!found.includes(f.id))??breeds[0],e)}>{found.length===12?'12猫種、みんなに会えた！':'まだ会っていない猫に会う'} <Sparkles size={15}/></button></div>
   </div>
  </section>
  <div className="marquee" aria-hidden="true"><div>{Array.from({length:4},(_,i)=><span key={i}>EAT. SLEEP. MEOW. REPEAT. <PawPrint/> ねこって、なんかいい。 <span className="star">✳</span> </span>)}</div></div>

  <section id="residents" className="residents section-wrap">
   <div className="section-head"><div><p className="eyebrow">12 BREEDS. 12 PERSONALITIES. / 01</p><h2>みんな、ちがって。<br/><span>みんな、ねこ。</span></h2></div><p>人気ランキングから集まった、12猫種。<br/>耳も、毛並みも、性格も。それぞれの魅力を。<br/><span className="little-note"><MousePointer2 size={15}/> 気になるねこをタップ</span></p></div>
   <div className="ranking-note"><span className="ranking-badge">2026 RANKING</span><div><p><b>人気順に、12猫種をご紹介。</b> ミックスを除いた猫種別の順位を、1〜12位で表示しています。</p><p>出典：<a href={ranking.url} target="_blank" rel="noreferrer">{ranking.publisher}「{ranking.title}」</a>（{ranking.published}発表）</p><p>集計：{ranking.period}に同社の保険へ加入し、契約が開始された猫。国内すべての飼育猫を対象とした順位ではありません。</p></div></div>
   <div className="resident-grid">{breeds.map((breed,i)=><button className={`resident-card breed-card bg-${breed.color}${breed.rank===1?' featured-breed':''}`} key={breed.id} data-breed-card={breed.id} onClick={e=>discover(breed,e)} aria-label={`猫種別${breed.rank}位 ${breed.name}の紹介を開く`}>
    <div className="card-top"><span className="card-rank">{breed.rank<=3&&<Crown className={`rank-crown rank-crown-${breed.rank}`} size={30} strokeWidth={1.7} aria-hidden="true"/>}<span className="rank-caption">No.</span><b>{breed.rank}</b></span><span className="card-icon">{found.includes(breed.id)?<Check size={18}/>:<Plus size={18}/>}</span></div>
    <div className="cat-stage"><span className="cat-catchphrase">{breed.catchphrase}</span><Cat index={i}/>{breed.rank===1&&<span className="winner-sparkles" aria-hidden="true"><Sparkles size={23}/><Sparkles size={17}/></span>}</div>
    <span className="breed-english">{breed.english}</span><h3><BreedName name={breed.name}/></h3><p>{breed.intro}</p><div className="card-bottom"><span>{breed.trait}</span><span className="round-open"><Plus size={19}/></span></div>
   </button>)}</div>
   <p className="breed-note">毛色・模様・体格・性格には個体差があります。イラストは、それぞれの猫種の一例を表現しています。</p>
  </section>

  <section id="cat-time" className="cat-time section-wrap">
   <div className="time-copy"><p className="eyebrow">A DAY IN CAT TIME / 02</p><h2>時計よりも、<br/><span>ねこの気分。</span></h2><p>ねこたちの一日は、<br/>遊びとお昼寝の、いいリズム。<br/>時間を動かして、のぞいてみよう。</p><small>これは一例。リズムには個体差があります。</small></div>
   <div className={`time-panel time-${period}`}><div className="time-display"><span>{p.mood}</span><b>{p.time}</b><span className="time-spark">✳</span></div><div className="time-scene"><button key={period} onClick={e=>discover(breeds[p.breed],e)} aria-label={`${breeds[p.breed].name}を知る`}><Cat index={p.breed}/><span className="time-breed-name">{breeds[p.breed].name}</span></button><div key={p.headline} className="time-description"><h3>{p.headline}</h3><p>{p.text}</p></div></div><Slider className="time-slider" value={[period]} min={0} max={3} step={1} onValueChange={v=>setPeriod(v[0])} aria-label="ねこの一日：朝、昼、夕方、夜"/><div className="time-labels">{periods.map((t,i)=><button className={i===period?'selected':''} key={t.time} aria-pressed={i===period} onClick={()=>setPeriod(i)}>{t.time}<span>{t.label}</span></button>)}</div></div>
  </section>

  <section id="quiz" className="quiz-section section-wrap"><div className="quiz-intro"><span className="quiz-stamp">NEKO<br/>LOVER<br/><Heart size={25} fill="currentColor"/></span><p className="eyebrow">ONE LAST THING / 03</p><h2>きみの、<br/>ねこ理解度は？</h2><p>フロアで会った猫たちを、<br/>3つのクイズでおさらい。</p><Cat index={2}/></div><div className="quiz-card">
   {!finished?<><div className="quiz-progress"><span>CAT QUIZ</span><div>{quizzes.map((_,i)=><span className={i<=question?'done':''} key={i}/>)}</div><b>0{question+1} / 03</b></div><h3>{quizzes[question].q}</h3><div className="quiz-options">{quizzes[question].choices.map((c,i)=><button key={`${question}-${i}`} disabled={answer!==null} className={answer!==null?(i===quizzes[question].answer?'correct':i===answer?'incorrect':'dim'):''} onClick={()=>answerQuiz(i)}><span>{String.fromCharCode(65+i)}</span>{c}{answer!==null&&i===quizzes[question].answer&&<Check size={22}/>}</button>)}</div>{answer!==null?<div className="quiz-feedback" role="status"><strong>{answer===quizzes[question].answer?'大正解、にゃんとすばらしい！':'おしい！ ねこのひみつをひとつ発見。'}</strong><p>{quizzes[question].explain}</p><button className="quiz-review" onClick={e=>discover(breeds[quizzes[question].breed],e)}>この猫の紹介を見る</button><button className="dark-button" onClick={()=>{if(question===2)setFinished(true);else{setQuestion(question+1);setAnswer(null)}}}>{question===2?'結果を見る':'次のクイズへ'}</button></div>:<p className="quiz-prompt">ぴんときた答えを選んでね。</p>}</>:<div className="quiz-result" role="status"><Sparkles size={38}/><p>YOU ARE A NEKO LOVER!</p><h3>{score}<small> / 3</small></h3><h4>{score===3?'立派な、ねこ博士。':'ねこと、もっと仲よくなれたね。'}</h4><p>正解しても、まちがえても。<br/>知るほど、ねこが好きになる。</p><button className="dark-button" onClick={()=>{setFinished(false);setQuestion(0);setAnswer(null);setScore(0)}}><RotateCcw size={17}/> もう一度あそぶ</button></div>}
  </div></section>

  <section className="closing"><p className="eyebrow">THANKS FOR HANGING OUT.</p><h2>好きなペースで。<br/>また、あそぼう。</h2><button onClick={goFloor} className="primary-button"><PawPrint size={19}/> もうひと踊りする</button><div className="closing-cats">{[8,6,1,0,2,9].map(n=>{const f=breeds[n];return <button key={n} aria-label={`${f.name}を知る`} onClick={e=>discover(f,e)}><Cat index={n}/></button>})}</div></section>
  <footer><div className="footer-top"><a className="brand" href="#top"><PawPrint size={24}/><span>NEKO DISCO<small>夜のねこ研究所</small></span></a><span>踊るのも、休むのも、ねこの自由。</span><a href="#top">BACK TO TOP ↑</a></div><div className="footer-bottom"><p>ここは空想のディスコ。ほんもののねこには、静かな居場所と新鮮なお水を。</p><span>© 2026 NEKO DISCO</span></div><details className="sources"><summary>ランキング・猫種・生態の参考資料</summary><p>ランキングは{ranking.publisher}の2026年版を使用。猫種の紹介は同社の猫種別飼い方ガイドとCFAの資料、生態の説明はCats Protectionの公開資料を参考にしています。猫種ごとの紹介にも出典リンクがあります。</p><div><a href={ranking.url} target="_blank" rel="noreferrer">2026年版 人気飼育猫種ランキング</a><a href="https://www.ipet-ins.com/cat-insurance/breed/" target="_blank" rel="noreferrer">第一アイペット — 猫種別飼い方ガイド</a><a href="https://cfa.org/breeds/" target="_blank" rel="noreferrer">CFA — 猫種ガイド</a>{Array.from(new Set(facts.map(f=>f.source))).map((url,i)=><a key={url} href={url} target="_blank" rel="noreferrer">Cats Protection — {['夜の活動','ボディランゲージ','猫と遊び','隠れる行動','猫の眠り','食事と水','爪とぎ','ひげの役割'][i]??'猫の行動'}</a>)}</div></details></footer>
  <aside className="discovery-pill" aria-live="polite"><PawPrint size={17}/><span>出会った猫種</span><b>{found.length}<small> / 12</small></b>{found.length===12&&<Sparkles size={18}/>}</aside>
  <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent className={`fact-dialog bg-${selected?.color??'pink'}`} showCloseButton={false} onCloseAutoFocus={e=>{e.preventDefault();lastTrigger.current?.focus()}}>
   {selected&&<><button className="dialog-close" aria-label="紹介を閉じる" onClick={()=>setSelected(null)}><X size={21}/></button>{'name' in selected?<>
    <div className="fact-visual breed-visual"><span className="fact-number">2026 RANKING<br/><small>猫種別<span className="rank-context">ミックスを除く</span></small><b>{String(selected.rank).padStart(2,'0')}<small>位</small></b></span><Cat index={breeds.indexOf(selected)}/><span className="fact-sound">{selected.catchphrase}</span></div>
    <div className="fact-copy breed-copy"><p className="eyebrow">{selected.english}</p><DialogTitle className="fact-title"><BreedName name={selected.name}/></DialogTitle><DialogDescription className="fact-body">{selected.intro}</DialogDescription><dl className="breed-details"><div><dt>見た目の特徴</dt><dd>{selected.appearance}</dd></div><div><dt>性格の傾向</dt><dd>{selected.personality}</dd></div></dl><p className="fact-tip"><PawPrint size={20}/><span>{selected.detail}</span></p><p className="individual-note">性格や見た目には個体差があります。イラストは一例です。</p><div className="fact-actions"><a href={selected.source} target="_blank" rel="noreferrer">猫種の参考：{selected.sourceName}</a><button className="dark-button" onClick={()=>setSelected(null)}>なるほど、にゃ！ <Check size={16}/></button></div></div>
   </>:<>
    <div className="fact-visual prop-visual"><Sparkles size={70}/><span className="fact-sound">{selected.sound}</span></div><div className="fact-copy"><p className="eyebrow">CAT LIFE / {selected.label}</p><DialogTitle className="fact-title">{selected.title}</DialogTitle><DialogDescription className="fact-body">{selected.body}</DialogDescription><p className="fact-tip"><PawPrint size={20}/><span>{selected.tip}</span></p><div className="fact-actions"><a href={selected.source} target="_blank" rel="noreferrer">参考：Cats Protection</a><button className="dark-button" onClick={()=>setSelected(null)}>なるほど、にゃ！ <Check size={16}/></button></div></div>
   </>}</>}
  </DialogContent></Dialog>
  {burst&&<div key={burst.id} className="burst" aria-hidden="true" style={{left:burst.x,top:burst.y}}>{Array.from({length:9},(_,i)=><span key={i} style={{'--angle':`${i*40}deg`,'--color':['#e6ff6b','#ff9cd6','#8bedeb'][i%3]} as CSSProperties}>{i%2?'✦':'♥'}</span>)}</div>}
  <SceneTooltip hint={selected?null:sceneHint}/>
 </main>
}
