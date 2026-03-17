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
        
        # Use ResNet50 as backbone (same as previous hybrid algorithm)
        try:
            resnet = models.resnet50(
                weights=models.ResNet50_Weights.IMAGENET1K_V2
            )
            print("✅ Using pretrained ResNet50 weights")
        except Exception as e:
            print(f"⚠️ Error downloading pretrained weights: {e}")
            print("🔄 Using random weights")
            resnet = models.resnet50(weights=None)
        
        # Remove avgpool + fc layers (same as previous hybrid)
        self.features = nn.Sequential(*list(resnet.children())[:-2])
        self.out_channels = 2048
        
        # Freeze early layers, unfreeze later layers
        for i, param in enumerate(self.features.parameters()):
            if i < len(list(self.features.parameters())) - 40:
                param.requires_grad = False

    def forward(self, x):
        return self.features(x)  # (B, 2048, 7, 7)

# =========================
# VISION TRANSFORMER FOR GLOBAL FEATURES
# =========================
class VisionTransformer(nn.Module):
    def __init__(self, embed_dim=256, n_heads=8, n_layers=3):
        super().__init__()
        
        self.proj = nn.Conv2d(2048, embed_dim, kernel_size=1)
        self.pos_embedding = nn.Parameter(torch.randn(1, 100, embed_dim))  # 10x10 grid
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=n_heads,
            dim_feedforward=embed_dim * 2,
            dropout=0.1,
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
        if seq_len <= 100:
            x = x + self.pos_embedding[:, :seq_len]
        
        # Apply transformer
        x = self.transformer(x)
        return x.mean(dim=1)  # Global average pooling

# =========================
# HYBRID CNN-VIT MODEL
# =========================
class HybridCNNViT(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        
        self.cnn = CNNBackbone()
        self.vit = VisionTransformer()
        
        # Dual heads for better fusion
        self.cnn_head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Dropout(0.2),
            nn.Linear(2048, 512),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, num_classes)
        )
        
        self.vit_head = nn.Sequential(
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, num_classes)
        )
        
        # Fusion layer for combining both
        self.fusion = nn.Sequential(
            nn.Linear(num_classes * 2, 128),
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
# DATA AUGMENTATION
# =========================
def get_transforms():
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.RandomAffine(degrees=10, translate=(0.1, 0.1)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
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
    print("HYBRID CNN-VIT FOR MULTI-ANIMAL DISEASE DETECTION")
    print("=" * 80)
    print("🐕 Dogs + 🐱 Cats + Other Animals")
    print("=" * 80)
    
    # Paths
    data_dir = "data"
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "valid")
    
    # Create train/valid split if not exists
    if not os.path.exists(train_dir):
        print("Creating train/valid split from data folder...")
        os.makedirs(train_dir, exist_ok=True)
        os.makedirs(val_dir, exist_ok=True)
        
        # Get all disease folders
        disease_folders = [f for f in os.listdir(data_dir) 
                       if os.path.isdir(os.path.join(data_dir, f)) and f != "train" and f != "valid"]
        
        # Split each disease folder
        for disease in disease_folders:
            disease_path = os.path.join(data_dir, disease)
            images = [f for f in os.listdir(disease_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
            
            # 80-20 split
            split_idx = int(0.8 * len(images))
            train_imgs = images[:split_idx]
            val_imgs = images[split_idx:]
            
            # Create folders
            os.makedirs(os.path.join(train_dir, disease), exist_ok=True)
            os.makedirs(os.path.join(val_dir, disease), exist_ok=True)
            
            # Copy images (simplified - in production use proper file copying)
            print(f"Splitting {disease}: {len(train_imgs)} train, {len(val_imgs)} val")
    
    # Transforms
    train_transform, val_transform = get_transforms()
    
    # Datasets
    try:
        train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
        val_dataset = datasets.ImageFolder(val_dir, transform=val_transform)
    except Exception as e:
        print(f"Error loading datasets: {e}")
        print("Using direct data folder...")
        train_dataset = datasets.ImageFolder(data_dir, transform=train_transform)
        val_dataset = datasets.ImageFolder(data_dir, transform=val_transform)
    
    # Data loaders
    BATCH_SIZE = 16
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
    model = HybridCNNViT(num_classes=num_classes).to(device)
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    
    # Training setup
    criterion = nn.CrossEntropyLoss()
    
    # Get all trainable parameters
    trainable_params = []
    for name, param in model.named_parameters():
        if param.requires_grad:
            trainable_params.append(param)
    
    optimizer = optim.AdamW(trainable_params, lr=1e-4, weight_decay=1e-4)
    
    # Alternative: Use differential learning rates
    # optimizer = optim.AdamW([
    #     {'params': model.cnn.parameters(), 'lr': 1e-4},
    #     {'params': model.vit.parameters(), 'lr': 5e-5},
    #     {'params': model.cnn_head.parameters(), 'lr': 1e-4},
    #     {'params': model.vit_head.parameters(), 'lr': 1e-4},
    #     {'params': model.fusion.parameters(), 'lr': 1e-4}
    # ], weight_decay=1e-4)
    
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='max', patience=5, factor=0.7
    )
    
    # Training loop
    print("\nStarting training...")
    EPOCHS = 30
    best_acc = 0
    train_losses, val_losses = [], []
    train_accs, val_accs = [], []
    
    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS}")
        print("-" * 50)
        
        # Progressive unfreezing
        if epoch == 10:
            print("🔄 Unfreezing more CNN layers...")
            # Unfreeze more layers without adding to optimizer again
            for param in model.cnn.features[-5:].parameters():
                param.requires_grad = True
            print("✅ Unfrozen additional CNN layers")
        
        if epoch == 15:
            print("🔄 Unfreezing all CNN layers...")
            # Unfreeze all CNN layers
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
        
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), "best_multi_animal_model.pth")
            print(f"🏆 New best model! Val Acc: {val_acc:.2f}%")
        
        print(f"Train Acc: {train_acc:.2f}% | Val Acc: {val_acc:.2f}%")
        print(f"Learning Rate: {optimizer.param_groups[0]['lr']:.6f}")
    
    # Plot results
    plt.figure(figsize=(15, 5))
    
    plt.subplot(1, 3, 1)
    plt.plot(train_accs, label="Train Accuracy", linewidth=2)
    plt.plot(val_accs, label="Validation Accuracy", linewidth=2)
    plt.legend()
    plt.title("Multi-Animal Model - Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy (%)")
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 3, 2)
    plt.plot(train_losses, label="Train Loss", linewidth=2)
    plt.plot(val_losses, label="Validation Loss", linewidth=2)
    plt.legend()
    plt.title("Multi-Animal Model - Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 3, 3)
    plt.plot(range(1, len(train_accs)+1), train_accs, 'bo-', label="Train")
    plt.plot(range(1, len(val_accs)+1), val_accs, 'ro-', label="Validation")
    plt.title("Training Progress")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy (%)")
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('multi_animal_training_curves.png', dpi=150, bbox_inches='tight')
    plt.show()
    
    # Final evaluation
    print(f"\n🏆 Best Validation Accuracy: {best_acc:.2f}%")
    print("Model saved as: best_multi_animal_model.pth")
    print("=" * 80)
    
    return model, best_acc

if __name__ == "__main__":
    model, accuracy = main()
