"""Guard crawlable answers against schema/content drift and incorrect examples."""
from decimal import Decimal, ROUND_HALF_UP
from html.parser import HTMLParser
import json
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Element:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return ' '.join(''.join(c.text() if isinstance(c, Element) else c for c in self.children).split())

    def find(self, tag=None, **attrs):
        result = []
        for child in self.children:
            if isinstance(child, Element):
                if (tag is None or child.tag == tag) and all(child.attrs.get(k) == v for k, v in attrs.items()):
                    result.append(child)
                result.extend(child.find(tag, **attrs))
        return result


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Element()
        self.stack = [self.root]
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        child = Element(tag, attrs)
        self.stack[-1].children.append(child)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append(child)

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


class SearchContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (ROOT / 'index.html').read_text()
        cls.doc = Document(cls.source).root
        cls.graph = json.loads(cls.doc.find('script', type='application/ld+json')[0].text())['@graph']

    def test_faq_schema_matches_every_visible_answer_and_anchor(self):
        faq = next(n for n in self.graph if n['@type'] == 'FAQPage')
        articles = self.doc.find('section', id='faq')[0].find('article')
        self.assertEqual(len(articles), 10)
        self.assertEqual(len(articles), len(faq['mainEntity']))
        for question, article in zip(faq['mainEntity'], articles):
            self.assertEqual(question['@id'], 'https://diabetescalculator.ai/#' + article.attrs['id'])
            self.assertEqual(question['name'], article.find('h3')[0].text())
            self.assertEqual(question['acceptedAnswer']['text'], article.find('p')[0].text())
            self.assertFalse(article.find('script'))
            self.assertNotIn('hidden', article.attrs)

    def test_chart_examples_match_calculator_equation_and_display_rounding(self):
        table = self.doc.find('table')[0]
        rows = table.find('tbody')[0].find('tr')
        self.assertEqual(len(rows), 6)
        for row in rows:
            a1c = Decimal(row.find('th')[0].text().rstrip('%'))
            cells = row.find('td')
            mgdl = Decimal('28.7') * a1c - Decimal('46.7')
            self.assertEqual(cells[0].text(), f'{mgdl.quantize(Decimal(1), rounding=ROUND_HALF_UP)} mg/dL')
            self.assertEqual(cells[1].text(), f'{mgdl / 18:.1f} mmol/L')

    def test_schema_identity_and_internal_fragment_links_resolve(self):
        ids = [n.attrs['id'] for n in self.doc.find() if 'id' in n.attrs]
        self.assertEqual(len(ids), len(set(ids)))
        for link in self.doc.find('a'):
            href = link.attrs.get('href', '')
            if href.startswith('#') and len(href) > 1:
                self.assertIn(href[1:], ids)
        canonical = self.doc.find('link', rel='canonical')[0].attrs['href']
        page = next(n for n in self.graph if n['@type'] == 'FAQPage')
        self.assertEqual(canonical, page['url'])
        self.assertEqual(self.doc.find('title')[0].text(), page['name'])
        self.assertEqual(self.doc.find('meta', name='description')[0].attrs['content'], page['description'])
        for source in page['citation']:
            self.assertTrue(self.doc.find('a', href=source))

    def test_sitemap_modified_date_matches_visible_content_date(self):
        sitemap = ET.parse(ROOT / 'sitemap.xml')
        ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        home = next(n for n in sitemap.findall('s:url', ns) if n.find('s:loc', ns).text == 'https://diabetescalculator.ai/')
        self.assertEqual(home.find('s:lastmod', ns).text, self.doc.find('time')[0].attrs['datetime'])


if __name__ == '__main__':
    unittest.main()
