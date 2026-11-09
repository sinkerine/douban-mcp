import { loadFixture } from '../../helpers/loadFixture.js';
import { parseUserCollections, parseUserProfile, parseUserDoulist } from '../../../src/datasources/parsers/user.js';

describe('parseUserCollections (movie/collect)', () => {
  const items = parseUserCollections(loadFixture('user/collections-watched.html'), 'movie', 'collect');
  it('returns items with subject id and title', () => {
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].subject.id).toMatch(/^\d+$/);
    expect(items[0].subject.title.length).toBeGreaterThan(0);
  });
  it('preserves status', () => {
    expect(items[0].status).toBe('collect');
  });
});

describe('parseUserCollections (book)', () => {
  const html = loadFixture('user/collections-books.html');

  it.each(['wish', 'do', 'collect'] as const)('parses the default interest list with status %s', (status) => {
    const items = parseUserCollections(html, 'book', status);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      subject: {
        id: '36467411',
        title: '失去一切的人',
        url: 'https://book.douban.com/subject/36467411/',
        cover: 'https://img.example/book.jpg',
      },
      status,
      rating: 5,
      comment: '值得一读',
      tags: ['小说', '文学'],
      markedAt: '2026-11-08',
    });
    expect(items[1].subject.title).toBe('地下室手记');
    expect(items[1].subject.url).toBe('https://book.douban.com/subject/1000002/');
  });

  it('keeps supporting the subject-list layout', () => {
    expect(parseUserCollections(html.replace('interest-list', 'subject-list'), 'book', 'collect'))
      .toHaveLength(2);
  });

  it('parses list view titles after an empty cover link', () => {
    const list = `<div class="item-show"><a href="/subject/1000003/"><img src="cover.jpg"></a>
      <div class="title"><a href="/subject/1000003/">白夜</a></div></div>`;
    expect(parseUserCollections(list, 'book', 'collect')[0].subject.title).toBe('白夜');
  });

  it('falls back to a subject link with text when no heading is present', () => {
    const list = `<div class="item-show"><a href="/subject/1000003/"><img src="cover.jpg"></a>
      <a href="/subject/1000003/">白夜</a></div>`;
    expect(parseUserCollections(list, 'book', 'collect')[0].subject.title).toBe('白夜');
  });
});

describe('parseUserProfile', () => {
  const profile = parseUserProfile(loadFixture('user/profile.html'));
  it('extracts uid and name', () => {
    expect(profile.uid).toBe('1524942');
    expect(profile.name).toBe('山风如月');
  });
  it('signature is the h1 signature line, not the uid / join-date block', () => {
    expect(profile.signature).toBe('海上去');
  });
  it('signature is undefined when the user has none', () => {
    const html = loadFixture('user/profile.html').replace(/<div id="display" class="signature_display pl">[^<]*<\/div>/, '');
    expect(parseUserProfile(html).signature).toBeUndefined();
  });
});

describe('parseUserDoulist (lenient — fixture user has no public doulists)', () => {
  it('returns an array (empty allowed) without throwing', () => {
    expect(() => parseUserDoulist(loadFixture('user/doulist.html'))).not.toThrow();
    const doulists = parseUserDoulist(loadFixture('user/doulist.html'));
    expect(Array.isArray(doulists)).toBe(true);
    // No length assertion — fixture user has 0 public doulists
    for (const d of doulists) {
      expect(d.id).toMatch(/^\d+$/);
      expect(d.title.length).toBeGreaterThan(0);
    }
  });
});
