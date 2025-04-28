import React, { useState, useRef, useEffect } from 'react';

type Format = 'grayscale' | 'rgb' | 'rgba';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [format, setFormat] = useState<Format>('grayscale');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 📦 파일 처리 로직 (드래그&드랍 / 파일선택 모두 사용)
  const processFile = (selectedFile: File) => {
    setFile(selectedFile);

    let bytesPerPixel = 1;
    if (format === 'rgb') bytesPerPixel = 3;
    else if (format === 'rgba') bytesPerPixel = 4;

    const size = selectedFile.size;
    const pixelCount = size / bytesPerPixel;
    const approx = Math.sqrt(pixelCount);
    const rounded = Math.floor(approx);

    setWidth(rounded);
    setHeight(rounded);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFormat = e.target.value as Format;
    setFormat(selectedFormat);

    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(Number(e.target.value));
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(Number(e.target.value));
  };

  useEffect(() => {
    if (file && width > 0 && height > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = width;
            canvas.height = height;

            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            let bytesPerPixel = 1;
            if (format === 'rgb') bytesPerPixel = 3;
            else if (format === 'rgba') bytesPerPixel = 4;

            for (let i = 0; i < width * height; i++) {
              const pixelStart = i * bytesPerPixel;
              if (format === 'grayscale') {
                const value = uint8Array[pixelStart] || 0;
                data[i * 4 + 0] = value;
                data[i * 4 + 1] = value;
                data[i * 4 + 2] = value;
                data[i * 4 + 3] = 255;
              } else if (format === 'rgb') {
                data[i * 4 + 0] = uint8Array[pixelStart] || 0;
                data[i * 4 + 1] = uint8Array[pixelStart + 1] || 0;
                data[i * 4 + 2] = uint8Array[pixelStart + 2] || 0;
                data[i * 4 + 3] = 255;
              } else if (format === 'rgba') {
                data[i * 4 + 0] = uint8Array[pixelStart] || 0;
                data[i * 4 + 1] = uint8Array[pixelStart + 1] || 0;
                data[i * 4 + 2] = uint8Array[pixelStart + 2] || 0;
                data[i * 4 + 3] = uint8Array[pixelStart + 3] ?? 255;
              }
            }

            ctx.putImageData(imageData, 0, 0);
          }
        }
      };

      reader.readAsArrayBuffer(file);
    }
  }, [file, width, height, format]);

  const handleDownload = (formatType: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (canvas && file) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL(`image/${formatType}`);

      const originalName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${originalName}.${formatType}`;

      link.click();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '40px',
      backgroundColor: '#f9f9f9',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ marginBottom: '30px', fontSize: '32px', color: '#333' }}>
        Raw Image Converter
      </h1>

      <div
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  style={{
    backgroundColor: isDragging ? '#e0f7fa' : '#fff',
    border: isDragging ? '2px dashed #00acc1' : '2px dashed #ccc',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
    marginBottom: '30px'
  }}
>
  <p style={{ marginBottom: '10px', fontWeight:'bold' }}>
    Drag & Drop RAW file here
  </p>
  <p>or</p>

  {/* 숨긴 파일 인풋 */}
  <input
    type="file"
    accept=".raw"
    id="fileInput"
    style={{ display: 'none' }}
    onChange={handleFileChange}
  />

  {/* 커스텀 파일 선택 버튼 */}
  <label
    htmlFor="fileInput"
    style={{
      display: 'inline-block',
      padding: '10px 20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      borderRadius: '4px',
      cursor: 'pointer',
    }}
  >
    Choose File
  </label>

  {/* 선택된 파일 이름 별도 표시 */}
  {file && (
    <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
      Selected file: <strong>{file.name}</strong>
    </div>
  )}
</div>



      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <select
            value={format}
            onChange={handleFormatChange}
            style={{
              padding: '8px',
              marginBottom: '20px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="grayscale">Grayscale (1 byte per pixel)</option>
            <option value="rgb">RGB (3 bytes per pixel)</option>
            <option value="rgba">RGBA (4 bytes per pixel)</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="number"
            placeholder="Width"
            value={width}
            onChange={handleWidthChange}
            style={{
              width: '100px',
              padding: '8px',
              marginRight: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <input
            type="number"
            placeholder="Height"
            value={height}
            onChange={handleHeightChange}
            style={{
              width: '100px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <canvas
            ref={canvasRef}
            style={{ border: '1px solid #ccc', maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div>
          <button
            onClick={() => handleDownload('png')}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              marginRight: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Download as PNG
          </button>
          <button
            onClick={() => handleDownload('jpeg')}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Download as JPG
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
