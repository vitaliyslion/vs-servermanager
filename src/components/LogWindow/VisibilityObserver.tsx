import React, { useEffect, useRef, useState } from "react";

const spawnObserver = () =>
  new IntersectionObserver(
    function (entries) {
      // no intersection
      if (entries[0].intersectionRatio === 0) {
        entries[0].target.classList.remove("visible");
      }
      // fully intersects
      else if (entries[0].intersectionRatio === 1) {
        entries[0].target.classList.add("visible");
      }
    },
    {
      threshold: [0, 1],
    }
  );

export interface VisibilityObserverProps {
  className?: string;
}

export const VisibilityObserver: React.FC<VisibilityObserverProps> = ({
  className,
}) => {
  const [observer] = useState(() => spawnObserver());
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={className}
      ref={(el) => {
        if (el) {
          elementRef.current = el;
          observer.observe(el);
        }
      }}
    />
  );
};
