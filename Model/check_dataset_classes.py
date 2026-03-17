import os
from torchvision import datasets

def check_dataset_classes():
    """Check actual classes in your dataset"""
    
    print("🔍 Checking Dataset Classes...")
    print("=" * 50)
    
    # Check data folder
    data_dir = "data"
    if os.path.exists(data_dir):
        folders = [f for f in os.listdir(data_dir) 
                  if os.path.isdir(os.path.join(data_dir, f))]
        
        print(f"📁 Found {len(folders)} disease folders:")
        for i, folder in enumerate(sorted(folders), 1):
            count = len([f for f in os.listdir(os.path.join(data_dir, folder)) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
            print(f"  {i:2d}. {folder} ({count} images)")
    
    # Check train folder
    train_dir = "data/train"
    if os.path.exists(train_dir):
        try:
            dataset = datasets.ImageFolder(train_dir)
            print(f"\n📊 Train Dataset Classes: {len(dataset.classes)}")
            for i, class_name in enumerate(dataset.classes, 1):
                print(f"  {i:2d}. {class_name}")
        except Exception as e:
            print(f"❌ Error loading train dataset: {e}")
    
    # Check valid folder
    valid_dir = "data/valid"
    if os.path.exists(valid_dir):
        try:
            dataset = datasets.ImageFolder(valid_dir)
            print(f"\n📊 Valid Dataset Classes: {len(dataset.classes)}")
            for i, class_name in enumerate(dataset.classes, 1):
                print(f"  {i:2d}. {class_name}")
        except Exception as e:
            print(f"❌ Error loading valid dataset: {e}")
    
    # Check if model file exists
    model_path = "best_multi_animal_model.pth"
    if os.path.exists(model_path):
        print(f"\n✅ Model file exists: {model_path}")
        
        # Try to load model to check architecture
        try:
            import torch
            checkpoint = torch.load(model_path, map_location='cpu')
            
            # Look for class count in checkpoint
            if 'model_state_dict' in checkpoint:
                state_dict = checkpoint['model_state_dict']
            else:
                state_dict = checkpoint
            
            # Try to infer class count from final layer
            for key in state_dict.keys():
                if 'fusion.3.weight' in key:
                    shape = state_dict[key].shape
                    print(f"🧠 Model classes (from fusion layer): {shape[0]}")
                    break
                elif 'cnn_head.6.weight' in key:
                    shape = state_dict[key].shape
                    print(f"🧠 Model classes (from cnn head): {shape[0]}")
                    break
        except Exception as e:
            print(f"❌ Error checking model: {e}")
    else:
        print(f"\n❌ Model file not found: {model_path}")
        print("💡 Train the model first: python train_cnn_vit_animal.py")

if __name__ == "__main__":
    check_dataset_classes()
