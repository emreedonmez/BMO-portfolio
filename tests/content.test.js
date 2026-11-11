import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {sections,content,links,moveIndex} from '../src/content.js';
test('every menu destination has real content or a valid external destination',()=>{
 assert.equal(new Set(sections.map(s=>s.id)).size,sections.length);
 for(const s of sections){assert.ok(content[s.id]||links[s.id],s.id);assert.doesNotMatch(content[s.id]||'',/coming soon|lorem ipsum|example\.com/i)}
 assert.equal(links.github.url,'https://github.com/emreedonmez');assert.equal(links.linkedin.url,'https://www.linkedin.com/in/emreedonmez/');
});
test('navigation wraps in both directions',()=>{assert.equal(moveIndex(0,-1),5);assert.equal(moveIndex(5,1),0);assert.equal(moveIndex(3,-1),2)});
test('resume and original version are retained, while credentials are not deployment assets',()=>{
 assert.ok(existsSync('legacy/index.html'));assert.ok(readFileSync('public/ozgecmis.pdf').subarray(0,4).equals(Buffer.from('%PDF')));
 const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
 assert.equal(config.name,'emreedonmez');assert.deepEqual(config.routes.map(r=>r.pattern),['emreedonmez.com','www.emreedonmez.com']);assert.equal(config.assets.directory,'./dist');
});
