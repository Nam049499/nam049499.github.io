var sound = new Howl({
  src: ['y2mate.com - Russian Alphabet Lore Reloaded OST  Explosion of Happiness.webm', 'y2mate.com - Russian Alphabet Lore Reloaded OST  Explosion of Happiness.mp3', 'y2mate.com - Russian Alphabet Lore Reloaded OST  Explosion of Happiness.wav'],
  autoplay: true,
  loop: true,
  volume: 0.5,
  onend: function() {
    console.log('Finished!');
  }
});
