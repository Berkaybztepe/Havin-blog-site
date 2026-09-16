// Olumlama & hayati romantize etme.

import { el, clear, toast, modal, todayISO, confirmDialog } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { MOODS, dailyAffirmation, dailyRitual, randomAffirmation, RITUALS, YT_SEARCHES } from '../data/affirmations.js';
import { parseYouTube, youtubeFrame } from './media.js';

const KEY_VIDEOS = 'affirm:videos';
const KEY_FAVS = 'affirm:favorites';
const KEY_MINE = 'affirm:mine';

let cleanup = null;

export default {
  async mount(host) {
    let mood = localStorage.getItem('havin.mood') || '';
    const videos = await repo.getDocOr(KEY_VIDEOS, []);
    const favs = await repo.getDocOr(KEY_FAVS, []);
    const mine = await repo.getDocOr(KEY_MINE, []);

    const bigText = el('p', { class: 'affirm-big' });
    let currentText = '';

    const setAffirm = (t) => { currentText = t; bigText.textContent = t; };
    setAffirm(dailyAffirmation(todayISO(), mood).t);

    // --- ruh hali secimi ---
    const moodRow = el('div', { class: 'mood-row' },
      MOODS.map((m) => el('button', {
        class: 'chip-btn' + (m.id === mood ? ' is-on' : ''), type: 'button',
        onClick: (e) => {
          mood = m.id;
          localStorage.setItem('havin.mood', mood);
          for (const b of moodRow.children) b.classList.remove('is-on');
          e.currentTarget.classList.add('is-on');
          setAffirm(dailyAffirmation(todayISO(), mood).t);
        },
      },
        el('span', { class: 'mood-dot', style: { '--dot': m.color } }),
        m.label)));

    // --- favoriler ---
    const favBox = el('div', {});
    const drawFavs = () => {
      clear(favBox);
      if (!favs.length && !mine.length) {
        favBox.append(el('p', { class: 'muted' }, 'You have not saved a line yet.'));
        return;
      }
      for (const t of mine) favBox.append(favRow(t, true));
      for (const t of favs) favBox.append(favRow(t, false));
    };
    const favRow = (t, isMine) => el('div', { class: 'card card--tight card--flat', style: { marginBottom: '8px' } },
      el('p', { style: { margin: '0 0 6px', fontFamily: 'var(--font-head)', fontSize: '1.2rem' } }, t),
      el('div', { class: 'btn-row' },
        isMine ? el('span', { class: 'chip' }, 'my own line') : null,
        el('button', {
          class: 'btn btn--sm btn--ghost',
          onClick: async () => {
            if (isMine) { mine.splice(mine.indexOf(t), 1); await repo.setDoc(KEY_MINE, mine); }
            else { favs.splice(favs.indexOf(t), 1); await repo.setDoc(KEY_FAVS, favs); }
            drawFavs();
          },
        }, 'remove')));
    drawFavs();

    // --- videolar ---
    const videoBox = el('div', { class: 'grid grid--2' });
    const drawVideos = () => {
      clear(videoBox);
      if (!videos.length) {
        videoBox.append(el('p', { class: 'muted' },
          'You have not added anything yet. Open one of the searches below, copy the link of something you like and add it here.'));
        return;
      }
      for (const v of videos) {
        const ref = parseYouTube(v.url);
        videoBox.append(el('div', { class: 'card card--tight' },
          ref ? youtubeFrame(ref) : el('p', { class: 'muted' }, 'link not recognised'),
          el('p', { style: { margin: '8px 0 6px', fontWeight: '600' } }, v.title || 'song'),
          el('button', {
            class: 'btn btn--sm btn--ghost',
            onClick: async () => {
              if (!await confirmDialog('Remove', 'Remove it from the list?', 'remove')) return;
              videos.splice(videos.indexOf(v), 1);
              await repo.setDoc(KEY_VIDEOS, videos);
              drawVideos();
            },
          }, 'remove')));
      }
    };
    drawVideos();

    const addVideo = () => {
      const url = el('input', { class: 'input', placeholder: 'YouTube link' });
      const title = el('input', { class: 'input', placeholder: 'what is it? (optional)' });
      modal({
        title: 'add a song',
        body: el('div', {},
          el('p', { class: 'muted' }, 'Paste a video or playlist link.'),
          url, el('div', { style: { height: '10px' } }), title),
        actions: [{ label: 'cancel' }, {
          label: 'add', kind: 'primary',
          onClick: async () => {
            if (!parseYouTube(url.value)) { toast('That link was not recognised.', 'err'); return false; }
            videos.unshift({ url: url.value.trim(), title: title.value.trim() });
            await repo.setDoc(KEY_VIDEOS, videos);
            drawVideos();
            toast('Added.');
          },
        }],
      });
    };

    clear(host).append(
      el('div', { class: 'card' },
        el('h2', {}, 'today\'s line'),
        el('p', { class: 'muted' }, 'pick how you feel, and the line will match it.'),
        moodRow,
        bigText,
        el('div', { class: 'btn-row', style: { justifyContent: 'center' } },
          el('button', {
            class: 'btn btn--sm',
            onClick: () => setAffirm(randomAffirmation(mood, currentText).t),
          }, 'another one'),
          el('button', {
            class: 'btn btn--sm',
            onClick: async () => {
              if (favs.includes(currentText) || mine.includes(currentText)) { toast('Already saved.'); return; }
              favs.unshift(currentText);
              await repo.setDoc(KEY_FAVS, favs);
              drawFavs();
              toast('Saved.');
            },
          }, 'save'),
          el('button', {
            class: 'btn btn--sm btn--ghost',
            onClick: () => {
              const inp = el('textarea', { class: 'textarea', placeholder: 'write your own line…' });
              modal({
                title: 'my own line',
                body: inp,
                actions: [{ label: 'cancel' }, {
                  label: 'save', kind: 'primary',
                  onClick: async () => {
                    const t = inp.value.trim();
                    if (!t) return false;
                    mine.unshift(t);
                    await repo.setDoc(KEY_MINE, mine);
                    drawFavs();
                    setAffirm(t);
                    toast('Saved.');
                  },
                }],
              });
            },
          }, 'write my own'))),

      el('div', { class: 'card' },
        el('h3', {}, 'a small ceremony for today'),
        el('p', { style: { fontSize: '1.1rem' } }, dailyRitual(todayISO())),
        el('button', {
          class: 'btn btn--sm btn--ghost',
          onClick: (e) => {
            const p = e.currentTarget.previousElementSibling;
            p.textContent = RITUALS[Math.floor(Math.random() * RITUALS.length)];
          },
        }, 'another suggestion')),

      el('div', { class: 'card' },
        el('div', { class: 'card__head' },
          el('h3', {}, 'my songs'),
          el('button', { class: 'btn btn--sm btn--primary', onClick: addVideo }, '+ add a song')),
        videoBox,
        el('h4', { style: { marginTop: '20px' } }, 'where do I find them?'),
        el('p', { class: 'muted' }, 'These open a search on YouTube. Copy the link of what you like and add it above.'),
        el('div', { class: 'tag-list' },
          YT_SEARCHES.map((s) => el('a', {
            class: 'chip-btn', target: '_blank', rel: 'noopener noreferrer',
            href: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s.q),
            style: { display: 'inline-flex', alignItems: 'center', textDecoration: 'none' },
          }, s.label)))),

      el('div', { class: 'card' },
        el('h3', {}, 'what I saved'),
        favBox));
  },

  async unmount() { if (cleanup) { cleanup(); cleanup = null; } },
};
