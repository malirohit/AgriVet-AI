# Multi-Animal Disease Detection System

🐕 **Dogs** + 🐱 **Cats** + 🐄 **Other Animals** Disease Detection using Hybrid CNN-ViT Architecture

## 🎯 Overview

This system detects diseases across multiple animal species using a state-of-the-art hybrid CNN-ViT transformer model that combines:
- **CNN**: Local spatial feature extraction
- **Vision Transformer**: Global dependency understanding
- **Fusion Layer**: Intelligent combination of both approaches

## 📂 Dataset Structure

```
MultipleAnimalDetection/
├── data/                          # Raw disease images
│   ├── Fungal Infection in Dog/
│   ├── Urinary Tract Infection in Cat/
│   ├── Dental Disease in Dog/
│   └── ... (other disease folders)
├── train/                         # Training split (80%)
│   ├── Fungal Infection in Dog/
│   └── ... (mirrors data/ structure)
├── valid/                         # Validation split (20%)
│   ├── Fungal Infection in Dog/
│   └── ... (mirrors data/ structure)
├── train_cnn_vit_improved.py     # 🚀 IMPROVED training script
├── test_multi_animal_auto.py     # 🤖 Automated testing script
├── quick_test.py                  # ⚡ Quick inference testing
├── real_time_accuracy.py         # 📊 Real-time accuracy monitoring
├── setup_dataset.py              # Dataset organization
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Setup Dataset
```bash
python setup_dataset.py
```
This will:
- Create train/valid splits (80-20%)
- Organize data properly
- Check dataset balance
- Show statistics

### 2. Train Improved Model
```bash
python train_cnn_vit_improved.py
```

### 3. Test Model
```bash
# Automated testing
python test_multi_animal_auto.py

# Quick single image test
python quick_test.py

# Real-time accuracy monitoring
python real_time_accuracy.py
```

## 🧠 Model Architecture

### **Hybrid CNN-ViT Components**

#### **CNN Backbone** 📸
- **EfficientNet-B3** pretrained on ImageNet
- Extracts local features: edges, textures, patterns
- Progressive unfreezing for better learning

#### **Vision Transformer** 🧠
- Multi-head self-attention (8 heads)
- Captures global dependencies between image regions
- Positional encoding for spatial awareness

#### **Fusion System** 🔗
- **Dual heads**: CNN predictions + ViT predictions
- **Fusion layer**: Intelligent combination
- **Output**: Final disease classification

### **Key Features**
- ✅ **Multi-animal support** (Dogs, Cats, + others)
- ✅ **19 disease classes** (expandable)
- ✅ **Transfer learning** (ImageNet weights)
- ✅ **Progressive training** (unfreeze layers gradually)
- ✅ **Advanced augmentation** (rotation, color jitter, etc.)
- ✅ **Early stopping** (prevents overfitting)

## 📊 Performance

### **Expected Results**
- **Dogs**: 85-95% accuracy
- **Cats**: 80-90% accuracy
- **Multi-animal**: 75-90% overall accuracy

### **Training Metrics**
- **Loss tracking**: Train & validation curves
- **Accuracy monitoring**: Real-time progress
- **Learning rate scheduling**: Adaptive optimization
- **Best model saving**: Automatic checkpointing

## 🎮 Usage Examples

### **Training**
```python
# Automatic dataset detection
python train_cnn_vit_animal.py

# Output:
# ✅ Using pretrained EfficientNet-B3 weights
# Classes: ['Dental Disease in Cat', 'Fungal Infection in Dog', ...]
# Number of classes: 19
# Training samples: XXX
# Validation samples: XXX
```

### **Inference**
```python
# Single image prediction
python test_multi_animal.py
> Enter image path: data/Fungal Infection in Dog/Image_1.jpg

# Output:
# 🔍 Prediction Results:
# 📸 File: Image_1.jpg
# 🐾 Animal: Dog
# 🏥 Disease: Fungal Infection
# 📊 Confidence: 94.2%
```

### **Batch Processing**
```python
# Process entire folder
python test_multi_animal.py
> Enter image path: (press Enter for batch mode)
> Enter folder path: test_images/

# Output:
# 📸 Image_1.jpg: Dog - Fungal Infection (94.2%)
# 📸 Image_2.jpg: Cat - Urinary Tract Infection (87.1%)
# 📊 Summary:
# Animals detected: {'Dog': 15, 'Cat': 8}
# Diseases detected: {'Fungal Infection': 12, 'Urinary Tract Infection': 6}
```

## 🔧 Technical Details

### **Model Parameters**
- **Total Parameters**: ~12M
- **Trainable Parameters**: ~8M
- **Input Size**: 224×224×3
- **Batch Size**: 16 (adjustable)
- **Epochs**: 30 (with early stopping)

### **Training Configuration**
- **Optimizer**: AdamW with differential learning rates
- **Loss**: CrossEntropyLoss
- **Scheduler**: ReduceLROnPlateau
- **Data Augmentation**: Random crop, flip, rotation, color jitter

### **Hardware Requirements**
- **GPU**: Recommended (CUDA support)
- **RAM**: 8GB+ recommended
- **Storage**: 2GB+ for dataset and models

## 📈 Adding New Animals

### **Easy Extension**
1. **Create disease folders**:
   ```
   data/
   ├── Horse Disease/
   ├── Cow Disease/
   └── Pig Disease/
   ```

2. **Add images** (20+ per disease recommended)

3. **Run setup**:
   ```bash
   python setup_dataset.py
   ```

4. **Retrain model**:
   ```bash
   python train_cnn_vit_animal.py
   ```

### **Automatic Detection**
The system automatically detects:
- ✅ Number of classes
- ✅ Class names from folders
- ✅ Animal species (from folder names)
- ✅ Disease types

## 🎯 Best Practices

### **Dataset Quality**
- **Minimum 20 images** per disease class
- **Balanced distribution** across classes
- **High-quality images** with clear disease symptoms
- **Multiple angles** and lighting conditions

### **Training Tips**
- **GPU acceleration** for faster training
- **Monitor validation loss** for overfitting
- **Save checkpoints** regularly
- **Experiment with hyperparameters**

### **Deployment**
- **Model format**: PyTorch .pth files
- **Input requirements**: 224×224 RGB images
- **Output format**: Class probabilities + predictions

## 🚨 Troubleshooting

### **Common Issues**

#### **Low Accuracy**
- Add more training images
- Balance dataset classes
- Increase training epochs
- Adjust learning rates

#### **Memory Issues**
- Reduce batch size
- Use gradient accumulation
- Enable mixed precision training

#### **Slow Training**
- Use GPU acceleration
- Reduce image resolution
- Optimize data loading

## 📞 Support

### **Model Files**
- `best_multi_animal_model.pth` - Trained model weights
- `multi_animal_training_curves.png` - Training progress plots

### **Dependencies**
```bash
pip install torch torchvision matplotlib seaborn scikit-learn pillow tqdm
```

---

## 🏆 Results

This hybrid CNN-ViT system provides:
- 🎯 **High accuracy** across multiple animal species
- 🧠 **Advanced architecture** combining CNN + Transformer
- 📈 **Scalable design** for new animals/diseases
- 🔧 **Easy deployment** with comprehensive testing tools

**Ready for multi-animal disease detection!** 🐕🐱🐄🐴🐷
