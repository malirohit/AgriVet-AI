import os
import shutil
import random

def setup_multi_animal_dataset():
    """Organize multi-animal dataset for training"""
    
    print("🔧 Setting up Multi-Animal Dataset...")
    print("=" * 50)
    
    data_dir = "data"
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "valid")
    
    # Create directories
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)
    
    # Get all disease folders
    disease_folders = [f for f in os.listdir(data_dir) 
                   if os.path.isdir(os.path.join(data_dir, f)) 
                   and f not in ["train", "valid"]]
    
    print(f"Found {len(disease_folders)} disease categories:")
    for disease in disease_folders:
        print(f"  📁 {disease}")
    
    # Process each disease folder
    total_images = 0
    total_train = 0
    total_val = 0
    
    for disease in disease_folders:
        disease_path = os.path.join(data_dir, disease)
        
        # Get all image files
        image_files = [f for f in os.listdir(disease_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        if not image_files:
            print(f"⚠️ No images found in {disease}")
            continue
        
        # Shuffle for random split
        random.shuffle(image_files)
        
        # 80-20 split
        split_idx = int(0.8 * len(image_files))
        train_imgs = image_files[:split_idx]
        val_imgs = image_files[split_idx:]
        
        # Create target directories
        train_target = os.path.join(train_dir, disease)
        val_target = os.path.join(val_dir, disease)
        os.makedirs(train_target, exist_ok=True)
        os.makedirs(val_target, exist_ok=True)
        
        # Copy images
        print(f"\n📂 Processing {disease}:")
        print(f"   📊 Total: {len(image_files)} images")
        print(f"   🚂 Train: {len(train_imgs)} images")
        print(f"   🧪 Valid: {len(val_imgs)} images")
        
        for img in train_imgs:
            src = os.path.join(disease_path, img)
            dst = os.path.join(train_target, img)
            shutil.copy2(src, dst)
        
        for img in val_imgs:
            src = os.path.join(disease_path, img)
            dst = os.path.join(val_target, img)
            shutil.copy2(src, dst)
        
        total_images += len(image_files)
        total_train += len(train_imgs)
        total_val += len(val_imgs)
    
    print(f"\n✅ Dataset Setup Complete!")
    print(f"📊 Total Images: {total_images}")
    print(f"🚂 Training: {total_train} images")
    print(f"🧪 Validation: {total_val} images")
    print(f"📁 Train Dir: {train_dir}")
    print(f"📁 Valid Dir: {val_dir}")
    
    # Show dataset structure
    print(f"\n📋 Dataset Structure:")
    print("data/")
    print("├── train/")
    for disease in sorted(disease_folders):
        disease_path = os.path.join(train_dir, disease)
        if os.path.exists(disease_path):
            count = len([f for f in os.listdir(disease_path) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
            print(f"│   ├── {disease}/ ({count} images)")
    
    print("└── valid/")
    for disease in sorted(disease_folders):
        disease_path = os.path.join(val_dir, disease)
        if os.path.exists(disease_path):
            count = len([f for f in os.listdir(disease_path) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
            print(f"    ├── {disease}/ ({count} images)")

def check_dataset_balance():
    """Check dataset balance and suggest improvements"""
    
    print("\n🔍 Dataset Balance Analysis:")
    print("=" * 40)
    
    data_dir = "data"
    disease_folders = [f for f in os.listdir(data_dir) 
                   if os.path.isdir(os.path.join(data_dir, f)) 
                   and f not in ["train", "valid"]]
    
    class_counts = {}
    
    for disease in disease_folders:
        disease_path = os.path.join(data_dir, disease)
        image_files = [f for f in os.listdir(disease_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        class_counts[disease] = len(image_files)
    
    # Sort by count
    sorted_counts = sorted(class_counts.items(), key=lambda x: x[1], reverse=True)
    
    print("Class Distribution:")
    for disease, count in sorted_counts:
        status = "✅ Good" if count >= 20 else "⚠️ Need more" if count >= 5 else "❌ Too few"
        print(f"  {disease}: {count:3d} images [{status}]")
    
    # Suggestions
    print(f"\n💡 Suggestions:")
    low_count_classes = [d for d, c in class_counts.items() if c < 10]
    if low_count_classes:
        print(f"  📸 Add more images for: {', '.join(low_count_classes)}")
    
    empty_classes = [d for d, c in class_counts.items() if c == 0]
    if empty_classes:
        print(f"  🚫 These classes have no data: {', '.join(empty_classes)}")
    
    # Calculate recommended minimum
    min_recommended = max(20, len(sorted_counts) * 2)
    print(f"  🎯 Aim for at least {min_recommended} images per class for best results")

if __name__ == "__main__":
    print("🐾 Multi-Animal Disease Detection Setup")
    print("=" * 50)
    
    choice = input("Choose option:\n1. Setup train/valid split\n2. Check dataset balance\n3. Both\nEnter choice (1-3): ").strip()
    
    if choice in ["1", "3"]:
        setup_multi_animal_dataset()
    
    if choice in ["2", "3"]:
        check_dataset_balance()
    
    print("\n✅ Setup complete! Now run:")
    print("python train_cnn_vit_animal.py")
