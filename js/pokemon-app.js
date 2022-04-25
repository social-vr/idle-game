const MAP_SIZE = 500
const NU_CENTER = ol.proj.fromLonLat([-87.6753, 42.056])

// downtown center, uncomment to use downtown instead, or make your own
// const NU_CENTER = ol.proj.fromLonLat([-87.6813, 42.049])
const AUTOMOVE_SPEED = 1
const UPDATE_RATE = 100
/*
 Apps are made out of a header (title/controls) and footer
 and some number of columns
 If its vertical, the columns can become sections in one column
 */


let landmarkCount = 0

let gameState = {
	points: 0,
	captured: [],
	currLandmark: "",
	guessed: false,
	messages: []
}

let correctDirection = -1;

// Create an interactive map
// Change any of these functions

let map = new InteractiveMap({
	mapCenter: NU_CENTER,

	// Ranges
	ranges: [500, 200, 90, 1], // must be in reverse order

	initializeMap() {

		// Create random landmarks
		// You can also use this to create trails or clusters for the user to find
		// for (var i = 0; i < 10; i++) {

		// 	// make a polar offset (radius, theta) 
		// 	// from the map's center (units are *approximately* meters)
		// 	let position = clonePolarOffset(NU_CENTER, 400*Math.random() + 300, 20*Math.random())
		// 	// this.createLandmark({
		// 	// 	pos: position,
		// 	// 	name: words.getRandomWord(),
		// 	// })
		// }
	},

	update() {
		// Do something each frame
	},

	initializeLandmark: (landmark, isPlayer) => {
		// Add data to any landmark when it's created

		// Any openmap data?
		if (landmark.openMapData) {
			// console.log(landmark.openMapData)
			landmark.name = landmark.openMapData.name
		}
		// *You* decide how to create a marker
		// These aren't used, but could be examples
		landmark.idNumber = landmarkCount++
		landmark.color = [Math.random(), 1, .5]

		// Give it a random number of points
    // landmark.points = Math.floor(Math.random()*10 + 1)
		return landmark
	}, 

	onEnterRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user enters a range
		// -1 is not in any range

		console.log("enter", landmark.name, newLevel)
		// Update gameState
		gameState.guessed = false
		gameState.currLandmark = landmark.name
		correctDirection = landmark.correct_direction
		if (newLevel == 2) {
			document.getElementById("location-buttons").style = ""
			
			// Add points to my gamestate

			// Have we captured this?
      last_captured = gameState.captured.length > 0 ? gameState.captured[gameState.captured.length - 1] : ""
			if (landmark.name !== last_captured) {
        gameState.points += landmark.points
				gameState.captured.push(landmark.name)
				// Add a message
				gameState.messages.push(`You captured ${landmark.name} for ${landmark.points} points`)
			}

		}
	},

	onExitRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user EXITS a range around a landmark 
		// e.g. (2->1, 0->-1)
		
		console.log("exit", landmark.name, newLevel)
	},
	
	featureToStyle: (landmark) => {
		// How should we draw this landmark?
		// Returns an object used to set up the drawing

		if (landmark.isPlayer) {
			return {
				icon: "person_pin_circle",
				noBG: true // skip the background
			}
		}
		
		// Pick out a hue, we can reuse it for foreground and background
		let hue = landmark.points*.1
		return {
			label: landmark.name + "\n" + landmark.distanceToPlayer +"m",
			fontSize: 8,

			// Icons (in icon folder)
			icon: "person_pin_circle",

			// Colors are in HSL (hue, saturation, lightness)
			iconColor: [hue, 1, .5],
			bgColor: [hue, 1, .2],
			noBG: false // skip the background
		}
	},
  enterGuess: (guess) => {
	if (!gameState.guessed) {
		directions = ["north", "east", "south", "west"]
		if (directions[correctDirection] == guess) {
			gameState.messages.push(`Correct view guessed at ${gameState.currLandmark} for 3 points`)
			gameState.points += 3
		}
		else {
			gameState.messages.push(`Incorrect view guessed at ${gameState.currLandmark}, try again next time!`)
		}
		gameState.guessed = true
		document.getElementById("location-buttons").style = "display:none"
	}
  },
})
map.loadLandmarks("sanath", (landmark) => {
	// Keep this landmark?
	return true
	// return landmark.properties.amenity || landmark.properties.store
})



window.onload = (event) => {


	const app = new Vue({
		template: `
		<div id="app">
		<header></header>
			<div id="main-columns">

				<div class="main-column" style="flex:1;overflow:scroll;max-height:500px">

					{{gameState}}

					<direction-widget :map="map"/>
					
				</div>

				<div class="main-column" style="overflow:hidden;width:${MAP_SIZE}px;height:${MAP_SIZE}px">
					<location-widget :map="map" />
				
				</div>

			</div>	
		<footer></footer>
		</div>`,

		data() {
			return {
			
				map: map,
				gameState: gameState
			}
		},

		// Get all of the intarsia components, plus various others
		components: Object.assign({
			// "user-widget": userWidget,
			// "room-widget": roomWidget,
			"location-widget": locationWidget,
			"direction-widget" : directionWidget,
		}),

		el: "#app"
	})

};

