interface Star {
  x: number,
  y: number,
  radius:number,
  vx: number,
  vy: number,
}

export default function animateCanvas(canvasId: string) {
  let canvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById(canvasId)!;
  let ctx = canvas.getContext("2d")!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var stars: Star[] = []; // Array that contains the stars
  let FPS = 60; // Frames per second
  let maxStars = 40; // Number of stars

  let mouse = {
    x: 0,
    y: 0,
  }; // mouse location

  let mouseCircle = {
    x: 0,
    y: 0,
  }; // following mouse circle

  // Push stars to array

  for (var i = 0; i < maxStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: Math.floor(Math.random() * 50) - 25,
      vy: Math.floor(Math.random() * 50) - 25,
    });
  }

  // Draw the scene

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "lighter";

    // dots
    for (var i = 0, x = stars.length; i < x; i++) {
      var s = stars[i];

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.stroke();
    }

    // lines

    ctx.beginPath();
    for (var i = 0, x = stars.length; i < x; i++) {
      var starI = stars[i];

      ctx.moveTo(starI.x, starI.y);
      if (distance(mouseCircle, starI) < 150)
        ctx.lineTo(mouseCircle.x, mouseCircle.y);

      for (var j = 0, x = stars.length; j < x; j++) {
        var starII = stars[j];
        if (distance(starI, starII) < 150) {
          ctx.lineTo(starII.x, starII.y);
        }
      }
    }

    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "#53B1E2";
    ctx.stroke();

    // mouseCircle

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(mouseCircle.x, mouseCircle.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.stroke();
  }

  function distance(point1: { x: any; y: any; }, point2: { x: number; y: number; }) {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
  }

  // Update star locations

  function update() {
    for (var i = 0, x = stars.length; i < x; i++) {
      var s = stars[i];

      s.x += s.vx / FPS;
      s.y += s.vy / FPS;

      if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
      if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
    }

    // mouseCircle

    mouseCircle.x = lerp(mouseCircle.x, mouse.x, 0.05);
    mouseCircle.y = lerp(mouseCircle.y, mouse.y, 0.05);
  }

  document.addEventListener("mousemove", function (evt) {
    var rect = canvas.getBoundingClientRect();
    mouse.x =
      ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
    mouse.y =
      ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
  });

  // Update and draw

  function tick() {
    draw();
    update();
    requestAnimationFrame(tick);
  }

  function lerp(start: number, end: number, amt: number) {
    return (1 - amt) * start + amt * end;
  }

  tick();
}
