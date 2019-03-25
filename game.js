/*
game.js for Perlenspiel 3.3.x
Last revision: 2018-10-14 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-18 Worcester Polytechnic Institute.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
By default, all event-handling function templates are COMMENTED OUT (using block-comment syntax), and are therefore INACTIVE.
Uncomment and add code to the event handlers required by your project.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 5, freeze : true */
/* globals PS : true */

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.init() event handler:
//
const colorNames = {
    darkLiver: 0x54494B,
    pewterBlue: 0x8CADA7,
    antiqueRuby: 0x88292F,
    flax: 0xE3D081,
    darkPurple: 0x31263E,
    paleGold: 0xE2C391,
    dingyDungeon: 0xB33951,
    sacrementoStateGreen: 0x065143,
    zinnwalditeBrown: 0x2E1E0F
};

const taunt = "Touch a square. If you dare.";

//const colors = Object.values(colorNames);
const colors = [PS.COLOR_BLACK, PS.COLOR_GRAY, PS.COLOR_BLACK, PS.COLOR_GRAY, PS.COLOR_BLACK, PS.COLOR_GRAY, PS.COLOR_BLACK, PS.COLOR_GRAY, PS.COLOR_BLACK];
const icons = [0x2662, 0x266b, 0x2606, 0x2734, 0x25C8, 0x25CE, 0x2702, 0x2740, 0x2682];

const instrument = "l_piano";

//var previous = [];

// TODO: randomize the scale

/**
 * Hang
 * Typically there is a fundamental tone, an overtone tuned to an octave above that fundamental, and an additional overtone a perfect fifth above that octave (twelfth or tritave). 
 * F major - D3 Ding, A3, B♭3, C4, D4, E4, F4, A4, (D5, F5 ,F#5) Gu 
 * https://en.wikipedia.org/wiki/Hang_(instrument)
 */
const ding = "d3";
const gu = "d5";
const notes = ["c4", "d4", "e4", "bb3", ding, "f4", "a3", gu, "a4"];

//var availHueRanges = [];
//var takenHueRanges = [];

/**
 * Gubal
 * The Ringding is tuned to four partial tones: E♭3, B♭3, E♭4 and G5. This way it serves a double function: It is a sound source itself as well as the place to excite the bass sound of the Helmholtz resonance.[6]
 * The Ringding is surrounded by the ring of seven seven tone fields created with the hammer and tuned to the notes B♭3, C4, D♭4, E♭4, F4, G4 and B♭4.
 * Bb major - 
 * https://en.wikipedia.org/wiki/Gubal_(instrument)
 */
//const ding = ["eb3", "bb3", "g5"];
//const gu = ["eb2", "bb3"];
//const notes = [["bb3", "f5"], ["c4", "g5"], ["db4", "ab5"], ["eb4", "bb5"], ding, ["f4", "c6"], ["g4", "eb6"], gu, ["bb4", "eb6"]];

PS.init = function( system, options ) {
	"use strict"; // Do not remove this directive!

	PS.gridSize( 3, 3 );
    PS.gridColor( 255, 256, 666 );

    /**
     * @param {string} instrument - instrument name 
     * @param {note} note - note namew
     * @callback {noteLoadedCallback} callback 
     *
     * @callback noteLoadedCallback
     * @param {string} channel id
     */
    function loadNote(instrument, note, volume, callback) {
        PS.audioLoad(`${instrument}_${note}`, {
            volume: volume,
            lock: true,
            onLoad: (data) => {
                callback(data.channel);
            }
        });
    }

    /**
     * @param {string} instrument - instrument name
     * @param {<string[]} chord - 3 notes
     * @callback {chordLoadedCallback} callback
     *
     * @callback chordLoadedCallback
     * @param {string[]} channel ids
     */
    function loadChord(instrument, chord, callback) {
        let channelIds = [];
        let volume = 1;
        chord.forEach(note => {
            loadNote(instrument, note, volume, (channel) => {
                channelIds.push(channel);
            });
            volume*=0.5;
        });
        callback(channelIds);
    }

    function isAllSoundsLoaded(notes, loaded, callback) {
        if(loaded == notes.length) {
            callback();
        }
    }

    /**
     * preload all sounds
     */
    function preloadAllSounds(callback) {
        let loaded = 0;
        notes.forEach((note, index) => {
            let col = calcColumn(index);
            let row = calcRow(index);
            let color = calcColor(col, row, colors);
            if(isChord(note)) {
                loadChord(instrument, note, (channelIds) => {
                    PS.color(col, row, color);
                    //PS.glyph(col, row, icons[row*3+col]);
                    PS.data(col, row, channelIds);
                    isAllSoundsLoaded(notes, ++loaded, callback);
                });
            } else {
                loadNote(instrument, note, 0.5, (channelId) => {
                    PS.color(col, row, color);
                    //PS.glyph(col, row, icons[row*3+col]);
                    PS.data(col, row, channelId);
                    isAllSoundsLoaded(notes, ++loaded, callback);
                });
            }
        });
    }

    /**
     * @callback {beadCallback} callback - 
     *
     * @callback beadCallback
     * @param {number} x
     * @param {number} y
     * @param {number} triplet
     */
    function allBeads(callback) {
        for(let y=0; y<3; y++) {
            for(let x=0; x<3; x++) {
                callback(x, y);
            }
        }
    }

    /**
     * Calculate color (hex)
     *
     * @param {number} column
     * @param {number} row
     * @param {hex[]} colors
     * @return {hex} color
     */
    function calcColor(column, row, colors) {
        return colors[calcIndex(column, row)];
    }

    function loading() {
        document.querySelector('canvas').style.cursor = 'wait';
        PS.gridColor(PS.COLOR_WHITE);
        allBeads((x, y) => {
            PS.border(x, y, 0);
            //PS.radius(x, y, 50);
            PS.fade(x, y, 60);
        });
        PS.statusText( "Loading audio" );
    }


    loading();
    preloadAllSounds(() => {
        document.querySelector('canvas').style.cursor = 'pointer';
        PS.statusText( taunt );
        allBeads((x, y) => {
            PS.fade(x, y, 10);
        });
    });

};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.touch() event handler:

