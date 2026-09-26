"""Build src/data/today-game/MM.json for Oct–Aug from the v2 drafts + verification results.

Inputs (scratchpad/game): v2-MM.json drafts, passes.json {MM: {"dd/i": "both|enArt|enOnly"}}.
A fact item goes live when it was matched on the English date page AND on a second source
(Hebrew date page, or the English article's own date). Items matched only on the English date page
are used solely to reach the minimum of 3 questions for a date. Day items must match
src/data/today/MM.json with src yo-yoo/wikipedia.
"""
import json, random, re, sys, urllib.parse

G = '/tmp/claude-0/-home-claude-ugabuga/49ab9a1a-d68b-5d90-a8b3-2c6b41235f5a/scratchpad/game'
ROOT = '/home/claude/ugabuga'
HEM = {'01': 'בינואר', '02': 'בפברואר', '03': 'במרץ', '04': 'באפריל', '05': 'במאי', '06': 'ביוני', '07': 'ביולי',
       '08': 'באוגוסט', '10': 'באוקטובר', '11': 'בנובמבר', '12': 'בדצמבר'}
ENM = {'01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July',
       '08': 'August', '10': 'October', '11': 'November', '12': 'December'}
passes = json.load(open(f'{G}/passes.json'))
report = []
for m in ['10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08']:
    v2 = json.load(open(f'{G}/v2-{m}.json'))
    days = json.load(open(f'{ROOT}/src/data/today/{m}.json'))
    res = passes[m]
    out, errs, seen = {}, [], set()
    stats = dict(total=0, dropped=0, filled=0, short=[])
    for date in sorted(v2):
        dd = date[3:]
        he_url = f"https://he.wikipedia.org/wiki/{urllib.parse.quote(f'{int(dd)}_{HEM[m]}')}"
        en_url = f"https://en.wikipedia.org/wiki/{ENM[m]}_{int(dd)}"
        good, spare = [], []
        for i, q in enumerate(v2[date]):
            if q['type'] == 'day':
                ok = [d for d in days.get(date, {}).get('days', []) if d['name'] == q.get('day_name') and d['src'] in ('yo-yoo', 'wikipedia')]
                if not ok: stats['dropped'] += 1; continue
                src = f'https://www.yo-yoo.co.il/days/month/{int(m)}' if ok[0]['src'] == 'yo-yoo' else he_url
                good.append((i, q, src)); continue
            r = res.get(f'{dd}/{i}')
            key = q['correct']
            if key in seen: stats['dropped'] += 1; continue
            if r in ('both', 'enArt'):
                good.append((i, q, he_url if r == 'both' else en_url)); seen.add(key)
            elif r == 'enOnly':
                spare.append((i, q, en_url))
            else:
                stats['dropped'] += 1
        while len(good) < 3 and spare:
            it = spare.pop(0); good.append(it); seen.add(it[1]['correct']); stats['filled'] += 1
        stats['dropped'] += len(spare)
        good.sort(key=lambda t: t[0])
        good = good[:5]
        if len(good) < 3: stats['short'].append(f'{date}:{len(good)}')
        items = []
        for i, q, src in good:
            wrong = [re.sub(r'\s*\[[^\]]*\]\s*$', '', w) for w in q['wrongs']]
            opts = [q['correct']] + wrong
            if len(set(opts)) != 4: errs.append(f'{date}#{i}: options not distinct')
            rnd = random.Random(f'{date}-{i}')
            order = list(range(4)); rnd.shuffle(order)
            options = [opts[j] for j in order]
            y = q['year']
            for field in [q['clue'], *q['hints'], *options]:
                if y and re.search(rf'(?<!\d){abs(y)}(?!\d)', field): errs.append(f'{date}#{i}: year in {field!r}')
                if 'לפני' in field and 'שנים' in field: errs.append(f'{date}#{i}: distance in {field!r}')
            if len(q['hints']) != 3: errs.append(f'{date}#{i}: hints')
            if q['type'] != 'day' and not isinstance(y, int): errs.append(f'{date}#{i}: year')
            items.append(dict(type=q['type'], person=bool(q.get('person')), year=y, emoji=q['emoji'], clue=q['clue'],
                              hints=q['hints'], options=options, answer=order.index(0), explain=q['explain'], source=src))
        out[date] = items
        stats['total'] += len(items)
    json.dump(out, open(f'{ROOT}/src/data/today-game/{m}.json', 'w'), ensure_ascii=False, indent=1)
    report.append(f"{m}: {stats['total']} questions / {len(out)} dates, dropped {stats['dropped']}, filled {stats['filled']}, short {stats['short']}")
    if errs: report.append('  ERR ' + '; '.join(errs[:20]))
print('\n'.join(report))
