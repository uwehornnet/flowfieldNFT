import React, { forwardRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import Rand from "rand-seed";
import { colorpalett } from "./color-palettes";
import { createRandomRange } from "./createRandomRange";
import { createRandomString } from "./createRandomString";
// Will only import `react-p5` on client-side
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
	ssr: false,
});

let p5js;
let difficulty = createRandomString();
let seed = new Rand(difficulty);
let random = createRandomRange(seed);

let pal;
let particles = [];
let noisescale = random(1 / 300, 1 / 1000);
let lineStroke = random(0.75, 1);

let freq = random(4, 12);

const Renderer = forwardRef((props, ref) => {
	const { resetButton, className, style, onReset, onDraw } = props;
	useImperativeHandle(ref, () => ({
		fetchData() {
			const canvas = p5js.canvas;
			const imageData = canvas.toDataURL("image/jpeg");
			return {
				seed: difficulty,
				metadata: {
					name: `SeedNFT #${difficulty}`,
					description: "radom art created offchain an",
					image: imageData,
				},
			};
		},
	}));

	const setup = (p5, canvasParentRef) => {
		// use parent to render the canvas in this ref
		// (without that p5 will render the canvas outside of your component)

		p5.createCanvas(400, 400).parent(canvasParentRef);
		p5js = p5;
		p5.noStroke();
		p5.pixelDensity(1.6);
		pal = colorpalett[p5.floor(random(0, colorpalett.length))];
		p5.background(pal[p5.floor(random(0, pal.length))]);

		updateParticles(p5);

		resetButton.current.addEventListener("click", (e) => {
			e.preventDefault();
			onReset();
			difficulty = createRandomString();
			seed = new Rand(difficulty);
			random = createRandomRange(seed);

			freq = random(4, 12);
			noisescale = random(1 / 200, 1 / 8000);
			lineStroke = random(0.8, 1.1);
			p5.background(pal[p5.floor(random(0, pal.length))]);
			updateParticles(p5);
		});
	};

	const draw = () => {
		for (let p of particles) {
			p.draw();
			p.move();
			p.stop();
		}
	};

	function updateParticles(p5) {
		particles = [];
		for (let x = 0; x < p5.width; x += freq) {
			let x_ = x;
			let s_ = lineStroke;
			let cNum = p5.floor(random(0, pal.length));
			let c_ = p5.color(pal[cNum]);
			particles.push(new Particle(x_, 0, s_, c_, p5, onDraw));
			particles.push(new Particle(x_, p5.height, s_, c_, p5, onDraw));
		}
		for (let y = 0; y < p5.height; y += freq) {
			let y_ = y;
			let s_ = lineStroke;
			let cNum = p5.floor(random(0, pal.length));
			let c_ = p5.color(pal[cNum]);
			particles.push(new Particle(0, y_, s_, c_, p5, onDraw));
			particles.push(new Particle(p5.width, y_, s_, c_, p5, onDraw));
		}
	}

	return <Sketch setup={setup} draw={draw} className={className} style={style} ref={ref} />;
});

Renderer.displayName = "Renderer";
export default Renderer;

class Particle {
	constructor(x_, y_, s_, c_, p5) {
		this.x = x_;
		this.y = y_;
		this.size = s_;
		this.c = c_;

		this.alpha = 70;
		this.dist = 0.75;
		this.p5 = p5;
	}
	move() {
		let theta = this.p5.noise(this.x * noisescale, this.y * noisescale) * this.p5.PI * 2;
		let v = p5.Vector.fromAngle(theta, this.dist);
		this.x += v.x;
		this.y += v.y;
		this.alpha *= random(0.001, 0.0025);
	}
	draw() {
		this.p5.fill(this.c);
		this.p5.ellipse(this.x, this.y, this.size);
	}
	stop() {
		if (this.x > this.p5.width || this.x < 0) {
			this.dist = 0;

			//this.onDraw((oldVal) => oldVal + 1);
		}
		if (this.y > this.p5.height || this.height < 0) {
			this.dist = 0;
			//this.onDraw((oldVal) => oldVal + 1);
		}
	}
}
