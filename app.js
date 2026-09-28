const $ = id => document.getElementById(id);
let selected = null;
let heard = new Set();
let doorTimer = null;
function show(id) {
  clearTimeout(doorTimer);
  gameAudio.stop();
  for (const screen of document.querySelectorAll('.screen')) screen.hidden = screen.id !== id;
  document.querySelector('.game').scrollIntoView({ behavior: 'smooth' });
}
function renderDoors() {
  const grid = $('door-grid');
  grid.replaceChildren();
  for (const group of PHONICS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `door ${group.color}`;
    button.setAttribute('aria-label', `Открыть дверь ${group.letters}, звук ${group.sound}`);
    button.innerHTML = `<span class="door-arch"><span class="door-letter">${group.letters}</span><span class="door-ipa">${group.sound}</span><span class="door-knob"></span></span><span class="door-caption">Открыть дверцу</span>`;
    button.addEventListener('click', () => {
      button.classList.add('opening');
      gameAudio.door();
      doorTimer = setTimeout(() => { button.classList.remove('opening'); openRoom(group); }, 550);
    });
    grid.append(button);
  }
}
function openRoom(group) {
  selected = group;
  heard = new Set();
  $('room-symbol').textContent = group.letters;
  $('room-title').textContent = `Дверца ${group.letters}`;
  $('room-sound').textContent = `Звук ${group.sound}`;
  $('finish-button').hidden = true;
  $('word-grid').replaceChildren();
  group.words.forEach((word, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'word-card';
    button.innerHTML = `<span class="word-icon" aria-hidden="true">${word.icon}</span><strong>${word.text}</strong><span class="ipa">${word.ipa}</span><span class="translation">${word.ru}</span><span class="listen">🔊 Послушать</span>`;
    button.addEventListener('click', () => {
      heard.add(index);
      button.classList.add('heard');
      gameAudio.word(group, word);
      updateProgress();
    });
    $('word-grid').append(button);
  });
  updateProgress();
  show('room');
  gameAudio.sound(group);
}
function updateProgress() {
  const done = heard.size === selected.words.length;
  $('progress').textContent = done ? 'Отлично! Все слова прослушаны. Можно вернуться к дверцам.' : `Прослушано слов: ${heard.size} из ${selected.words.length}`;
  $('finish-button').hidden = !done;
}
$('start-button').addEventListener('click', () => show('doors'));
$('doors-home').addEventListener('click', () => show('start'));
$('room-back').addEventListener('click', () => show('doors'));
$('finish-button').addEventListener('click', () => show('doors'));
$('sound-toggle').addEventListener('click', event => {
  const enabled = gameAudio.toggle();
  event.currentTarget.textContent = enabled ? '🔊 Звук включён' : '🔇 Звук выключен';
  event.currentTarget.setAttribute('aria-pressed', String(enabled));
});
renderDoors();
