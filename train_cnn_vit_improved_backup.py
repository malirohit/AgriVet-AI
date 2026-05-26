import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import os
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# =========================
# CNN BACKBONE FOR SPATIAL FEATURES (RESNET50)
# =========================
class CNNBackbone(nn.Module):
    def __init__(self):
        super().__init__()
        
        # Use ResNet50 as backbone
        try:
            resnet = models.resnet50(
                weights=models.ResNet50_Weights.IMAGENET1K_V2
            )
            print("✅ Using pretrained ResNet50 weights")
        except Exception as e:
            print(f"⚠️ Error downloading pretrained weights: {e}")
            print("🔄 Using random weights")
            resnet = models.resnet50(weights=None)
        
        # Remove avgpool + fc layers
        self.features = nn.Sequential(*list(resnet.children())[:-2])
        self.out_channels = 2048
        
        # Freeze early layers
        for i, param in enumerate(self.features.parameters()):
            if i < len(list(self.features.parameters())) - 30:
                param.requires_grad = False

    def forward(self, x):
        return self.features(x)  # (B, 2048, 7, 7)

# =========================
# VISION TRANSFORMER FOR GLOBAL FEATURES
# =========================
class VisionTransformer(nn.Module):
    def __init__(self, embed_dim=256, n_heads=8, n_layers=2):
        super().__init__()
        
        self.proj = nn.Conv2d(2048, embed_dim, kernel_size=1)
        self.pos_embedding = nn.Parameter(torch.randn(1, 49, embed_dim))  # 7x7 grid
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=n_heads,
            dim_feedforward=embed_dim * 2,
            dropout=0.2,  # Increased dropout
            batch_first=True,
            activation="gelu"
        )
        
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)

    def forward(self, x):
        B, C, H, W = x.shape
        
        # Project and flatten
        x = self.proj(x)                  # (B, 256, H, W)
        x = x.flatten(2).transpose(1, 2)  # (B, H*W, 256)
        
        # Add positional encoding
        seq_len = x.shape[1]
        if seq_len <= 49:
            x = x + self.pos_embedding[:, :seq_len]
        
        # Apply transformer
        x = self.transformer(x)
        return x.mean(dim=1)  # Global average pooling

# =========================
# IMPROVED HYBRID CNN-VIT MODEL
# =========================
class ImprovedHybridCNNViT(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        
        self.cnn = CNNBackbone()
        self.vit = VisionTransformer()
        
        # CNN head with more regularization
        self.cnn_head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Dropout(0.3),  # Increased dropout
            nn.Linear(2048, 1024),
            nn.BatchNorm1d(1024),  # Added batch norm
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),  # Added batch norm
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, num_classes)
        )
        
        # ViT head with more regularization
        self.vit_head = nn.Sequential(
            nn.Dropout(0.2),  # Increased dropout
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),  # Added batch norm
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, num_classes)
        )
        
        # Fusion layer with regularization
        self.fusion = nn.Sequential(
            nn.Linear(num_classes * 2, 256),
            nn.BatchNorm1d(256),  # Added batch norm
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        # Extract features
        cnn_features = self.cnn(x)
        vit_features = self.vit(cnn_features)
        
        # Get predictions from both heads
        cnn_logits = self.cnn_head(cnn_features)
        vit_logits = self.vit_head(vit_features)
        
        # Fusion approach
        combined = torch.cat([cnn_logits, vit_logits], dim=1)
        output = self.fusion(combined)
        
        return output

# =========================
# IMPROVED DATA AUGMENTATION
# =========================
def get_improved_transforms():
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),  # More aggressive cropping
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(20),  # More rotation
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.2),  # More color variation
        transforms.RandomAffine(degrees=15, translate=(0.15, 0.15)),  # More translation
        transforms.RandomGrayscale(p=0.1),  # Random grayscale
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),  # Random blur
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        transforms.RandomErasing(p=0.1)  # Random erasing
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

# =========================
# TRAINING FUNCTIONS
# =========================
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    correct, total, running_loss = 0, 0, 0
    
    for imgs, labels in tqdm(loader, desc="Training"):
        imgs, labels = imgs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        
        # Gradient clipping to prevent exploding gradients
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        optimizer.step()
        
        running_loss += loss.item()
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)
    
    acc = 100 * correct / total
    return running_loss / len(loader), acc

def validate(model, loader, criterion, device):
    model.eval()
    correct, total, running_loss = 0, 0, 0
    
    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    
    acc = 100 * correct / total
    return running_loss / len(loader), acc

