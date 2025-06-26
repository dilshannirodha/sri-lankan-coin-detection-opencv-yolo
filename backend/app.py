from flask import Flask, request, jsonify
from ultralytics import YOLO
from flask_cors import CORS
import os
import uuid
import torch
import cv2
from collections import Counter

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'static/uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = YOLO('runs/detect/train/weights/best.pt')

coin_values = {
    '1_rupee_1': 1,
    '1_rupee_2': 1,
    '2_rupee': 2,
    '5_rupee_1': 5,
    '5_rupee_2': 5,
    '5_rupee_3': 5,
    '10_rupee_1': 10,
    '10_rupee_2': 10,
}

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/image', methods=['POST'])
def detect_coins():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = str(uuid.uuid4()) + "_" + file.filename
        img_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(img_path)

        with torch.no_grad():
            results = model(img_path, conf=0.6, iou=0.4)

        boxes = results[0].boxes
        if boxes is None or boxes.cls is None or boxes.conf is None:
            return jsonify({"image_path": filename, "total_value": 0, "coins_detected": {}})

        detected_classes = boxes.cls.tolist()
        confidences = boxes.conf.tolist()

        CONFIDENCE_THRESHOLD = 0.6
        filtered_classes = [
            int(cls)
            for cls, conf in zip(detected_classes, confidences)
            if conf >= CONFIDENCE_THRESHOLD
        ]

        class_names = results[0].names
        detected_class_names = [class_names[int(cls)] for cls in filtered_classes]

        coin_counts = Counter(detected_class_names)
        total_value = sum(coin_values.get(name, 0) * count for name, count in coin_counts.items())

        name, ext = os.path.splitext(filename)
        result_filename = f"{name}_result{ext}"
        result_path = os.path.join(UPLOAD_FOLDER, result_filename)

        rendered_img = results[0].plot()
        cv2.imwrite(result_path, cv2.cvtColor(rendered_img, cv2.COLOR_RGB2BGR))

        return jsonify({
            "image_path": result_path.replace("\\", "/"),
            "total_value": total_value,
            "coins_detected": dict(coin_counts)  # Convert Counter to dict
        })

    return jsonify({"error": "Invalid file type"}), 400

if __name__ == '__main__':
    app.run(debug=True)
