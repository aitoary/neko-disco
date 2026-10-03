"""Check the requested keys and inspect musical independence before synthesis."""
import json
from pathlib import Path
from difflib import SequenceMatcher
from scores import TRACKS

SCALES={'08':{11,1,3,4,6,8,10},'09':{0,1,3,5,6,8,10},'10':{11,1,3,5,6,8,10}}
BLACK={1,3,6,8,10}
reports=[]
for track in TRACKS:
    allowed=SCALES[track['id']]
    harmony_pcs={n%12 for root,notes in track['harmony'].values() for n in [root,*notes]}
    melody_pcs={note%12 for phrase in track['phrases'].values() for _,note,_,_ in phrase}
    assert harmony_pcs<=allowed,(track['title'],'harmony outside key',harmony_pcs-allowed)
    assert melody_pcs==allowed,(track['title'],'melody must use all 7 requested scale tones',melody_pcs)
    assert BLACK<=melody_pcs
    assert len(track['progression'])==20 and set(track['lead_bars'])==set(range(20))
    for notes in track['phrases'].values():
        assert all(0<=at<4 and duration>0 and 0<velocity<=1.2 for at,note,duration,velocity in notes)
    bass_pcs={ (root+offset)%12 for root,_ in track['harmony'].values() for _,offset,_,_ in track['bass_pattern']}
    assert bass_pcs<=allowed,(track['title'],'bass outside key',bass_pcs-allowed)
    report={'id':track['id'],'title':track['title'],'key':track['key'],'scale_pitch_classes':sorted(allowed),
            'melody_pitch_classes':sorted(melody_pcs),'harmony_pitch_classes':sorted(harmony_pcs),
            'all_five_black_keys_used':True,'white_keys_used':sorted(allowed-BLACK),
            'hook_progression':track['progression'][2:10],
            'first_hook_phrase':track['phrases'][track['lead_bars'][2]]}
    reports.append(report)
for i,a in enumerate(TRACKS):
    for b in TRACKS[i+1:]:
        pa=a['phrases'][a['lead_bars'][2]];pb=b['phrases'][b['lead_bars'][2]]
        motif_a=[(round(at,3),n-pa[0][1],round(d,3)) for at,n,d,_ in pa]
        motif_b=[(round(at,3),n-pb[0][1],round(d,3)) for at,n,d,_ in pb]
        assert motif_a!=motif_b, 'Transposed duplicate hook'
        print(json.dumps({'pair':[a['id'],b['id']],'hook_sequence_similarity':round(SequenceMatcher(None,motif_a,motif_b,autojunk=False).ratio(),3)}))
path=Path(__file__).resolve().parent/'key-validation.json'
path.write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(reports,ensure_ascii=False,indent=2))
