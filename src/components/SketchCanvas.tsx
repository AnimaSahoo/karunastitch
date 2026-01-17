import { useRef, useState, useEffect, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brush, Eraser, RotateCcw, Download, Circle, Square } from "lucide-react";

interface SketchCanvasProps {
  onSave: (dataUrl: string, designName: string) => void;
  customerName?: string;
}

type Tool = "brush" | "eraser" | "rectangle" | "circle";

interface BowType {
  id: string;
  name: string;
  emoji: string;
}

const bowTypes: BowType[] = [
  { id: "classic", name: "Classic Bow", emoji: "🎀" },
  { id: "ribbon", name: "Ribbon Bow", emoji: "🎗️" },
  { id: "butterfly", name: "Butterfly Bow", emoji: "🦋" },
  { id: "rose", name: "Rose Bow", emoji: "🌹" },
  { id: "knot", name: "Decorative Knot", emoji: "🪢" },
  { id: "tassel", name: "Tassel", emoji: "🧶" },
];

interface DroppedBow {
  id: string;
  bowType: BowType;
  x: number;
  y: number;
}

export const SketchCanvas = ({ onSave, customerName = "" }: SketchCanvasProps) => {
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeView, setActiveView] = useState<"front" | "back">("front");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>("brush");
  const [brushColor, setBrushColor] = useState("#8B4513");
  const [brushSize, setBrushSize] = useState(3);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [frontBows, setFrontBows] = useState<DroppedBow[]>([]);
  const [backBows, setBackBows] = useState<DroppedBow[]>([]);

  const colors = [
    "#000000", "#8B4513", "#D4AF37", "#800020", "#1a365d",
    "#2d5016", "#4a1259", "#b91c1c", "#f97316", "#06b6d4"
  ];

  const getCurrentCanvas = () => {
    return activeView === "front" ? frontCanvasRef.current : backCanvasRef.current;
  };

  const getCurrentBows = () => {
    return activeView === "front" ? frontBows : backBows;
  };

  const setCurrentBows = (bows: DroppedBow[]) => {
    if (activeView === "front") {
      setFrontBows(bows);
    } else {
      setBackBows(bows);
    }
  };

  useEffect(() => {
    initCanvas(frontCanvasRef.current, "front");
    initCanvas(backCanvasRef.current, "back");
  }, []);

  // Re-initialize canvas when switching tabs to ensure proper dimensions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeView === "front") {
        initCanvas(frontCanvasRef.current, "front");
      } else {
        initCanvas(backCanvasRef.current, "back");
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeView]);

  const initCanvas = (canvas: HTMLCanvasElement | null, view: "front" | "back") => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 350;

    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBlouseOutline(ctx, canvas.width, canvas.height, view);
  };

  const drawBlouseOutline = (ctx: CanvasRenderingContext2D, width: number, height: number, view: "front" | "back") => {
    const centerX = width / 2;
    const topY = 40;
    
    ctx.strokeStyle = "#d4c4b0";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);

    ctx.beginPath();
    
    // Neckline - different for front vs back
    if (view === "front") {
      // V-neck or deeper front
      ctx.moveTo(centerX - 80, topY + 30);
      ctx.quadraticCurveTo(centerX, topY + 50, centerX + 80, topY + 30);
    } else {
      // Shallower back neckline
      ctx.moveTo(centerX - 80, topY + 30);
      ctx.quadraticCurveTo(centerX, topY + 15, centerX + 80, topY + 30);
    }
    
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
    ctx.fillText(view === "front" ? "Front Neckline" : "Back Neckline", centerX, topY + (view === "front" ? 35 : 10));
    ctx.fillText("Sleeve", centerX + 145, topY + 95);
    ctx.fillText("Sleeve", centerX - 145, topY + 95);
    ctx.fillText(view === "front" ? "Front Body" : "Back Body", centerX, height - 100);
  };

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = getCurrentCanvas();
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
      const canvas = getCurrentCanvas();
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = getCurrentCanvas();
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

    const canvas = getCurrentCanvas();
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
    autoSave();
  };

  const autoSave = () => {
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (frontCanvas && backCanvas) {
      // Combine both canvases for save
      const combinedDataUrl = frontCanvas.toDataURL("image/png");
      onSave(combinedDataUrl, "");
    }
  };

  const clearCanvas = () => {
    const canvas = getCurrentCanvas();
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBlouseOutline(ctx, canvas.width, canvas.height, activeView);
    setCurrentBows([]);
    autoSave();
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
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (!frontCanvas || !backCanvas) return;

    const designName = generateDesignName();
    
    // Create combined canvas
    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = frontCanvas.width * 2 + 20;
    combinedCanvas.height = frontCanvas.height + 60;
    const ctx = combinedCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

    // Labels
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FRONT", frontCanvas.width / 2, 20);
    ctx.fillText("BACK", frontCanvas.width + 10 + backCanvas.width / 2, 20);

    // Draw canvases
    ctx.drawImage(frontCanvas, 0, 30);
    ctx.drawImage(backCanvas, frontCanvas.width + 20, 30);

    // Draw bows on combined canvas
    ctx.font = "24px sans-serif";
    frontBows.forEach((bow) => {
      ctx.fillText(bow.bowType.emoji, bow.x, bow.y + 30);
    });
    backBows.forEach((bow) => {
      ctx.fillText(bow.bowType.emoji, bow.x + frontCanvas.width + 20, bow.y + 30);
    });

    const dataUrl = combinedCanvas.toDataURL("image/png");
    onSave(dataUrl, designName);

    const link = document.createElement("a");
    link.download = `${designName}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, bow: BowType) => {
    e.dataTransfer.setData("bowId", bow.id);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const bowId = e.dataTransfer.getData("bowId");
    const bow = bowTypes.find((b) => b.id === bowId);
    if (!bow) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBow: DroppedBow = {
      id: `${bow.id}-${Date.now()}`,
      bowType: bow,
      x,
      y,
    };

    setCurrentBows([...getCurrentBows(), newBow]);
    autoSave();
  };

  const removeBow = (bowId: string) => {
    setCurrentBows(getCurrentBows().filter((b) => b.id !== bowId));
    autoSave();
  };

  const renderCanvas = (view: "front" | "back") => {
    const canvasRef = view === "front" ? frontCanvasRef : backCanvasRef;
    const bows = view === "front" ? frontBows : backBows;

    return (
      <div
        className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-[#faf8f5]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
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
        {/* Dropped bows overlay */}
        {bows.map((bow) => (
          <div
            key={bow.id}
            className="absolute cursor-pointer hover:scale-110 transition-transform group"
            style={{ left: bow.x - 12, top: bow.y - 12 }}
            onClick={() => removeBow(bow.id)}
            title="Click to remove"
          >
            <span className="text-2xl">{bow.bowType.emoji}</span>
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              ×
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Bow Drag & Drop Panel */}
      <div className="p-3 bg-accent/30 rounded-lg">
        <p className="text-sm font-medium text-foreground mb-2">Drag & Drop Decorations</p>
        <div className="flex flex-wrap gap-2">
          {bowTypes.map((bow) => (
            <div
              key={bow.id}
              draggable
              onDragStart={(e) => handleDragStart(e, bow)}
              className="flex items-center gap-1 px-3 py-2 bg-background rounded-lg border border-border cursor-grab hover:border-primary hover:shadow-sm transition-all active:cursor-grabbing"
              title={bow.name}
            >
              <span className="text-xl">{bow.emoji}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{bow.name}</span>
            </div>
          ))}
        </div>
      </div>

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

      {/* Front/Back Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "front" | "back")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="front" className="text-sm font-medium">
            👕 Front View
          </TabsTrigger>
          <TabsTrigger value="back" className="text-sm font-medium">
            🔙 Back View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="front" className="mt-4">
          {renderCanvas("front")}
        </TabsContent>
        <TabsContent value="back" className="mt-4">
          {renderCanvas("back")}
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center">
        Design both front and back of your blouse. Drag decorations onto the canvas or draw freehand. Click decorations to remove them.
      </p>
    </div>
  );
};
