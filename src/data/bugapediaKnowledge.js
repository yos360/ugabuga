const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('he-IL')
  .replace(/[?!.?,:;"'??()-]/g, ' ').replace(/(^|\s)(���|����|���|����|��|��|���|����|����|���|��|���|��|��)(?=\s|$)/g, '$1')
  .replace(/����/g, '�����').replace(/�������/g, '����� ��').replace(/�����/g, '���� ��').replace(/\s+/g, ' ').trim()
const KNOWLEDGE = [{
  matches: ['����� �� �����', '���� �� �����', '����� �� ���� �����', '���� �� �� �����'],
  answer: { id: 'verified-pirate-eye-patch', title: '��� ������� ����� �� �� �����?', extract: '�� ���� ������ �� ���� ����� ���� ���� ����� ��� ���� ����� ����. ����� ���� ����� ��� ����� �� ����, ��� ����� ������ �� ���� ��� �� ����� ������ ����� ������, ������� �������. ������ ������� ���� ��� ��� ������ ����� ��� ���� ������� �������, �� ��� �� ����� �������� ����.', url: 'https://he.wikipedia.org/wiki/%D7%A9%D7%95%D7%93%D7%93_%D7%99%D7%9D', image: '', verified: true, sourceLabel: '����� ����� + ����� ����� ����������' },
}, {
  matches: ['because'],
  answer: {
    id: 'verified-translation-because',
    title: 'because - ��, ���� �?, ���� �?',
    extract: '����� because ����� ��� ����� �����. ������: I stayed home because it rained - ������ ���� �� ��� ���. ������� �� �� ��� ��� ����, ������� ���� ��� ������ because of, ������� ����.',
    url: 'https://he.wiktionary.org/wiki/%D7%91%D7%92%D7%9C%D7%9C',
    image: '',
    verified: true,
    sourceLabel: '����� ���� � ���������',
    linkLabel: '������ ����������� ?',
  },
}]
export function findBugaPediaKnowledge(question) { const value = normalize(question); const item = KNOWLEDGE.find(entry => entry.matches.some(match => normalize(match).split(' ').every(word => value.includes(word)))); return item ? { ...item.answer } : null }
export function bugaPediaSearchTerms(question) { return normalize(question).split(' ').filter(word => word.length > 1).slice(0, 10) }

