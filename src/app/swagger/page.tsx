"use client";

import { useEffect, useRef } from "react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      if (!containerRef.current) return;

      const SwaggerUI = await import("swagger-ui-react");
      const SwaggerUIComponent = SwaggerUI.default;

      containerRef.current.innerHTML = "";

      const { createRoot } = await import("react-dom/client");
      const root = createRoot(containerRef.current);
      root.render(<SwaggerUIComponent url="/swagger.yaml" />);
    })();
  }, []);

  return <div ref={containerRef} />;
}
