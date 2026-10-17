"""Transcribe the site's recorded clips with a Hebrew Whisper model, so mispronounced or cut-off
recordings can be found without listening to all of them.

  python scripts/audio/whisper/transcribe.py <shard> <shards> <out.jsonl>

Reads scripts/audio/whisper/clips.json ({lang, id, group, text}); clips already in <out.jsonl>
are skipped, so a stopped run continues where it left off. Run by .github/workflows/whisper-check.yml.
"""
import json
import os
import sys

from faster_whisper import WhisperModel

shard, shards, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
here = os.path.dirname(os.path.abspath(__file__))
clips = json.load(open(os.path.join(here, 'clips.json'), encoding='utf-8'))
mine = [c for i, c in enumerate(clips) if i % shards == shard]

done = set()
if os.path.exists(out):
    for line in open(out, encoding='utf-8'):
        try:
            r = json.loads(line)
            done.add(r['lang'] + '/' + r['id'])
        except (ValueError, KeyError):
            pass

model = WhisperModel(os.environ.get('WHISPER_MODEL', 'ivrit-ai/whisper-large-v3-turbo-ct2'), device='cpu', compute_type='int8')
root = os.path.join(here, '..', '..', '..', 'public', 'audio')
with open(out, 'a', encoding='utf-8') as f:
    for n, c in enumerate(mine):
        key = c['lang'] + '/' + c['id']
        if key in done:
            continue
        path = os.path.join(root, c['lang'], c['id'] + '.mp3')
        segments, info = model.transcribe(path, language=c['lang'], beam_size=5, vad_filter=False, condition_on_previous_text=False)
        segs = list(segments)
        f.write(json.dumps({
            'lang': c['lang'], 'id': c['id'],
            'heard': ' '.join(s.text.strip() for s in segs).strip(),
            'duration': round(info.duration, 2),
            'logprob': round(min((s.avg_logprob for s in segs), default=-9), 3),
            'no_speech': round(max((s.no_speech_prob for s in segs), default=1), 3),
        }, ensure_ascii=False) + '\n')
        f.flush()
        if n % 50 == 0:
            print(f'shard {shard}: {n}/{len(mine)}', flush=True)
