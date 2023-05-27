export default class LoadScene extends Phaser.Scene{
    constructor(){
        super({
            key: 'LoadScene'
        });
    }

    preload()
    {
        this.load.on('complete',() => {
            this.scene.start('GameScene');
        });

        this.load.image('bg', 'assets/bg_castle.png');
        
    }

    create(){

    }

    update(){

    }
}