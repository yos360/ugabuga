def Q(type, emoji, clue, hints, correct, wrongs, explain, year, quote, en, he_article=None):
    return dict(type=type, emoji=emoji, clue=clue, hints=hints, correct=correct, wrongs=wrongs,
                explain=explain, year=year, quote=quote, en=en, he_article=he_article)
def D(emoji, clue, hints, correct, wrongs, explain, quote):
    return dict(type="day", emoji=emoji, clue=clue, hints=hints, correct=correct, wrongs=wrongs,
                explain=explain, year=None, quote=quote, en=None, he_article=None)
