"""STAR POP EXPRESS: original D-flat-major candy disco, all diatonic."""

def phrase(notes, rhythm, velocities=None):
    if velocities is None:
        velocities=[1,.91,.97,.88,.96,.85,.94,.89,.95]
    return [(at,note,length,velocity) for note,(at,length),velocity in zip(notes,rhythm,velocities,strict=False)]

CALL=[(0,.32),(.5,.30),(1,.37),(1.5,.26),(2.25,.33),(2.75,.23),(3.25,.18),(3.5,.33)]
ANSWER=[(0,.58),(.75,.25),(1.25,.35),(2,.32),(2.5,.24),(3,.26),(3.5,.34)]

TRACK={
 'id':'09','title':'STAR POP EXPRESS','file':'STAR-POP-EXPRESS-demo-09',
 'style':'pop','bpm':126,'tail':2.2,'seed':2026100309,'swing':0,
 'key':'Db major','scale_pitch_classes':[0,1,3,5,6,8,10],
 'description_ja':'歌えるシンセのコール＆レスポンス。きらめく四つ打ちディスコポップ。',
 'intro_kind':'rising-spark',
 'harmony':{
   'Dbmaj9':(37,[60,63,65,68]),
   'Gbmaj9':(42,[53,56,58,61]),
   'Ab13':(44,[54,58,60,65]),
   'Fm7':(41,[56,60,63,65]),
   'Bbm9':(46,[53,56,60,61]),
   'Ebm9':(39,[53,54,58,61]),
   'Ab7sus4':(44,[54,56,61,63]),
   'Db6/9':(37,[53,56,58,63]),
 },
 'progression':['Dbmaj9','Ab13',
   'Gbmaj9','Ab13','Fm7','Bbm9','Ebm9','Ab7sus4','Db6/9','Ab13',
   'Ebm9','Ab7sus4',
   'Gbmaj9','Ab13','Fm7','Bbm9','Ebm9','Ab7sus4','Ab13','Db6/9'],
 'bass_pattern':[(0,0,.39,1),(.75,12,.20,.76),(1.5,0,.35,.94),
                 (2,7,.29,.78),(2.75,0,.23,.88),(3.5,12,.30,.84)],
 'chord_pattern':[(.5,.35,1),(1.5,.27,.83),(2.5,.32,.96),(3.5,.30,.91)],
 'phrases':{
   'intro':[(0,85,.20,1),(.25,85,.15,.88),(.75,80,.42,.96),(1.5,77,.30,.90),
            (2,75,.23,.85),(2.5,77,.28,.91),(3,80,.25,.97),(3.5,85,.30,1)],
   'intro_answer':[(0,84,.51,1),(.75,80,.29,.91),(1.25,77,.42,.94),
                  (2,75,.27,.88),(2.5,80,.23,.92),(3,82,.22,.95),(3.5,84,.30,1)],
   'call':phrase([78,82,85,82,80,78,80,82],CALL),
   'answer':phrase([84,82,80,77,75,77,80],ANSWER),
   'call_minor':phrase([77,80,84,80,78,77,78,80],CALL),
   'answer_minor':phrase([82,80,77,75,73,77,82],ANSWER),
   'call_ii':phrase([75,78,82,78,77,75,77,78],CALL),
   'suspension':phrase([78,77,75,73,75,78,80],ANSWER),
   'tonic_hook':phrase([73,77,80,77,75,73,75,77],CALL),
   'lift':[(0,80,.40,1),(.75,84,.25,.94),(1.25,85,.38,.96),(2,84,.29,.89),
           (2.5,82,.25,.87),(3,80,.26,.90),(3.5,84,.32,1)],
   'break':[(.5,75,.40,.86),(1.25,78,.46,.92),(2.25,82,.64,.97),(3.25,78,.39,.84)],
   'launch':[(0,78,.48,.88),(1,75,.34,.82),(2,80,.26,.91),(2.5,82,.23,.94),(3,84,.25,.97),(3.5,85,.29,1)],
   'return_call':phrase([78,82,85,82,80,78,82,85],CALL),
   'return_answer':phrase([84,85,84,80,77,80,84],ANSWER),
   'end':[(0,85,.64,1),(1,80,.28,.90),(1.5,77,.29,.87),(2.25,73,1.35,.98)],
 },
 'lead_bars':{0:'intro',1:'intro_answer',2:'call',3:'answer',4:'call_minor',5:'answer_minor',
              6:'call_ii',7:'suspension',8:'tonic_hook',9:'lift',10:'break',11:'launch',
              12:'return_call',13:'return_answer',14:'call_minor',15:'answer_minor',
              16:'call_ii',17:'suspension',18:'lift',19:'end'},
 'intro_pickup':[(3.25,84),(3.75,85)],'ending_root':37,
}
