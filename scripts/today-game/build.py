import json, random, re, sys
import sep_a, sep_b, sep_c, extra
DATA = {**sep_a.DATA, **sep_b.DATA, **sep_c.DATA}
for k, v in extra.EXTRA.items():
    DATA[k] = sorted(DATA[k] + v, key=lambda q: extra.ORDER.index(q["type"]))
PERSON_ISRAEL = {"09-01","09-02","09-04","09-05","09-08","09-10","09-16","09-17","09-18","09-20","09-21","09-27","09-28","09-30"}
errs = []; out = {}; review = []
HE = lambda d: f"https://he.wikipedia.org/wiki/{int(d[3:])}_%D7%91%D7%A1%D7%A4%D7%98%D7%9E%D7%91%D7%A8"
YOYO = "https://www.yo-yoo.co.il/days/month/9"
DOTY = {"09-07": "buy-a-book-day", "09-14": "national-coloring-day", "09-25": "comic-book-day", "09-28": "ask-a-stupid-question-day", "09-29": "international-day-of-awareness-of-food-loss-and-waste"}
HE_DAYS = {"09-01", "09-02", "09-15", "09-16", "09-17", "09-18", "09-19", "09-21", "09-22", "09-23", "09-27", "09-30"}
EN_DAYS = {"09-11", "09-13", "09-20"}
def source_for(date, q):
    if q['type'] != 'day': return HE(date)
    if date in DOTY: return f"https://www.daysoftheyear.com/days/{DOTY[date]}/"
    if date in HE_DAYS: return HE(date)
    if date in EN_DAYS: return f"https://en.wikipedia.org/wiki/September_{int(date[3:])}#Holidays_and_observances"
    return YOYO
for date in sorted(DATA):
    qs = DATA[date]
    if not 3 <= len(qs) <= 5: errs.append(f"{date}: {len(qs)} questions")
    items = []
    for i, q in enumerate(qs):
        wrong = [re.sub(r'\s*\[[^\]]*\]$', '', w) for w in q['wrongs']]
        opts = [q['correct']] + wrong
        if len(set(opts)) != 4: errs.append(f"{date}#{i}: options not distinct")
        rnd = random.Random(f"{date}-{i}")
        order = list(range(4)); rnd.shuffle(order)
        options = [opts[j] for j in order]; answer = order.index(0)
        person = q['type'] == 'born' or (q['type'] == 'israel' and date in PERSON_ISRAEL)
        y = q['year']
        for field in [q['clue'], *q['hints'], *options]:
            if y and re.search(rf'(?<!\d){abs(y)}(?!\d)', field): errs.append(f"{date}#{i}: year shown in '{field}'")
            if 'לפני' in field and 'שנים' in field: errs.append(f"{date}#{i}: time distance in '{field}'")
        if len(q['clue']) > 110: errs.append(f"{date}#{i}: clue {len(q['clue'])}")
        for h in q['hints']:
            if len(h) > 90: errs.append(f"{date}#{i}: hint {len(h)}")
        if len(q['explain']) > 200: errs.append(f"{date}#{i}: explain {len(q['explain'])}")
        if q['type'] != 'day' and not isinstance(y, int): errs.append(f"{date}#{i}: year")
        items.append(dict(type=q['type'], person=person, year=y, emoji=q['emoji'], clue=q['clue'], hints=q['hints'],
                          options=options, answer=answer, explain=q['explain'],
                          source=source_for(date, q)))
        review.append(dict(date=date, i=i, type=q['type'], correct=q['correct'], wrongs=q['wrongs'], quote=q['quote'], en=q['en'], he_article=q['he_article'], year=y))
    out[date] = items
print("\n".join(errs) or "all checks passed", file=sys.stderr)
json.dump(out, open('/home/claude/ugabuga/src/data/today-game/09.json','w'), ensure_ascii=False, indent=1)
json.dump(review, open('/tmp/claude-0/-home-claude-ugabuga/49ab9a1a-d68b-5d90-a8b3-2c6b41235f5a/scratchpad/game/09-review.json','w'), ensure_ascii=False)
print(sum(len(v) for v in out.values()), "questions;", sum(1 for d in out.values() for q in d if q['answer']==0), sum(1 for d in out.values() for q in d if q['answer']==1), sum(1 for d in out.values() for q in d if q['answer']==2), sum(1 for d in out.values() for q in d if q['answer']==3))
