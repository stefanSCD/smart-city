# utils/image_processor.py
import torch
from torchvision import transforms
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import io
import base64


class ImageProcessor:
    def __init__(self):
        # Transformări standard pentru modelul PyTorch
        self.standard_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def load_image_from_path(self, image_path):
        """Încarcă o imagine de la calea specificată"""
        try:
            return Image.open(image_path).convert('RGB')
        except Exception as e:
            raise Exception(f"Error loading image from path: {e}")

    def load_image_from_bytes(self, image_bytes):
        """Încarcă o imagine din bytes"""
        try:
            return Image.open(io.BytesIO(image_bytes)).convert('RGB')
        except Exception as e:
            raise Exception(f"Error loading image from bytes: {e}")

    def load_image_from_base64(self, base64_string):
        """Încarcă o imagine din string base64"""
        try:
            # Eliminate any base64 prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]

            image_bytes = base64.b64decode(base64_string)
            return self.load_image_from_bytes(image_bytes)
        except Exception as e:
            raise Exception(f"Error loading image from base64: {e}")

    def preprocess_image(self, image, apply_transforms=True):
        """Preprocesează imaginea pentru inputul modelului"""
        if apply_transforms:
            return self.standard_transform(image).unsqueeze(0)
        return image

    def enhance_image(self, image, enhancement_factor=1.5):
        """Îmbunătățește claritatea și contrastul imaginii pentru detecție mai bună"""
        # Îmbunătățește contrastul
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(enhancement_factor)

        # Îmbunătățește claritatea
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(enhancement_factor)

        return image

    def apply_filters(self, image):
        """Aplică filtre pentru a evidenția caracteristicile"""
        # Aplică un filtru de detectare a marginilor
        edges = image.filter(ImageFilter.FIND_EDGES)

        # Aplică un filtru de îmbunătățire a detaliilor
        enhanced = image.filter(ImageFilter.DETAIL)

        return enhanced

    def segment_problem_area(self, image, model=None):
        """
        Segmentează zona cu probleme din imagine (necesită un model de segmentare)
        Dacă nu există un model, returnează întreaga imagine
        """
        if model is None:
            return image

        # Aici ar veni codul specific pentru segmentare cu modelul dat
        # Exemplu simplu: împărțim imaginea în regiuni și identificăm regiunea cu cea mai mare probabilitate

        return image

    def generate_heatmap(self, image, predictions):
        """
        Generează o hartă termică a zonelor cu probleme.
        Presupune că predictions conține scoruri de confidence pe zone ale imaginii.
        """
        # Această funcție ar putea fi implementată pentru vizualizare
        # Pentru exemplul de față, doar convertim imaginea în numpy array
        img_array = np.array(image)

        # Aici ar veni codul pentru suprapunerea heatmap-ului pe baza predicțiilor

        return Image.fromarray(img_array)

    def bounding_box_detection(self, image, threshold=0.5):
        """
        Detectează regiuni de interes și returnează bounding boxes.
        Pentru implementarea completă ar fi necesar un model de detectare a obiectelor.
        """
        # Implementare simplificată:
        width, height = image.size

        # Returnează un bounding box de exemplu
        # În implementarea reală, acesta ar fi generat de un model de detecție
        dummy_box = {
            'x1': int(width * 0.2),
            'y1': int(height * 0.2),
            'x2': int(width * 0.8),
            'y2': int(height * 0.8),
            'confidence': 0.85,
            'label': 'problem_area'
        }

        return [dummy_box]

    def crop_to_problem(self, image, boxes):
        """Decupează imaginea pentru a include doar zona cu problema"""
        if not boxes:
            return image

        box = boxes[0]  # Ia primul bounding box
        return image.crop((box['x1'], box['y1'], box['x2'], box['y2']))

    def tensor_to_pil(self, tensor):
        """Convertește un tensor PyTorch la o imagine PIL"""
        # Elimină batch dimension și convertește la CPU
        if tensor.dim() == 4:
            tensor = tensor[0]
        tensor = tensor.cpu()

        # Convertește tensor la PIL Image
        if tensor.shape[0] == 3:
            # Pentru imagini cu 3 canale (RGB)
            transform = transforms.ToPILImage()
            return transform(tensor)
        else:
            # Pentru imagini cu 1 canal
            return Image.fromarray(tensor[0].numpy() * 255, 'L')


# Exemplu de utilizare
if __name__ == "__main__":
    processor = ImageProcessor()
    # Test cu o imagine de exemplu
    try:
        img = processor.load_image_from_path("test_image.jpg")
        img = processor.enhance_image(img)
        tensor = processor.preprocess_image(img)
        print(f"Image preprocessed to tensor shape: {tensor.shape}")
    except Exception as e:
        print(f"Error during testing: {e}")
