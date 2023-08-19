var sound = new Howl({
  src: ['y2mate.com - Russian Alphabet Lore Reloaded OST  Explosion of Happiness.mp3'],
  autoplay: true,
  loop: true,
  volume: 10,
  onend: function() {
    console.log('Finished!');
  }
});
