"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BuyMeACoffeeProps {
  username: string;
  className?: string;
}

export function BuyMeACoffee({
  username = "naderferjani",
  className,
}: BuyMeACoffeeProps) {
  useEffect(() => {
    // Load Buy Me a Coffee script
    const script = document.createElement("script");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("data-id", username);
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute(
      "data-message",
      "Thank you for visiting. You can now buy me a coffee!"
    );
    script.setAttribute("data-color", "#5F7FFF");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      const existingScript = document.querySelector(
        `script[data-id="${username}"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
      // Also remove the widget if it exists
      const widget = document.getElementById("bmc-wbtn");
      if (widget) {
        widget.remove();
      }
    };
  }, [username]);

  return (
    <div className={className}>
      <a
        href={`https://buymeacoffee.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Button variant="outline" className="gap-2">
          <span>☕</span>
          <span>Buy me a coffee</span>
        </Button>
      </a>
    </div>
  );
}
