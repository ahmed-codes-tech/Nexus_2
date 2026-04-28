import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SignaturePadProps {
  signerName: string;
  documentName: string;
  onSave: (signatureData: string) => void;
  onClose: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  signerName,
  documentName,
  onSave,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [signatureData, setSignatureData] = useState<string>('');

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastX(x);
    setLastY(y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    setLastX(x);
    setLastY(y);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData('');
    }
  };

  const handleSave = () => {
    if (signatureData) {
      onSave(signatureData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sign Document</h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">Signing as: <strong>{signerName}</strong></p>
            <p className="text-sm text-gray-500">{documentName}</p>
          </div>

          <div className="border-2 border-gray-300 rounded-lg">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="w-full h-48 cursor-crosshair bg-white rounded-lg"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={clearSignature} fullWidth>
              Clear
            </Button>
            <Button onClick={handleSave} disabled={!signatureData} fullWidth>
              Sign Document
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Draw your signature above using your mouse or touch
          </p>
        </div>
      </div>
    </div>
  );
};