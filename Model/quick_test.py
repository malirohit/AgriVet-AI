import torch
from train_cnn_vit_improved import ImprovedHybridCNNViT
from torchvision import transforms
from PIL import Image
import sys
import os

def test_model():
    print("🧪 Quick Model Test")
    print("=" * 40)
    
    # Check if image path provided
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        print(f"📸 Testing image: {image_path}")
    else:
        print("❌ No image path provided")
        return
    
    # Load model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"🔧 Device: {device}")
    
    try:
        model = ImprovedHybridCNNViT(num_classes=22)
        model.load_state_dict(torch.load('best_improved_multi_animal_model.pth', map_location=device))
        model.to(device)
        model.eval()
        print("✅ Improved Model loaded successfully")
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        return
    
    # Test with the provided image
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Classes
    classes = [
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
    
    try:
        print(f"\n📸 Testing: {image_path}")
        
        # Check if image exists
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return
        
        # Load and test image
        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        # Predict
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
        
        predicted_class = classes[predicted.item()]
        confidence_score = confidence.item() * 100
        
        # Extract animal and disease
        if 'Dog' in predicted_class:
            animal = 'Dog'
        elif 'Cat' in predicted_class:
            animal = 'Cat'
        else:
            animal = 'Unknown'
        
        disease = predicted_class.replace(' in Dog', '').replace(' in Cat', '')
        
        print(f"🐾 Animal: {animal}")
        print(f"🏥 Disease: {disease}")
        print(f"📊 Confidence: {confidence_score:.2f}%")
        print(f"🏷️ Full Class: {predicted_class}")
        
    except Exception as e:
        print(f"❌ Error testing {image_path}: {e}")

if __name__ == "__main__":
    test_model()