/**
 * hue ranges to choose from 360/15 = 24
 *
 * if (hue > 0)
 * currentHue = beadHue;
 *
 * get list of avail hue ranges
 * choose random hue range from list of avail hue ranges
 * remove chosen hue range from avail hues
 * add chosen hue range to taken hue ranges
 * 
 * if(currentHue)
 *   determine hue range current hue belongs to
 *   add hue range back to avail hue ranges
 *
 * choose random hue from chosen hue range
 */
function chooseHue(currentHue) {
    if( ! takenHueRanges.length) {
        availHueRanges = calcAllHueRanges();
    }
    let randomHueRange = chooseRandomValue(availHueRanges);
    takenHueRanges.push(availHueRanges.splice(availHueRanges.indexOf(randomHueRange), 1)[0]);

    if(currentHue) {
        let currentHueRange = calcHueRange(currentHue, takenHueRanges);
        availHueRanges.push(currentHueRange);
        takenHueRanges.splice(takenHueRanges.indexOf(currentHueRange), 1);
    }
    return (randomHueRange+(PS.random(36)-1));
}

function chooseRandomValue(arr) {
    return arr[PS.random(arr.length)-1];
}

function calcAllHueRanges() {
    let hues = [];
    for(x=0; x<360; x+=36) {
        hues.push(x);
    }
    return hues;
}

/**
 * determine hue range current hue belongs to
 */
function calcHueRange(hue, takenHueRanges) {
    let differences = takenHueRanges.map( takenHueRange => {
        return Math.abs(takenHueRange - hue);
    });
    let hueRangeIndex = differences.reduce((previousIndex, currentValue, currentIndex, differences) => {
        if( ! currentIndex) {
            return currentIndex;
        }
        if(differences[previousIndex] < differences[currentIndex]) {
            return previousIndex;
        } else {
            return currentIndex;
        }
    }, 0);
    return takenHueRanges[hueRangeIndex];
}


/**
 * Adjust saturation of colors when touched
 * http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 */
PS.touch = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!
    if(PS.statusText() === taunt) {
        PS.statusText("");
    }
    if(isNote(data)) { 
        PS.audioPlayChannel(data);
        //PS.unmakeRGB(PS.color(x, y), currentRgbColor);
        //let currentHsvColor = rgbToHsv(...currentRgbColor);
        //let currentHue = currentHsvColor[0];
        //let newHue = chooseHue(currentHue);
        //let newRgbColor = hsvToRgb(newHue, PS.random(100)/100, (PS.random(50)+50)/100);
        //PS.color(x, y, newRgbColor);
        PS.color(x, y, [PS.random(255), PS.random(255), PS.random(255)]);
        PS.glyph(x, y, icons[PS.random(9)-1]);

    }
    if(isChord(data)) {
        // might need to use promises here
        data.forEach((note) => {
            console.log('playing channelId', note);
            PS.audioPlayChannel(note);
        });
        PS.color(x, y, PS.random(255), PS.random(255), PS.random(255));
        PS.glyph(x, y, icons[PS.random(9)-1]);
    }
};

function isChord(data) {
    return Array.isArray(data);
}

function isNote(data) {
    return typeof data === 'string';
}

/**
 * Calculate column (x)
 */
function calcColumn(index) {
    return index % 3;
}

/**
 * Calculate row (y)
 */
function calcRow(index) {
    return Math.floor(index/3);
}

function calcIndex(column, row) {
    return row*3+column;
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h *= 60;
    //h /= 6;
  }

  return [ h, s, v ];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h / 60);
  var f = h / 60 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}

