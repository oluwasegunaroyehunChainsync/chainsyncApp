import { useEffect, useRef } from "react";

export function AnimatedNetworkGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Grid configuration
    const gridSize = 60;
    const lineColor = "rgba(232, 232, 232, 0.01)";
    const nodeColor = "rgba(232, 232, 232, 0.04)";
    const highlightColor = "rgba(74, 144, 226, 0.08)";
    const accentColor = "rgba(112, 128, 144, 0.05)";

    // Animation state
    let animationId: number;
    let time = 0;

    const animate = () => {
      // Validate canvas dimensions
      if (!canvas.width || !canvas.height || !isFinite(canvas.width) || !isFinite(canvas.height)) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas with semi-transparent background for trail effect
      ctx.fillStyle = "rgba(10, 14, 39, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      // Draw grid
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw animated nodes at grid intersections
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          // Base node
          ctx.fillStyle = nodeColor;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing highlight nodes (random pattern)
          const nodeId = (x / gridSize) * 100 + (y / gridSize);
          const pulse = Math.sin(time * 2 + nodeId) * 0.5 + 0.5;

          if (pulse > 0.7) {
            ctx.fillStyle = highlightColor;
            ctx.beginPath();
            ctx.arc(x, y, 3 + pulse * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw running light effect (horizontal waves) - toned down
      const waveAmplitude = 20;
      const waveFrequency = 0.05;
      const waveSpeed = 3;

      for (let i = 0; i < 3; i++) {
        const offset = time * waveSpeed * 50 + i * 100;
        const waveY = Math.sin((offset / canvas.width) * Math.PI * 2) * waveAmplitude;

        ctx.strokeStyle = `rgba(0, 255, 255, ${0.03 - i * 0.01})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + Math.sin((x + offset) * waveFrequency) * waveAmplitude + waveY;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical light streams (data flow) - toned down
      for (let i = 0; i < 5; i++) {
        const x = (i * canvas.width) / 5 + (time * 50) % (canvas.width / 5);
        const streamHeight = 200;

        // Validate gradient coordinates
        if (isFinite(x) && isFinite(streamHeight)) {
          const gradient = ctx.createLinearGradient(x, 0, x, streamHeight);
          gradient.addColorStop(0, "rgba(0, 255, 65, 0)");
          gradient.addColorStop(0.5, "rgba(232, 232, 232, 0.06)");
          gradient.addColorStop(1, "rgba(0, 255, 65, 0)");

          ctx.fillStyle = gradient;
          ctx.fillRect(x - 1, 0, 2, streamHeight);
        }
      }

      // Draw moving particles (coins/data points) - toned down
      for (let i = 0; i < 8; i++) {
        const particleX = ((time * 40 + i * 50) % canvas.width) || 1;
        const particleY = Math.sin(time * 1.5 + i) * 100 + canvas.height / 2;

        if (isFinite(particleX) && isFinite(particleY)) {
          // Particle glow
          const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 8);
          particleGradient.addColorStop(0, "rgba(74, 144, 226, 0.12)");
          particleGradient.addColorStop(1, "rgba(0, 255, 255, 0)");

          ctx.fillStyle = particleGradient;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 8, 0, Math.PI * 2);
          ctx.fill();

          // Particle core
          ctx.fillStyle = "rgba(74, 144, 226, 0.25)";
          ctx.beginPath();
          ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw accent particles (magenta) - toned down
      for (let i = 0; i < 5; i++) {
        const particleX = Math.sin(time * 1.2 + i) * (canvas.width / 3) + canvas.width / 2;
        const particleY = ((time * 30 + i * 60) % canvas.height) || 1;

        if (isFinite(particleX) && isFinite(particleY)) {
          const accentGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 6);
          accentGradient.addColorStop(0, "rgba(112, 128, 144, 0.08)");
          accentGradient.addColorStop(1, "rgba(255, 0, 255, 0)");

          ctx.fillStyle = accentGradient;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ background: "transparent", zIndex: 0 }}
    />
  );
}
