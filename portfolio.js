const palette = ['green', 'blue', 'cyan', 'yellow', 'brown', 'pink', 'red', 'violet'];
const textElements = document.querySelectorAll('.hover-text:not(.name-text)');
const colors = Array.from({ length: textElements.length }, (_, index) => palette[index % palette.length]);

for (let index = colors.length - 1; index > 0; index--) {
  const swap = Math.floor(Math.random() * (index + 1));
  [colors[index], colors[swap]] = [colors[swap], colors[index]];
}

textElements.forEach((element, index) => {
  element.style.setProperty('--hover-color', `var(--${colors[index]})`);
});

const dialog = document.querySelector('#stories');
const stories = Array.from(dialog.querySelectorAll('.story'));
const arrows = Array.from(dialog.querySelectorAll('[data-story-step]'));
let currentStory = 0;
let opener;

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
