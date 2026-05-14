import React from "react";
import { useEditorStore } from "@/store/editor.store";

export function useElementAnimation(ref: React.RefObject<HTMLDivElement | null>) {
  const { previewMode, animationPreviewNonce } = useEditorStore();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (previewMode) {
          // In preview mode, reset visibility when scrolled out
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animationPreviewNonce, previewMode, ref]);

  return isVisible;
}
