import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
from train_cnn_vit_animal import HybridCNNViT
import os

class RealTimeAccuracyMonitor:
    def __init__(self, model_path="best_multi_animal_model.pth"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = HybridCNNViT(num_classes=19)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        self.classes = [
            'Dental Disease in Cat', 'Dental Disease in Dog',
            'Distemper in Dog', 'Ear Mites in Cat',
            'Eye Infection in Cat', 'Eye Infection in Dog',
            'Fungal Infection in Cat', 'Fungal Infection in Dog',
            'Hot Spots in Dog', 'Kennel Cough in Dog',
            'Ringworm in Cat', 'Scabies in Cat',
            'Skin Allergy in Cat', 'Skin Allergy in Dog',
            'Tick Infestation in Dog', 'Urinary Tract Infection in Cat',
            'Worm Infection in Cat', 'Worm Infection in Dog'
        ]
        
        self.predictions_history = []
        self.confidence_history = []
    
    def predict_with_confidence(self, image_path):
        """Predict with confidence score"""
        try:
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
            
            predicted_class = self.classes[predicted.item()]
            confidence_score = confidence.item()
            
            # Store for monitoring
            self.predictions_history.append(predicted_class)
            self.confidence_history.append(confidence_score)
            
            return {
                'class': predicted_class,
                'confidence': confidence_score,
                'all_probs': {self.classes[i]: prob.item() for i, prob in enumerate(probabilities[0])}
            }
        except Exception as e:
            return {'error': str(e)}
    
    def monitor_folder_accuracy(self, folder_path, ground_truth=None):
        """Monitor accuracy on folder with optional ground truth"""
        
        print(f"🔍 Monitoring accuracy for: {folder_path}")
        print("=" * 50)
        
        image_files = [f for f in os.listdir(folder_path) 
                       if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        if not image_files:
            print("❌ No images found!")
            return
        
        results = []
        high_confidence_count = 0
        low_confidence_count = 0
        
        print(f"📸 Processing {len(image_files)} images...\n")
        
        for i, image_file in enumerate(image_files, 1):
            image_path = os.path.join(folder_path, image_file)
            result = self.predict_with_confidence(image_path)
            
            if 'error' in result:
                print(f"❌ {image_file}: Error - {result['error']}")
                continue
            
            confidence = result['confidence']
            prediction = result['class']
            
            # Confidence classification
            if confidence >= 0.8:
                confidence_level = "🟢 HIGH"
                high_confidence_count += 1
            elif confidence >= 0.6:
                confidence_level = "🟡 MEDIUM"
            else:
                confidence_level = "🔴 LOW"
                low_confidence_count += 1
            
            print(f"{i:2d}. 📸 {image_file}")
            print(f"    🏷️ {prediction}")
            print(f"    📊 {confidence:.3f} ({confidence_level})")
            
            # Ground truth comparison (if provided)
            if ground_truth and image_file in ground_truth:
                true_label = ground_truth[image_file]
                is_correct = prediction == true_label
                status = "✅ CORRECT" if is_correct else "❌ WRONG"
                print(f"    🎯 {true_label} → {status}")
            
            results.append({
                'filename': image_file,
                'prediction': prediction,
                'confidence': confidence,
                'all_probs': result['all_probs']
            })
        
        # Summary statistics
        print(f"\n📊 ACCURACY MONITORING SUMMARY:")
        print("=" * 50)
        print(f"📸 Total Images: {len(results)}")
        print(f"🟢 High Confidence (≥80%): {high_confidence_count} ({100*high_confidence_count/len(results):.1f}%)")
        print(f"🟡 Medium Confidence (60-79%): {len(results) - high_confidence_count - low_confidence_count}")
        print(f"🔴 Low Confidence (<60%): {low_confidence_count} ({100*low_confidence_count/len(results):.1f}%)")
        
        # Average confidence
        avg_confidence = np.mean([r['confidence'] for r in results])
        print(f"📈 Average Confidence: {avg_confidence:.3f}")
        
        # Most common predictions
        from collections import Counter
        predictions = [r['prediction'] for r in results]
        common_preds = Counter(predictions).most_common(5)
        print(f"\n🏷️ Top Predictions:")
        for pred, count in common_preds:
            print(f"    {pred}: {count} times")
        
        # Confidence distribution plot
        self.plot_confidence_distribution()
        
        return results
    
    def plot_confidence_distribution(self):
        """Plot confidence score distribution"""
        
        if not self.confidence_history:
            return
        
        plt.figure(figsize=(12, 4))
        
        # Confidence histogram
        plt.subplot(1, 2, 1)
        plt.hist(self.confidence_history, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
        plt.axvline(x=0.8, color='green', linestyle='--', label='High Confidence')
        plt.axvline(x=0.6, color='orange', linestyle='--', label='Medium Confidence')
        plt.xlabel('Confidence Score')
        plt.ylabel('Frequency')
        plt.title('Confidence Score Distribution')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Confidence over time
        plt.subplot(1, 2, 2)
        plt.plot(range(len(self.confidence_history)), self.confidence_history, 
                marker='o', markersize=3, alpha=0.7)
        plt.axhline(y=0.8, color='green', linestyle='--', alpha=0.5)
        plt.axhline(y=0.6, color='orange', linestyle='--', alpha=0.5)
        plt.xlabel('Image Number')
        plt.ylabel('Confidence Score')
        plt.title('Confidence Over Time')
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('confidence_monitoring.png', dpi=150, bbox_inches='tight')
        plt.show()
    
    def test_single_image(self, image_path):
        """Test single image with detailed analysis"""
        
        print(f"🔍 Analyzing: {os.path.basename(image_path)}")
        print("=" * 50)
        
        result = self.predict_with_confidence(image_path)
        
        if 'error' in result:
            print(f"❌ Error: {result['error']}")
            return
        
        prediction = result['class']
        confidence = result['confidence']
        all_probs = result['all_probs']
        
        # Main prediction
        print(f"🏷️ Predicted: {prediction}")
        print(f"📊 Confidence: {confidence:.3f} ({confidence*100:.1f}%)")
        
        # Confidence level
        if confidence >= 0.8:
            level = "🟢 HIGH CONFIDENCE"
        elif confidence >= 0.6:
            level = "🟡 MEDIUM CONFIDENCE"
        else:
            level = "🔴 LOW CONFIDENCE"
        print(f"📈 Level: {level}")
        
        # Top 3 predictions
        sorted_probs = sorted(all_probs.items(), key=lambda x: x[1], reverse=True)[:3]
        print(f"\n🏆 TOP 3 PREDICTIONS:")
        for i, (class_name, prob) in enumerate(sorted_probs, 1):
            star = "⭐" if i == 1 else "  "
            print(f"{star} {i}. {class_name}: {prob:.3f} ({prob*100:.1f}%)")
        
        # Animal and disease extraction
        if 'Dog' in prediction:
            animal = '🐕 Dog'
        elif 'Cat' in prediction:
            animal = '🐱 Cat'
        else:
            animal = '❓ Unknown'
        
        disease = prediction.replace(' in Dog', '').replace(' in Cat', '')
        print(f"\n🐾 Animal: {animal}")
        print(f"🏥 Disease: {disease}")

def main():
    print("🎯 REAL-TIME ACCURACY MONITOR")
    print("=" * 50)
    
    monitor = RealTimeAccuracyMonitor()
    
    choice = input("Choose option:\n1. Test single image\n2. Monitor folder\n3. Show confidence history\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        image_path = input("Enter image path: ").strip()
        if os.path.exists(image_path):
            monitor.test_single_image(image_path)
        else:
            print("❌ Image not found!")
    
    elif choice == "2":
        folder_path = input("Enter folder path: ").strip()
        if os.path.exists(folder_path):
            results = monitor.monitor_folder_accuracy(folder_path)
        else:
            print("❌ Folder not found!")
    
    elif choice == "3":
        if monitor.confidence_history:
            monitor.plot_confidence_distribution()
        else:
            print("❌ No predictions yet!")
    
    else:
        print("❌ Invalid choice!")

if __name__ == "__main__":
    main()
