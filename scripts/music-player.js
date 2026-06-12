/**
 * MusicPlayer Component (NEW)
 * Background music that shuffles through every song listed in
 * music/playlist.json and plays them in random order, forever.
 *
 * Why a playlist.json file? A browser cannot "read a folder" on a
 * static site — there is no filesystem API over HTTP. So we keep
 * one tiny JSON file next to the songs; add a filename there and
 * the player picks it up. (See music/README.md for instructions.)
 *
 * Autoplay policy: browsers block sound until the visitor interacts
 * with the page. The disc pulses as an invitation, and the FIRST
 * click/tap/keypress anywhere starts the music — unless the visitor
 * previously turned it off (we remember that in localStorage).
 */
const MusicPlayer = (function() {
    const PLAYLIST_URL = 'music/playlist.json';
    const PREF_KEY = 'wedding-music-off'; // '1' = visitor said no thanks

    let audio = null;
    let player = null;
    let queue = [];        // shuffled order of indexes into `tracks`
    let queuePos = -1;
    let tracks = [];
    let lastPlayed = -1;   // avoid the same song twice in a row
    let errorStreak = 0;   // consecutive load failures (404, codec…)
    let currentFile = ''; // filename currently cued (for error messages)
    let noteTimer = null;
    let unlockHandlerBound = false;

    function init() {
        player = document.getElementById('music-player');
        audio = document.getElementById('music-audio');
        if (!player || !audio) {
            console.warn('MusicPlayer: markup not found, skipping');
            return;
        }
        if (player.dataset.ready) return; // don't initialize twice
        player.dataset.ready = 'true';

        audio.volume = 0.55; // background music should stay in the background

        // cache: 'no-store' + timestamp → playlist.json LUÔN được tải mới.
        // (http-server mặc định cache 1 giờ; thiếu dòng này thì sửa
        //  playlist xong F5 vẫn thấy danh sách cũ!)
        fetch(PLAYLIST_URL + '?t=' + Date.now(), { cache: 'no-store' })
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(data) {
                tracks = (data && Array.isArray(data.tracks)) ? data.tracks.filter(Boolean) : [];
                if (!tracks.length) throw new Error('playlist.json has no tracks');
                setup();
            })
            .catch(function(err) {
                // No playlist → no player. The rest of the site is unaffected.
                console.warn('MusicPlayer: disabled —', err.message);
            });
    }

    function setup() {
        player.classList.remove('hidden');
        reshuffle();
        cueNext(false); // load the first song's name without playing

        // ----- Controls -----
        document.getElementById('music-disc').addEventListener('click', togglePlay);
        document.getElementById('music-toggle').addEventListener('click', togglePlay);
        document.getElementById('music-next').addEventListener('click', function() {
            playNext(true);
        });

        // When a song finishes, the next random one begins
        audio.addEventListener('ended', function() {
            playNext(true);
        });

        audio.addEventListener('error', function() {
            errorStreak++;
            console.warn('MusicPlayer: không tải được "' + currentFile +
                '" — kiểm tra tên file trong music/playlist.json có khớp 100% với file thật không.');

            // Cả một vòng playlist đều hỏng → DỪNG, đừng dội server vô hạn
            if (errorStreak >= tracks.length) {
                console.error('MusicPlayer: không phát được bài nào (' + tracks.length +
                    '/' + tracks.length + ' lỗi). Dừng thử lại. ' +
                    'Mở music/playlist.json và đối chiếu từng tên với thư mục music/.');
                setTrackNameRaw('⚠ ' + currentFile);
                player.classList.remove('playing', 'inviting');
                player.classList.add('panel-open'); // mở panel để thấy cảnh báo
                return;
            }

            playNext(audioWasPlaying());
        });

        // Phát thành công → xóa chuỗi lỗi (bài hỏng lẻ tẻ chỉ bị bỏ qua)
        audio.addEventListener('playing', function() {
            errorStreak = 0;
            player.classList.remove('panel-open');
        });

        audio.addEventListener('play', updateUI);
        audio.addEventListener('pause', updateUI);

        // ----- Autoplay invitation -----
        if (localStorage.getItem(PREF_KEY) !== '1') {
            player.classList.add('inviting');
            bindFirstInteraction();
        }

        updateUI();
    }

    /** Fisher–Yates shuffle of [0, 1, …, n-1] */
    function reshuffle() {
        queue = tracks.map(function(_, i) { return i; });
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = queue[i];
            queue[i] = queue[j];
            queue[j] = tmp;
        }
        // New round shouldn't open with the song we just heard
        if (queue.length > 1 && queue[0] === lastPlayed) {
            queue.push(queue.shift());
        }
        queuePos = -1;
    }

    /** Advance the queue; reshuffle when every song has been played */
    function cueNext(andPlay) {
        queuePos++;
        if (queuePos >= queue.length) {
            reshuffle();
            queuePos = 0;
        }
        const index = queue[queuePos];
        lastPlayed = index;
        currentFile = tracks[index];

        audio.src = 'music/' + encodeURIComponent(currentFile);
        setTrackName(currentFile);

        if (andPlay) {
            audio.play().catch(function(err) {
                console.warn('MusicPlayer: play blocked —', err.message);
            });
        }
    }

    function playNext(andPlay) {
        cueNext(andPlay);
    }

    function togglePlay() {
        if (audio.paused) {
            errorStreak = 0; // người dùng chủ động thử lại → cho chạy vòng mới
            // src may be empty if the first cue failed — re-cue defensively
            if (!audio.src) cueNext(false);
            audio.play().catch(function(err) {
                console.warn('MusicPlayer: play blocked —', err.message);
            });
            localStorage.removeItem(PREF_KEY);
        } else {
            audio.pause();
            // The visitor explicitly paused → don't auto-start next visit
            localStorage.setItem(PREF_KEY, '1');
        }
        player.classList.remove('inviting');
    }

    /** First click/tap/keypress anywhere unlocks and starts the music */
    function bindFirstInteraction() {
        if (unlockHandlerBound) return;
        unlockHandlerBound = true;

        const start = function() {
            document.removeEventListener('pointerdown', start);
            document.removeEventListener('keydown', start);
            if (audio.paused && localStorage.getItem(PREF_KEY) !== '1') {
                audio.play().catch(function() {
                    /* Still blocked (rare) — the pulsing disc remains the invitation */
                });
            }
        };

        document.addEventListener('pointerdown', start, { once: true });
        document.addEventListener('keydown', start, { once: true });
    }

    /** "08 - Beautiful_in-White.mp3" → "Beautiful in White" */
    function setTrackName(filename) {
        let name = filename.replace(/\.[^.]+$/, '');     // drop extension
        name = name.replace(/^\d+\s*[-_.]\s*/, '');      // drop "01 - " prefixes
        name = name.replace(/[-_]+/g, ' ').trim();       // dashes → spaces
        setTrackNameRaw(name || filename);
    }

    /** Ghi nguyên văn (dùng cho thông báo lỗi) */
    function setTrackNameRaw(text) {
        const el = document.getElementById('music-track-name');
        if (el) el.textContent = text;
    }

    function audioWasPlaying() {
        return !audio.paused && !audio.ended;
    }

    function updateUI() {
        const playing = !audio.paused;
        player.classList.toggle('playing', playing);
        if (playing) player.classList.remove('inviting');

        const toggleIcon = document.getElementById('music-toggle-icon');
        if (toggleIcon) {
            toggleIcon.className = playing ? 'fas fa-pause' : 'fas fa-play';
        }

        const disc = document.getElementById('music-disc');
        if (disc) {
            disc.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
        }

        // Little notes drift up from the disc while music plays
        if (playing && !noteTimer) {
            noteTimer = setInterval(spawnNote, 1400);
        } else if (!playing && noteTimer) {
            clearInterval(noteTimer);
            noteTimer = null;
        }
    }

    function spawnNote() {
        if (document.hidden || !player.classList.contains('playing')) return;
        const note = document.createElement('i');
        note.className = 'fas ' + (Math.random() > 0.5 ? 'fa-music' : 'fa-heart') + ' music-note-float';
        note.style.right = (40 + Math.random() * 20) + '%';
        player.appendChild(note);
        setTimeout(function() { note.remove(); }, 2700);
    }

    return {
        init: init
    };
})();
