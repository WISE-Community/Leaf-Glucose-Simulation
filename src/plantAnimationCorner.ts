export class PlantAnimationCorner {
    draw: any;
    lightBulbOn: any;
    lightBulbOff: any;
    allLeaves: any[];
    leafYellow: any;
    leafLightGreen: any;
    leafGreen: any;
    leafDead: any;
    darknessOverlay: any;
    constructor(draw: any) {
        this.draw = draw;

        // draws the upper left box where the light and plant will be displayed
        this.draw.rect(250,300).x(0).y(0).fill('white').stroke({width:2});

        // create the leaf images
        this.leafYellow = this.draw.image('./leafYellow.png', 128, 128).attr({
            'x': 20,
            'y': 150
        });

        this.leafLightGreen = this.draw.image('./leafLightGreen.png', 128, 128).attr({
            'x': 55,
            'y': 90
        });

        this.leafGreen = this.draw.image('./leafGreen.png', 128, 128).attr({
            'x': 55,
            'y': 90
        });

        // draw the pot
        this.draw.image('./pot.png', 128, 128).attr({"x": 100, "y": 160});

        // the dead leaf should appear above the pot
        this.leafDead = this.draw.image('./leafDead.png', 128, 128).attr({
            'x': 20,
            'y': 150
        });

        // store all the leaf images in a global variable
        this.allLeaves = [this.leafDead, this.leafYellow, this.leafLightGreen, this.leafGreen];

        // draw the rectangle below the pot
        this.draw.rect(250,40).x(0).y(270).fill('gray').stroke({width:2});

        // create the light bulb on image
        this.lightBulbOn = this.draw.image('./lightbulb20001.png', 40, 70).rotate(150);

        // create the light bulb off image
        this.lightBulbOff = this.draw.image('./lightbulb20002.png', 40, 70).rotate(150).hide();

        // create the darkness overlay that displays when the light is turned off
        this.darknessOverlay = this.draw.rect(250, 300).attr({
            'fill-opacity': 0,
            'fill': 'black'
        });

        this.showLeaf(0);  // show the green healthy leaf to begin.
    }

    /**
     * Change the leaf based on the leaf index specified
     * 0 = green, 1 = light green, 2 = yellow, 3 = dead brown
     * @param glucoseCount the number of glucose stored.
     */
    showLeaf(leafIndex) {
        // first hide all the leaves
        for (var l = 0; l < this.allLeaves.length; l++) {
            var leaf = this.allLeaves[l];
            leaf.hide();
        }

        // then show the appropriate leaf
        if (leafIndex === 0) {
            this.leafGreen.show();
        } else if (leafIndex <= 1) {
            this.leafLightGreen.show();
        } else if (leafIndex <= 2) {
            this.leafYellow.show();
        } else {
            this.leafDead.show();
        }
    }

    turnLightOn(doTurnOn: boolean = true) {
        if (doTurnOn) {
          // hide the grey light bulb
          this.lightBulbOff.hide();

          // show the yellow light bulb
          this.lightBulbOn.show();

          // hide the darkness overlay
          this.darknessOverlay.animate().attr({
              'fill-opacity': '0'
          });
        } else {
          // hide the yellow bulb
          this.lightBulbOn.hide();

          // show the grey bulb
          this.lightBulbOff.show();

          // display the darkness overlay
          this.darknessOverlay.animate().attr({
              'fill-opacity': '0.3'
          });
        }
    }
}
