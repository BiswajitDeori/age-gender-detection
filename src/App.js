import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Input from "@mui/material/Input";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// MUI styles (using the sx prop for styling)
const styles = {
  appContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    color: "#333",
    fontSize: "calc(10px + 2vmin)",
  },
  header: {
    padding: "20px",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#ffffff",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
    borderRadius: "15px",
    padding: "20px",
    marginTop: "20px",
    transition: "box-shadow 0.3s ease",
    "&:hover": {
      boxShadow: "0px 12px 36px rgba(0, 0, 0, 0.2)",
    },
  },
  cardContent: {
    textAlign: "center",
  },
  uploadedImage: {
    marginTop: "20px",
    maxWidth: "300px",
    maxHeight: "300px",
    borderRadius: "10px",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  button: {
    padding: "12px 25px",
    borderRadius: "10px",
    "&:hover": {
      transform: "scale(1.05)",
      transition: "transform 0.3s ease",
    },
  },
  webcamContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "20px",
    width: "100%",
    maxWidth: "800px",
  },
};

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [openModal, setOpenModal] = useState(false);
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const webcamRef = useRef(null);
  const [showAlert, setShowAlert] = useState(""); // Alert message state

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas element to resize the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas dimensions to 256x256 (as expected by the model)
          canvas.width = 256;
          canvas.height = 256;

          // Draw the image onto the canvas with the new size
          ctx.drawImage(img, 0, 0, 256, 256);

          // Ensure the image is in RGB format (remove alpha channel if exists)
          const imageData = ctx.getImageData(0, 0, 256, 256);
          const data = imageData.data;

          // Loop through each pixel and remove the alpha channel by ensuring it's an RGB image
          for (let i = 0; i < data.length; i += 4) {
            // Convert RGBA to RGB (keep the red, green, blue values and discard alpha)
            data[i + 3] = 255; // Set alpha to 255 (fully opaque)
          }

          // Put the modified image data back onto the canvas
          ctx.putImageData(imageData, 0, 0);

          // Convert the canvas to a base64 image (now in RGB format)
          const resizedImage = canvas.toDataURL("image/jpeg"); // Ensure it is in RGB format (JPEG)
          setImage(resizedImage);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };
  // Capture image from webcam
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const img = new Image();
    img.onload = () => {
      // Create a canvas element to resize the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to 256x256 (as expected by the model)
      canvas.width = 256;
      canvas.height = 256;

      // Draw the image onto the canvas with the new size
      ctx.drawImage(img, 0, 0, 256, 256);

      // Ensure the image is in RGB format (remove alpha channel if exists)
      const imageData = ctx.getImageData(0, 0, 256, 256);
      const data = imageData.data;

      // Loop through each pixel and remove the alpha channel by ensuring it's an RGB image
      for (let i = 0; i < data.length; i += 4) {
        // Convert RGBA to RGB (keep the red, green, blue values and discard alpha)
        data[i + 3] = 255; // Set alpha to 255 (fully opaque)
      }

      // Put the modified image data back onto the canvas
      ctx.putImageData(imageData, 0, 0);

      // Convert the canvas to a base64 image (now in RGB format)
      const resizedImage = canvas.toDataURL("image/jpeg"); // Ensure it is in RGB format (JPEG)
      setImage(resizedImage);
    };
    img.src = imageSrc;
  };

  // Send the image to the Flask backend
  const handleSubmit = async () => {
    setLoading(true);

    setShowAlert(""); // Reset any previous alert

    if (image) {
      const payload = {
        file: image, // Send the base64 string directly
      };

      try {
        const response = await fetch(
          "https://ashamed-bat-studentfindmyway-a7018881.koyeb.app/get_info",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.gender && data.image_with_face) {
          setResult({
            age: data.age,
            gender: data.gender,
            imageWithFace: data.image_with_face, // Set the base64 image here
          });
        } else {
          setShowAlert("Error in doing model prediction.");
        }
      } catch (error) {
        setShowAlert("An error occurred while predicting.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please provide an image.");
    }
  };

  // Open the modal with instructions
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenPdfModal = () => {
    setOpenPdfModal(true);
  };

  // Function to close the PDF modal
  const handleClosePdfModal = () => {
    setOpenPdfModal(false);
  };

  return (
    <Box sx={styles.appContainer}>
      <Box sx={styles.header}>
        <Typography variant="h4" gutterBottom>
          Age and Gender Detection
        </Typography>
        <Typography variant="body1" paragraph>
          Upload a photo or use the webcam to detect age and gender.
        </Typography>

        {/* Display the alert if there is a message */}
        {showAlert && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {showAlert}
          </Alert>
        )}
        {/* Instruction Button */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenModal}
            sx={{ mt: 3 }}
            style={styles.button}
          >
            Instructions
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleOpenPdfModal}
            sx={{ mb: 3 }}
            style={styles.button}
          >
            Model Code
          </Button>
        </Box>

        {/* Flex container for file upload and webcam capture */}
        <Box sx={styles.flexContainer}>
          {/* File input card */}
          <Card sx={styles.card}>
            <CardContent sx={styles.cardContent}>
              <Typography variant="h6">Upload Image</Typography>
              <Input
                type="file"
                onChange={handleImageChange}
                sx={{
                  mb: 2,
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  padding: "10px",
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                }}
              />
              {/* Display uploaded image */}
              {image && (
                <img src={image} alt="Uploaded" style={styles.uploadedImage} />
              )}
            </CardContent>
          </Card>

          {/* Webcam capture card */}
          <Card sx={styles.card}>
            <CardContent sx={styles.cardContent}>
              <Typography variant="h6">Capture from Webcam</Typography>
              <Box sx={styles.webcamContainer}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{
                    facingMode: "user",
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={capture}
                  sx={{ mt: 2 }}
                  style={styles.button}
                >
                  Capture
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Button to trigger the detection */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          sx={{ mt: 3 }}
          style={styles.button}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Detect"}
        </Button>
      </Box>

      {/* Display the result */}
      {result && (
        <Card sx={styles.card}>
          <CardContent
            sx={styles.cardContent}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            {/* Right side: Image */}
            {result.imageWithFace &&
              result.imageWithFace.startsWith("data:image") && (
                <img
                  src={result.imageWithFace}
                  alt="Detected Face"
                  style={styles.uploadedImage}
                />
              )}
            {/* Right side: Data (Age and Gender) */}
            <div
              style={{
                flex: 1,
                marginRight: "16px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#333", marginBottom: "8px" }}
              >
                Detection Result:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "16px",
                  color: "#555",
                  marginBottom: "4px",
                  fontWeight: "400",
                }}
              >
                <strong>Age:</strong> {result.age} years
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "16px",
                  color: "#555",
                  marginBottom: "8px",
                  fontWeight: "400",
                }}
              >
                <strong>Gender:</strong> {result.gender}
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal with instructions */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Instructions</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            1. Upload an image or capture one using the webcam.
            <br />
            2. Click the "Detect" button to get age and gender information from
            the image.
            <br />
            3. If the webcam is used, make sure the face is visible for accurate
            detection.
            <br />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal to display the PDF */}
      <Dialog
        open={openPdfModal}
        onClose={handleClosePdfModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Model Code</DialogTitle>
        <DialogContent>
          <iframe
            src="/ModelFile/modelCode.pdf" // Path to your PDF file
            width="100%"
            height="600px"
            title="PDF Viewer"
          ></iframe>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePdfModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
