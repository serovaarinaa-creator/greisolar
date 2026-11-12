const palette = ['green', 'blue', 'cyan', 'yellow', 'brown', 'pink', 'red', 'violet'];
const textElements = document.querySelectorAll('.hover-text:not(.name-text)');
const colors = Array.from({ length: textElements.length }, (_, index) => palette[index % palette.length]);

for (let index = colors.length - 1; index > 0; index--) {
  const swap = Math.floor(Math.random() * (index + 1));
  [colors[index], colors[swap]] = [colors[swap], colors[index]];
}

const footerColors = [...new Set(colors)].filter(color => color !== 'yellow' && color !== 'brown');
let footerIndex = 0;

textElements.forEach((element, index) => {
  const color = element.matches('.footer-links .pill') ? footerColors[footerIndex++] : colors[index];
  element.style.setProperty('--hover-color', `var(--${color})`);
  if (element.matches('.project-title > :last-child')) {
    element.closest('.project').style.setProperty('--project-hover-color', `var(--${color})`);
  }
  if (color === 'brown' && element.matches('.contact-links .pill')) {
    element.style.setProperty('--hover-ink', '#fff');
  }
});

const dialog = document.querySelector('#stories');
const stories = Array.from(dialog.querySelectorAll('.story'));
const arrows = Array.from(dialog.querySelectorAll('[data-story-step]'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentStory = 0;
let opener;

function animateStoryLauncher(button) {
  const colors = button.dataset.ringColors.split(' ');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('viewBox', '-1 -1 2 2');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('story-launcher-rings');

  const background = document.createElementNS(svgNamespace, 'circle');
  background.setAttribute('r', '1');
  const rings = Array.from({ length: 4 }, () => document.createElementNS(svgNamespace, 'circle'));
  svg.append(background, ...rings);
  button.append(svg);

  const colorAt = index => colors[(index + colors.length * 2) % colors.length];
  let frame = 0;
  let previousTime;
  let phase = 0.5;
  let hovered = false;

  function draw(time) {
    if (previousTime !== undefined) {
      phase = (phase + (time - previousTime) / 390) % colors.length;
    }
    previousTime = time;

    const newest = Math.floor(phase);
    const progress = phase - newest;
    background.setAttribute('fill', colorAt(newest - rings.length));
    rings.forEach((ring, index) => {
      const age = rings.length - 1 - index;
      const radius = (age + progress) / rings.length;
      ring.setAttribute('r', radius);
      ring.setAttribute('fill', colorAt(newest - age));
    });
    frame = requestAnimationFrame(draw);
  }

  function update() {
    const play = !dialog.open && !reducedMotion.matches && (hovered || button.matches(':focus-visible'));
    svg.classList.toggle('is-playing', play);
    if (play && !frame) frame = requestAnimationFrame(draw);
    if (!play && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = undefined;
    }
  }

  button.addEventListener('pointerenter', event => {
    hovered = event.pointerType !== 'touch';
    update();
  });
  button.addEventListener('pointerleave', () => {
    hovered = false;
    update();
  });
  button.addEventListener('focus', update);
  button.addEventListener('blur', update);
  button.addEventListener('click', update);
  dialog.addEventListener('close', update);
  reducedMotion.addEventListener('change', update);
}

function showStory(index) {
  if (index < 0 || index >= stories.length) return;
  const restoreFocus = !dialog.open || stories[currentStory].contains(document.activeElement);
  currentStory = index;

  stories.forEach((story, storyIndex) => {
    story.hidden = storyIndex !== index;
  });
  arrows[0].disabled = index === 0;
  arrows[1].disabled = index === stories.length - 1;

  if (!dialog.open) dialog.showModal();
  if (restoreFocus || document.activeElement.disabled) {
    stories[index].querySelector('[data-close-story]').focus({ preventScroll: true });
  }
}

document.querySelectorAll('[data-open-story]').forEach(button => {
  button.addEventListener('click', () => {
    opener = button;
    showStory(Number(button.dataset.openStory));
  });
  animateStoryLauncher(button);
});

arrows.forEach(button => {
  button.addEventListener('click', () => showStory(currentStory + Number(button.dataset.storyStep)));
});

dialog.querySelectorAll('[data-close-story]').forEach(button => {
  button.addEventListener('click', () => dialog.close());
});

dialog.addEventListener('keydown', event => {
  const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
  if (!step) return;
  event.preventDefault();
  showStory(currentStory + step);
});

dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
