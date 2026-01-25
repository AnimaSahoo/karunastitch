import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brush, 
  Square, 
  Circle, 
  Trash2, 
  Download, 
  Palette,
  Undo,
  Redo
} from "lucide-react";
import { toast } from "sonner";

interface PopularDesign {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

const popularDesigns: PopularDesign[] = [
  { id: "princess-cut", name: "Princess Cut", description: "Deep V-neck with darts", emoji: "👸" },
  { id: "boat-neck", name: "Boat Neck", description: "Wide horizontal neckline", emoji: "⛵" },
  { id: "sweetheart", name: "Sweetheart", description: "Heart-shaped neckline", emoji: "💖" },
  { id: "halter-neck", name: "Halter Neck", description: "Ties behind the neck", emoji: "🎀" },
  { id: "collar-neck", name: "Collar Neck", description: "Shirt-style collar", emoji: "👔" },
  { id: "high-neck", name: "High Neck", description: "Full coverage neckline", emoji: "🔝" },
  { id: "puff-sleeve", name: "Puff Sleeve", description: "Voluminous sleeves", emoji: "🎈" },
];

interface CustomDesignCanvasProps {
  onSaveDesign: (designData: string) => void;
}

export const CustomDesignCanvas = ({ onSaveDesign }: CustomDesignCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<"brush" | "rectangle" | "circle">("brush");
  const [currentColor, setCurrentColor] = useState("#8B0000");
  const [brushSize, setBrushSize] = useState(3);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 500;

    // Set up canvas background
    ctx.fillStyle = "#FFF8DC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw blouse outline
    ctx.strokeStyle = "#DDD";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Basic blouse shape
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(350, 50);
    ctx.lineTo(380, 200);
    ctx.lineTo(350, 450);
    ctx.lineTo(50, 450);
    ctx.lineTo(20, 200);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // Add labels
    ctx.fillStyle = "#888";
    ctx.font = "12px sans-serif";
    ctx.fillText("Front Panel", 170, 30);
    ctx.fillText("Neckline", 180, 70);
    ctx.fillText("Sleeve Area", 30, 150);
    ctx.fillText("Sleeve Area", 300, 150);
    
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (currentTool === "brush") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (currentTool === "brush") {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(false);

    if (currentTool === "rectangle") {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(x - 25, y - 15, 50, 30);
    } else if (currentTool === "circle") {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and redraw background
    ctx.fillStyle = "#FFF8DC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw blouse outline
    ctx.strokeStyle = "#DDD";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(350, 50);
    ctx.lineTo(380, 200);
    ctx.lineTo(350, 450);
    ctx.lineTo(50, 450);
    ctx.lineTo(20, 200);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#888";
    ctx.font = "12px sans-serif";
    ctx.fillText("Front Panel", 170, 30);
    ctx.fillText("Neckline", 180, 70);
    ctx.fillText("Sleeve Area", 30, 150);
    ctx.fillText("Sleeve Area", 300, 150);

    toast.success("Canvas cleared!");
  };

  const saveDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    onSaveDesign(dataURL);
    toast.success("Custom design saved!");
  };

  const downloadDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "custom-blouse-design.png";
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Design downloaded!");
  };

  const colors = [
    "#8B0000", // Dark Red
    "#FFD700", // Gold  
    "#006400", // Dark Green
    "#4B0082", // Indigo
    "#FF69B4", // Hot Pink
    "#000000", // Black
    "#800080", // Purple
    "#008B8B", // Dark Cyan
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-elegant">
      <CardHeader className="bg-gradient-elegant text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Brush className="h-6 w-6" />
          Custom Design Canvas
        </CardTitle>
        <p className="text-base opacity-90">
          Sketch your custom blouse design using our drawing tools
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Popular Designs Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg text-royal-red mb-4">Popular Indian Blouse Styles</h3>
          <p className="text-sm text-muted-foreground mb-4">Select a style for inspiration, then customize on the canvas below</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {popularDesigns.map((design) => (
              <button
                key={design.id}
                onClick={() => setSelectedStyle(selectedStyle === design.id ? null : design.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center hover:shadow-md ${
                  selectedStyle === design.id
                    ? "border-royal-red bg-cream shadow-md scale-105"
                    : "border-border hover:border-royal-gold"
                }`}
              >
                <span className="text-2xl block mb-1">{design.emoji}</span>
                <span className="text-xs font-medium block">{design.name}</span>
              </button>
            ))}
          </div>
          {selectedStyle && (
            <div className="mt-3 p-3 bg-cream rounded-lg border border-royal-gold">
              <p className="text-sm">
                <strong>{popularDesigns.find(d => d.id === selectedStyle)?.name}:</strong>{" "}
                {popularDesigns.find(d => d.id === selectedStyle)?.description}. 
                <span className="text-muted-foreground"> Sketch your version on the canvas below!</span>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tools Panel */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-royal-red mb-3">Drawing Tools</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={currentTool === "brush" ? "royal" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTool("brush")}
                  className="flex flex-col items-center gap-1 h-auto p-3"
                >
                  <Brush className="h-4 w-4" />
                  <span className="text-xs">Brush</span>
                </Button>
                <Button
                  variant={currentTool === "rectangle" ? "royal" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTool("rectangle")}
                  className="flex flex-col items-center gap-1 h-auto p-3"
                >
                  <Square className="h-4 w-4" />
                  <span className="text-xs">Square</span>
                </Button>
                <Button
                  variant={currentTool === "circle" ? "royal" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTool("circle")}
                  className="flex flex-col items-center gap-1 h-auto p-3"
                >
                  <Circle className="h-4 w-4" />
                  <span className="text-xs">Circle</span>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-base mb-2">Colors</h4>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      currentColor === color 
                        ? "border-royal-red scale-110" 
                        : "border-gray-300 hover:border-royal-red"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Badge className="mt-2 bg-cream text-foreground">
                Selected: {currentColor}
              </Badge>
            </div>

            <div>
              <h4 className="font-medium text-base mb-2">Brush Size</h4>
              <input
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground mt-1">
                Size: {brushSize}px
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={clearCanvas}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
              <Button
                variant="gold"
                onClick={downloadDesign}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Design
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="border-2 border-border rounded-lg p-4 bg-cream">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={() => setIsDrawing(false)}
                className="border border-gray-300 rounded cursor-crosshair mx-auto block"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            
            <div className="mt-4 text-center">
              <Button
                variant="elegant"
                size="lg"
                onClick={saveDesign}
                className="px-8"
              >
                Save Custom Design
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};