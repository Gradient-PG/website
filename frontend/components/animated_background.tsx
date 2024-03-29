import { cn } from "@/lib/utils";
import React, { HTMLProps, useEffect, useRef } from "react";
import animateCanvas from "../lib/animate_bg";

interface AnimatedBackgroundProps extends HTMLProps<HTMLCanvasElement> {
  id: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  id,
  ...props
}) => {
  const elementRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    animateCanvas(
      id,
      elementRef.current!.clientWidth,
      elementRef.current!.clientHeight,
    );
    const handleResize = () => {
      let context = elementRef.current!.getContext("2d")!;
      context.canvas.width = elementRef.current!.clientWidth;
      context.canvas.height = elementRef.current!.clientHeight;
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [id]);

  return (
    <canvas
      id={id}
      className={cn("h-full w-full", props.className)}
      ref={elementRef}
    ></canvas>
  );
};

export default AnimatedBackground;
