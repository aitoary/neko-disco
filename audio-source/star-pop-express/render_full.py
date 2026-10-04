"""STAR POP EXPRESS full arrangement and a genuinely cyclic PCM body.

The 64-bar body is rendered with four matching bars before and after it.
Effects/filter state at the splice is validated against the following cycle.
The approved D-flat-major melody, tempo and synth patches are retained.
"""
from pathlib import Path
import argparse,json,sys,subprocess,re
import numpy as np
from scipy.io import wavfile
import synth as s

sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'major-keys'))
from track09 import TRACK

SR=s.SR
BPM=126
BEAT=60/BPM
BAR=4*BEAT
BEAT_FRAMES=21000
BAR_FRAMES=84000
TAIL=2.4
SCALE={0,1,3,5,6,8,10}
PHRASES=dict(TRACK['phrases'])
PHRASES.update({
 'verse_a':[(0,70,.62,.91),(.875,73,.30,.82),(1.5,77,.48,.90),(2.5,75,.30,.81),(3.125,73,.24,.79),(3.5,70,.37,.89)],
 'verse_b':[(0,68,.52,.90),(.75,72,.28,.82),(1.25,75,.40,.88),(2.125,73,.29,.81),(2.75,72,.25,.79),(3.5,68,.37,.87)],
 'verse_c':[(0,70,.46,.90),(.75,73,.28,.84),(1.5,77,.50,.89),(2.375,78,.28,.87),(3,77,.23,.81),(3.5,73,.34,.88)],
 'pre_a':[(0,75,.53,.92),(.75,78,.28,.86),(1.25,82,.40,.93),(2,80,.29,.84),(2.625,78,.23,.83),(3.125,77,.24,.84),(3.5,78,.34,.94)],
 'pre_b':[(0,77,.52,.93),(.75,80,.28,.86),(1.25,84,.43,.96),(2,82,.30,.85),(2.625,80,.23,.83),(3.125,78,.24,.85),(3.5,80,.35,.94)],
 'pre_lift':[(0,78,.40,.92),(.625,80,.30,.87),(1.25,82,.40,.94),(2,84,.30,.95),(2.625,85,.23,.98),(3.125,84,.20,.90),(3.5,84,.34,1)],
 'loop_turn':[(0,73,.35,.98),(.5,77,.28,.89),(1,80,.37,.97),(1.5,77,.26,.86),(2.25,75,.33,.94),(2.75,73,.23,.83),(3.25,75,.18,.90),(3.5,73,.34,.98)],
 'outro_hold':[(0,85,.66,1),(1,80,.30,.87),(1.5,77,.28,.84),(2.25,73,1.55,.98)],
})
HOOK_CHORDS=TRACK['progression'][2:10]
HOOK_PHRASES=['call','answer','call_minor','answer_minor','call_ii','suspension','tonic_hook','lift']
BODY=[]
SECTIONS=[]

def section(name,chords,phrases,mode):
 start=len(BODY)
 for i,(chord,phrase) in enumerate(zip(chords,phrases,strict=True)):
  BODY.append({'id':len(BODY),'chord':chord,'phrase':phrase,'mode':mode,'local':i,'length':len(chords),'section':name})
 SECTIONS.append({'name':name,'bar_start':start,'bars':len(chords)})

section('main hook',HOOK_CHORDS*2,HOOK_PHRASES+['return_call','return_answer',*HOOK_PHRASES[2:]],'hook')
section('night groove',['Bbm9','Fm7','Gbmaj9','Dbmaj9','Ebm9','Fm7','Gbmaj9','Ab7sus4'],
        ['verse_a','verse_b','verse_c','tonic_hook','call_ii','verse_b','verse_c','suspension'],'verse')
section('lift',['Ebm9','Fm7','Gbmaj9','Ab7sus4','Ebm9','Gbmaj9','Ab7sus4','Ab13'],
        ['pre_a','pre_b','call','suspension','pre_a','return_call','launch','pre_lift'],'pre')
section('hook return',HOOK_CHORDS*2,['return_call','return_answer',*HOOK_PHRASES[2:]]*2,'return')
section('starlight break',['Bbm9','Fm7','Gbmaj9','Dbmaj9','Ebm9','Gbmaj9','Ab7sus4','Ab13'],
        [None,None,'break',None,'break','call','launch','pre_lift'],'break')
