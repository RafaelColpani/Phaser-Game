import LoadScene from './load-scene.js';
import GameScene from './game-scene.js';

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 240,
    parent: 'jogo-plataforma',
    scene: [
        LoadScene,
        GameScene
    ]
};

const jogo = new Phaser.Game(config);

