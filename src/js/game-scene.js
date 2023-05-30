//#region Bullet Class
class Bullet extends Phaser.Physics.Arcade.Image {
    fire(x, y, vx, vy) {
        this.enableBody(true, x, y, true, true);
        this.setVelocity(vx, vy);
    }

    onCreate() {
        this.disableBody(true, true);
        this.body.collideWorldBounds = true;
        this.body.onWorldBounds = true;
    }

    onWorldBounds() {
        this.disableBody(true, true);
    }
}

//world config
class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(world, scene, config) {
        super(
            world,
            scene,
            { ...config, classType: Bullet, createCallback: Bullets.prototype.onCreate }
        );
    }

    fire(x, y, vx, vy) {
        const bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(x, y, vx, vy);
        }
    }

    onCreate(bullet) {
        bullet.onCreate();
    }

    poolInfo() {
        return `${this.name} total=${this.getLength()} active=${this.countActive(true)} inactive=${this.countActive(false)}`;
    }
}
//#endregion

//------------------------------------------------------

class gameScene extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'gameScene' });
        window.GAME = this;
    }

    //------------------------------------------------------

    //#region Variaveis
    //Enemy
    enemy;
    bullets;
    enemyBullets;
    enemyFiring;
    enemyMoving;

    //Player
    playerBullet;
    player;
    
    //UI
    text;
    //#endregion

    //------------------------------------------------------

    preload() {
        //Player
        this.load.image('player', 'assets/player/playerShip1_blue.png');

        //Enemy
        this.load.image('enemy', 'assets/enemy/enemyRed3.png');

        //FX
        this.load.image('bullet', 'assets/effect/laserBlue01.png');
        this.load.image('enemyBullet', 'assets/effect/laserRed01.png');

        //UI
        this.load.image('btleft', 'assets/UI/blue_sliderLeft.png');
        this.load.image('btright', 'assets/UI/blue_sliderRight.png');
        this.load.image('btup', 'assets/UI/blue_sliderUp.png');
        this.load.image('btdown', 'assets/UI/blue_sliderDown.png');
        this.load.image('btshot', 'assets/UI/blue_circle.png');
        this.load.image('png_UI_lifePlayer', 'assets/UI/playerLife1_blue.png');

    }

    //------------------------------------------------------

    create() {

        //#region  Bullet Player & Enemy
        //Bullet Player
        this.bullets = this.add.existing(
            new Bullets(this.physics.world, this, { name: 'bullets' })
        );
        this.bullets.createMultiple({
            key: 'bullet',
            quantity: 1
        });

        //Bullet Enemy
        this.enemyBullets = this.add.existing(
            new Bullets(this.physics.world, this, { name: 'enemyBullets' })
        );

        this.enemyBullets.createMultiple({
            key: 'enemyBullet',
            quantity: 15

        });
        //#endregion

        //------------------------------------------------------

        //#region Enemy Config
        this.enemy = this.physics.add.image(256, 128, 'enemy');
        this.enemy.setBodySize(160, 64);

        // Score Point
        this.enemy.state = 0;
        
        this.enemyMoving = this.tweens.add({
            targets: this.enemy.body.velocity,
            props: {
                x: { from: 150, to: -150, duration: 4000 },
            },
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.enemyFiring = this.time.addEvent({
            delay: 750,
            loop: true,
            callback: () => {
                this.enemyBullets.fire(this.enemy.x, this.enemy.y + 32, 0, 150);
            }
        });

        //#endregion

        //-------------------------------------------

        //#region Player
        //Player
        this.player = this.physics.add.image(256, 448, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.35);

        //Life Player
        this.player.state = 5;
        

        this.physics.add.overlap(this.enemy, this.bullets, (enemy, bullet) => {
            const { x, y } = bullet.body.center;

            enemy.state += 1;
            bullet.disableBody(true, true); 
        });

        this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
            const { x, y } = bullet.body.center;

            player.state -= 1;
            bullet.disableBody(true, true);
            
            //Dead player
            if (player.state <= 0) {
                console.log("gameover");
                this.scene.start('gameover');
            }
        });
        //#endregion

        //------------------------------------------------------
        
        //#region World Config
        //Delete bullet
        this.physics.world.on('worldbounds', (body) => {
            body.gameObject.onWorldBounds();
        });
        
        //UI Text Config
        this.textEnemy = this.add.text(400, 10, '', {
            font: '16px monospace',
            fill: 'white'
        });

        this.textPlayer = this.add.text(10, 10, '', {
            font: '16px monospace',
            fill: 'white'
        });
        //#endregion

        //------------------------------------------------------
        
        //#region Inputs
        //Init inputs PC
        this.cursors = this.input.keyboard.createCursorKeys(); //Teclado

        //input mobile
        const btup = this.add.image(65, 400, 'btup').setInteractive();
        const btleft = this.add.image(18, 435, 'btleft').setInteractive();
        const btdown = this.add.image(65, 475, 'btdown').setInteractive();
        const btright = this.add.image(110, 435, 'btright').setInteractive();
        const btshot = this.add.image(450, 450, 'btshot').setInteractive();

        btup.on('pointerdown', (pointer) => {
            this.direction = 'up';
            this.isMovingUP = true;
            btup.setTint(0xaaaaaa);
            //btup.setScale(2.75);
        });

        btdown.on('pointerdown', (pointer) =>{
            this.direction = 'down';
            this.isMovingDown = true;
            btdown.setTint(0xaaaaaa);
            //btdown.setScale(2.75);
        });

        btleft.on('pointerdown', (pointer) =>{
            this.direction = 'left';
            this.isMovingLeft = true;
            btleft.setTint(0xaaaaaa);
            //btleft.setScale(2.75);
        });

        btright.on('pointerdown', (pointer) =>{
            this.direction = 'right';
            this.isMovingRight = true;
            btright.setTint(0xaaaaaa);
            //btright.setScale(2.75);
        });

        btshot.on('pointerdown', (pointer) =>{
            this.shotPressed = true;
            btshot.setTint(0xaaaaaa);
            //btshot.setScale(3.75);
        });
    
        this.input.on('pointerout', (pointer) =>{
            btup.clearTint();
            btdown.clearTint();
            btleft.clearTint();
            btright.clearTint();
            btshot.clearTint();
        });

        this.input.on('pointerup', (pointer) =>{
            this.isMovingRight = false;
            this.isMovingUP = false;
            this.isMovingLeft = false;
            this.isMovingDown = false;

            this.direction = null;
            this.shotPressed = false;
    
            btup.clearTint();
            btdown.clearTint();
            btleft.clearTint();
            btright.clearTint();
            btshot.clearTint();
        });

        //#endregion

    }

    update() {
        //UI Text
        this.textEnemy.setText("Pontuacao\n " + [this.enemy.state]);
        this.textPlayer.setText("Vida Jogador\n " + [this.player.state]);

        //------------------------------------------------------

        //Input PC & Mobile
        this.player.setVelocity(0);

        if (this.cursors.left.isDown || this.isMovingLeft == true) {
            this.player.setVelocityX(-300);
        }

        if (this.cursors.right.isDown || this.isMovingRight == true) {
            this.player.setVelocityX(300);
        }

        if (this.cursors.up.isDown || this.isMovingUP == true) {
            this.player.setVelocityY(-300);
        }

        else if (this.cursors.down.isDown || this.isMovingDown == true) {
            this.player.setVelocityY(300);
        }

        if (this.cursors.space.isDown || this.shotPressed == true) {

            this.bullets.fire(this.player.x, this.player.y, 0, -300);
        }
    }
}

//------------------------------------------------------

//#region GameOver
class GameOver extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'gameover' });
        window.OVER = this;
    }

    preload(){
        this.load.image('btnGameOver', 'assets/UI/buttonBlue.png');
    }
    
    create ()
    {
        const btnGameOver = this.add.image(250, 250, 'btnGameOver').setInteractive();

        console.log("into game over");
        this.add.text(210, 242, 'RESTART', { font: '21px Courier', fill: '#000000' });
        
        
        this.input.once('pointerup', function (event)
        {
            this.scene.start('gameScene');

        }, this);
        
    }

}
//#endregion

//#region Game Config
const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 512,
    pixelArt: true,
    parent: 'gameScene',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        activePointers: 3
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [gameScene, GameOver]
};

const game = new Phaser.Game(config);
//#endregion