section('final hook',['Gbmaj9','Ab13','Fm7','Bbm9','Ebm9','Ab7sus4','Ab13','Db6/9'],
        ['return_call','return_answer','call_minor','answer_minor','call_ii','suspension','lift','loop_turn'],'final')
assert len(BODY)==64
INTRO=[{'id':200+i,'chord':chord,'phrase':phrase,'mode':'intro','local':i,'length':4,'section':'intro'}
       for i,(chord,phrase) in enumerate(zip(['Dbmaj9','Ab13','Db6/9','Ab7sus4'],['intro','intro_answer','tonic_hook','launch'],strict=True))]
OUTRO=[{'id':300+i,'chord':chord,'phrase':phrase,'mode':'outro','local':i,'length':4,'section':'outro'}
       for i,(chord,phrase) in enumerate(zip(['Gbmaj9','Ab13','Db6/9','Db6/9'],['call','answer','loop_turn','outro_hold'],strict=True))]

for plan in [*BODY,*INTRO,*OUTRO]:
 root,voices=TRACK['harmony'][plan['chord']]
 assert {n%12 for n in [root,*voices]}<=SCALE
 if plan['phrase']:
  assert {n%12 for _,n,_,_ in PHRASES[plan['phrase']]}<=SCALE

EVENTS=[]

def render(plans,tail=0,label='body'):
 nframes=len(plans)*BAR_FRAMES+round(tail*SR)
 s.initialize(nframes/SR,2026100313)
 kicks=[]
 def play(role,note,length,at,gain,pan=0):
  assert note%12 in SCALE
  patch='bell' if role=='bells' else 'chord' if role=='chords' else role
  s.add(role,s.voice(note,length*BEAT,patch,'pop'),at,gain,pan)
  EVENTS.append({'render':label,'part':role,'midi':note,'frame':round(at*SR),'beats':length})
 for position,plan in enumerate(plans):
  # Local seeds make guard bars identical to their corresponding body bars.
  s.RNG=np.random.default_rng(2026100313+plan['id']*97)
  at=position*BAR
  root,voices=TRACK['harmony'][plan['chord']]
  mode,local=plan['mode'],plan['local']
  quiet=mode=='break' and local<4
  ending=mode=='outro' and local==3
  drum_gain=.68 if quiet else .86 if mode=='verse' else 1
  kick_beats=[0] if ending else [0,2] if quiet else [0,1,2,3]
  for b in kick_beats:
   s.add('kick',s.kick(),at+b*BEAT,.73*drum_gain)
   kicks.append(at+b*BEAT)
  if not ending:
   for b in ([3] if quiet else [1,3]):
    s.add('clap',s.clap(),at+b*BEAT+.004,.23*(.55 if quiet else .83 if mode=='verse' else 1))
   for step in range(8):
    if quiet and step%2==0:continue
    opened=step%2==1 and not quiet
    gain=(.108 if opened else .056)*(1 if step%2 else .73)*drum_gain
    s.add('hats',s.hat(opened),at+step*.5*BEAT+s.RNG.uniform(-.0015,.0025),gain,[-.23,.25][step%2])
   if mode not in ['intro','break']:
    for step in [3,7,11,15]:
     s.add('hats',s.hat(),at+step*.25*BEAT+.006,.027,-.44)
    for b,note,pan in [(1.75,73,-.42),(3.25,78,.45)]:
     s.add('percussion',s.percussion(note),at+b*BEAT,.096*drum_gain,pan)
   if local==plan['length']-1 or (mode in ['hook','return'] and local==7):
    for i,b in enumerate([3.25,3.5,3.75]):
     s.add('clap',s.clap(True),at+b*BEAT,.055+i*.023,[-.14,.14][i%2])
  if local==0 or (mode in ['hook','return'] and local==8):
   s.add('fx',s.cymbal(),at,.041 if quiet else .055,-.18)
  bass=[(0,root,1.8,1)] if ending else [(0,root,1.1,.66),(2,root,.45,.60)] if quiet else \
       [(b,root+offset,length,velocity) for b,offset,length,velocity in TRACK['bass_pattern']]
  for b,note,length,velocity in bass:
   play('bass',note,length,at+b*BEAT,.37*velocity*(.91 if mode=='verse' else 1))
  chord_events=[(0,.82,1.12),(1.5,.28,.79),(2.5,.38,.91),(3.5,.23,.8)] if mode=='intro' else \
               [(0,3.1,.57)] if quiet else [(0,3.1,.8)] if ending else TRACK['chord_pattern']
  for b,length,velocity in chord_events:
   for i,note in enumerate(voices):
    play('chords',note,length,at+b*BEAT+i*.004,.071*velocity*(.78 if mode=='verse' else 1),float(np.linspace(-.55,.55,len(voices))[i]))
  for note in voices:
   s.add('pad',s.pad_note(note,(3.85 if ending else 3.65)*BEAT),at,.032 if quiet else .023 if mode in ['return','final'] else .020)
  if plan['phrase']:
   for b,note,length,velocity in PHRASES[plan['phrase']]:
    gain=.218*(.76 if mode=='verse' else .61 if mode=='break' else .94 if mode=='pre' else 1)
    play('lead',note,length,at+b*BEAT,gain*velocity)
    if mode in ['return','final'] and b in [0,.5,1.5,2.25]:
     play('bells',note+12,.20,at+b*BEAT+.011,.032*velocity,.35)
  if mode=='break' or (mode=='pre' and local>=4):
   for step in range(8):
    note=voices[[0,2,1,3][step%4]]+12
    play('bells',note,.20,at+step*.5*BEAT,.077 if mode=='break' else .046,[-.35,.35][step%2])
  elif mode not in ['verse','outro'] and local%2==1:
   for b,note in [(3.25,voices[1]+24),(3.75,voices[2]+24)]:
    play('bells',note,.14,at+b*BEAT,.034,.38)
  if mode=='intro' and local==3:
   for step,note in enumerate(voices):
    play('bells',note+24,.14,at+(3+step*.25)*BEAT,.052,[-.32,.32][step%2])
  if mode in ['pre','break'] and local==plan['length']-1:
   t=s.times(BAR*.75)
   noise=s.filt(s.RNG.normal(0,1,len(t)),[1300,6500],'bandpass')
   noise*=np.linspace(0,1,len(t))**2*np.minimum(t/.02,1)
   noise[-round(.02*SR):]*=np.linspace(1,0,round(.02*SR))
   s.add('fx',noise,at+BEAT,.037)
  if position%16==0:print(f'{label}: bar {position+1}/{len(plans)}',flush=True)
 print(f'Mixing {label}',flush=True)
 mix,stats=s.master(BEAT,kicks,'pop')
 assert mix.shape==(nframes,2) and np.isfinite(mix).all()
 return mix,stats


