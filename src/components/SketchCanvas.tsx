import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Brush, Eraser, RotateCcw, Download, Circle, Square } from "lucide-react";

interface SketchCanvasProps {
  onSave: (dataUrl: string, designName: string) => void;
  customerName?: string;
}

type Tool = "brush" | "eraser" | "rectangle" | "circle";

export const SketchCanvas = ({ onSave, customerName = "" }: SketchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>("brush");
  const [brushColor, setBrushColor] = useState("#8B4513");
  const [brushSize, setBrushSize] = useState(3);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const colors = [
    "#000000", "#8B4513", "#D4AF37", "#800020", "#1a365d",
    "#2d5016", "#4a1259", "#b91c1c", "#f97316", "#06b6d4"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 350;

    // Fill with off-white background
    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw blouse outline
    drawBlouseOutline(ctx, canvas.width, canvas.height);
  }, []);

  const drawBlouseOutline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const topY = 40;
    
    ctx.strokeStyle = "#d4c4b0";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);

    ctx.beginPath();
    
    // Neckline
    ctx.moveTo(centerX - 80, topY + 30);
    ctx.quadraticCurveTo(centerX, topY, centerX + 80, topY + 30);
    
    // Right shoulder and sleeve
    ctx.lineTo(centerX + 120, topY + 40);
    ctx.lineTo(centerX + 160, topY + 80);
    ctx.lineTo(centerX + 150, topY + 120);
    ctx.lineTo(centerX + 100, topY + 100);
    
    // Right side
    ctx.lineTo(centerX + 90, height - 60);
    
    // Bottom
    ctx.lineTo(centerX - 90, height - 60);
    
    // Left side
    ctx.lineTo(centerX - 100, topY + 100);
    
    // Left sleeve
    ctx.lineTo(centerX - 150, topY + 120);
    ctx.lineTo(centerX - 160, topY + 80);
    ctx.lineTo(centerX - 120, topY + 40);
    
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // Add labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Neckline", centerX, topY + 20);
    ctx.fillText("Sleeve", centerX + 145, topY + 95);
    ctx.fillText("Sleeve", centerX - 145, topY + 95);
    ctx.fillText("Body", centerX, height - 100);
  };

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPosition(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (currentTool === "brush" || currentTool === "eraser") {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pos = getPosition(e);

    if (currentTool === "brush") {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (currentTool === "eraser") {
      ctx.strokeStyle = "#faf8f5";
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    if (currentTool === "rectangle" || currentTool === "circle") {
      const pos = getPosition(e);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;

      if (currentTool === "rectangle") {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else {
        const radiusX = Math.abs(pos.x - startPos.x) / 2;
        const radiusY = Math.abs(pos.y - startPos.y) / 2;
        const centerX = startPos.x + (pos.x - startPos.x) / 2;
        const centerY = startPos.y + (pos.y - startPos.y) / 2;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    setIsDrawing(false);
    
    // Auto-save after drawing (without name, just for preview)
    if (canvas) {
      onSave(canvas.toDataURL("image/png"), "");
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBlouseOutline(ctx, canvas.width, canvas.height);
    onSave("", "");
  };

  const generateDesignName = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedName = customerName
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase();
    
    if (sanitizedName) {
      return `${sanitizedName}_blouse_design_${timestamp}`;
    }
    return `blouse_design_${timestamp}`;
  };

  const saveDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const designName = generateDesignName();
    const dataUrl = canvas.toDataURL("image/png");
    
    // Save to parent component with design name
    onSave(dataUrl, designName);

    // Download the file
    const link = document.createElement("a");
    link.download = `${designName}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Tools Panel */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <div className="flex gap-1">
          <Button
            type="button"
            variant={currentTool === "brush" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("brush")}
            title="Brush"
          >
            <Brush className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={currentTool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("eraser")}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={currentTool === "rectangle" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("rectangle")}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={currentTool === "circle" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("circle")}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        {/* Color Palette */}
        <div className="flex gap-1">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setBrushColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                brushColor === color ? "border-primary ring-2 ring-primary/30" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        {/* Brush Size */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className="text-xs text-muted-foreground">Size</span>
          <Slider
            value={[brushSize]}
            onValueChange={(v) => setBrushSize(v[0])}
            min={1}
            max={20}
            step={1}
            className="w-16"
          />
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <Button type="button" variant="outline" size="sm" onClick={clearCanvas}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={saveDesign}>
          <Download className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>

      {/* Canvas */}
      <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-[#faf8f5]">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          style={{ height: "350px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Draw your custom blouse design on the template above. Your sketch will be saved automatically.
      </p>
    </div>
  );
};
