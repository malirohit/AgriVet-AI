import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import os
from train_cnn_vit_animal import HybridCNNViT

class MultiAnimalDetector:
    def __init__(self, model_path="best_multi_animal_model.pth"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = HybridCNNViT(num_classes=22)  # Match saved model
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        
        # Class names (22 classes to match saved model)
        self.classes = [
            'Dental Disease in Cat', 'Dental Disease in Dog',
            'Distemper in Dog', 'Ear Mites in Cat',
            'Eye Infection in Cat', 'Eye Infection in Dog',
            'Fungal Infection in Cat', 'Fungal Infection in Dog',
            'Hot Spots in Dog', 'Kennel Cough in Dog',
            'Ringworm in Cat', 'Scabies in Cat',
            'Skin Allergy in Cat', 'Skin Allergy in Dog',
            'Tick Infestation in Dog', 'Urinary Tract Infection in Cat',
            'Worm Infection in Cat', 'Worm Infection in Dog',
            'Feline Leukemia', 'Feline Panleukopenia',
            'Mange in Dog', 'Parvovirus in Dog'
        ]
        
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    
    def predict(self, image_path):
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
        
        # Get results
        predicted_class = self.classes[predicted.item()]
        confidence_score = confidence.item() * 100
        
        # Extract animal and disease
        if 'Dog' in predicted_class:
            animal = 'Dog'
        elif 'Cat' in predicted_class:
            animal = 'Cat'
        else:
            animal = 'Unknown'
        
        disease = predicted_class.replace(' in Dog', '').replace(' in Cat', '')
        
        return {
            'predicted_class': predicted_class,
            'animal': animal,
            'disease': disease,
            'confidence': confidence_score,
            'all_probabilities': {
                self.classes[i]: prob.item() * 100 
                for i, prob in enumerate(probabilities[0])
            }
        }
    
    def predict_batch(self, image_folder):
        """Predict all images in a folder"""
        results = []
        image_files = [f for f in os.listdir(image_folder) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        print(f"Processing {len(image_files)} images...")
        
        for image_file in image_files:
            image_path = os.path.join(image_folder, image_file)
            result = self.predict(image_path)
            result['filename'] = image_file
            results.append(result)
            
            print(f"📸 {image_file}: {result['animal']} - {result['disease']} ({result['confidence']:.1f}%)")
        
        return results

def main():
    print("=" * 60)
    print("MULTI-ANIMAL DISEASE DETECTOR")
    print("=" * 60)
    
    # Initialize detector
    detector = MultiAnimalDetector()
    
    # Test single image
    image_path = input("Enter image path (or press Enter for batch mode): ").strip()
    
    if image_path:
        if os.path.exists(image_path):
            result = detector.predict(image_path)
            print(f"\n🔍 Prediction Results:")
            print(f"📸 File: {os.path.basename(image_path)}")
            print(f"🐾 Animal: {result['animal']}")
            print(f"🏥 Disease: {result['disease']}")
            print(f"📊 Confidence: {result['confidence']:.2f}%")
            print(f"🏷️ Full Class: {result['predicted_class']}")
        else:
            print("❌ Image file not found!")
    else:
        # Batch mode
        folder_path = input("Enter folder path containing images: ").strip()
        if os.path.exists(folder_path):
            results = detector.predict_batch(folder_path)
            
            # Summary
            animals = {}
            diseases = {}
            for result in results:
                animal = result['animal']
                disease = result['disease']
                animals[animal] = animals.get(animal, 0) + 1
                diseases[disease] = diseases.get(disease, 0) + 1
            
            print(f"\n📊 Summary:")
            print(f"Animals detected: {animals}")
            print(f"Diseases detected: {diseases}")
        else:
            print("❌ Folder not found!")

if __name__ == "__main__":
    main()