def measure(path):
 r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-af','loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json','-f','null','-'],check=True,capture_output=True,text=True)
 return json.loads(re.findall(r'\{[^{}]+\}',r.stderr)[-1])


def pcm(x):
 return np.clip(np.rint(x*32767),-32768,32767).astype(np.int16)


def main(out):
 out.mkdir(parents=True,exist_ok=True)
 # Guard bars carry release, echo, reverb, sidechain and filter state.
 guarded,stem_stats=render([*BODY[-4:],*BODY,*BODY[:4]],label='cyclic body')
 start=4*BAR_FRAMES
 length=64*BAR_FRAMES
 loop=guarded[start:start+length].copy()
 following=guarded[start+length:start+length+BAR_FRAMES]
 wrap_error=float(np.max(np.abs(loop[:BAR_FRAMES]-following)))
 assert wrap_error<2e-5,('Effects state is not periodic',wrap_error)
 del guarded,following
 intro,_=render(INTRO,TAIL,'intro')
 outro,_=render(OUTRO,TAIL,'outro')
 intro_frames=4*BAR_FRAMES
 full_frames=72*BAR_FRAMES+round(TAIL*SR)
 full=np.zeros((full_frames,2),np.float32)
 full[:len(intro)]+=intro
 body=loop.copy()
 fade=round(.005*SR)
 body[:fade]*=np.linspace(0,1,fade)[:,None]
 full[intro_frames:intro_frames+length]+=body
 del body
 # Carry the periodic body's state into a beat-aligned outro crossfade.
 transition=BEAT_FRAMES
 weight=np.linspace(1,0,transition)[:,None]
 outro[:transition]=loop[:transition]*weight+outro[:transition]*(1-weight)
 full[intro_frames+length:]+=outro
 wavfile.write(out/'loop-premaster.wav',SR,loop)
 raw_measure=measure(out/'loop-premaster.wav')
 gain_db=-14-float(raw_measure['input_i'])
 gain=10**(gain_db/20)
 # Memoryless peak control preserves the periodic boundary and sample count.
 def finish(x):
  y=x*gain
  a=np.abs(y)
  knee=.65;room=.17
  return np.sign(y)*np.where(a<=knee,a,knee+room*np.tanh((a-knee)/room))
 loop_final=finish(loop)
 full_final=finish(full)
 intro_final=finish(intro)
 loop_path=out/'STAR-POP-EXPRESS-loop-v1.wav'
 full_path=out/'STAR-POP-EXPRESS-full-v1.wav'
 intro_path=out/'STAR-POP-EXPRESS-intro-v1.wav'
 wavfile.write(loop_path,SR,pcm(loop_final))
 wavfile.write(full_path,SR,pcm(full_final))
 wavfile.write(intro_path,SR,pcm(intro_final))
 mp3=out/'STAR-POP-EXPRESS-full-v1.mp3'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(full_path),'-c:a','libmp3lame','-b:a','256k','-id3v2_version','3',
  '-metadata','title=STAR POP EXPRESS - Full Version','-metadata','artist=NEKO DISCO',str(mp3)],check=True)
 loop_loudness=measure(loop_path);full_loudness=measure(mp3)
 for metrics in [loop_loudness,full_loudness]:
  assert -15.5<float(metrics['input_i'])<-13.3,metrics
  assert float(metrics['input_tp'])<-.3,metrics
 rate,decoded=wavfile.read(loop_path)
 assert rate==SR and decoded.shape==(length,2) and decoded.dtype==np.int16
 expected={int(e['midi'])%12 for e in EVENTS}
 assert expected==SCALE
 delta=float(np.max(np.abs(decoded[0].astype(float)-decoded[-1].astype(float)))/32768)
 adjacent=np.abs(np.diff(decoded.astype(np.float32)/32768,axis=0))
 slope99=float(np.percentile(adjacent,99.9))
 assert delta<max(.025,slope99*1.5),('Possible boundary click',delta,slope99)
 report={
  'title':'STAR POP EXPRESS','bpm':BPM,'key':'Db major','sample_rate':SR,'loop_frames':length,
  'loop_seconds':length/SR,'intro_body_start_seconds':intro_frames/SR,'full_seconds':full_frames/SR,
  'body_bars':64,'intro_bars':4,'outro_bars':4,'tail_seconds':TAIL,
  'scale_pitch_classes':sorted(expected),'sections':SECTIONS,'body_plan':BODY,
  'synth_stem_rms_dbfs':stem_stats,'gain_db':round(gain_db,3),
  'periodic_effect_state_max_error':wrap_error,'boundary_step':delta,'adjacent_step_p999':slope99,
  'loop_loudness':loop_loudness,'full_mp3_loudness':full_loudness,
  'loop_format':'44.1 kHz stereo PCM16 WAV, exactly 256 beats, no encoder delay or fade',
  'player':'one-shot intro overlaps its release with a sample-accurate AudioBufferSourceNode body loop',
  'audible_listening_performed':False,
 }
 (out/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2,default=lambda v:v.item() if isinstance(v,np.generic) else v)+'\n')
 (out/'note-events.json').write_text(json.dumps(EVENTS,ensure_ascii=False)+'\n')
 print(json.dumps({k:report[k] for k in ['full_seconds','loop_seconds','periodic_effect_state_max_error','boundary_step','adjacent_step_p999']},indent=2),flush=True)
 print(json.dumps({'loop_LUFS':loop_loudness['input_i'],'full_LUFS':full_loudness['input_i'],'loop_TP':loop_loudness['input_tp'],'full_TP':full_loudness['input_tp']},indent=2),flush=True)

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--output-dir',type=Path,required=True)
 main(p.parse_args().output_dir)
