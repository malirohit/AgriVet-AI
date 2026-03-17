import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from train_cnn_vit_animal import HybridCNNViT
import os

def evaluate_model_accuracy(model_path="best_multi_animal_model.pth"):
    """Comprehensive accuracy evaluation"""
    
    print("=" * 70)
    print("🎯 MULTI-ANIMAL MODEL ACCURACY EVALUATION")
    print("=" * 70)
    
    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🔧 Device: {device}")
    
    # Load dataset
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Try test set first, then validation
    try:
        test_dataset = datasets.ImageFolder("data/test", transform=transform)
        print("📊 Using Test Set")
    except:
        try:
            test_dataset = datasets.ImageFolder("data/valid", transform=transform)
            print("📊 Using Validation Set")
        except:
            test_dataset = datasets.ImageFolder("data", transform=transform)
            print("📊 Using Full Dataset")
    
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)
    
    # Load model
    num_classes = len(test_dataset.classes)
    model = HybridCNNViT(num_classes=num_classes).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    print(f"🏷️ Classes: {len(test_dataset.classes)}")
    print(f"📸 Test Images: {len(test_dataset)}")
    print(f"📁 Class Names: {test_dataset.classes}")
    
    # Evaluate
    all_preds = []
    all_labels = []
    correct = 0
    total = 0
    
    print("\n🔍 Evaluating model...")
    with torch.no_grad():
        for imgs, labels in test_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    
    # Calculate metrics
    accuracy = 100 * correct / total
    print(f"\n🏆 OVERALL ACCURACY: {accuracy:.2f}%")
    print(f"✅ Correct: {correct}/{total}")
    
    # Detailed classification report
    print("\n📋 DETAILED CLASSIFICATION REPORT:")
    print("=" * 70)
    report = classification_report(
        all_labels, all_preds, 
        target_names=test_dataset.classes,
        digits=3
    )
    print(report)
    
    # Per-class accuracy
    print("\n🎯 PER-CLASS ACCURACY:")
    print("-" * 40)
    class_accuracies = {}
    for i, class_name in enumerate(test_dataset.classes):
        class_mask = np.array(all_labels) == i
        if np.sum(class_mask) > 0:
            class_correct = np.sum((np.array(all_labels) == i) & (np.array(all_preds) == i))
            class_total = np.sum(class_mask)
            class_acc = 100 * class_correct / class_total
            class_accuracies[class_name] = class_acc
            print(f"{class_name}: {class_acc:.1f}% ({class_correct}/{class_total})")
    
    # Animal-wise accuracy
    print("\n🐾 ANIMAL-WISE ACCURACY:")
    print("-" * 30)
    animal_accuracies = {}
    for class_name, acc in class_accuracies.items():
        animal = "Dog" if "Dog" in class_name else "Cat" if "Cat" in class_name else "Other"
        if animal not in animal_accuracies:
            animal_accuracies[animal] = []
        animal_accuracies[animal].append(acc)
    
    for animal, accs in animal_accuracies.items():
        avg_acc = np.mean(accs)
        print(f"{animal}: {avg_acc:.1f}% (avg across {len(accs)} diseases)")
    
    # Confusion Matrix
    print("\n🔥 CONFUSION MATRIX:")
    print("-" * 40)
    cm = confusion_matrix(all_labels, all_preds)
    
    # Plot confusion matrix
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=test_dataset.classes,
                yticklabels=test_dataset.classes)
    plt.title('Multi-Animal Disease Detection - Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=150, bbox_inches='tight')
    plt.show()
    
    # Top performing classes
    print("\n🥇 TOP PERFORMING CLASSES:")
    print("-" * 30)
    sorted_classes = sorted(class_accuracies.items(), key=lambda x: x[1], reverse=True)
    for i, (class_name, acc) in enumerate(sorted_classes[:5]):
        print(f"{i+1}. {class_name}: {acc:.1f}%")
    
    # Classes needing improvement
    print("\n⚠️ CLASSES NEEDING IMPROVEMENT:")
    print("-" * 40)
    worst_classes = sorted(class_accuracies.items(), key=lambda x: x[1])[:3]
    for class_name, acc in worst_classes:
        print(f"{class_name}: {acc:.1f}%")
    
    # Save detailed report
    with open('accuracy_report.txt', 'w') as f:
        f.write("MULTI-ANIMAL DISEASE DETECTION - ACCURACY REPORT\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"OVERALL ACCURACY: {accuracy:.2f}%\n")
        f.write(f"TOTAL IMAGES: {total}\n")
        f.write(f"CORRECT PREDICTIONS: {correct}\n\n")
        f.write("CLASSIFICATION REPORT:\n")
        f.write(report + "\n\n")
        f.write("PER-CLASS ACCURACY:\n")
        for class_name, acc in class_accuracies.items():
            f.write(f"{class_name}: {acc:.1f}%\n")
    
    print(f"\n💾 Detailed report saved to: accuracy_report.txt")
    print(f"📊 Confusion matrix saved to: confusion_matrix.png")
    
    return accuracy, class_accuracies

def compare_with_baseline():
    """Compare with baseline models"""
    
    print("\n🔄 BASELINE COMPARISON:")
    print("-" * 30)
    
    baseline_scores = {
        'Random Forest (Dog Only)': 87.53,
        'CNN MobileNetV2 (Dog Only)': 79.77,
        'SVM (Dog Only)': 75.20,
        'Hybrid CNN-ViT (Multi-Animal)': 'Loading...'
    }
    
    try:
        accuracy, _ = evaluate_model_accuracy()
        baseline_scores['Hybrid CNN-ViT (Multi-Animal)'] = accuracy
    except:
        print("⚠️ Could not load model for comparison")
        baseline_scores['Hybrid CNN-ViT (Multi-Animal)'] = 'N/A'
    
    print("\n📊 MODEL COMPARISON:")
    for model, score in baseline_scores.items():
        if isinstance(score, float):
            print(f"{model}: {score:.2f}%")
        else:
            print(f"{model}: {score}")

if __name__ == "__main__":
    # Run evaluation
    accuracy, class_accuracies = evaluate_model_accuracy()
    
    # Compare with baselines
    compare_with_baseline()
    
    print(f"\n🎉 EVALUATION COMPLETE!")
    print(f"🏆 Final Accuracy: {accuracy:.2f}%")
