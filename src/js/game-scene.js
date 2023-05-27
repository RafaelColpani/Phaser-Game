export default class GameScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'GameScene'
        });
    }

    preload()
    {

    }

    create(){
        this.add.image(0, 0, 'bg');
    }

    update(){

    }
}