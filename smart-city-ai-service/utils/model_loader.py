from ultralytics import YOLO
import torch
import os
import numpy as np


class ProblemDetectionModel:
    def __init__(self, model_path):
        try:
            # Încarcă modelul folosind API-ul YOLO
            self.model = YOLO(model_path)
            print(f"Model încărcat cu succes: {model_path}")

            # Define problem categories (ajustează acestea în funcție de clasele din modelul tău)
            self.categories = ['pothole', 'garbage', 'graffiti']

        except Exception as e:
            print(f"Eroare la încărcarea modelului: {e}")
            raise

    def predict(self, image):
        """
        Procesează imaginea și returnează predicțiile.

        Args:
            image (PIL.Image): Imaginea de procesat

        Returns:
            dict: Rezultatele predicției
        """
        try:
            # Rulează predicția YOLO pe imaginea dată
            results = self.model(image)

            # Extrage rezultatele
            if len(results) > 0:
                result = results[0]
                boxes = result.boxes

                if len(boxes) > 0:
                    # Ia clasa cu cel mai mare scor
                    class_id = int(boxes.cls[0])
                    confidence = float(boxes.conf[0])

                    # Mapează class_id la categoria de probleme
                    if class_id < len(self.categories):
                        category = self.categories[class_id]
                    else:
                        category = "unknown"

                    # Calculează severitatea bazată pe confidence
                    severity_score = int(confidence * 10)

                    # Calculează timpul estimat de remediere
                    if severity_score > 8:
                        estimated_fix_time = "3-5 days"
                    elif severity_score > 5:
                        estimated_fix_time = "1-2 weeks"
                    else:
                        estimated_fix_time = "2-4 weeks"

                    # Construiește dicționarul de detecții
                    detections = {}
                    for i in range(len(boxes)):
                        cls_id = int(boxes.cls[i])
                        if cls_id < len(self.categories):
                            cls_name = self.categories[cls_id]
                        else:
                            cls_name = f"class_{cls_id}"
                        cls_conf = float(boxes.conf[i])
                        detections[cls_name] = cls_conf

                    return {
                        "detectedCategory": category,
                        "confidence": confidence,
                        "severityScore": severity_score,
                        "estimatedFixTime": estimated_fix_time,
                        "detectedObjects": detections
                    }

            # Dacă nu s-a detectat nimic
            return {
                "detectedCategory": "unknown",
                "confidence": 0.0,
                "severityScore": 0,
                "estimatedFixTime": "unknown",
                "detectedObjects": {}
            }
        except Exception as e:
            print(f"Eroare la predicție: {e}")
            return {
                "error": str(e),
                "detectedCategory": "error",
                "confidence": 0.0,
                "severityScore": 0,
                "estimatedFixTime": "unknown",
                "detectedObjects": {}
            }