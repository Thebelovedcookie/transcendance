export const canvas = document.getElementById("pongGame");
export const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export let ratioWidth = window.innerWidth / canvas.width;
export let ratioHeight = window.innerHeight / canvas.height;

//----------------------------CLASS --------------------------------//

class Element{
	constructor(options){
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.color = options.color;
		this.speed = options.speed || 2;
		this.gravity = options.gravity;
	}

	update({ x, y, width, height, speed }) {
		this.x = x !== undefined ? x : this.x;
		this.y = y !== undefined ? y : this.y;
		this.width = width !== undefined ? width : this.width;
		this.height = height !== undefined ? height : this.height;
		this.speed = speed !== undefined ? speed : this.speed;
	}
}

//----------------------------OBJET--------------------------------//
//first paddle
export const playerOne = new Element({
	x: 5,
	y: canvas.height * 0.4,
	width: canvas.width / 80,
	height: canvas.height / 6,
	color: "#3B2077",
	gravity: 2,
})

//second paddle
export const playerTwo = new Element({
	x: canvas.width - 20,
	y: canvas.height * 0.4,
	width: canvas.width / 80,
	height: canvas.height / 6,
	color: "#3B2077",
	gravity: 2,
})

//ball
export const ball = new Element({
	x: canvas.width / 2,
	y: canvas.height / 2,
	width: 15 * ratioWidth,
	height: 15 * ratioHeight,
	color: "#c480da",
	speed: 3,
	gravity: 2,
})

//bar au milieu
export const middle = new Element({
	x: canvas.width/2,
	y: 0,
	width: 1,
	height: canvas.height,
	color: "#fff",
	gravity: 1,
})