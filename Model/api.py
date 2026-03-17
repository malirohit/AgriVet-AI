# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import torch
# import torchvision.transforms as transforms
# from PIL import Image
# import torchvision.models as models
# import torch.nn as nn
# import os
# app = Flask(__name__)
# CORS(app)

# # Device
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# # Classes (same 22 classes used in training)
# # Add classes as training dataset is expanded 
# # classes = sorted([d for d in os.listdir("data") if os.path.isdir(os.path.join("data", d)) and d not in ["train","valid"]])
# classes = [
#     "Dental Disease in Cat",
#     "Dental Disease in Dog",
#     "Distemper in Dog",
#     "Ear Mites in Cat",
#     "Eye Infection in Cat",
#     "Eye Infection in Dog",
#     "Feline Leukemia",
#     "Feline Panleukopenia",
#     "Fungal Infection in Cat",
#     "Fungal Infection in Dog",
#     "Hot Spots in Dog",
#     "Kennel Cough in Dog",
#     "Mange in Dog",
#     "Parvovirus in Dog",
#     "Ringworm in Cat",
#     "Scabies in Cat",
#     "Skin Allergy in Cat",
#     "Skin Allergy in Dog",
#     "Tick Infestation in Dog",
#     "Urinary Tract Infection in Cat",
#     "Worm Infection in Cat",
#     "Worm Infection in Dog"
# ]

# # Load model
# model = models.resnet50(pretrained=False)
# model.fc = nn.Linear(model.fc.in_features, len(classes))

# model.load_state_dict(torch.load("best_improved_multi_animal_model.pth", map_location=device))
# model.to(device)
# model.eval()

# # Image transform
# transform = transforms.Compose([
#     transforms.Resize((224,224)),
#     transforms.ToTensor()
# ])

# @app.route("/predict", methods=["POST"])
# def predict():

#     if "file" not in request.files:
#         return jsonify({"error":"No file uploaded"}),400

#     file = request.files["file"]

#     image = Image.open(file).convert("RGB")
#     image = transform(image).unsqueeze(0).to(device)

#     with torch.no_grad():
#         outputs = model(image)
#         probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
#         confidence, predicted = torch.max(probabilities,0)

#     predicted_class = classes[predicted]

#     animal = predicted_class.split(" in ")[1]
#     disease = predicted_class.split(" in ")[0]

#     return jsonify({
#         "animal": animal,
#         "disease": disease,
#         "confidence": float(confidence)*100
#     })

# if __name__ == "__main__":
#     app.run(debug=True, port=1003)

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
from PIL import Image

# Import the SAME model used during training
from train_cnn_vit_improved import ImprovedHybridCNNViT

app = Flask(__name__)
CORS(app)

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 22 classes
classes = [
    "Dental Disease in Cat",
    "Dental Disease in Dog",
    "Distemper in Dog",
    "Ear Mites in Cat",
    "Eye Infection in Cat",
    "Eye Infection in Dog",
    "Feline Leukemia",
    "Feline Panleukopenia",
    "Fungal Infection in Cat",
    "Fungal Infection in Dog",
    "Hot Spots in Dog",
    "Kennel Cough in Dog",
    "Mange in Dog",
    "Parvovirus in Dog",
    "Ringworm in Cat",
    "Scabies in Cat",
    "Skin Allergy in Cat",
    "Skin Allergy in Dog",
    "Tick Infestation in Dog",
    "Urinary Tract Infection in Cat",
    "Worm Infection in Cat",
    "Worm Infection in Dog"
]

# Load model (same architecture used during training)
model = ImprovedHybridCNNViT(num_classes=len(classes))

model.load_state_dict(
    torch.load("best_improved_multi_animal_model.pth", map_location=device)
)

model.to(device)
model.eval()

print("Model loaded successfully")

# Image transform
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    image = Image.open(file).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted = torch.max(probabilities, 0)

    predicted_class = classes[predicted]

    if " in " in predicted_class:
        disease, animal = predicted_class.split(" in ")
    else:
        disease = predicted_class
        animal = "Unknown"

    return jsonify({
        "animal": animal,
        "disease": disease,
        "confidence": round(float(confidence) * 100, 2)
    })


@app.route("/")
def home():
    return {"message": "VetAI API running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)