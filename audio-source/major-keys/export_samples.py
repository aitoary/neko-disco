"""Two-pass matched-loudness WAV / MP3 exports, followed by decode checks."""
from pathlib import Path
import json
import re
import subprocess
import sys
from scores import TRACKS

OUT=Path(__file__).resolve().parent.parent


def run(command):
    return subprocess.run(command,check=True,capture_output=True,text=True)


def measure(path):
    result=run(['ffmpeg','-hide_banner','-nostats','-i',str(path),
        '-af','loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json','-f','null','-'])
    return json.loads(re.findall(r'\{[^{}]+\}',result.stderr)[-1])


def export(track):
    raw=OUT/f"{track['file']}-premaster.wav"
    measured=measure(raw)
    af=('loudnorm=I=-14:TP=-1.5:LRA=9:linear=true:'
        f'measured_I={measured["input_i"]}:measured_TP={measured["input_tp"]}:'
        f'measured_LRA={measured["input_lra"]}:measured_thresh={measured["input_thresh"]}:'
        f'offset={measured["target_offset"]}')
    wav=OUT/f"{track['file']}.wav"
    mp3=OUT/f"{track['file']}.mp3"
    run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',af,
         '-ar','44100','-c:a','pcm_s24le',str(wav)])
    run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','256k',
         '-id3v2_version','3','-metadata',f'title={track["title"]} - Audition {track["id"]}',
         '-metadata','artist=NEKO DISCO','-metadata','album=NEKO DISCO BGM Drafts',
         '-metadata','date=2026','-metadata',f'track={track["id"]}',str(mp3)])
    final=measure(mp3)
    probe=json.loads(run(['ffprobe','-v','error','-show_entries',
        'format=duration,size:stream=codec_name,sample_rate,channels','-of','json',str(mp3)]).stdout)
    stream=probe['streams'][0]
    assert stream['channels']==2 and stream['sample_rate']=='44100'
    assert abs(float(final['input_i'])-(-14))<.65
    assert float(final['input_tp']) < -.1
    report={'title':track['title'],'premaster':measured,'final_mp3':final,'probe':probe,
            'checks':'2-channel 44.1 kHz MP3 decodes; loudness in range; true peak below 0 dBTP'}
    (OUT/'source'/f"verification-{track['id']}.json").write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'title':track['title'],'duration':probe['format']['duration'],
        'LUFS':final['input_i'],'true_peak_dBTP':final['input_tp'],
        'LRA_LU':final['input_lra'],'mp3':mp3.name}),flush=True)


if __name__=='__main__':
    for track in TRACKS:
        if len(sys.argv)==1 or track['id'] in sys.argv[1:]:
            export(track)
