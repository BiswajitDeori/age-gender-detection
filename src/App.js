import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, Typography, Card, CardContent, Input, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

// MUI styles (using the sx prop for styling)
const styles = {
  appContainer: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5', // Light background color
    color: '#333', // Dark text for contrast
    fontSize: 'calc(10px + 2vmin)',
  },
  header: {
    padding: '20px',
    marginBottom: '30px',
  },
  card: {
    backgroundColor: '#ffffff', // White background for cards
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)', // Stronger shadow for modern look
    borderRadius: '15px', // Larger rounded corners
    padding: '20px',
    marginTop: '20px',
    transition: 'box-shadow 0.3s ease', // Smooth shadow transition
    '&:hover': {
      boxShadow: '0px 12px 36px rgba(0, 0, 0, 0.2)', // Increased shadow on hover
    },
  },
  cardContent: {
    textAlign: 'center',
  },
  uploadedImage: {
    marginTop: '20px',
    maxWidth: '300px',
    maxHeight: '300px',
    borderRadius: '10px',
    transition: 'transform 0.2s ease-in-out', // Add image transition effect
    '&:hover': {
      transform: 'scale(1.05)', // Slight zoom effect on hover
    },
  },
  button: {
    padding: '12px 25px',
    borderRadius: '10px',
    '&:hover': {
      transform: 'scale(1.05)', // Slight zoom effect on hover
      transition: 'transform 0.3s ease',
    },
  },
  webcamContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginTop: '20px',
    width: '100%',
    maxWidth: '800px',
  },
};

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [openModal, setOpenModal] = useState(false); // Modal open state
  const webcamRef = useRef(null);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  // Capture image from webcam
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  // Placeholder function for age and gender detection
  const handleSubmit = () => {
    setResult({
      age: '25-30',
      gender: 'Female',
    });
  };

  // Open the modal with instructions
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setOpenModal(false);
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

        {/* Instruction Button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpenModal}
          sx={{ mt: 3, mb: 2 }}
          style={styles.button}
        >
          Instructions
        </Button>

        {/* Flex container for file upload and webcam capture */}
        <Box sx={styles.flexContainer}>
          {/* File input card */}
          <Card sx={styles.card}>
            <CardContent sx={styles.cardContent}>
              <Typography variant="h6">Upload Image</Typography>
              <Input
                type="file"
                onChange={handleImageChange}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '5px', padding: '10px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}
              />
              {/* Display uploaded image */}
              {image && <img src={image} alt="Uploaded" style={styles.uploadedImage} />}
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
                    facingMode: 'user', // Use the front camera
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
          Detect
        </Button>
      </Box>

      {/* Display the result */}
      {result && (
        <Card sx={styles.card}>
          <CardContent sx={styles.cardContent}>
            <Typography variant="h6">Detection Result:</Typography>
            <Typography variant="body1">Age: {result.age}</Typography>
            <Typography variant="body1">Gender: {result.gender}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Modal with instructions */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Instructions</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            1. Upload an image or capture one using the webcam.<br />
            2. Click the "Detect" button to get age and gender information from the image.<br />
            3. If the webcam is used, make sure the face is visible for accurate detection.<br />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
