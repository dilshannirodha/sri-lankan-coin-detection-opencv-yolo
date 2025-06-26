from ultralytics import YOLO
import torch

if __name__ == "__main__":
    # Check if GPU is available
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")

    # Load YOLO model
    model = YOLO("yolov8n.pt")

    # Train model on GPU
    model.train(data="F:\coinCounting1\dataset\data.yaml", epochs=50, imgsz=640, device=device, batch=2, workers=0)