import { RefObject, useEffect, useRef, useState } from "react";

type UseSeamlessVideoPlaybackOptions = {
  sectionRef: RefObject<HTMLElement>;
  videoRef: RefObject<HTMLVideoElement>;
  sourceKey: string;
  enabled?: boolean;
  threshold?: number;
};

const isElementInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
};

export const useSeamlessVideoPlayback = ({
  sectionRef,
  videoRef,
  sourceKey,
  enabled = true,
  threshold = 0.01,
}: UseSeamlessVideoPlaybackOptions) => {
  const isVisibleRef = useRef(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!enabled || !section || !video) return;

    isVisibleRef.current = isElementInViewport(section);
    setIsActive(isVisibleRef.current);

    const playIfVisible = () => {
      if (!isVisibleRef.current) return;
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        setIsActive(entry.isIntersecting);

        if (entry.isIntersecting) {
          playIfVisible();
        } else {
          video.pause();
        }
      },
      { threshold }
    );

    observer.observe(section);

    const interactionEvents = ["pointerdown", "touchstart", "keydown", "scroll"] as const;
    interactionEvents.forEach((eventName) =>
      window.addEventListener(eventName, playIfVisible, { passive: true })
    );

    video.addEventListener("loadeddata", playIfVisible);
    video.addEventListener("canplay", playIfVisible);
    video.addEventListener("playing", playIfVisible);
    video.addEventListener("waiting", playIfVisible);
    playIfVisible();

    let lastTime = -1;
    const playbackNudge = window.setInterval(() => {
      if (!isVisibleRef.current) return;
      if (video.paused) {
        playIfVisible();
        return;
      }
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      const currentTime = video.currentTime;
      if (Math.abs(currentTime - lastTime) < 0.03) {
        playIfVisible();
      }
      lastTime = currentTime;
    }, 1800);

    return () => {
      observer.disconnect();
      window.clearInterval(playbackNudge);
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, playIfVisible));
      video.removeEventListener("loadeddata", playIfVisible);
      video.removeEventListener("canplay", playIfVisible);
      video.removeEventListener("playing", playIfVisible);
      video.removeEventListener("waiting", playIfVisible);
    };
  }, [enabled, sectionRef, sourceKey, threshold, videoRef]);

  return isActive;
};