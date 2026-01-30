import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { Button } from "@/app/components/ui/button";
import { Upload, Download } from "lucide-react";
import ScreenshotnitsaLogo from "@/imports/ScreenshotnitsaLogo";

interface Screenshot {
  id: string;
  data: string;
  width: number;
  height: number;
}

interface Layout {
  backgroundWidth: number;
  backgroundHeight: number;
  screenshotWidth: number;
  screenshotHeight: number;
  isHorizontal: boolean;
}

export default function App() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>(
    [],
  );
  const [selectedIndex, setSelectedIndex] = useState<
    number | null
  >(null);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const [exportCount, setExportCount] = useState(() => {
    const saved = localStorage.getItem(
      "screenshotnica_export_count",
    );
    return saved ? parseInt(saved, 10) : 1;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<string, HTMLDivElement>>(
    new Map(),
  );

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newScreenshots: Screenshot[] = [];
    let loadedCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          newScreenshots.push({
            id: `${Date.now()}_${loadedCount}`,
            data: e.target?.result as string,
            width: img.width,
            height: img.height,
          });
          loadedCount++;

          if (loadedCount === files.length) {
            setScreenshots(newScreenshots);
            setSelectedIndex(0);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleExport = async () => {
    if (screenshots.length === 0) return;

    setIsExporting(true);

    try {
      if (screenshots.length === 1) {
        // Экспорт одного скриншота как PNG
        const screenshot = screenshots[0];
        const canvasElement = canvasRefs.current.get(
          screenshot.id,
        );

        if (!canvasElement) {
          console.error(
            "Canvas element not found for screenshot:",
            screenshot.id,
          );
          return;
        }

        const dataUrl = await toPng(canvasElement, {
          cacheBust: true,
          pixelRatio: 2,
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `screenshot_${exportCount}.png`;
        link.click();
      } else {
        // Экспорт нескольких скриншотов в ZIP
        const zip = new JSZip();

        for (let i = 0; i < screenshots.length; i++) {
          const screenshot = screenshots[i];
          const canvasElement = canvasRefs.current.get(
            screenshot.id,
          );

          if (!canvasElement) {
            console.error(
              "Canvas element not found for screenshot:",
              screenshot.id,
            );
            continue;
          }

          const dataUrl = await toPng(canvasElement, {
            cacheBust: true,
            pixelRatio: 2,
          });

          const blob = await fetch(dataUrl).then((res) =>
            res.blob(),
          );
          zip.file(`screenshot_${i + 1}.png`, blob);
        }

        const content = await zip.generateAsync({
          type: "blob",
        });
        const zipLink = document.createElement("a");
        zipLink.href = URL.createObjectURL(content);
        zipLink.download = `screenshot_pack_${exportCount}.zip`;
        zipLink.click();
      }

      const newCount = exportCount + 1;
      setExportCount(newCount);
      localStorage.setItem(
        "screenshotnica_export_count",
        newCount.toString(),
      );
    } catch (error) {
      console.error("Error exporting images:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoClick = () => {
    setScreenshots([]);
    setSelectedIndex(null);
  };

  const getLayout = (screenshot: Screenshot): Layout => {
    const isHorizontal = screenshot.width > screenshot.height;

    if (isHorizontal) {
      const screenshotWidth = 1344;
      const screenshotHeight =
        (screenshot.height / screenshot.width) *
        screenshotWidth;
      const backgroundWidth = 1440;
      const backgroundHeight = screenshotHeight + 96 + 96;

      return {
        backgroundWidth,
        backgroundHeight,
        screenshotWidth,
        screenshotHeight,
        isHorizontal: true,
      };
    } else {
      const screenshotHeight = 864;
      const screenshotWidth =
        (screenshot.width / screenshot.height) *
        screenshotHeight;

      return {
        backgroundWidth: 1440,
        backgroundHeight: 960,
        screenshotWidth,
        screenshotHeight,
        isHorizontal: false,
      };
    }
  };

  const selectedScreenshot =
    selectedIndex !== null ? screenshots[selectedIndex] : null;
  const selectedLayout = selectedScreenshot
    ? getLayout(selectedScreenshot)
    : null;

  useEffect(() => {
    if (!selectedLayout || !containerRef.current) return;

    const calculateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const availableWidth = containerWidth - 64;
      const availableHeight = containerHeight - 64;

      const scaleX =
        availableWidth / selectedLayout.backgroundWidth;
      const scaleY =
        availableHeight / selectedLayout.backgroundHeight;

      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () =>
      window.removeEventListener("resize", calculateScale);
  }, [selectedLayout]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12">
              <ScreenshotnitsaLogo />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Скриншотница
            </h1>
          </button>
          <div className="flex gap-3 ml-auto">
            {selectedScreenshot && (
              <>
                <Button
                  onClick={handleUploadClick}
                  className="bg-[rgb(255,231,105)] hover:bg-[rgb(255,220,60)] text-[rgb(0,0,0)]"
                  style={{
                    border: "none",
                  }}
                >
                  Загрузить новые скриншоты
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {isExporting
                    ? "Эксортирую..."
                    : screenshots.length > 1
                      ? `Экспортировать всё (${screenshots.length})`
                      : "Экспорт"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      <div className="flex-1 flex overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-8 overflow-hidden relative"
        >
          {!selectedScreenshot ? (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Загузи скриншоты, чтобы начать
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Скриншотница автоматически оформит их в стиле
                Яндекс Практикума
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleUploadClick}
                  className="text-[rgb(0,0,0)] bg-[rgb(255,231,105)] hover:bg-[rgb(255,220,60)]"
                >
                  Загрузить
                </Button>
              </div>
            </div>
          ) : selectedLayout ? (
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              <div
                style={{
                  width: `${selectedLayout.backgroundWidth}px`,
                  height: `${selectedLayout.backgroundHeight}px`,
                  backgroundColor: "#F7F7F7",
                }}
                className="flex items-center justify-center shadow-lg"
              >
                <div
                  style={{
                    width: `${selectedLayout.screenshotWidth}px`,
                    height: `${selectedLayout.screenshotHeight}px`,
                    borderRadius: "16px",
                    border: "1px solid #B6BCBF",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={selectedScreenshot.data}
                    alt="Screenshot"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {screenshots.length > 0 && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <h3 className="font-medium text-gray-900">
                Скриншоты ({screenshots.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {screenshots.map((screenshot, index) => {
                  const layout = getLayout(screenshot);
                  const isSelected = selectedIndex === index;

                  return (
                    <div
                      key={screenshot.id}
                      onClick={() => setSelectedIndex(index)}
                      className={`cursor-pointer rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="p-2">
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: `${layout.backgroundWidth} / ${layout.backgroundHeight}`,
                            backgroundColor: "#F7F7F7",
                          }}
                          className="flex items-center justify-center rounded"
                        >
                          <div
                            style={{
                              width: `${(layout.screenshotWidth / layout.backgroundWidth) * 100}%`,
                              height: `${(layout.screenshotHeight / layout.backgroundHeight) * 100}%`,
                              borderRadius: "4px",
                              border: "0.5px solid #B6BCBF",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={screenshot.data}
                              alt={`Скриншот ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Скриншот {index + 1} •{" "}
                          {layout.isHorizontal
                            ? "Горизонтальный"
                            : "Вертикальный"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
        }}
      >
        {screenshots.map((screenshot) => {
          const layout = getLayout(screenshot);
          return (
            <div
              key={screenshot.id}
              ref={(ref) => {
                if (ref)
                  canvasRefs.current.set(screenshot.id, ref);
              }}
              style={{
                width: `${layout.backgroundWidth}px`,
                height: `${layout.backgroundHeight}px`,
                backgroundColor: "#F7F7F7",
              }}
              className="flex items-center justify-center"
            >
              <div
                style={{
                  width: `${layout.screenshotWidth}px`,
                  height: `${layout.screenshotHeight}px`,
                  borderRadius: "16px",
                  border: "1px solid #B6BCBF",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={screenshot.data}
                  alt={`Screenshot export`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}