# =========================
# MAIN TRAINING FUNCTION
# =========================
def main():
    print("=" * 80)
    print("IMPROVED HYBRID CNN-VIT FOR MULTI-ANIMAL DISEASE DETECTION")
    print("=" * 80)
    print("🐕 Dogs + 🐱 Cats + Other Animals (With Regularization)")
    print("=" * 80)
    
    # Paths
    data_dir = "data"
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "valid")
    
    # Transforms
    train_transform, val_transform = get_improved_transforms()
    
    # Datasets
    try:
        train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
        val_dataset = datasets.ImageFolder(val_dir, transform=val_transform)
    except Exception as e:
        print(f"Error loading datasets: {e}")
        print("Using direct data folder...")
        train_dataset = datasets.ImageFolder(data_dir, transform=train_transform)
        val_dataset = datasets.ImageFolder(data_dir, transform=val_transform)
    
    # Data loaders with smaller batch size
    BATCH_SIZE = 12  # Reduced from 16
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
    
    # Class info
    num_classes = len(train_dataset.classes)
    print(f"\nDataset Info:")
    print(f"Classes: {train_dataset.classes}")
    print(f"Number of classes: {num_classes}")
    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")
    
    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    
    # Model
    model = ImprovedHybridCNNViT(num_classes=num_classes).to(device)
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    
    # Training setup with label smoothing
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)  # Label smoothing
    
    # Get all trainable parameters
    trainable_params = []
    for name, param in model.named_parameters():
        if param.requires_grad:
            trainable_params.append(param)
    
    optimizer = optim.AdamW(trainable_params, lr=5e-5, weight_decay=1e-3)  # Lower LR, higher weight decay
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='max', patience=3, factor=0.5, min_lr=1e-6
    )
    
    # Early stopping
    best_acc = 0
    patience_counter = 0
    max_patience = 8  # Early stopping after 8 epochs without improvement
    
    # Training loop
    print("\nStarting improved training...")
    EPOCHS = 40  # More epochs with early stopping
    train_losses, val_losses = [], []
    train_accs, val_accs = [], []
    
    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS}")
        print("-" * 50)
        
        # Progressive unfreezing
        if epoch == 8:
            print("🔄 Unfreezing more CNN layers...")
            for param in model.cnn.features[-5:].parameters():
                param.requires_grad = True
            print("✅ Unfrozen additional CNN layers")
        
        if epoch == 15:
            print("🔄 Unfreezing all CNN layers...")
            for param in model.cnn.features.parameters():
                param.requires_grad = True
            print("✅ Unfrozen all CNN layers")
        
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        scheduler.step(val_acc)
        
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        train_accs.append(train_acc)
        val_accs.append(val_acc)
        
        # Early stopping logic
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), "best_improved_multi_animal_model.pth")
            print(f"🏆 New best model! Val Acc: {val_acc:.2f}%")
            patience_counter = 0
        else:
            patience_counter += 1
            print(f"⏳ No improvement for {patience_counter} epochs")
        
        if patience_counter >= max_patience:
            print(f"⏹️ Early stopping triggered after {patience_counter} epochs")
            break
        
        print(f"Train Acc: {train_acc:.2f}% | Val Acc: {val_acc:.2f}%")
        print(f"Learning Rate: {optimizer.param_groups[0]['lr']:.6f}")
        print(f"Gap: {train_acc - val_acc:.2f}% (should be < 20%)")
    
    # Plot results
    plt.figure(figsize=(15, 5))
    
    plt.subplot(1, 3, 1)
    plt.plot(train_accs, label="Train Accuracy", linewidth=2)
    plt.plot(val_accs, label="Validation Accuracy", linewidth=2)
    plt.legend()
    plt.title("Improved Multi-Animal Model - Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy (%)")
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 3, 2)
    plt.plot(train_losses, label="Train Loss", linewidth=2)
    plt.plot(val_losses, label="Validation Loss", linewidth=2)
    plt.legend()
    plt.title("Improved Multi-Animal Model - Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 3, 3)
    gaps = [t - v for t, v in zip(train_accs, val_accs)]
    plt.plot(range(1, len(gaps)+1), gaps, 'ro-', label="Train-Val Gap")
    plt.axhline(y=20, color='red', linestyle='--', label='Target Gap (<20%)')
    plt.title("Overfitting Monitor")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy Gap (%)")
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('improved_multi_animal_training_curves.png', dpi=150, bbox_inches='tight')
    plt.show()
    
    # Final evaluation
    print(f"\n🏆 Best Validation Accuracy: {best_acc:.2f}%")
    print("Model saved as: best_improved_multi_animal_model.pth")
    print("=" * 80)
    
    return model, best_acc

if __name__ == "__main__":
    model, accuracy = main()
